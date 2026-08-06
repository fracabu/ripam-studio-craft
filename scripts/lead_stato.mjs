#!/usr/bin/env node
// ============================================================================
// Stato di lavorazione dei lead: leggere e aggiornare la tabella `lead_stato`.
//
// È la to-do dei lead, a DB invece che nella memoria di Claude o nella testa di
// chi risponde. Vedi db/schema_lead_stato.sql per il perché.
//
// LEGGERE
//   node scripts/lead_stato.mjs                      # to-do: chi aspetta noi, in ordine
//   node scripts/lead_stato.mjs --tutti              # tutti i lead aperti (anche attesa_lead)
//   node scripts/lead_stato.mjs --stato attesa_lead  # filtra per stato
//   node scripts/lead_stato.mjs --email x@y.it       # quadro completo di una persona
//   node scripts/lead_stato.mjs --json               # output JSON (per altri script)
//
// SCRIVERE (upsert: aggiorna solo i campi passati, gli altri restano)
//   node scripts/lead_stato.mjs --set --email x@y.it --nome "Tizia" \
//     --stato attesa_lead --priorita hot --concorso "MIC 1800 Cod. 01" \
//     --cosa-vuole "preventivo materiali per il gruppo" \
//     --pendenza "attende: ore/giorno, orizzonte, basi, quante sono" \
//     --origine mail --sua 2026-07-30 --nostra 2026-08-05 --note "..."
//
//   node scripts/lead_stato.mjs --chiudi --email x@y.it --esito vinto|perso
//
// Stati: da_rispondere | in_lavorazione | attesa_lead | chiuso_vinto | chiuso_perso | freddo
// Priorità: hot | medio | cold
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

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}

const STATI = ['da_rispondere', 'in_lavorazione', 'attesa_lead', 'chiuso_vinto', 'chiuso_perso', 'freddo']
const PRIORITA = ['hot', 'medio', 'cold']

const ICONA = {
  da_rispondere: '🔴',
  in_lavorazione: '🟠',
  attesa_lead: '🟢',
  freddo: '⚪',
  chiuso_vinto: '💰',
  chiuso_perso: '✖️',
}

// ---------------------------------------------------------------- scrittura
if (has('--set') || has('--chiudi')) {
  const email = (val('--email') || '').toLowerCase().trim()
  if (!email) {
    console.error('[FAIL] serve --email')
    process.exit(1)
  }

  let stato = val('--stato')
  if (has('--chiudi')) {
    const esito = (val('--esito') || '').toLowerCase()
    if (!['vinto', 'perso'].includes(esito)) {
      console.error('[FAIL] --chiudi richiede --esito vinto|perso')
      process.exit(1)
    }
    stato = esito === 'vinto' ? 'chiuso_vinto' : 'chiuso_perso'
  }
  if (stato && !STATI.includes(stato)) {
    console.error(`[FAIL] stato non valido: ${stato}\n       ammessi: ${STATI.join(' | ')}`)
    process.exit(1)
  }
  const priorita = val('--priorita')
  if (priorita && !PRIORITA.includes(priorita)) {
    console.error(`[FAIL] priorità non valida: ${priorita}\n       ammesse: ${PRIORITA.join(' | ')}`)
    process.exit(1)
  }

  // COALESCE su ogni campo: quello che non passi resta com'era.
  const [row] = await sql`
    INSERT INTO lead_stato (email, nome, stato, priorita, cosa_vuole, pendenza,
                            origine, concorso, ultima_sua_at, ultima_nostra_at, note)
    VALUES (${email}, ${val('--nome')}, ${stato || 'da_rispondere'},
            ${priorita || 'medio'}, ${val('--cosa-vuole')}, ${val('--pendenza')},
            ${val('--origine')}, ${val('--concorso')},
            ${val('--sua')}::timestamptz, ${val('--nostra')}::timestamptz, ${val('--note')})
    ON CONFLICT (email) DO UPDATE SET
      nome             = COALESCE(EXCLUDED.nome, lead_stato.nome),
      stato            = COALESCE(${stato}, lead_stato.stato),
      priorita         = COALESCE(${priorita}, lead_stato.priorita),
      cosa_vuole       = COALESCE(EXCLUDED.cosa_vuole, lead_stato.cosa_vuole),
      pendenza         = COALESCE(EXCLUDED.pendenza, lead_stato.pendenza),
      origine          = COALESCE(EXCLUDED.origine, lead_stato.origine),
      concorso         = COALESCE(EXCLUDED.concorso, lead_stato.concorso),
      ultima_sua_at    = COALESCE(EXCLUDED.ultima_sua_at, lead_stato.ultima_sua_at),
      ultima_nostra_at = COALESCE(EXCLUDED.ultima_nostra_at, lead_stato.ultima_nostra_at),
      note             = COALESCE(EXCLUDED.note, lead_stato.note),
      updated_at       = now()
    RETURNING *`
  console.log(`[OK] ${ICONA[row.stato] || ''} ${row.nome || row.email} → ${row.stato} (${row.priorita})`)
  if (row.pendenza) console.log(`     pendenza: ${row.pendenza}`)
  process.exit(0)
}

