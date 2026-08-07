-- ============================================================================
-- Bot Telegram @ripamstudio_bot — memoria e risposte
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter/ordini/invii.
--
-- PERCHE' ESISTE
-- Il webhook oggi riceve, risponde e dimentica: non conserva niente. Finche'
-- e' cosi', "rispondi ad Anna" e' impossibile — il bot non sa chi sia Anna ne'
-- cosa abbia scritto. Queste tabelle sono la memoria che gli manca:
--
--   telegram_messaggi  cosa e' stato detto nel gruppo (finestra breve)
--   telegram_template  cosa il bot puo' rispondere, con parole gia' approvate
--   telegram_risposte  cosa ha effettivamente risposto, a chi e quando
--
-- Applica con:  node db/apply_schema.mjs
--               node db/apply_schema.mjs schema_telegram.sql
--
-- NB: solo DDL. I template si scrivono a runtime, i messaggi li salva il
--     webhook.
-- ============================================================================

-- ── 1. Buffer dei messaggi del gruppo ──────────────────────────────────────
-- ⚠️ DATI PERSONALI. Qui finiscono i messaggi di 1.814 persone: nome, username
-- e testo. Tre conseguenze non negoziabili:
--   a) FINESTRA CORTA. Servono per rispondere a una conversazione in corso,
--      non per profilare: si tengono 7 giorni e si cancellano (vedi la vista
--      telegram_da_purgare e lo script che la usa). Piu' a lungo sarebbe
--      raccolta senza scopo.
--   b) NON ESCONO DA QUI. Valgono le regole di .claude/rules/never.md: niente
--      testi di membri dentro materiali destinati ad altri, niente invio a
--      servizi esterni (compresa la trascrizione dei vocali altrui).
--   c) NIENTE MEDIA. Si salva il testo, non foto/audio/documenti: il
--      contenuto di un vocale di un membro non va trascritto ne' conservato.
CREATE TABLE IF NOT EXISTS telegram_messaggi (
    id              BIGSERIAL PRIMARY KEY,
    chat_id         BIGINT NOT NULL,
    message_id      BIGINT NOT NULL,
    -- topic dei forum: NULL = General
    thread_id       BIGINT,
    user_id         BIGINT,
    username        TEXT,
    -- nome visualizzato al momento del messaggio: e' quello che Francesco usa
    -- quando dice "rispondi ad Anna", e cambia nel tempo, quindi si congela qui
    nome            TEXT,
    testo           TEXT,
    -- text | caption | comando | altro (i media si annotano, non si salvano)
    tipo            TEXT NOT NULL DEFAULT 'text',
    -- a quale messaggio rispondeva: ricostruisce il filo di una discussione
    reply_to        BIGINT,
    e_bot           BOOLEAN NOT NULL DEFAULT false,
    inviato_at      TIMESTAMPTZ NOT NULL,
    salvato_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telegram puo' riconsegnare lo stesso update (ritenta finche' non riceve 200):
-- senza questo vincolo un messaggio comparirebbe due volte e "l'ultima domanda
-- di Anna" sarebbe un doppione.
CREATE UNIQUE INDEX IF NOT EXISTS telegram_messaggi_uq
    ON telegram_messaggi (chat_id, message_id);

CREATE INDEX IF NOT EXISTS telegram_messaggi_utente_idx  ON telegram_messaggi (user_id, inviato_at DESC);
CREATE INDEX IF NOT EXISTS telegram_messaggi_quando_idx  ON telegram_messaggi (inviato_at DESC);
-- Ricerca per nome scritto a mano ("rispondi ad anna"): case-insensitive.
CREATE INDEX IF NOT EXISTS telegram_messaggi_nome_idx    ON telegram_messaggi (LOWER(nome));

