-- ============================================================================
-- Memoria di lavoro — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter/ordini/invii.
--
-- Specchio interrogabile della cartella `memory/` dell'harness (274 file .md,
-- ~990 KB). Serve a due cose che i file da soli non sanno fare:
--   1. CERCARE. Oggi o l'informazione sta in MEMORY.md, o va trovata aprendo i
--      file a uno a uno: con 274 file, una memoria non linkata dall'indice di
--      fatto non esiste. Qui c'e' il full-text italiano.
--   2. REGGERE LA CRESCITA. MEMORY.md e' l'unico file caricato a ogni sessione
--      ed era arrivato a 21,4 KB contro un limite di lettura di 24,4 KB. E'
--      stato ricompattato a mano due volte, perdendo dettaglio ogni volta.
--
-- ⚠️ SENSO UNICO: la fonte di scrittura restano i FILE, che l'harness scrive da
--    se'. Questo DB e' uno specchio in sola lettura, rigenerato da
--    `scripts/memoria_sync.mjs`. Nessuno script scrive nei file partendo da qui:
--    due verita' sono esattamente l'errore del proxy di `invii_email`.
--
-- ⚠️ CHIAVE = IL NOME DEL FILE, mai il campo `name:` del frontmatter. Censimento
--    del 04/09/2026: 62 file su 274 hanno un `name:` diverso dal basename
--    (`feedback-git-push` per `feedback_git_push.md`, o titoli liberi come
--    «Mai pushare senza chiedere»). I wikilink [[...]] usano il basename: usare
--    `name:` come identificatore romperebbe un quarto dei riferimenti.
--
-- 🔴 PRIVACY: la colonna `corpo` contiene i corpi delle memorie, quindi NOMI DI
--    CANDIDATI E CLIENTI. Sta qui, su Neon in regione UE, che e' il posto dove
--    quei dati devono stare — mai in un file tracciato da git. Questo .sql e'
--    tracciato: contiene solo DDL, nessun dato reale, e va tenuto cosi'.
--
-- Applica con:  node db/apply_schema.mjs
--               node db/apply_schema.mjs schema_memorie.sql   (solo questo)
-- ============================================================================

