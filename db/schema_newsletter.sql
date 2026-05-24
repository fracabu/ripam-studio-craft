-- ============================================================================
-- Newsletter subscribers schema — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region)
--
-- Applica con:
--   psql "$NEON_DATABASE_URL" -f db/schema_newsletter.sql
-- oppure incolla nel SQL editor di Neon console.
-- ============================================================================

-- Tabella iscritti: contiene anche il registro consensi GDPR
-- (consent_text, consent_ip, consent_user_agent, consent_at) richiesto
-- per provare il consenso in caso di reclamo al Garante.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    nome            TEXT,
    -- origine dell'iscrizione: 'home' (form dedicato), 'scrivimi' (checkbox
    -- nel form di contatto), 'telegram', 'admin' (aggiunto manualmente)
    source          TEXT NOT NULL DEFAULT 'home',
    -- registro consensi GDPR
    consent_text    TEXT NOT NULL,        -- snapshot del testo della checkbox
    consent_ip      TEXT,                 -- IP cliente al momento del consenso
    consent_user_agent TEXT,              -- user agent al momento del consenso
    consent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- doppio opt-in
    confirm_token        TEXT NOT NULL,   -- token random URL-safe (32+ bytes)
    confirmed_at         TIMESTAMPTZ,     -- NULL = in attesa di conferma
    -- unsubscribe (token diverso da quello di conferma per evitare riuso)
    unsubscribe_token    TEXT NOT NULL,
    unsubscribed_at      TIMESTAMPTZ,
    unsubscribe_reason   TEXT,            -- opzionale, se l'utente lascia un motivo
    -- metadati
    last_email_sent_at   TIMESTAMPTZ,     -- ultima newsletter inviata
    last_opened_at       TIMESTAMPTZ,     -- ultima volta che ha aperto (se tracciamo)
    bounce_count         INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indice unico case-insensitive su email: stesso indirizzo non si reiscrive
-- (se prova, l'endpoint riusa la riga esistente generando un nuovo confirm_token).
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_idx
    ON newsletter_subscribers (LOWER(email));

CREATE INDEX IF NOT EXISTS newsletter_subscribers_confirm_token_idx
    ON newsletter_subscribers (confirm_token);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_idx
    ON newsletter_subscribers (unsubscribe_token);

-- Indice parziale per le query di invio: solo confermati e non disiscritti.
CREATE INDEX IF NOT EXISTS newsletter_subscribers_active_idx
    ON newsletter_subscribers (id)
    WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;

-- Trigger per aggiornare updated_at automaticamente.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Log invii (audit + analytics base)
-- ============================================================================
-- Una riga per ogni mail inviata: serve per evitare doppi invii della stessa
-- newsletter allo stesso iscritto e per misurare basic deliverability.
CREATE TABLE IF NOT EXISTS newsletter_send_events (
    id              SERIAL PRIMARY KEY,
    subscriber_id   INTEGER NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    newsletter_id   TEXT NOT NULL,        -- es. '2026-05-23-ripam-novita' (nome file)
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    status          TEXT NOT NULL,        -- 'sent' | 'bounced' | 'error'
    error_message   TEXT,
    UNIQUE (subscriber_id, newsletter_id)  -- idempotenza: stessa newsletter, stesso iscritto = una sola volta
);

CREATE INDEX IF NOT EXISTS newsletter_send_events_newsletter_id_idx
    ON newsletter_send_events (newsletter_id);

CREATE INDEX IF NOT EXISTS newsletter_send_events_sent_at_idx
    ON newsletter_send_events (sent_at DESC);

-- ============================================================================
-- View comoda: iscritti attivi (confermati, non disiscritti, non bounce-out)
-- ============================================================================
CREATE OR REPLACE VIEW newsletter_active AS
SELECT
    id, email, nome, source, consent_at,
    confirmed_at, last_email_sent_at, created_at
FROM newsletter_subscribers
WHERE confirmed_at IS NOT NULL
  AND unsubscribed_at IS NULL
  AND bounce_count < 3
ORDER BY confirmed_at DESC;
