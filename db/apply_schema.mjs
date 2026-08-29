#!/usr/bin/env node
// ============================================================================
// Applica gli schema SQL al database Neon dedicato a Ripam Studio Craft.
//
// Setup:
//   1. Crea database Neon dal dashboard Vercel del progetto ripam-studio-craft:
//      Storage tab -> Create -> Postgres (Neon) -> region Frankfurt -> Create
//      Vercel inietta automaticamente DATABASE_URL nelle env vars del progetto.
//   2. Sincronizza le env in locale:
//      npx vercel link        (collega questa cartella al progetto Vercel)
//      npx vercel env pull .env.local
//   3. Lancia: node db/apply_schema.mjs
//
// Applica TUTTI gli schema in SCHEMAS (newsletter + ordini). È idempotente
// (CREATE TABLE/INDEX IF NOT EXISTS, CREATE OR REPLACE VIEW): rilanciabile in
// sicurezza dopo modifiche. Per applicarne uno solo:
//   node db/apply_schema.mjs schema_ordini.sql
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client, neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Tutti gli schema da applicare, in ordine (newsletter, ordini, candidati, anteprime, invii).
// NB: schema_candidati DOPO schema_ordini → la view `candidato_completo` usa `clienti`.
// NB: schema_bounce DOPO schema_newsletter → la view `indirizzi_morti` legge `newsletter_subscribers`.
const SCHEMAS = ['schema_newsletter.sql', 'schema_ordini.sql', 'schema_candidati.sql', 'schema_anteprime.sql', 'schema_invii.sql', 'schema_telegram.sql', 'schema_bounce.sql']

// Carica .env.local manualmente (no dotenv, niente dipendenze extra)
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
      if (m) {
        const [, key, val] = m
        const v = val.replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = v
      }
    }
  } catch {
    // .env.local non esiste, usa solo process.env
  }
}

loadEnv()

// Vercel-Neon injection: DATABASE_URL (pooled, ideale per serverless),
// alias possibili: POSTGRES_URL, NEON_DATABASE_URL, CRAFT_DATABASE_URL (legacy).
const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.CRAFT_DATABASE_URL

if (!url) {
  console.error('[FAIL] Nessuna connection string trovata.')
  console.error('       Cercata: DATABASE_URL, POSTGRES_URL, NEON_DATABASE_URL, CRAFT_DATABASE_URL')
  console.error('       Sincronizza con: npx vercel env pull .env.local')
  process.exit(1)
}

// Override opzionale: applica solo lo schema passato come argomento.
const onlySchema = process.argv[2]
const schemasToApply = onlySchema ? [onlySchema] : SCHEMAS

// Maschera la password nel log: postgres://user:***@host/db
const masked = url.replace(/:[^:@/]+@/, ':***@')
console.log(`[..] DB target: ${masked}`)

// Per DDL serve Client (TCP/WebSocket): l'API HTTP neon() accetta solo template tag.
const client = new Client(url)
await client.connect()

// Per le query di verifica finali manteniamo anche l'API HTTP comoda.
const sql = neon(url)

// 1) Rimuovi commenti single-line '-- ...' prima dello split, altrimenti
//    statement preceduti da commenti header vengono erroneamente scartati.
//    Non rimuovere se siamo dentro un blocco $$...$$ (raro qui ma safe).
function stripLineComments(s) {
  // approccio semplice: rimuovi tutto da '--' a fine riga, riga per riga.
  // Lo schema non contiene stringhe con '--' annidate.
  return s.split('\n').map(line => {
    const idx = line.indexOf('--')
    return idx >= 0 ? line.slice(0, idx) : line
  }).join('\n')
}

// 2) Split sugli ';' di livello base, ignorando ';' dentro $$...$$ (plpgsql body).
function splitStatements(s) {
  const statements = []
  let buf = ''
  let inDollar = false
  for (let i = 0; i < s.length; i++) {
    const next2 = s.slice(i, i + 2)
    if (next2 === '$$') {
      inDollar = !inDollar
      buf += next2
      i++
      continue
    }
    const c = s[i]
    if (c === ';' && !inDollar) {
      const trimmed = buf.trim()
      if (trimmed) statements.push(trimmed)
      buf = ''
      continue
    }
    buf += c
  }
  const tail = buf.trim()
  if (tail) statements.push(tail)
  return statements
}

let totalApplied = 0
let totalFailed = 0

for (const schemaFile of schemasToApply) {
  let schemaSql
  try {
    schemaSql = readFileSync(join(__dirname, schemaFile), 'utf8')
  } catch {
    console.error(`\n[FAIL] schema non trovato: ${schemaFile}`)
    totalFailed++
    continue
  }

  const statements = splitStatements(stripLineComments(schemaSql))
  console.log(`\n[..] ${schemaFile}: applico ${statements.length} statement`)

  for (const [i, stmt] of statements.entries()) {
    const preview = stmt.slice(0, 70).replace(/\s+/g, ' ')
    try {
      await client.query(stmt)
      totalApplied++
      console.log(`  [${String(i + 1).padStart(2, '0')}/${statements.length}] OK  ${preview}...`)
    } catch (err) {
      totalFailed++
      console.error(`  [${String(i + 1).padStart(2, '0')}/${statements.length}] FAIL  ${preview}...`)
      console.error(`       ${err.message}`)
    }
  }
}

await client.end()

console.log(`\n=== Done ===`)
console.log(`Applied: ${totalApplied}`)
if (totalFailed > 0) {
  console.error(`Failed:  ${totalFailed}`)
  process.exit(2)
}

// Smoke check: leggi struttura tabelle chiave e count.
try {
  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'newsletter_subscribers'
    ORDER BY ordinal_position
  `
  if (cols.length) {
    console.log(`\nnewsletter_subscribers ha ${cols.length} colonne`)
    const count = await sql`SELECT COUNT(*)::int AS n FROM newsletter_subscribers`
    console.log(`Iscritti attuali: ${count[0].n}`)
  }

  const ordiniCols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ordini'
    ORDER BY ordinal_position
  `
  if (ordiniCols.length) {
    console.log(`\nordini ha ${ordiniCols.length} colonne:`)
    for (const c of ordiniCols) console.log(`  · ${c.column_name} (${c.data_type})`)
    const oc = await sql`SELECT COUNT(*)::int AS n FROM ordini`
    console.log(`Ordini registrati: ${oc[0].n}`)
  }
} catch (err) {
  console.error(`[WARN] smoke check fallita: ${err.message}`)
}