CREATE TABLE IF NOT EXISTS memorie (
    -- basename del file senza .md. E' la chiave vera e quella dei wikilink.
    slug             TEXT PRIMARY KEY,
    -- user | feedback | project | reference. Letto da metadata.type (263 file,
    -- formato nuovo) con fallback su type: al primo livello (11 file, vecchio).
    tipo             TEXT NOT NULL DEFAULT 'project',
    -- campo `name:` del frontmatter: titolo/alias, NON identificatore.
    titolo           TEXT,
    descrizione      TEXT,
    corpo            TEXT NOT NULL DEFAULT '',

    -- ---- curatela, letta da MEMORY.md ------------------------------------
    -- Sono i dati che oggi esistono SOLO nell'indice scritto a mano: se non si
    -- catturano, la rigenerazione dell'indice (fase 2) li perde per sempre.
    sezione          TEXT,      -- l'## di MEMORY.md sotto cui sta ('Lead caldi'…)
    etichetta        TEXT,      -- testo visibile del link
    hook             TEXT,      -- la coda della riga, la frase che fa decidere se aprirlo
    marker           TEXT,      -- gli emoji davanti al link, verbatim ('⭐⭐', '🔥', '⚠️⭐')
    priorita         SMALLINT NOT NULL DEFAULT 0,  -- ⭐ e 🔥 contati, 0-4
    in_indice        BOOLEAN  NOT NULL DEFAULT false,
    indice_riga      INTEGER,   -- n. di riga in MEMORY.md, per ricostruire l'ordine
    indice_ordine    INTEGER,   -- posizione del link dentro la riga (righe multi-link)

    -- ---- provenienza dal file --------------------------------------------
    file_bytes       INTEGER NOT NULL DEFAULT 0,
    -- sha256 del file: il sync riscrive solo cio' che e' cambiato davvero.
    contenuto_hash   TEXT NOT NULL,
    modificata_at    TIMESTAMPTZ,   -- metadata.modified (c'e' su 172 file su 274)
    file_mtime       TIMESTAMPTZ,
    origin_session   TEXT,
    sincronizzata_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memorie_tipo_idx     ON memorie (tipo);
CREATE INDEX IF NOT EXISTS memorie_priorita_idx ON memorie (priorita DESC);
CREATE INDEX IF NOT EXISTS memorie_recenti_idx  ON memorie (COALESCE(modificata_at, file_mtime) DESC);

-- Full-text italiano. Underscore e trattini diventano spazi, altrimenti
-- 'project_lead_rosy_diritto_amm' resta un token solo e cercare "rosy" non
-- lo trova. Pesi: A = slug+titolo, B = descrizione, C = corpo — cosi' una
-- parola nel titolo vale piu' della stessa parola persa in fondo al corpo.
ALTER TABLE memorie ADD COLUMN IF NOT EXISTS ricerca tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('italian',
            replace(replace(COALESCE(slug, ''), '_', ' '), '-', ' ') || ' ' ||
            COALESCE(titolo, '')), 'A')
        || setweight(to_tsvector('italian', COALESCE(descrizione, '')), 'B')
        || setweight(to_tsvector('italian', COALESCE(corpo, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS memorie_ricerca_idx ON memorie USING GIN (ricerca);

-- Ricerca per sottostringa (nomi propri, email, sigle di bando che lo stemmer
-- italiano maciulla): pg_trgm se disponibile, altrimenti si usa ILIKE e basta.
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS memorie_corpo_trgm_idx ON memorie USING GIN (corpo gin_trgm_ops);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm non disponibile: la ricerca per sottostringa usera'' ILIKE senza indice';
END $$;

-- ============================================================================
-- Grafo dei wikilink [[slug]]. 853 link fra i 274 file: e' la struttura che
-- permette di chiedere "chi punta a questa memoria?" — l'unico modo di
-- ritrovare una memoria che l'indice non nomina.
-- `rotto` = il bersaglio non esiste come file (22 casi al 04/09/2026, quasi
-- tutti varianti con trattini di uno slug con underscore).
-- ============================================================================
CREATE TABLE IF NOT EXISTS memorie_link (
    da_slug   TEXT    NOT NULL REFERENCES memorie(slug) ON DELETE CASCADE,
    a_slug    TEXT    NOT NULL,
    rotto     BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (da_slug, a_slug)
);

CREATE INDEX IF NOT EXISTS memorie_link_a_idx ON memorie_link (a_slug);

-- Vista: quante memorie per tipo, quanto pesano, quante arrivano all'indice.
CREATE OR REPLACE VIEW memorie_per_tipo AS
SELECT
    tipo,
    COUNT(*)::int                                        AS memorie,
    SUM(file_bytes)::int                                 AS bytes,
    COUNT(*) FILTER (WHERE in_indice)::int               AS in_indice,
    COUNT(*) FILTER (WHERE NOT in_indice)::int           AS fuori_indice,
    MAX(COALESCE(modificata_at, file_mtime))             AS ultima_modifica
FROM memorie
GROUP BY tipo
ORDER BY COUNT(*) DESC;

-- Vista: le memorie IRRAGGIUNGIBILI — non nominate dall'indice e senza nessun
-- wikilink entrante. Esistono su disco ma nessuna sessione le trovera' mai,
-- se non con la ricerca. E' il conto esatto di quanto costa l'indice troppo corto.
CREATE OR REPLACE VIEW memorie_invisibili AS
SELECT
    m.slug,
    m.tipo,
    m.descrizione,
    m.file_bytes,
    COALESCE(m.modificata_at, m.file_mtime) AS ultima_modifica
FROM memorie m
WHERE NOT m.in_indice
  AND NOT EXISTS (SELECT 1 FROM memorie_link l WHERE l.a_slug = m.slug)
ORDER BY COALESCE(m.modificata_at, m.file_mtime) DESC NULLS LAST;

-- Vista: i wikilink che non atterrano da nessuna parte.
CREATE OR REPLACE VIEW memorie_link_rotti AS
SELECT a_slug AS bersaglio_mancante,
       COUNT(*)::int                    AS puntato_da,
       ARRAY_AGG(da_slug ORDER BY da_slug) AS sorgenti
FROM memorie_link
WHERE rotto
GROUP BY a_slug
ORDER BY COUNT(*) DESC;