// ------------------------------------------------------------------ lettura
const email = (val('--email') || '').toLowerCase().trim()

if (email) {
  const [q] = await sql`SELECT * FROM lead_quadro WHERE email = ${email}`
  if (!q) {
    console.log(`Nessun lead a registro per ${email}.`)
    process.exit(0)
  }
  if (has('--json')) {
    console.log(JSON.stringify(q, null, 2))
    process.exit(0)
  }
  console.log(`\n${ICONA[q.stato] || ''} ${q.nome || '?'} <${q.email}>`)
  console.log(`   stato: ${q.stato} · priorità: ${q.priorita}${q.concorso ? ` · ${q.concorso}` : ''}`)
  if (q.cosa_vuole) console.log(`   vuole: ${q.cosa_vuole}`)
  if (q.pendenza) console.log(`   pendenza: ${q.pendenza}`)
  const d = (t) => (t ? new Date(t).toISOString().slice(0, 10) : '—')
  console.log(`   ultima sua: ${d(q.ultima_sua_at)} · ultima nostra: ${d(q.ultima_nostra_at)}`)
  if (q.n_ordini > 0) console.log(`   cliente: ${q.n_ordini} ordini, ${q.totale_speso_eur}€`)
  if (q.materie_interesse?.length) console.log(`   materie (dal form): ${q.materie_interesse.join(', ')}`)
  if (q.note) console.log(`   note: ${q.note}`)
  console.log()
  process.exit(0)
}

const filtro = val('--stato')
let righe
if (filtro) righe = await sql`SELECT * FROM lead_da_gestire WHERE stato = ${filtro}`
else if (has('--tutti')) righe = await sql`SELECT * FROM lead_da_gestire`
else righe = await sql`SELECT * FROM lead_da_gestire WHERE stato IN ('da_rispondere', 'in_lavorazione')`

if (has('--json')) {
  console.log(JSON.stringify(righe, null, 2))
  process.exit(0)
}

if (!righe.length) {
  console.log('\nNessun lead in questo stato. 🎉\n')
  process.exit(0)
}

let statoCorrente = null
console.log()
for (const r of righe) {
  if (r.stato !== statoCorrente) {
    statoCorrente = r.stato
    const quanti = righe.filter((x) => x.stato === statoCorrente).length
    console.log(`\n${'═'.repeat(72)}\n${ICONA[statoCorrente] || ''} ${statoCorrente.toUpperCase().replace('_', ' ')} — ${quanti}\n${'═'.repeat(72)}`)
  }
  const fermo = r.giorni_fermo != null ? ` · fermo da ${r.giorni_fermo} gg` : ''
  const cliente = r.ha_acquistato ? ` · CLIENTE ${r.totale_speso_eur}€` : ''
  console.log(`\n[${r.priorita.toUpperCase()}] ${r.nome || '?'} <${r.email}>${fermo}${cliente}`)
  if (r.concorso) console.log(`   ${r.concorso}`)
  if (r.cosa_vuole) console.log(`   vuole: ${r.cosa_vuole}`)
  if (r.pendenza) console.log(`   → ${r.pendenza}`)
}
console.log()
