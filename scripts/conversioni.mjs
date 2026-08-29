#!/usr/bin/env node
// ============================================================================
// Il misuratore: quanti preventivi sono usciti, quanti hanno chiuso, per fascia
// di prezzo. È il numero che manca per tarare un listino sui fatti invece che a
// sensazione (vedi db/schema_preventivi.sql e messaggi-clienti/listino-2026-09.md).
//
//   node scripts/conversioni.mjs                 # il quadro completo
//   node scripts/conversioni.mjs --aperti        # solo i preventivi ancora fermi
//   node scripts/conversioni.mjs --bando mic-1800-cod01
//   node scripts/conversioni.mjs --giorni 90     # solo gli ultimi 90 giorni
//
// COME DEDUCE UNA CHIUSURA: un preventivo è "chiuso" se quella email ha un
// ordine `pagato` con data >= data del preventivo. Non serve segnarlo a mano —
// registrare l'ordine basta. Restano da marcare a mano solo i "no" espliciti
// (`preventivo_add.mjs --esito perso`), che il DB non può vedere.
//
// ⚠️ Un tasso di chiusura vicino al 100% non è una buona notizia: è un prezzo
// lasciato sul tavolo. Il punto giusto è dove QUALCUNO dice di no.
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
  for (const riga of env.split('\n')) {
    const m = riga.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* env già presenti */ }

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const BANDO = arg('bando')
const GIORNI = Number(arg('giorni', '0')) || 0
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const preventivi = await sql`SELECT * FROM preventivi ORDER BY quotato_at`
const ordini = await sql`SELECT LOWER(email) AS email, importo_eur, ordine_at, prodotto FROM ordini WHERE stato = 'pagato'`

if (!preventivi.length) {
  console.log('\nNessun preventivo a registro. Si popola con scripts/preventivo_add.mjs,')
  console.log('una riga ogni volta che in una mail esce un prezzo.\n')
  process.exit(0)
}

const oggi = new Date()
// Mai negativo: un preventivo datato oggi vale 0 giorni, non -1 (le date senza
// ora vengono salvate a mezzogiorno UTC, che al mattino è ancora nel futuro).
const giorniFa = (d) => Math.max(0, Math.floor((oggi - new Date(d)) / 86400000))

// Un preventivo ha chiuso se dopo di lui c'è un ordine pagato della stessa
// persona. L'incassato somma TUTTI gli ordini suoi entro 90 giorni: chi paga a
// rate (Gloria: 117 € in due) altrimenti risulterebbe per metà.
const FINESTRA_MS = 90 * 86400000
const esitoDi = (p) => {
  if (p.esito === 'perso' || p.esito === 'ritirato') return { stato: p.esito, ordine: null, incassato: 0, rate: 0 }
  const suoi = ordini
    .filter(x => x.email === String(p.email).toLowerCase())
    .filter(x => new Date(x.ordine_at) >= new Date(p.quotato_at) && new Date(x.ordine_at) - new Date(p.quotato_at) <= FINESTRA_MS)
    .sort((a, b) => new Date(a.ordine_at) - new Date(b.ordine_at))
  if (!suoi.length) return { stato: 'aperto', ordine: null, incassato: 0, rate: 0 }
  return {
    stato: 'chiuso',
    ordine: suoi[0],
    incassato: suoi.reduce((a, x) => a + Number(x.importo_eur), 0),
    rate: suoi.length,
  }
}

let righe = preventivi.map(p => ({ ...p, ...esitoDi(p), importo: Number(p.importo_eur) }))
if (BANDO) righe = righe.filter(r => (r.bando || '').includes(BANDO))
if (GIORNI) righe = righe.filter(r => giorniFa(r.quotato_at) <= GIORNI)

const chiusi = righe.filter(r => r.stato === 'chiuso')
const persi = righe.filter(r => r.stato === 'perso' || r.stato === 'ritirato')
const aperti = righe.filter(r => r.stato === 'aperto')
const pct = (n, d) => d ? `${Math.round(100 * n / d)}%` : '—'

console.log('\n════════════════════════════════════════════════════════════════')
console.log(`PREVENTIVI E CHIUSURE${BANDO ? ` — bando ${BANDO}` : ''}${GIORNI ? ` — ultimi ${GIORNI} giorni` : ''}`)
console.log('════════════════════════════════════════════════════════════════')
console.log(`quotati: ${righe.length}   ·   chiusi: ${chiusi.length} (${pct(chiusi.length, righe.length)})   ·   persi: ${persi.length}   ·   ancora aperti: ${aperti.length}`)

const incassato = chiusi.reduce((a, r) => a + r.incassato, 0)
const quotato = righe.reduce((a, r) => a + r.importo, 0)
if (chiusi.length) {
  const attesi = chiusi.reduce((a, r) => a + r.importo, 0)
  const scarto = incassato - attesi
  const aRate = chiusi.filter(r => r.rate > 1).length
  console.log(`quotato in tutto: ${quotato.toFixed(0)}€   ·   incassato dai chiusi: ${incassato.toFixed(0)}€ su ${attesi.toFixed(0)}€ quotati` +
    (Math.abs(scarto) >= 1 ? `   (${scarto > 0 ? '+' : ''}${scarto.toFixed(0)}€)` : ''))
  if (scarto < -1) console.log(`  ⚠ meno del quotato: rate ancora da incassare${aRate ? ` (${aRate} preventivo/i pagato/i in più tranche)` : ''}, o sconti fatti in chiusura`)
}

