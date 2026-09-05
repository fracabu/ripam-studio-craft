#!/usr/bin/env node
// ============================================================================
// La memoria, interrogabile. Legge la tabella `memorie` su Neon, popolata da
// `scripts/memoria_sync.mjs`. Sola lettura: non scrive mai niente.
//
//   node scripts/memoria.mjs --cerca "prezzo report"     # full-text italiano
//   node scripts/memoria.mjs --cerca "libero" --tipo feedback
//   node scripts/memoria.mjs --apri project_listino_2026_09   # la memoria intera
//   node scripts/memoria.mjs --link project_registro_invii    # chi la cita, chi cita
//   node scripts/memoria.mjs --invisibili                # esistono ma non le trova nessuno
//   node scripts/memoria.mjs --stato                     # il quadro d'insieme
//
// La ricerca fa due passate: prima il full-text con i pesi (titolo > descrizione
// > corpo), poi — se non trova nulla — la sottostringa grezza, perche' lo
// stemmer italiano maciulla nomi propri, email e sigle di bando ('FT-47').
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
const val = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? (argv[i + 1] ?? null) : null }
const has = (flag) => argv.includes(flag)

const q = val('--cerca')
const tipo = val('--tipo')
const apri = val('--apri')
const link = val('--link')
const limite = parseInt(val('--limite') ?? '12', 10)

const T = {
  feedback: '\x1b[33mfeedback \x1b[0m',
  project: '\x1b[36mproject  \x1b[0m',
  reference: '\x1b[35mreference\x1b[0m',
  user: '\x1b[32muser     \x1b[0m',
}
const etichettaTipo = (t) => T[t] ?? t.padEnd(9)
const g = (s) => `\x1b[90m${s}\x1b[0m`
const b = (s) => `\x1b[1m${s}\x1b[0m`

