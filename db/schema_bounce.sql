-- ============================================================================
-- Registro bounce email — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter/ordini/invii.
--
-- Fonte UNICA di "quali indirizzi hanno rifiutato la consegna, quando e perché".
--
-- PERCHÉ ESISTE (2026-08-29): `newsletter_subscribers.bounce_count` esiste dal
-- primo giorno e `api/newsletter/send.js` la usa in TRE punti per escludere chi
-- sta a `bounce_count >= 3` (anche la view `newsletter_active` lo fa). Ma nessuno
-- ha mai incrementato quel contatore: i mailer-daemon arrivavano in inbox e non
-- li leggeva nessuno. Risultato: il filtro era sempre falso e un indirizzo morto
-- restava in lista per sempre, bruciando quota Gmail a ogni invio.
--
-- Il caso che l'ha fatto emergere: un indirizzo con un typo nel dominio
-- (`tiscai.it` invece di `tiscali.it`) ha generato bounce per tre giorni senza
-- che nessun sistema se ne accorgesse.
--
-- COME SI ALIMENTA: `node scripts/bounce_scan.mjs --apply` legge i messaggi del
-- mailer-daemon via IMAP e scrive qui. Poi RICALCOLA `bounce_count` contando le
-- righe PERMANENTI per indirizzo — non incrementa: ricalcola. Così lo script è
-- rilanciabile all'infinito senza gonfiare i contatori.
--
-- PERMANENTE vs TEMPORANEO: un "Delivery Status Notification (Delay)" NON è un
-- indirizzo morto — Gmail sta solo ritentando, e la mail può ancora arrivare.
-- Contarlo come bounce escluderebbe dalla newsletter gente raggiungibilissima.
-- Solo lo status SMTP 5.x.x (o Action: failed) è definitivo.
--
-- Applica con:  node db/apply_schema.mjs   (idempotente)
--               node db/apply_schema.mjs schema_bounce.sql  (solo questo)
--
-- NB: solo DDL nel file. Le righe si scrivono a runtime da bounce_scan.mjs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS bounce_events (
    id             BIGSERIAL PRIMARY KEY,
    email          TEXT        NOT NULL,
    -- 'permanente' = 5.x.x / Action: failed → l'indirizzo non esiste o rifiuta
    -- 'temporaneo' = 4.x.x / Action: delayed → Gmail sta ancora ritentando
    tipo           TEXT        NOT NULL CHECK (tipo IN ('permanente', 'temporaneo')),
    status         TEXT,                  -- lo Status SMTP grezzo, es. '5.1.1'
    diagnostic     TEXT,                  -- Diagnostic-Code, troncato
    oggetto        TEXT,                  -- oggetto del DSN (per capire cosa era partito)
    -- Message-ID del DSN: è la chiave di idempotenza. Lo stesso mailer-daemon
    -- riletto a ogni scansione non deve creare una riga nuova.
    dsn_message_id TEXT        NOT NULL,
    ricevuto_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS bounce_events_dsn_uniq
    ON bounce_events (dsn_message_id, LOWER(email));

CREATE INDEX IF NOT EXISTS bounce_events_email_idx
    ON bounce_events (LOWER(email));

CREATE INDEX IF NOT EXISTS bounce_events_tipo_idx
    ON bounce_events (tipo, ricevuto_at DESC);

-- Vista di comodo: un indirizzo per riga, con quanti bounce permanenti ha
-- collezionato e se è ancora in lista newsletter. È la risposta a
-- "chi sto continuando a contattare a vuoto?".
-- NB: `ancora_in_lista` si ricava con un LEFT JOIN, non con una subquery
-- correlata: dentro un GROUP BY su LOWER(email) la colonna grezza `b.email`
-- non è più referenziabile (Postgres: "subquery uses ungrouped column").
CREATE OR REPLACE VIEW indirizzi_morti AS
WITH agg AS (
    SELECT
        LOWER(email)                                       AS email,
        COUNT(*) FILTER (WHERE tipo = 'permanente')::int    AS bounce_permanenti,
        COUNT(*) FILTER (WHERE tipo = 'temporaneo')::int    AS bounce_temporanei,
        MAX(ricevuto_at)                                   AS ultimo_bounce
    FROM bounce_events
    GROUP BY LOWER(email)
    HAVING COUNT(*) FILTER (WHERE tipo = 'permanente') > 0
)
SELECT
    a.email,
    a.bounce_permanenti,
    a.bounce_temporanei,
    a.ultimo_bounce,
    (s.id IS NOT NULL) AS ancora_in_lista
FROM agg a
LEFT JOIN newsletter_subscribers s
       ON LOWER(s.email) = a.email
      AND s.confirmed_at IS NOT NULL
      AND s.unsubscribed_at IS NULL
ORDER BY a.bounce_permanenti DESC, a.ultimo_bounce DESC;
