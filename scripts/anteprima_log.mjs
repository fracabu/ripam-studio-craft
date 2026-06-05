#!/usr/bin/env node
// ============================================================================
// Registra una consegna anteprima sulla tabella `anteprime_inviate` (Neon).
// Fonte UNICA di chi ha già ricevuto quale anteprima → anti-doppione del drip.
//
// Uso:
//   node scripts/anteprima_log.mjs --email <email> --materia <slug> [opzioni]
//
// Flag:
//   --email     (obbligatorio) email del destinatario
//   --materia   (obbligatorio) slug materia, es. "pubblico-impiego"
//   --nome      nome del destinatario
//   --formato   completa-avm (default) | audio | video | manuale | report | kit | altro
//   --canale    welcome | drip | lead | blast | manuale (default: manuale)
//   --invio-id  id del pacchetto invio (es. "drip-2026-06-05" o newsletter_id)
//   --thread    gmail_thread_id (audit)
//   --note      note libere
//   --data      data invio ISO (YYYY-MM-DD), default: adesso
//   --dry-run   stampa cosa farebbe senza scrivere
//
// Idempotente: stesso email+materia+formato → ON CONFLICT DO NOTHING (rilanciare
// il backfill non duplica). Stessa materia in formato diverso = riga nuova.
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

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) out[key] = true
    else { out[key] = next; i++ }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const email = (args.email || '').toLowerCase().trim()
const materia = (args.materia || '').trim()

if (!email || !materia) {
  console.error('Uso: node scripts/anteprima_log.mjs --email <email> --materia <slug> [opzioni]')
  console.error('     (vedi header del file per tutti i flag)')
  process.exit(1)
}

const record = {
  email,
  nome: typeof args.nome === 'string' ? args.nome.trim() : null,
  materia,
  formato: typeof args.formato === 'string' ? args.formato.trim() : 'completa-avm',
  canale: typeof args.canale === 'string' ? args.canale.trim() : 'manuale',
  invio_id: typeof args['invio-id'] === 'string' ? args['invio-id'].trim() : null,
  gmail_thread_id: typeof args.thread === 'string' ? args.thread.trim() : null,
  note: typeof args.note === 'string' ? args.note.trim() : null,
  inviata_at: typeof args.data === 'string' ? args.data.trim() : null, // null → DEFAULT now()
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

const rows = await sql`
  INSERT INTO anteprime_inviate (
    email, nome, materia, formato, canale, invio_id, gmail_thread_id, note, inviata_at
  ) VALUES (
    ${record.email}, ${record.nome}, ${record.materia}, ${record.formato}, ${record.canale},
    ${record.invio_id}, ${record.gmail_thread_id}, ${record.note},
    COALESCE(${record.inviata_at}::timestamptz, now())
  )
  ON CONFLICT (LOWER(email), materia, formato) DO NOTHING
  RETURNING id, email, materia, formato, canale, inviata_at
`

if (!rows.length) {
  console.log(`[skip] già presente: ${record.email} — ${record.materia} (${record.formato}) — nessun duplicato`)
} else {
  const r = rows[0]
  console.log(`[OK] #${r.id} registrata: ${r.email} — ${r.materia} (${r.formato}) via ${r.canale}`)
}
