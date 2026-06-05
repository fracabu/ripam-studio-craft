#!/usr/bin/env node
// ============================================================================
// Elenco del registro anteprime (tabella `anteprime_inviate` su Neon).
// Il "chi ha ricevuto cosa" leggibile da terminale — anti-doppione del drip.
//
// Uso:
//   node scripts/anteprime_list.mjs                    # vista per cliente (materie aggregate)
//   node scripts/anteprime_list.mjs --righe            # tutte le consegne, riga per riga
//   node scripts/anteprime_list.mjs --email <email>    # consegne di un singolo cliente
//   node scripts/anteprime_list.mjs --materia <slug>   # chi ha già ricevuto la materia X
//   node scripts/anteprime_list.mjs --json             # output JSON
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

const argv = process.argv.slice(2)
const args = new Set(argv.filter(a => a.startsWith('--')))
const emailIdx = argv.indexOf('--email')
const filterEmail = emailIdx >= 0 ? (argv[emailIdx + 1] || '').toLowerCase().trim() : null
const materiaIdx = argv.indexOf('--materia')
const filterMateria = materiaIdx >= 0 ? (argv[materiaIdx + 1] || '').trim() : null
const asJson = args.has('--json')

function dateOnly(ts) { return ts ? new Date(ts).toISOString().slice(0, 10) : '—' }

// --- Chi ha già ricevuto una materia (per il drip anti-doppione) ----------
if (filterMateria) {
  const rows = await sql`
    SELECT email, nome, formato, canale, inviata_at
    FROM anteprime_inviate
    WHERE materia = ${filterMateria}
    ORDER BY inviata_at ASC
  `
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
  console.log(`\nHanno già ricevuto "${filterMateria}": ${rows.length}\n`)
  for (const r of rows) {
    console.log(`  ${dateOnly(r.inviata_at)}  ${(r.email||'').padEnd(34)}  ${(r.formato||'').padEnd(13)}  via ${r.canale}`)
  }
  console.log()
  process.exit(0)
}

// --- Singolo cliente: tutte le sue anteprime ------------------------------
if (filterEmail) {
  const rows = await sql`
    SELECT materia, formato, canale, invio_id, inviata_at
    FROM anteprime_inviate
    WHERE LOWER(email) = ${filterEmail}
    ORDER BY inviata_at ASC
  `
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
  if (!rows.length) { console.log(`Nessuna anteprima registrata per ${filterEmail}`); process.exit(0) }
  console.log(`\nAnteprime ricevute da ${filterEmail}:\n`)
  for (const r of rows) {
    console.log(`  ${dateOnly(r.inviata_at)}  ${(r.materia||'').padEnd(24)}  ${(r.formato||'').padEnd(13)}  via ${r.canale}`)
  }
  console.log()
  process.exit(0)
}

// --- Tutte le consegne, riga per riga -------------------------------------
if (args.has('--righe')) {
  const rows = await sql`
    SELECT email, nome, materia, formato, canale, inviata_at
    FROM anteprime_inviate
    ORDER BY inviata_at DESC, email ASC
  `
  if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
  if (!rows.length) { console.log('Registro anteprime vuoto.'); process.exit(0) }
  console.log(`\n${rows.length} consegne:\n`)
  for (const r of rows) {
    console.log(`  ${dateOnly(r.inviata_at)}  ${(r.email||'').padEnd(34)}  ${(r.materia||'').padEnd(22)}  ${(r.formato||'').padEnd(13)}  ${r.canale}`)
  }
  console.log()
  process.exit(0)
}

// --- Default: vista per cliente (materie aggregate) -----------------------
const rows = await sql`SELECT * FROM anteprime_per_cliente`
if (asJson) { console.log(JSON.stringify(rows, null, 2)); process.exit(0) }
if (!rows.length) { console.log('Registro anteprime vuoto.'); process.exit(0) }
console.log(`\n${rows.length} clienti nel registro anteprime:\n`)
for (const r of rows) {
  const materie = Array.isArray(r.materie) ? r.materie.join(', ') : (r.materie || '')
  console.log(`  ${(r.email||'').padEnd(34)}  ${String(r.n_anteprime).padStart(2)} ant.  ult. ${dateOnly(r.ultima_inviata_at)}`)
  console.log(`      ${materie}`)
}
console.log()
