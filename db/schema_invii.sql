-- ============================================================================
-- Registro invii email — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter/ordini/anteprime.
--
-- Fonte UNICA di "a chi ho mandato cosa, quando". Gemello di `anteprime_inviate`,
-- ma per le COMUNICAZIONI (inviti, campagne, risposte lead), non per i materiali.
--
-- PERCHÉ ESISTE (2026-07-16): fino a oggi la verità sugli invii stava solo nella
-- Posta inviata di Gmail. Le campagne giravano con script usa-e-getta che non
-- lasciavano traccia, quindi ogni nuovo blast ripartiva cieco e il filtro
-- "chi ha già ricevuto?" era un PROXY sul DB (presenza in `candidati` prima della
-- data del blast). Il proxy si è rivelato falso: su 99 destinatari diceva "0 già
-- invitati", mentre la Posta inviata ne conteneva 38 — inclusi 26 che avevano
-- ricevuto un invito 12 giorni prima. Da qui: la verità si scrive QUI, all'invio.
--
-- REGOLA: ogni script che manda mail scrive la sua riga qui. Chi non logga, per
-- il sistema non è partito.
--
-- Applica con:  node db/apply_schema.mjs   (idempotente)
--               node db/apply_schema.mjs schema_invii.sql  (solo questo)
--
-- NB: solo DDL nel file (nessun dato personale). Le righe si scrivono a runtime
--     dagli script d'invio + backfill una tantum dalla Posta inviata (IMAP).
-- ============================================================================

CREATE TABLE IF NOT EXISTS invii_email (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    nome            TEXT,
    -- slug stabile della campagna/comunicazione, es. 'invito-newsletter-quizpro-2026-07'.
    -- È la chiave con cui si chiede "gliel'ho già mandata?" → tenerlo PARLANTE e stabile.
    campagna        TEXT NOT NULL,
    -- oggetto reale della mail spedita (per ricostruire cosa ha visto la persona).
    oggetto         TEXT,
    -- che tipo di comunicazione: invito | campagna | lead | newsletter | credenziali
    --                          | anteprima | fattura | altro
    tipo            TEXT NOT NULL DEFAULT 'altro',
    -- come è partita: blast | lead | auto | manuale | backfill-imap
    -- 'backfill-imap' marca le righe ricostruite dallo storico Gmail: sono
    -- affidabili su (email, oggetto, data), meno sul resto.
    canale          TEXT NOT NULL DEFAULT 'manuale',
    message_id      TEXT,
    esito           TEXT NOT NULL DEFAULT 'sent',   -- sent | failed | bounced
    errore          TEXT,
    inviata_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ricerca per persona (case-insensitive), per campagna e per data.
CREATE INDEX IF NOT EXISTS invii_email_lower_idx ON invii_email (LOWER(email));
CREATE INDEX IF NOT EXISTS invii_campagna_idx    ON invii_email (campagna);
CREATE INDEX IF NOT EXISTS invii_inviata_at_idx  ON invii_email (inviata_at DESC);

-- Anti-doppione: stessa persona + stessa campagna = una riga sola.
-- Gli script inseriscono con ON CONFLICT DO NOTHING, quindi rilanciare un blast
-- interrotto non duplica. NB: il vincolo NON include l'esito: un tentativo
-- fallito occupa comunque lo slot — per rimandare a chi è fallito si cancella
-- la riga 'failed' e si rilancia (esplicito, mai silenzioso).
CREATE UNIQUE INDEX IF NOT EXISTS invii_email_campagna_uq
    ON invii_email (LOWER(email), campagna);

-- Le righe di backfill hanno oggetti reali ma campagna dedotta: questo indice
-- serve a ritrovarle per oggetto quando si riclassifica lo storico.
CREATE INDEX IF NOT EXISTS invii_oggetto_idx ON invii_email (oggetto);

-- Vista: una riga per persona con tutte le campagne già ricevute.
-- È la risposta veloce a "che cosa ha già visto questa persona?".
CREATE OR REPLACE VIEW invii_per_persona AS
SELECT
    LOWER(email)                                    AS email,
    MAX(nome)                                       AS nome,
    COUNT(*)::int                                   AS n_invii,
    ARRAY_AGG(DISTINCT campagna ORDER BY campagna)  AS campagne,
    MIN(inviata_at)                                 AS primo_invio_at,
    MAX(inviata_at)                                 AS ultimo_invio_at
FROM invii_email
WHERE esito = 'sent'
GROUP BY LOWER(email)
ORDER BY MAX(inviata_at) DESC;

-- Vista: una riga per campagna, per vedere a colpo d'occhio cosa è partito e a quanti.
CREATE OR REPLACE VIEW invii_per_campagna AS
SELECT
    campagna,
    MIN(tipo)                                    AS tipo,
    COUNT(*) FILTER (WHERE esito = 'sent')::int  AS inviate,
    COUNT(*) FILTER (WHERE esito <> 'sent')::int AS fallite,
    COUNT(DISTINCT LOWER(email))::int            AS persone,
    MIN(inviata_at)                              AS iniziata_at,
    MAX(inviata_at)                              AS finita_at
FROM invii_email
GROUP BY campagna
ORDER BY MIN(inviata_at) DESC;
