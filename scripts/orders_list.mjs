#!/usr/bin/env node
// ============================================================================
// Elenco clienti / ordini dal DB Neon + fatturato totale.
// Il "registro clienti" leggibile da terminale (sostituisce la conta a mano
// delle fatture in Gmail).
//
// Uso:
//   node scripts/orders_list.mjs                 # vista clienti (aggregati)
//   node scripts/orders_list.mjs --ordini        # tutti gli ordini, riga per riga
//   node scripts/orders_list.mjs --email <email> # ordini di un singolo cliente
//   node scripts/orders_list.mjs --json          # output JSON (per altri script)
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

try {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  console.error('[FAIL] .env.local non trovato')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  console.error('[FAIL] DATABASE_URL/POSTGRES_URL mancante in .env.local')
  process.exit(1)
}

const sql = neon(databaseUrl)

const args = new Set(process.argv.slice(2).filter(a => a.startsWith('--')))
const emailIdx = process.argv.indexOf('--email')
const filterEmail = emailIdx >= 0 ? (process.argv[emailIdx + 1] || '').toLowerCase().trim() : null
const asJson = args.has('--json')

function eur(v) {
  return v == null ? '—' : `${Number(v).toFixed(2)}€`
}
function dateOnly(ts) {
  return ts ? new Date(ts).toISOString().slice(0, 10) : '—'
}

// --- Singolo cliente: tutti i suoi ordini --------------------------------
if (filterEmail) {
  const rows = await sql`
    SELECT id, prodotto, formato, importo_eur, numero_fattura, stato, ordine_at
    FROM ordini
    WHERE LOWER(email) = ${filterEmail}
    ORDER BY ordine_at DESC
  `
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
  if (!rows.length) { console.log(`Nessun ordine per ${filterEmail}`); process.exit(0) }
  console.log(`\nOrdini di ${filterEmail}:\n`)
  let tot = 0
  for (const r of rows) {
    if (r.stato === 'pagato' && r.importo_eur != null) tot += Number(r.importo_eur)
    console.log(`  #${r.id}  ${dateOnly(r.ordine_at)}  ${eur(r.importo_eur).padStart(8)}  ` +
      `${(r.numero_fattura || '—').padEnd(8)}  ${r.stato.padEnd(10)}  ${r.prodotto}`)
  }
  console.log(`\n  Totale pagato: ${eur(tot)}\n`)
  process.exit(0)
}

// --- Tutti gli ordini, riga per riga -------------------------------------
if (args.has('--ordini')) {
  const rows = await sql`
    SELECT id, email, nome, prodotto, formato, importo_eur, numero_fattura, stato, ordine_at
    FROM ordini
    ORDER BY ordine_at DESC
  `
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
  if (!rows.length) { console.log('Nessun ordine registrato.'); process.exit(0) }
  console.log(`\n${rows.length} ordini:\n`)
  let tot = 0
  for (const r of rows) {
    if (r.stato === 'pagato' && r.importo_eur != null) tot += Number(r.importo_eur)
    console.log(`  #${String(r.id).padStart(3)}  ${dateOnly(r.ordine_at)}  ${eur(r.importo_eur).padStart(8)}  ` +
      `${(r.email || '').padEnd(28)}  ${r.prodotto}`)
  }
  console.log(`\n  Fatturato totale (pagati): ${eur(tot)}\n`)
  process.exit(0)
}

// --- Default: vista clienti (aggregati) ----------------------------------
const rows = await sql`SELECT * FROM clienti`
if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
if (!rows.length) { console.log('Nessun cliente registrato.'); process.exit(0) }

console.log(`\n${rows.length} clienti:\n`)
let tot = 0
for (const r of rows) {
  tot += Number(r.totale_speso_eur || 0)
  console.log(`  ${(r.nome || '—').padEnd(22)}  ${(r.email || '').padEnd(30)}  ` +
    `${String(r.n_ordini).padStart(2)} ord.  ${eur(r.totale_speso_eur).padStart(8)}  ` +
    `ultimo ${dateOnly(r.ultimo_ordine_at)}`)
}
console.log(`\n  Fatturato totale (pagati): ${eur(tot)}\n`)
