-- ============================================================================
-- Registro anteprime inviate — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter e ordini.
--
-- Fonte UNICA di "chi ha ricevuto quale anteprima, quando, con che canale".
-- Serve al DRIP ANTEPRIME come anti-doppione: prima di mandare la materia X a
-- un iscritto si controlla qui che non gliel'abbia già data la welcome, un
-- lead, il blast o un drip precedente.
--
-- Applica con:  node db/apply_schema.mjs   (idempotente)
--               node db/apply_schema.mjs schema_anteprime.sql  (solo questo)
--
-- NB: solo DDL nel file (nessun dato personale). Le righe reali si inseriscono
--     a runtime con scripts/anteprima_log.mjs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS anteprime_inviate (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    nome            TEXT,
    -- slug materia (stabile, come in src/data/materie.js), es. 'pubblico-impiego'.
    -- Per consegne non legate a una materia usare uno slug descrittivo.
    materia         TEXT NOT NULL,
    -- cosa è stato mandato di quella materia:
    -- completa-avm (audio+video+manuale) | audio | video | manuale | report | kit | altro
    formato         TEXT NOT NULL DEFAULT 'completa-avm',
    -- canale di consegna: welcome | drip | lead | blast | manuale
    canale          TEXT NOT NULL DEFAULT 'manuale',
    -- riferimento opzionale al "pacchetto" (es. id file drip 'drip-2026-06-05'
    -- o newsletter_id) per ricostruire cosa conteneva quell'invio.
    invio_id        TEXT,
    gmail_thread_id TEXT,
    note            TEXT,
    inviata_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ricerca per cliente (case-insensitive), per materia e per data.
CREATE INDEX IF NOT EXISTS anteprime_email_lower_idx ON anteprime_inviate (LOWER(email));
CREATE INDEX IF NOT EXISTS anteprime_materia_idx     ON anteprime_inviate (materia);
CREATE INDEX IF NOT EXISTS anteprime_inviata_at_idx  ON anteprime_inviate (inviata_at DESC);

-- Anti-doppione: stessa email + stessa materia + stesso formato = una sola riga.
-- (formato è NOT NULL con default, quindi il vincolo è sempre attivo.) Così
-- rilanciare un backfill o un drip non duplica, ma resta possibile mandare la
-- stessa materia in un formato diverso più avanti (es. dopo un manuale-only,
-- la serie completa audio+video+manuale).
CREATE UNIQUE INDEX IF NOT EXISTS anteprime_email_materia_formato_uq
    ON anteprime_inviate (LOWER(email), materia, formato);

-- Vista: una riga per cliente con l'elenco delle materie già ricevute
-- (array aggregato) + conteggio e ultimo invio. Il "registro anti-doppione"
-- leggibile a colpo d'occhio.
CREATE OR REPLACE VIEW anteprime_per_cliente AS
SELECT
    LOWER(email)                       AS email,
    MAX(nome)                          AS nome,
    COUNT(*)::int                      AS n_anteprime,
    ARRAY_AGG(DISTINCT materia ORDER BY materia) AS materie,
    MIN(inviata_at)                    AS prima_inviata_at,
    MAX(inviata_at)                    AS ultima_inviata_at
FROM anteprime_inviate
GROUP BY LOWER(email)
ORDER BY MAX(inviata_at) DESC;
