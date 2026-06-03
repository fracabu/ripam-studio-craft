#!/usr/bin/env node
// ============================================================================
// Registra un ordine sulla tabella `ordini` del DB Neon (registro acquisti).
// Fonte UNICA di chi ha comprato cosa → niente più ricerca a mano delle
// fatture in Gmail. Usato a mano e (in futuro) dagli script di consegna.
//
// Uso:
//   node scripts/order_add.mjs --email <email> --prodotto "<testo>" [opzioni]
//
// Flag:
//   --email      (obbligatorio) email del cliente
//   --prodotto   (obbligatorio) descrizione libera, es. "Manuale Diritto UE"
//   --nome       nome del cliente
//   --materia    slug o testo materia (opzionale, per analisi)
//   --formato    manuale | audio | video | podcast | report | serie | kit | altro
//   --importo    TOTALE pagato in EUR (lordo, comprensivo rivalsa), es. 29.98
//   --imponibile imponibile EUR
//   --rivalsa    rivalsa INPS EUR
//   --fattura    numero fattura, es. "8/2026"
//   --stato      pagato (default) | in_attesa | rimborsato | annullato
//   --thread     gmail_thread_id (per audit / auto-label)
//   --note       note libere
//   --data       data ordine ISO (YYYY-MM-DD), default: adesso
//   --dry-run    stampa cosa farebbe senza scrivere
//
// Idempotente "morbido": stesso email+numero_fattura → ON CONFLICT DO NOTHING
// (così rilanciare il backfill non duplica). Senza --fattura il vincolo non
// scatta e l'ordine viene sempre inserito.
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Carica .env.local (stesso pattern di check_subscriber.mjs / send_newsletter.mjs)
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

// Parser flag minimale: --chiave valore (oppure --flag booleano).
function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))

const email = (args.email || '').toLowerCase().trim()
const prodotto = (args.prodotto || '').trim()

if (!email || !prodotto) {
  console.error('Uso: node scripts/order_add.mjs --email <email> --prodotto "<testo>" [opzioni]')
  console.error('     (vedi header del file per tutti i flag)')
  process.exit(1)
}

// Numeri opzionali → null se assenti o non parsabili.
function num(v) {
  if (v === undefined || v === true) return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const record = {
  email,
  nome: typeof args.nome === 'string' ? args.nome.trim() : null,
  prodotto,
  materia: typeof args.materia === 'string' ? args.materia.trim() : null,
  formato: typeof args.formato === 'string' ? args.formato.trim() : null,
  importo_eur: num(args.importo),
  imponibile_eur: num(args.imponibile),
  rivalsa_eur: num(args.rivalsa),
  numero_fattura: typeof args.fattura === 'string' ? args.fattura.trim() : null,
  stato: typeof args.stato === 'string' ? args.stato.trim() : 'pagato',
  gmail_thread_id: typeof args.thread === 'string' ? args.thread.trim() : null,
  note: typeof args.note === 'string' ? args.note.trim() : null,
  ordine_at: typeof args.data === 'string' ? args.data.trim() : null, // null → DEFAULT now()
}

if (args['dry-run']) {
  console.log('[dry-run] inserirei:')
  console.log(JSON.stringify(record, null, 2))
  process.exit(0)
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  console.error('[FAIL] DATABASE_URL/POSTGRES_URL mancante in .env.local')
  process.exit(1)
}

const sql = neon(databaseUrl)

// COALESCE su ordine_at: se null usa il DEFAULT now() della colonna.
// ON CONFLICT sull'unique index parziale (email_lower + numero_fattura).
const rows = await sql`
  INSERT INTO ordini (
    email, nome, prodotto, materia, formato,
    importo_eur, imponibile_eur, rivalsa_eur, numero_fattura,
    stato, gmail_thread_id, note, ordine_at
  ) VALUES (
    ${record.email}, ${record.nome}, ${record.prodotto}, ${record.materia}, ${record.formato},
    ${record.importo_eur}, ${record.imponibile_eur}, ${record.rivalsa_eur}, ${record.numero_fattura},
    ${record.stato}, ${record.gmail_thread_id}, ${record.note},
    COALESCE(${record.ordine_at}::timestamptz, now())
  )
  ON CONFLICT (LOWER(email), numero_fattura) WHERE numero_fattura IS NOT NULL
  DO NOTHING
  RETURNING id, email, prodotto, importo_eur, numero_fattura, ordine_at
`

if (!rows.length) {
  console.log(`[skip] ordine già presente (email+fattura ${record.numero_fattura}) — nessun duplicato inserito`)
} else {
  const r = rows[0]
  console.log(`[OK] ordine #${r.id} registrato: ${r.email} — ${r.prodotto}` +
    (r.importo_eur != null ? ` — ${r.importo_eur}€` : '') +
    (r.numero_fattura ? ` — fattura ${r.numero_fattura}` : ''))
}
