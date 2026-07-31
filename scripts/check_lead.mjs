#!/usr/bin/env node
// ============================================================================
// Quadro completo di UNA persona prima di risponderle: "che cosa ha già
// ricevuto da noi?". Usato dalla skill `auto-risposte-lead` (Step 1) come
// controllo anti-doppione PRIMA di comporre una bozza.
//
// PERCHÉ ESISTE: il filtro anti-doppione della skill era solo su Gmail (label
// + ricerca per email nella casella). Gmail però racconta solo ciò che è
// rimasto nei thread: se una consegna è partita da uno script, o è finita in un
// thread con un altro oggetto, il triage può crederla mai gestita e mandare un
// doppione. Le fonti di verità sono a DB — `invii_email` (comunicazioni),
// `anteprime_inviate` (materiali), `ordini`/`clienti` (acquisti) — e questo
// script le interroga tutte in un colpo solo. Cfr. la regola in CLAUDE.md:
// l'anti-doppione si fa sul registro, MAI con proxy su altre tabelle.
//
// Uso:
//   node scripts/check_lead.mjs <email>
//   node scripts/check_lead.mjs <email> --full     # tutte le righe, non le ultime 10
//
// Stampa un JSON su stdout con newsletter / invii / anteprime / cliente /
// candidato e un `verdetto` sintetico:
//   { gestito: true|false, motivi: [...] }
// `gestito: true` NON significa "non rispondere": significa "questa persona ha
// già ricevuto qualcosa, guarda COSA prima di draftare" (spesso la risposta
// giusta è un follow-up, non la mail di primo contatto).
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// Exit code 0 anche se la persona è sconosciuta (non è un errore: è un lead
// nuovo). Exit 1 solo su errori veri (env mancante, DB irraggiungibile).
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Carica .env.local a mano (stesso pattern degli altri script, niente dotenv)
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

const args = process.argv.slice(2)
const full = args.includes('--full')
const email = (args.find((a) => !a.startsWith('--')) || '').toLowerCase().trim()

if (!email) {
  console.error('Uso: node scripts/check_lead.mjs <email> [--full]')
  process.exit(1)
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) {
  console.error('[FAIL] DATABASE_URL/POSTGRES_URL mancante in .env.local')
  process.exit(1)
}
const sql = neon(url)

// 40 righe coprono anche i clienti storici (i più "carichi" ne hanno ~25): con
// una finestra troppo stretta le risposte lead vecchie cadevano fuori e il
// verdetto perdeva proprio il segnale che serve. --full per lo storico intero.
const LIMIT = full ? 500 : 40

// Ogni query è isolata: una tabella non ancora applicata (o rinominata) non
// deve far fallire l'intero check — meglio un quadro parziale che nessuno.
async function safe(label, fn) {
  try {
    return await fn()
  } catch (e) {
    console.error(`[WARN] ${label}: ${e.message}`)
    return null
  }
}

const [subscriber, invii, anteprime, cliente, candidato] = await Promise.all([
  // Lo stato newsletter NON è una colonna: si deriva da confirmed_at /
  // unsubscribed_at, esattamente come in check_subscriber.mjs.
  safe('newsletter_subscribers', () => sql`
    SELECT confirmed_at, unsubscribed_at, consent_at, source, requested_materia
    FROM newsletter_subscribers WHERE LOWER(email) = ${email} LIMIT 1`),
  safe('invii_email', () => sql`
    SELECT campagna, tipo, canale, oggetto, esito, inviata_at
    FROM invii_email WHERE LOWER(email) = ${email}
    ORDER BY inviata_at DESC LIMIT ${LIMIT}`),
  safe('anteprime_inviate', () => sql`
    SELECT materia, formato, canale, invio_id, inviata_at
    FROM anteprime_inviate WHERE LOWER(email) = ${email}
    ORDER BY inviata_at DESC LIMIT ${LIMIT}`),
  safe('clienti', () => sql`
    SELECT n_ordini, totale_speso_eur, primo_ordine_at, ultimo_ordine_at
    FROM clienti WHERE email = ${email} LIMIT 1`),
  safe('candidati', () => sql`
    SELECT nome, concorsi, materie_interesse, formati_interesse, n_richieste,
           source, primo_contatto, ultimo_contatto
    FROM candidati WHERE email = ${email} LIMIT 1`),
])

const subRow = subscriber?.[0] || null
const sub = subRow
  ? {
      ...subRow,
      status: subRow.unsubscribed_at ? 'unsubscribed' : (subRow.confirmed_at ? 'confirmed' : 'pending'),
    }
  : null
