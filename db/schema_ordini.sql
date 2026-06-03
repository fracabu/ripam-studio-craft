-- ============================================================================
-- Ordini / clienti schema — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB della newsletter.
--
-- Fonte UNICA degli acquisti: chi ha comprato cosa, quando, a quanto.
-- Sostituisce la "ricerca a mano delle fatture in Gmail" (fragile, perde righe).
-- Da qui derivano: elenco clienti, fatturato, dedup, follow-up post-vendita.
--
-- Applica con:  node db/apply_schema.mjs   (idempotente, applica anche questo)
--
-- NB: questo file contiene SOLO DDL (nessun dato personale di cliente).
--     I dati reali si inseriscono a runtime con scripts/order_add.mjs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ordini (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    nome            TEXT,
    -- descrizione libera del prodotto venduto:
    -- es. "Manuale Diritto UE", "Serie completa Contabilità", "Video lezioni Dir. Europeo"
    prodotto        TEXT NOT NULL,
    materia         TEXT,                 -- slug o testo (opzionale, per analisi)
    -- formato: manuale | audio | video | podcast | report | serie | kit | altro
    formato         TEXT,
    -- importi (tutti opzionali: a volte si conosce solo il totale)
    importo_eur     NUMERIC(8,2),         -- TOTALE pagato (lordo, comprensivo rivalsa)
    imponibile_eur  NUMERIC(8,2),
    rivalsa_eur     NUMERIC(8,2),
    numero_fattura  TEXT,                 -- es. '8/2026'
    -- stato: pagato (default) | in_attesa | rimborsato | annullato
    stato           TEXT NOT NULL DEFAULT 'pagato',
    -- collegamento al thread Gmail dell'ordine (per audit / auto-label)
    gmail_thread_id TEXT,
    note            TEXT,
    ordine_at       TIMESTAMPTZ NOT NULL DEFAULT now(),  -- data ordine/pagamento
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ricerca per cliente (case-insensitive) e per data.
CREATE INDEX IF NOT EXISTS ordini_email_lower_idx ON ordini (LOWER(email));
CREATE INDEX IF NOT EXISTS ordini_ordine_at_idx   ON ordini (ordine_at DESC);
CREATE INDEX IF NOT EXISTS ordini_thread_idx      ON ordini (gmail_thread_id);

-- Anti-doppione "morbido": stesso cliente + stessa fattura = un solo ordine.
-- (numero_fattura può essere NULL → in tal caso il vincolo non si applica,
--  così restano permessi più ordini senza numero ancora emesso.)
CREATE UNIQUE INDEX IF NOT EXISTS ordini_email_fattura_uq
    ON ordini (LOWER(email), numero_fattura)
    WHERE numero_fattura IS NOT NULL;

-- Vista CLIENTI: una riga per cliente con aggregati (il "registro clienti").
CREATE OR REPLACE VIEW clienti AS
SELECT
    LOWER(email)                 AS email,
    MAX(nome)                    AS nome,
    COUNT(*)::int                AS n_ordini,
    COALESCE(SUM(importo_eur),0) AS totale_speso_eur,
    MIN(ordine_at)               AS primo_ordine_at,
    MAX(ordine_at)               AS ultimo_ordine_at
FROM ordini
WHERE stato = 'pagato'
GROUP BY LOWER(email)
ORDER BY MAX(ordine_at) DESC;
