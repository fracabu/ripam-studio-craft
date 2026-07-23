#!/usr/bin/env node
// ============================================================================
// Radar vendite — chi vale la pena ricontattare, oggi.
//
// Incrocia i 4 registri (candidati, ordini, invii_email, anteprime_inviate)
// e tira fuori 3 liste azionabili, in stile Clay ma con i dati di casa:
//
//   1. LEAD FERMI          — hanno scritto dal form, mai comprato, e da N giorni
//                            nessuno si muove → candidati al follow-up.
//                            Flag "ultima mossa: LORO" = ci hanno scritto dopo
//                            il nostro ultimo invio → in realtà è DA RISPONDERE.
//   2. CLIENTI DA RISVEGLIARE — hanno già pagato ma l'ultimo ordine è vecchio
//                            → upsell/riacquisto (sono i più facili da convertire).
//   3. ANTEPRIME SCOPERTE  — materie che il candidato ha dichiarato di volere
//                            ma di cui non ha MAI ricevuto un'anteprima
//                            (check su anteprime_inviate) → invio a costo zero.
//
// SOLO LETTURA: non manda nulla, non scrive nulla. Le mail si compongono a
// valle (lead-draft.mjs / skill auto-risposte-lead) e si inviano dopo revisione.
//
// Uso:
//   node scripts/radar_vendite.mjs                     # le 3 liste
//   node scripts/radar_vendite.mjs --giorni 10         # soglia silenzio lead (default 7)
//   node scripts/radar_vendite.mjs --giorni-clienti 45 # soglia clienti fermi (default 30)
//   node scripts/radar_vendite.mjs --limit 25          # righe max per lista (default 15)
//   node scripts/radar_vendite.mjs --source form       # solo lead da una fonte: form | quizpro | anteprima
//   node scripts/radar_vendite.mjs --json              # output JSON (per altri script)
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { MATERIE } from '../src/data/materie.js'

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

function intFlag(name, def) {
  const i = process.argv.indexOf(name)
  if (i < 0) return def
  const v = Number.parseInt(process.argv[i + 1], 10)
  return Number.isFinite(v) && v > 0 ? v : def
}
const srcIdx = process.argv.indexOf('--source')
const FILTER_SOURCE = srcIdx >= 0 ? (process.argv[srcIdx + 1] || '').toLowerCase().trim() : null
const GIORNI_LEAD = intFlag('--giorni', 7)
const GIORNI_CLIENTI = intFlag('--giorni-clienti', 30)
const LIMIT = intFlag('--limit', 15)
const asJson = process.argv.includes('--json')

const MS_GIORNO = 24 * 60 * 60 * 1000
const giorniFa = ts => ts ? Math.floor((Date.now() - new Date(ts).getTime()) / MS_GIORNO) : null
const dateOnly = ts => ts ? new Date(ts).toISOString().slice(0, 10) : '—'
const eur = v => v == null ? '—' : `${Number(v).toFixed(2)}€`

// Mappa nome materia (come accumulato in candidati.materie_interesse) → scheda
// materie.js. Le chiavi coprono sia il titolo che lo slug, lowercase.
const materiaByNome = new Map()
for (const m of MATERIE) {
  materiaByNome.set(m.t.toLowerCase(), m)
  materiaByNome.set(m.slug.toLowerCase(), m)
}

// --- I 4 registri in un colpo solo (join in JS, sono poche centinaia di righe)
const [candidati, invii, anteprime, prodotti] = await Promise.all([
  sql`SELECT * FROM candidato_completo`,
  sql`SELECT LOWER(email) AS email, MAX(inviata_at) AS ultimo_invio, COUNT(*)::int AS n_invii
      FROM invii_email WHERE esito = 'sent' GROUP BY LOWER(email)`,
  sql`SELECT email, materie FROM anteprime_per_cliente`,
  sql`SELECT LOWER(email) AS email, ARRAY_AGG(DISTINCT prodotto) AS prodotti
      FROM ordini WHERE stato = 'pagato' GROUP BY LOWER(email)`,
])
const invioByEmail = new Map(invii.map(r => [r.email, r]))
const anteprimeByEmail = new Map(anteprime.map(r => [r.email, r.materie || []]))
const prodottiByEmail = new Map(prodotti.map(r => [r.email, r.prodotti || []]))

// --- 1. LEAD FERMI ---------------------------------------------------------
const leadFermi = candidati
  .filter(c => !c.ha_acquistato)
  .filter(c => !FILTER_SOURCE || (c.source || '').toLowerCase() === FILTER_SOURCE)
  .map(c => {
    const inv = invioByEmail.get(c.email) || null
    const ultimoInvio = inv?.ultimo_invio || null
    const ultimoTocco = [c.ultimo_contatto, ultimoInvio]
      .filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0]
    // "loro" = l'ultima mossa registrata è una loro richiesta dal form (le
    // risposte via Gmail non passano di qui, quindi è un'approssimazione).
    const ultimaMossa =
      ultimoInvio && new Date(ultimoInvio) >= new Date(c.ultimo_contatto) ? 'nostra' : 'LORO'
    return { ...c, ultimo_invio: ultimoInvio, n_invii: inv?.n_invii || 0,
             ultimo_tocco: ultimoTocco, silenzio_giorni: giorniFa(ultimoTocco), ultima_mossa: ultimaMossa }
  })
  .filter(c => c.silenzio_giorni >= GIORNI_LEAD)
  .sort((a, b) => new Date(b.ultimo_tocco) - new Date(a.ultimo_tocco))