const cli = cliente?.[0] || null
const cand = candidato?.[0] || null
const listaInvii = invii || []
const listaAnteprime = anteprime || []

// Le date arrivano come oggetti Date dal driver: String(d) darebbe "Tue Jul 28".
const d = (v) => {
  if (!v) return '—'
  const dt = v instanceof Date ? v : new Date(v)
  return Number.isNaN(dt.getTime()) ? String(v).slice(0, 10) : dt.toISOString().slice(0, 10)
}

// Verdetto: si è già parlato con questa persona? E di cosa?
const motivi = []
if (cli) {
  motivi.push(`È CLIENTE: ${cli.n_ordini} ordine/i, ${Number(cli.totale_speso_eur).toFixed(2)} € totali, ultimo il ${d(cli.ultimo_ordine_at)}`)
}
if (listaAnteprime.length) {
  const materie = [...new Set(listaAnteprime.map((r) => `${r.materia}/${r.formato}`))]
  motivi.push(`Ha già ricevuto ${listaAnteprime.length} anteprima/e: ${materie.slice(0, 6).join(', ')}${materie.length > 6 ? '…' : ''}`)
}
// Una fattura è il segnale più forte che esista: quella persona è stata servita.
const inviiLead = listaInvii.filter((r) => ['lead', 'anteprima', 'credenziali', 'fattura'].includes(r.tipo))
if (inviiLead.length) {
  motivi.push(`Risposte/consegne già partite (registro invii): ${inviiLead.slice(0, 4).map((r) => `${r.campagna} il ${d(r.inviata_at)}`).join(' · ')}`)
}

// Mail 1:1 che il backfill IMAP non ha saputo classificare (finiscono tipo
// 'altro', campagna 'altro-<data>'): le riconosciamo dall'oggetto. Una
// "Re: Nuova richiesta — …" È la risposta a un lead, e conta come gestito
// quanto una riga con tipo 'lead' — ignorarla significa mandare un doppione.
const RE_UNO_A_UNO = /^\s*re:|nuova richiesta|coordinate|pagamento|preventivo|il tuo piano|i tuoi (report|audio|video)/i
const inviiUnoAUno = listaInvii.filter(
  (r) => r.tipo === 'altro' && r.oggetto && RE_UNO_A_UNO.test(r.oggetto),
)
if (inviiUnoAUno.length) {
  motivi.push(`Scambi 1:1 nello storico Gmail (non classificati, ma sono risposte vere): ${inviiUnoAUno.slice(0, 3).map((r) => `"${String(r.oggetto).slice(0, 60)}" il ${d(r.inviata_at)}`).join(' · ')}`)
}
const inviiBlast = listaInvii.filter((r) => ['newsletter', 'invito', 'campagna'].includes(r.tipo))
if (inviiBlast.length) {
  motivi.push(`Ha ricevuto ${inviiBlast.length} comunicazione/i di lista (newsletter/inviti) — normale, non blocca una risposta`)
}
if (sub?.status === 'confirmed') motivi.push('Iscritta/o alla newsletter (confermato)')

// "gestito" = c'è già stato uno scambio 1:1 o un acquisto. Le sole newsletter
// NON contano: chi riceve i blast è comunque un lead da lavorare.
const gestito = Boolean(cli || listaAnteprime.length || inviiLead.length || inviiUnoAUno.length)

const out = {
  email,
  newsletter: sub
    ? {
        status: sub.status,
        subscribed: sub.status === 'confirmed',
        confirmed_at: sub.confirmed_at,
        unsubscribed_at: sub.unsubscribed_at,
        source: sub.source,
        requested_materia: sub.requested_materia,
      }
    : { status: 'absent', subscribed: false },
  invii: { n: listaInvii.length, righe: listaInvii },
  anteprime: { n: listaAnteprime.length, righe: listaAnteprime },
  cliente: cli,
  candidato: cand,
  verdetto: { gestito, motivi },
  // Promemoria per chi legge l'output: il DB non sa delle mail scritte a mano
  // da Gmail dopo l'ultimo backfill IMAP → resta valida la verifica sulla
  // casella (search_threads per email) prevista dallo Step 1 della skill.
  nota: 'Il registro copre gli invii loggati e lo storico IMAP riversato: le risposte scritte a mano da Gmail dopo l\'ultimo backfill potrebbero non esserci. Verifica anche la casella.',
}

process.stdout.write(JSON.stringify(out, null, 2))
