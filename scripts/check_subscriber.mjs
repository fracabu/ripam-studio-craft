#!/usr/bin/env node
// ============================================================================
// Verifica lo stato newsletter di un'email sul DB Neon.
// Usato dalla skill `auto-risposte-lead` per scegliere la variante M1:
// un lead vago GIÀ iscritto ha già ricevuto le anteprime → niente CTA
// "iscriviti" (passa --subscribed=true a lead-draft.mjs).
//
// Uso:
//   node scripts/check_subscriber.mjs <email>
//
// Stampa una riga JSON su stdout:
//   { "email": "...", "status": "confirmed|pending|unsubscribed|absent", "subscribed": true|false }
// `subscribed` è true SOLO se confermato e non disiscritto.
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Carica .env.local (stesso pattern di send_newsletter.mjs)
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

const email = (process.argv[2] || '').toLowerCase().trim()
if (!email) {
  console.error('Uso: node scripts/check_subscriber.mjs <email>')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  console.error('[FAIL] DATABASE_URL/POSTGRES_URL mancante in .env.local')
  process.exit(1)
}

const sql = neon(databaseUrl)
const rows = await sql`
  SELECT email, confirmed_at, unsubscribed_at
  FROM newsletter_subscribers
  WHERE LOWER(email) = ${email}
  LIMIT 1
`

let status, subscribed
if (!rows.length) {
  status = 'absent'
  subscribed = false
} else {
  const r = rows[0]
  status = r.unsubscribed_at ? 'unsubscribed' : (r.confirmed_at ? 'confirmed' : 'pending')
  subscribed = status === 'confirmed'
}

console.log(JSON.stringify({ email, status, subscribed }))