// Tutto dentro main(): su Windows `process.exit()` a query appena chiusa fa
// abortire libuv (assertion in async.c) — si esce restituendo, non uccidendo.
async function main() {

// --------------------------------------------------------------------------
if (apri) {
  const [m] = await sql`SELECT * FROM memorie WHERE slug = ${apri}`
  if (!m) {
    const simili = await sql`SELECT slug FROM memorie WHERE slug ILIKE ${'%' + apri + '%'} LIMIT 8`
    console.error(`Nessuna memoria "${apri}".`)
    if (simili.length) console.error('Forse: ' + simili.map(s => s.slug).join(', '))
    process.exitCode = 1
    return
  }
  console.log('='.repeat(72))
  console.log(b(m.titolo || m.slug))
  console.log(g(`${m.slug}  ·  ${m.tipo}  ·  ${m.file_bytes} B  ·  ${m.marker ?? ''}`))
  console.log(g(m.sezione ? `indice: ${m.sezione}` : 'FUORI INDICE'))
  console.log('='.repeat(72))
  console.log(m.descrizione ? g(m.descrizione) + '\n' : '')
  console.log(m.corpo)
  return
}

// --------------------------------------------------------------------------
if (link) {
  const entranti = await sql`
    SELECT l.da_slug, m.tipo, m.descrizione
    FROM memorie_link l JOIN memorie m ON m.slug = l.da_slug
    WHERE l.a_slug = ${link} ORDER BY l.da_slug`
  const uscenti = await sql`
    SELECT l.a_slug, l.rotto, m.descrizione
    FROM memorie_link l LEFT JOIN memorie m ON m.slug = l.a_slug
    WHERE l.da_slug = ${link} ORDER BY l.a_slug`

  console.log(b(`\n  ← LA CITANO (${entranti.length})`))
  for (const r of entranti) console.log(`  ${etichettaTipo(r.tipo)} ${r.da_slug}\n     ${g((r.descrizione ?? '').slice(0, 100))}`)
  if (!entranti.length) console.log(g('  nessuno — se non e\' nell\'indice, e\' irraggiungibile'))

  console.log(b(`\n  → CITA (${uscenti.length})`))
  for (const r of uscenti) console.log(`  ${r.rotto ? '\x1b[31mROTTO\x1b[0m    ' : '         '} ${r.a_slug}`)
  console.log()
  return
}

// --------------------------------------------------------------------------
if (has('--invisibili')) {
  const rows = await sql`SELECT * FROM memorie_invisibili`
  console.log(b(`\n  ${rows.length} memorie che nessuno puo' trovare`))
  console.log(g('  non sono nell\'indice e nessun\'altra memoria le cita: esistono solo qui.\n'))
  for (const r of rows) {
    console.log(`  ${etichettaTipo(r.tipo)} ${b(r.slug)}  ${g((r.ultima_modifica ?? '').toString().slice(0, 10))}`)
    console.log(`     ${g((r.descrizione ?? '').slice(0, 110))}`)
  }
  console.log()
  return
}

// --------------------------------------------------------------------------
if (has('--stato')) {
  const tipi = await sql`SELECT * FROM memorie_per_tipo`
  const [tot] = await sql`SELECT COUNT(*)::int n, SUM(file_bytes)::int b,
                                 COUNT(*) FILTER (WHERE in_indice)::int idx,
                                 MAX(sincronizzata_at) AS sync FROM memorie`
  const [lk] = await sql`SELECT COUNT(*)::int n, COUNT(*) FILTER (WHERE rotto)::int r FROM memorie_link`
  const [inv] = await sql`SELECT COUNT(*)::int n FROM memorie_invisibili`

  console.log(b('\n  LA MEMORIA, IN NUMERI\n'))
  const quando = tot.sync ? new Date(tot.sync).toISOString().replace('T', ' ').slice(0, 16) : 'mai'
  console.log(`  ${tot.n} memorie · ${(tot.b / 1024).toFixed(0)} KB · ultimo allineamento ${g(quando)}`)
  console.log(`  nell'indice ${tot.idx}  ·  fuori ${tot.n - tot.idx}  ·  irraggiungibili ${inv.n}`)
  console.log(`  collegamenti ${lk.n} (${lk.r} rotti)\n`)
  for (const t of tipi)
    console.log(`  ${etichettaTipo(t.tipo)} ${String(t.memorie).padStart(3)}  ${g(`${(t.bytes / 1024).toFixed(0)} KB · ${t.fuori_indice} fuori indice`)}`)
  console.log()
  return
}

// --------------------------------------------------------------------------
if (!q) {
  console.log(`
  node scripts/memoria.mjs --cerca "<testo>"     cerca ovunque
                           --tipo feedback       ... solo un tipo
                           --apri <slug>         leggi una memoria intera
                           --link <slug>         chi la cita e chi cita lei
                           --invisibili          quelle che nessuno trova
                           --stato               il quadro d'insieme
`)
  return
}

// Passata 1: full-text pesato.
let rows = await sql`
  SELECT slug, tipo, titolo, descrizione, marker, sezione, in_indice, file_bytes,
         COALESCE(modificata_at, file_mtime) AS quando,
         ts_rank(ricerca, websearch_to_tsquery('italian', ${q})) AS rank,
         ts_headline('italian', corpo, websearch_to_tsquery('italian', ${q}),
                     'MaxWords=28, MinWords=12, StartSel=», StopSel=«, MaxFragments=1') AS estratto
  FROM memorie
  WHERE ricerca @@ websearch_to_tsquery('italian', ${q})
    AND (${tipo}::text IS NULL OR tipo = ${tipo})
  ORDER BY rank DESC, priorita DESC, quando DESC NULLS LAST
  LIMIT ${limite}`

let modo = 'full-text'

// Passata 2: sottostringa grezza, per nomi propri / sigle / email.
if (!rows.length) {
  modo = 'sottostringa'
  rows = await sql`
    SELECT slug, tipo, titolo, descrizione, marker, sezione, in_indice, file_bytes,
           COALESCE(modificata_at, file_mtime) AS quando, 0 AS rank,
           substring(corpo from GREATEST(1, position(lower(${q}) in lower(corpo)) - 60) for 160) AS estratto
    FROM memorie
    WHERE (corpo ILIKE ${'%' + q + '%'} OR slug ILIKE ${'%' + q + '%'} OR descrizione ILIKE ${'%' + q + '%'})
      AND (${tipo}::text IS NULL OR tipo = ${tipo})
    ORDER BY priorita DESC, quando DESC NULLS LAST
    LIMIT ${limite}`
}

console.log(b(`\n  "${q}" → ${rows.length} risultati`) + g(`  (${modo}${tipo ? `, tipo=${tipo}` : ''})\n`))

for (const r of rows) {
  const dove = r.in_indice ? g(r.sezione ?? '') : '\x1b[31mfuori indice\x1b[0m'
  console.log(`  ${etichettaTipo(r.tipo)} ${b(r.slug)} ${r.marker ?? ''}  ${dove}`)
  if (r.descrizione) console.log(`     ${(r.descrizione).slice(0, 120)}`)
  if (r.estratto) console.log(g(`     …${r.estratto.replace(/\s+/g, ' ').trim()}…`))
  console.log()
}

if (rows.length) console.log(g(`  apri con:  node scripts/memoria.mjs --apri ${rows[0].slug}\n`))

} // fine main()

await main()