// --- 2. CLIENTI DA RISVEGLIARE --------------------------------------------
const clientiFermi = candidati
  .filter(c => c.ha_acquistato && giorniFa(c.ultimo_ordine_at) >= GIORNI_CLIENTI)
  .map(c => ({ ...c, fermo_giorni: giorniFa(c.ultimo_ordine_at),
               prodotti: prodottiByEmail.get(c.email) || [] }))
  .sort((a, b) => Number(b.totale_speso_eur) - Number(a.totale_speso_eur))

// --- 3. ANTEPRIME SCOPERTE -------------------------------------------------
const anteprimeScoperte = candidati
  .map(c => {
    const ricevute = new Set(anteprimeByEmail.get(c.email) || [])
    const scoperte = []
    for (const nome of c.materie_interesse || []) {
      const m = materiaByNome.get(String(nome).toLowerCase())
      if (!m) continue                       // materia non a catalogo → percorso custom
      if (ricevute.has(m.slug)) continue
      const pronti = Object.entries(m.avail || {}).filter(([, s]) => s === 'ready').map(([f]) => f)
      scoperte.push({ nome: m.t, slug: m.slug, formati_pronti: pronti })
    }
    return scoperte.length ? { email: c.email, nome: c.nome, ha_acquistato: c.ha_acquistato,
                               ultimo_contatto: c.ultimo_contatto, scoperte } : null
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.ultimo_contatto) - new Date(a.ultimo_contatto))

if (asJson) {
  console.log(JSON.stringify({
    parametri: { giorni_lead: GIORNI_LEAD, giorni_clienti: GIORNI_CLIENTI },
    lead_fermi: leadFermi, clienti_da_risvegliare: clientiFermi, anteprime_scoperte: anteprimeScoperte,
  }, null, 2))
  process.exit(0)
}

const arr = a => (a || []).join(', ') || '—'

console.log(`\n═══ 1. LEAD FERMI — mai comprato, silenzio ≥ ${GIORNI_LEAD} gg (${leadFermi.length}) ═══\n`)
for (const c of leadFermi.slice(0, LIMIT)) {
  const flag = c.ultima_mossa === 'LORO' ? '⚠ ultima mossa: LORO → DA RISPONDERE' : 'palla loro'
  console.log(`  ${(c.nome || '—').padEnd(20)}  ${c.email.padEnd(32)}  ${String(c.silenzio_giorni).padStart(3)} gg  ` +
    `${String(c.n_richieste)} rich.  [${(c.source || '?').padEnd(9)}]  ${flag}`)
  console.log(`      concorsi: ${arr(c.concorsi)} · materie: ${arr(c.materie_interesse)}`)
}
if (leadFermi.length > LIMIT) console.log(`  … +${leadFermi.length - LIMIT} altri (usa --limit)`)

console.log(`\n═══ 2. CLIENTI DA RISVEGLIARE — ultimo ordine ≥ ${GIORNI_CLIENTI} gg fa (${clientiFermi.length}) ═══\n`)
for (const c of clientiFermi.slice(0, LIMIT)) {
  console.log(`  ${(c.nome || '—').padEnd(20)}  ${c.email.padEnd(32)}  ${String(c.fermo_giorni).padStart(3)} gg  ` +
    `${String(c.n_ordini)} ord.  ${eur(c.totale_speso_eur).padStart(8)}  ultimo ${dateOnly(c.ultimo_ordine_at)}`)
  console.log(`      ha comprato: ${arr(c.prodotti)}`)
  console.log(`      interessi: ${arr(c.materie_interesse)} · concorsi: ${arr(c.concorsi)}`)
}
if (clientiFermi.length > LIMIT) console.log(`  … +${clientiFermi.length - LIMIT} altri (usa --limit)`)

console.log(`\n═══ 3. ANTEPRIME SCOPERTE — materia chiesta, anteprima mai ricevuta (${anteprimeScoperte.length}) ═══\n`)
for (const c of anteprimeScoperte.slice(0, LIMIT)) {
  const chi = c.ha_acquistato ? 'CLIENTE' : 'lead'
  console.log(`  ${(c.nome || '—').padEnd(20)}  ${c.email.padEnd(32)}  ${chi}`)
  for (const s of c.scoperte) {
    console.log(`      → manda anteprima '${s.slug}' (pronti: ${arr(s.formati_pronti)})`)
  }
}
if (anteprimeScoperte.length > LIMIT) console.log(`  … +${anteprimeScoperte.length - LIMIT} altri (usa --limit)`)

console.log(`\n  Prossimo passo: componi la bozza con lead-draft.mjs / skill auto-risposte-lead,`)
console.log(`  rivedi, e SOLO DOPO invia (regola: mai inviare senza bozza approvata).\n`)