// --- per fascia di prezzo: è qui che si legge se un prezzo converte ----------
const FASCE = [[0, 35], [35, 75], [75, 110], [110, 175], [175, 1e9]]
const etichetta = ([a, b]) => b >= 1e9 ? `oltre ${a}€` : `${a}-${b}€`
console.log('\nFASCIA DEL PREZZO QUOTATO')
console.log('fascia         quotati  chiusi   tasso   giorni medi')
for (const f of FASCE) {
  const g = righe.filter(r => r.importo >= f[0] && r.importo < f[1])
  if (!g.length) continue
  const c = g.filter(r => r.stato === 'chiuso')
  const gg = c.length
    ? Math.round(c.reduce((a, r) => a + (new Date(r.ordine.ordine_at) - new Date(r.quotato_at)) / 86400000, 0) / c.length)
    : null
  console.log(
    etichetta(f).padEnd(14),
    String(g.length).padStart(5),
    String(c.length).padStart(8),
    pct(c.length, g.length).padStart(7),
    (gg === null ? '—' : `${gg}`).padStart(11))
}

// --- per offerta: lo stesso prodotto quotato a persone diverse ---------------
const perOfferta = {}
for (const r of righe) {
  const k = (r.bando || r.offerta || '—').slice(0, 34)
  perOfferta[k] = perOfferta[k] || { n: 0, chiusi: 0, prezzi: new Set(), perProdotto: {} }
  perOfferta[k].n++
  if (r.stato === 'chiuso') perOfferta[k].chiusi++
  perOfferta[k].prezzi.add(r.importo)
  // Il campanello va suonato solo quando LO STESSO prodotto è uscito a due
  // prezzi: dentro un bando convivono offerte diverse, ed è legittimo.
  const prod = r.offerta.trim().toLowerCase()
  perOfferta[k].perProdotto[prod] = perOfferta[k].perProdotto[prod] || new Set()
  perOfferta[k].perProdotto[prod].add(r.importo)
}
console.log('\nPER BANDO / OFFERTA')
console.log('cosa                                quotati  chiusi   prezzi usati')
const incoerenze = []
for (const [k, v] of Object.entries(perOfferta).sort((a, b) => b[1].n - a[1].n)) {
  const prezzi = [...v.prezzi].sort((a, b) => a - b).map(x => `${x}€`).join(' · ')
  const doppi = Object.entries(v.perProdotto).filter(([, s]) => s.size > 1)
  console.log(k.padEnd(35), String(v.n).padStart(5), String(v.chiusi).padStart(8), '   ' + prezzi)
  for (const [prod, s] of doppi) incoerenze.push({ prod, prezzi: [...s].sort((a, b) => a - b) })
}
if (incoerenze.length) {
  console.log('\n⚠ STESSO PRODOTTO, PREZZI DIVERSI')
  for (const i of incoerenze) console.log(`  "${i.prod}" quotato a ${i.prezzi.map(x => x + '€').join(' e a ')}`)
  console.log('  Finché convivono due prezzi non stai misurando il prezzo: stai misurando due prodotti.')
}

// --- i fermi: sono anche la to-do dei follow-up -----------------------------
if (aperti.length) {
  console.log('\nANCORA FERMI (in ordine di attesa)')
  for (const r of aperti.sort((a, b) => new Date(a.quotato_at) - new Date(b.quotato_at))) {
    const gg = giorniFa(r.quotato_at)
    console.log(`  ${String(gg).padStart(3)} gg  ${String(r.importo).padStart(6)}€  ${(r.nome || r.email).padEnd(22)} ${r.offerta}`)
  }
}

if (flag('aperti')) process.exit(0)

// --- l'avvertenza che conta più dei numeri ----------------------------------
console.log('\n────────────────────────────────────────────────────────────────')
const tasso = righe.length ? chiusi.length / righe.length : 0
const maturi = righe.filter(r => r.stato !== 'aperto' || giorniFa(r.quotato_at) > 14)
if (maturi.length < 10) {
  const s = maturi.length === 1 ? '1 preventivo maturo' : `${maturi.length} preventivi maturi`
  console.log(`Campione ancora piccolo: ${s} (ne servono ~10 per fascia prima di`)
  console.log('muovere un prezzo). Fino ad allora tieni ferme le cifre e continua a registrare.')
} else if (tasso > 0.8) {
  console.log(`Chiude l'${Math.round(tasso * 100)}% dei preventivi: il prezzo è BASSO.`)
  console.log('Una quotazione che non viene mai rifiutata è margine lasciato sul tavolo.')
} else if (tasso < 0.2) {
  console.log(`Chiude il ${Math.round(tasso * 100)}%: o il prezzo è alto, o arriva prima della fiducia.`)
  console.log('Prima di abbassare, guarda se il materiale era già stato consegnato: dove lo è stato, il prezzo regge.')
} else {
  console.log(`Chiude il ${Math.round(tasso * 100)}%: è la fascia sana. Si alza dando di più, non ritoccando il numero.`)
}
console.log('')
