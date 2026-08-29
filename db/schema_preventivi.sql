-- ============================================================================
-- Registro preventivi — Ripam Studio Craft
-- Database: Neon PostgreSQL (UE region) — stesso DB di ordini/invii/anteprime.
--
-- Fonte UNICA di "a chi ho quotato cosa, a quanto, e com'è finita".
--
-- PERCHÉ ESISTE (2026-08-29): `ordini` dice quanto è stato incassato, mai quante
-- volte è stato chiesto. I quattro ordini da 99 € possono venire da cinque
-- preventivi (80% di chiusura: prezzo basso) o da venti (20%: prezzo alto) —
-- due mondi opposti, indistinguibili dai dati esistenti. Senza il denominatore
-- il prezzo si tara a sensazione, ed è così che lo stesso kit MIC è uscito a
-- 139 € il 27/08 e a 99 € il 29/08.
--
-- REGOLA: ogni volta che in una mail esce un prezzo, si registra una riga qui.
-- L'esito NON si scrive a mano: lo calcola `conversioni.mjs` incrociando
-- `ordini` (stessa email, ordine successivo alla data del preventivo). Il campo
-- `esito` serve solo per le chiusure che il DB non può vedere — un "no" detto
-- esplicitamente, o un preventivo ritirato.
--
-- Applica con:  node db/apply_schema.mjs schema_preventivi.sql   (idempotente)
--
-- NB: solo DDL nel file. Le righe si scrivono a runtime con preventivo_add.mjs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS preventivi (
    id              SERIAL PRIMARY KEY,
    email           TEXT NOT NULL,
    nome            TEXT,
    -- il bando su cui è stato quotato (es. 'mic-1800-cod01'), per confrontare
    -- lo stesso prodotto fra persone diverse.
    bando           TEXT,
    -- cosa è stato offerto, in chiaro: "kit 16 report MIC Cod. 01"
    offerta         TEXT NOT NULL,
    -- IL numero che conta: il prezzo dell'opzione principale, quella che il
    -- preventivo spinge. Se la mail ne conteneva altre, vanno in `alternative`.
    importo_eur     NUMERIC(8,2) NOT NULL,
    -- le altre opzioni della stessa mail, come testo: "159 (3 serie) · 199 (tutte)"
    alternative     TEXT,
    -- campagna della mail in `invii_email`, per risalire al testo spedito
    campagna        TEXT,
    -- esito NOTO, quando il DB non può dedurlo:
    --   aperto (default) | perso | ritirato
    -- 'chiuso' NON si scrive qui: lo deduce conversioni.mjs dagli ordini.
    esito           TEXT NOT NULL DEFAULT 'aperto',
    note            TEXT,
    quotato_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS preventivi_lower_idx    ON preventivi (LOWER(email));
CREATE INDEX IF NOT EXISTS preventivi_quotato_idx  ON preventivi (quotato_at DESC);
CREATE INDEX IF NOT EXISTS preventivi_bando_idx    ON preventivi (bando);

-- Anti-doppione morbido: stessa persona + stessa offerta + stesso giorno = una
-- riga. Riquotare la stessa cosa in un altro momento è un preventivo NUOVO (ed
-- è un dato prezioso: dice che il primo non aveva chiuso).
-- NB: DATE(quotato_at) non è indicizzabile (dipende dal fuso della sessione →
-- non IMMUTABLE): si normalizza a UTC, che invece lo è.
CREATE UNIQUE INDEX IF NOT EXISTS preventivi_uq
    ON preventivi (LOWER(email), offerta, (timezone('UTC', quotato_at)::date));

-- Vista di comodo: un preventivo per riga con i giorni trascorsi.
CREATE OR REPLACE VIEW preventivi_aperti AS
SELECT p.id, p.nome, p.email, p.bando, p.offerta, p.importo_eur, p.campagna,
       p.quotato_at::date AS quotato_il,
       (CURRENT_DATE - p.quotato_at::date) AS giorni_fa
FROM preventivi p
WHERE p.esito = 'aperto'
  AND NOT EXISTS (
      SELECT 1 FROM ordini o
      WHERE LOWER(o.email) = LOWER(p.email)
        AND o.stato = 'pagato'
        AND o.ordine_at >= p.quotato_at
  )
ORDER BY p.quotato_at;