-- Chi ha scritto negli ultimi 7 giorni, con quanti messaggi e quando l'ultimo.
-- E' la tabella di disambiguazione: nel gruppo gli omonimi sono la norma
-- (nell'export, "Anna" e' la 2a persona piu' attiva con 2.376 messaggi), quindi
-- davanti a piu' candidati il bot deve CHIEDERE quale, non indovinare.
CREATE OR REPLACE VIEW telegram_persone AS
SELECT
    user_id,
    MAX(nome)                     AS nome,
    MAX(username)                 AS username,
    COUNT(*)::int                 AS n_messaggi,
    MAX(inviato_at)               AS ultimo_messaggio_at
FROM telegram_messaggi
WHERE user_id IS NOT NULL
  AND e_bot = false
  AND inviato_at > now() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY MAX(inviato_at) DESC;

-- Cosa e' oltre la finestra di conservazione: la purga legge di qui.
CREATE OR REPLACE VIEW telegram_da_purgare AS
SELECT id, chat_id, message_id, inviato_at
FROM telegram_messaggi
WHERE inviato_at < now() - INTERVAL '7 days';


-- ── 2. Template: le risposte che il bot puo' dare ──────────────────────────
-- Il motore delle risposte NON e' un modello lasciato libero sul gruppo: sono
-- testi scritti e approvati da Francesco. Un bot che improvvisa su punteggi,
-- riserve e scadenze sbaglia davanti a 1.814 persone, e la correzione arriva
-- sempre dopo lo screenshot.
--
-- ⚠️ GLI INNESCHI VANNO SCRITTI CON LE PAROLE DEI MEMBRI, non con quelle del
-- bando. Lezione dall'analisi di 22.338 messaggi: "titoli di preferenza"
-- compare 2 volte in tutto; la gente scrive "chi passa prima", "a parita' di
-- punteggio", "le riserve passano con punteggio piu' basso?". Un innesco
-- scritto in burocratese non si attiva mai.
CREATE TABLE IF NOT EXISTS telegram_template (
    slug            TEXT PRIMARY KEY,
    titolo          TEXT NOT NULL,
    -- quiz-pro | materiali | punteggio | graduatoria | riserve | requisiti |
    -- date-sedi | inpa | acquisto | altro
    categoria       TEXT NOT NULL DEFAULT 'altro',
    -- le frasi/parole con cui la gente fa QUELLA domanda
    inneschi        TEXT[] NOT NULL DEFAULT '{}',
    -- il testo della risposta, in HTML Telegram (<b>, <i>, <a href>)
    testo           TEXT NOT NULL,
    -- true = il bot puo' pubblicarla da solo; false = prepara e Francesco decide.
    -- Si parte quasi sempre da false e si promuove quando la scheda ha retto.
    auto            BOOLEAN NOT NULL DEFAULT false,
    attivo          BOOLEAN NOT NULL DEFAULT true,
    -- concorso a cui si riferisce, se la risposta non e' generale
    bando           TEXT,
    note            TEXT,
    usi             INTEGER NOT NULL DEFAULT 0,
    ultimo_uso_at   TIMESTAMPTZ,
    creato_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    aggiornato_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_template_categoria_idx ON telegram_template (categoria);
-- GIN sull'array: il match parte dagli inneschi, ed e' l'operazione piu'
-- frequente del bot.
CREATE INDEX IF NOT EXISTS telegram_template_inneschi_idx  ON telegram_template USING GIN (inneschi);


-- ── 3. Registro delle risposte date ────────────────────────────────────────
-- Stessa logica di invii_email: cio' che non e' registrato, per il sistema non
-- e' mai successo. Serve a due cose concrete: non ripetere la stessa scheda
-- alla stessa persona a distanza di un'ora, e sapere quali template servono
-- davvero (i piu' usati meritano cura, quelli mai usati hanno inneschi sbagliati).
CREATE TABLE IF NOT EXISTS telegram_risposte (
    id              BIGSERIAL PRIMARY KEY,
    template_slug   TEXT REFERENCES telegram_template(slug) ON DELETE SET NULL,
    chat_id         BIGINT NOT NULL,
    -- messaggio a cui ha risposto e messaggio prodotto dal bot
    in_risposta_a   BIGINT,
    message_id      BIGINT,
    user_id         BIGINT,
    nome            TEXT,
    -- auto (pubblicata dal bot) | approvata (Francesco ha dato l'ok) | manuale
    modo            TEXT NOT NULL DEFAULT 'auto',
    risposto_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_risposte_utente_idx   ON telegram_risposte (user_id, risposto_at DESC);
CREATE INDEX IF NOT EXISTS telegram_risposte_template_idx ON telegram_risposte (template_slug, risposto_at DESC);

-- Quali schede tirano: uso per capire cosa il gruppo chiede davvero.
CREATE OR REPLACE VIEW telegram_template_uso AS
SELECT
    t.slug,
    t.titolo,
    t.categoria,
    t.attivo,
    t.auto,
    COUNT(r.id)::int   AS n_risposte,
    MAX(r.risposto_at) AS ultima_risposta_at
FROM telegram_template t
LEFT JOIN telegram_risposte r ON r.template_slug = t.slug
GROUP BY t.slug, t.titolo, t.categoria, t.attivo, t.auto
ORDER BY COUNT(r.id) DESC, t.slug;
