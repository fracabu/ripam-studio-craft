-- ============================================================================
-- Stato di lavorazione dei LEAD — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di newsletter/ordini/candidati.
--
-- Fonte UNICA di "a che punto sono con questa persona": di chi è la palla, che
-- cosa vuole, che cosa sto aspettando da lei. È il pezzo che mancava:
--   · `candidati`       = chi è e cosa le interessa (dal form)
--   · `invii_email`     = cosa le ho mandato e quando
--   · `anteprime_inviate` = quali materiali ha ricevuto
--   · `ordini`          = cosa ha pagato
--   · `lead_stato`      = ⟵ QUESTA: in che stato è la trattativa, adesso
--
-- PERCHÉ ESISTE (2026-08-05): lo stato dei lead viveva nella memoria di Claude
-- (file markdown, uno per persona) e nella testa di chi risponde. Risultato: il
-- 05/08 tre lead sono emersi scoperti da settimane, tra cui una richiesta di
-- preventivo per un GRUPPO di persone ferma da 6 giorni. Nessun registro sapeva
-- dirlo, perché nessun registro teneva il concetto di "aspetta una risposta".
--
-- REGOLA: dopo ogni scambio con un lead, aggiornare la riga qui
-- (`node scripts/lead_stato.mjs --set ...`). Una riga per persona, sempre viva.
--
-- Applica con:  node db/apply_schema.mjs   (idempotente)
--               node db/apply_schema.mjs schema_lead_stato.sql   (solo questo)
--
-- NB: solo DDL nel file (nessun dato personale). Le righe si scrivono a runtime.
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_stato (
    -- email normalizzata (lowercase) = stessa chiave di `candidati` e `clienti`,
    -- così le join sono dirette. NON aggiungere un id sintetico.
    email             TEXT PRIMARY KEY,
    nome              TEXT,

    -- di chi è la palla, adesso. È il campo che si guarda per sapere cosa fare:
    --   'da_rispondere' = aspetta NOI (ha scritto, non abbiamo replicato)
    --   'attesa_lead'   = aspetta LEI (le abbiamo scritto, deve rispondere)
    --   'in_lavorazione'= stiamo preparando qualcosa per lei (piano, materiale)
    --   'chiuso_vinto'  = ha comprato
    --   'chiuso_perso'  = ha declinato
    --   'freddo'        = silenzio prolungato, da ripescare
    stato             TEXT NOT NULL DEFAULT 'da_rispondere',

    -- hot | medio | cold — quanto vale muoversi presto su questa persona.
    priorita          TEXT NOT NULL DEFAULT 'medio',

    -- che cosa vuole, in una riga leggibile da umano (non uno slug).
    cosa_vuole        TEXT,

    -- che cosa esattamente stiamo aspettando, o che cosa dobbiamo fare noi.
    -- Con stato='attesa_lead' è la lista delle informazioni che le abbiamo chiesto.
    pendenza          TEXT,

    -- da dove arriva: form | mail | telegram | facebook | messenger | newsletter
    origine           TEXT,
    -- bando/i di riferimento, testo libero (es. 'MIC 1800 Cod. 01').
    concorso          TEXT,

    -- le due date che determinano di chi è la palla. Le popola chi aggiorna la
    -- riga; `giorni_fermo` sotto le usa per ordinare il lavoro.
    ultima_sua_at     TIMESTAMPTZ,   -- ultima volta che ci ha scritto
    ultima_nostra_at  TIMESTAMPTZ,   -- ultima volta che le abbiamo scritto

    note              TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_stato_stato_idx    ON lead_stato (stato);
CREATE INDEX IF NOT EXISTS lead_stato_priorita_idx ON lead_stato (priorita);
CREATE INDEX IF NOT EXISTS lead_stato_updated_idx  ON lead_stato (updated_at DESC);

-- Vista LEAD_DA_GESTIRE: la to-do vera e propria, già ordinata.
-- Prima chi aspetta noi, poi per priorità, poi per anzianità dell'attesa.
CREATE OR REPLACE VIEW lead_da_gestire AS
SELECT
    l.email,
    l.nome,
    l.stato,
    l.priorita,
    l.cosa_vuole,
    l.pendenza,
    l.concorso,
    l.origine,
    l.ultima_sua_at,
    l.ultima_nostra_at,
    -- da quanti giorni la palla è ferma dalla nostra parte
    CASE WHEN l.stato = 'da_rispondere' AND l.ultima_sua_at IS NOT NULL
         THEN EXTRACT(DAY FROM now() - l.ultima_sua_at)::int END AS giorni_fermo,
    (o.email IS NOT NULL)              AS ha_acquistato,
    COALESCE(o.totale_speso_eur, 0)    AS totale_speso_eur
FROM lead_stato l
LEFT JOIN clienti o ON o.email = l.email
WHERE l.stato IN ('da_rispondere', 'in_lavorazione', 'attesa_lead', 'freddo')
ORDER BY
    CASE l.stato WHEN 'da_rispondere' THEN 0 WHEN 'in_lavorazione' THEN 1
                 WHEN 'attesa_lead'   THEN 2 ELSE 3 END,
    CASE l.priorita WHEN 'hot' THEN 0 WHEN 'medio' THEN 1 ELSE 2 END,
    l.ultima_sua_at ASC NULLS LAST;

-- Vista LEAD_QUADRO: stato + profilo dal form + acquisti, in una riga sola.
-- È quella da leggere prima di rispondere a qualcuno.
CREATE OR REPLACE VIEW lead_quadro AS
SELECT
    l.email,
    COALESCE(l.nome, c.nome)      AS nome,
    l.stato,
    l.priorita,
    l.cosa_vuole,
    l.pendenza,
    l.concorso,
    c.concorsi                    AS concorsi_dal_form,
    c.materie_interesse,
    c.formati_interesse,
    c.n_richieste,
    l.ultima_sua_at,
    l.ultima_nostra_at,
    COALESCE(o.n_ordini, 0)       AS n_ordini,
    COALESCE(o.totale_speso_eur, 0) AS totale_speso_eur,
    l.note,
    l.updated_at
FROM lead_stato l
LEFT JOIN candidati c ON c.email = l.email
LEFT JOIN clienti   o ON o.email = l.email
ORDER BY l.updated_at DESC;
