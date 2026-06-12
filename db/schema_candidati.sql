-- ============================================================================
-- Candidati / profili lead schema — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter e ordini.
--
-- Fonte UNICA del PROFILO della persona (chi è, che concorso fa, che materie
-- e formati le interessano), separata dagli ACQUISTI (tabella `ordini`).
--   · `candidati` = una riga per persona, alimentata dal form contatti.
--   · `ordini`    = una riga per transazione (cosa ha pagato).
-- Le due si uniscono via `email` nella view `candidato_completo` → quadro 360°
-- del candidato, per proporre materiali cuciti su misura partendo da una base
-- già nota (concorso + materie d'interesse + se ha già acquistato).
--
-- Applica con:  node db/apply_schema.mjs   (idempotente, applica anche questo)
--   NB: va applicato DOPO schema_ordini.sql (la view qui sotto usa `clienti`).
--
-- Solo DDL: i dati reali si popolano a runtime (upsert da api/contact.js,
-- + eventuale backfill dalle richieste form già in Gmail).
-- ============================================================================

CREATE TABLE IF NOT EXISTS candidati (
    -- email normalizzata (lowercase, trimmed) = chiave naturale della persona.
    email             TEXT PRIMARY KEY,
    nome              TEXT,
    -- profilo d'interesse, accumulato dedup a ogni nuova richiesta dal form:
    concorsi          TEXT[] NOT NULL DEFAULT '{}',   -- es. {RIPAM, MIC, Funzionari}
    materie_interesse TEXT[] NOT NULL DEFAULT '{}',   -- nomi materia da materie.js (es. {Contratti Pubblici})
    formati_interesse TEXT[] NOT NULL DEFAULT '{}',   -- {podcast, audio, video, manuale, report, simulatore}
    -- ultimo testo "cosa serve" inviato dal form (contesto qualitativo):
    note_ultima       TEXT,
    -- da dove arriva l'ultima richiesta: form | anteprima | quizpro
    source            TEXT,
    -- quante volte questa persona ci ha scritto dal form:
    n_richieste       INTEGER NOT NULL DEFAULT 1,
    primo_contatto    TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_contatto   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ricerca per data di ultimo contatto (i lead più freschi in cima).
CREATE INDEX IF NOT EXISTS candidati_ultimo_contatto_idx ON candidati (ultimo_contatto DESC);
-- Ricerca "chi è interessato alla materia X / al concorso Y" (GIN su array).
CREATE INDEX IF NOT EXISTS candidati_materie_gin  ON candidati USING GIN (materie_interesse);
CREATE INDEX IF NOT EXISTS candidati_concorsi_gin ON candidati USING GIN (concorsi);

-- Vista CANDIDATO_COMPLETO: profilo + acquisti uniti via email.
-- È il "quadro 360°" per cucire la proposta: cosa vuole (candidati) +
-- cosa ha già comprato e quanto ha speso (clienti, da schema_ordini.sql).
CREATE OR REPLACE VIEW candidato_completo AS
SELECT
    c.email,
    c.nome,
    c.concorsi,
    c.materie_interesse,
    c.formati_interesse,
    c.note_ultima,
    c.source,
    c.n_richieste,
    c.primo_contatto,
    c.ultimo_contatto,
    COALESCE(cl.n_ordini, 0)         AS n_ordini,
    COALESCE(cl.totale_speso_eur, 0) AS totale_speso_eur,
    cl.ultimo_ordine_at,
    (cl.email IS NOT NULL)           AS ha_acquistato
FROM candidati c
LEFT JOIN clienti cl ON cl.email = c.email
ORDER BY c.ultimo_contatto DESC;
