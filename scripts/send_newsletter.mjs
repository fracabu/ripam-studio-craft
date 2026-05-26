#!/usr/bin/env node
// ============================================================================
// CLI wrapper per /api/newsletter/send: chiama l'handler in-process bypassando
// Vercel dev (rotto su Windows con CLI 46 + Vite 6.4).
//
// Uso:
//   node scripts/send_newsletter.mjs <YYYY-MM-DD> [opzioni]
//
// Opzioni:
//   --dry-run             non manda, mostra solo i destinatari che riceverebbero
//   --only-email=<email>  spedisce solo a quell'indirizzo (test mirato)
//   --limit=<n>           max destinatari in questa esecuzione (default 30, max 200)
//   --rate-ms=<ms>        pausa tra una mail e l'altra (default 1300, min 800)
//
// Esempi:
//   node scripts/send_newsletter.mjs 2026-05-24 --dry-run
//   node scripts/send_newsletter.mjs 2026-05-24 --only-email=fracabu@gmail.com
//   node scripts/send_newsletter.mjs 2026-05-24 --limit=10
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Carica .env.local
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

// Cambia cwd alla project root cosi' l'handler trova messaggi-clienti/newsletter
process.chdir(ROOT)

// Forza PUBLIC_BASE_URL alla URL di produzione: chi manda newsletter dalla CLI
// vuole che i link nelle mail (conferma, disiscrizione) puntino al sito live,
// NON al server di dev locale. .env.local in dev usa localhost:5173 per altri
// scopi, ma qui ci serve sempre il dominio pubblico.
process.env.PUBLIC_BASE_URL = 'https://ripam-studio-craft.vercel.app'

// Parse argomenti
const [, , file, ...rest] = process.argv
if (!file || file.startsWith('--')) {
  console.error(`Uso: node scripts/send_newsletter.mjs <YYYY-MM-DD> [--dry-run] [--only-email=X] [--limit=N] [--rate-ms=N]`)
  process.exit(1)
}

const flags = { dry_run: false, only_email: null, limit: null, rate_ms: null }
for (const a of rest) {
  if (a === '--dry-run') flags.dry_run = true
  else if (a.startsWith('--only-email=')) flags.only_email = a.split('=')[1]
  else if (a.startsWith('--limit=')) flags.limit = parseInt(a.split('=')[1], 10)
  else if (a.startsWith('--rate-ms=')) flags.rate_ms = parseInt(a.split('=')[1], 10)
  else { console.error(`Argomento sconosciuto: ${a}`); process.exit(1) }
}

// Mock req/res in stile test_newsletter.mjs
const body = { file, ...flags }
const req = {
  method: 'POST',
  url: '/api/newsletter/send',
  headers: {
    'content-type': 'application/json',
    'x-admin-secret': process.env.ADMIN_SECRET,
    'user-agent': 'send-newsletter-cli/1.0',
    'x-forwarded-for': '127.0.0.1',
  },
  socket: { remoteAddress: '127.0.0.1' },
  body,
}

let finalStatus = 200
let finalBody = null
const res = {
  statusCode: 200,
  headers: {},
  setHeader(k, v) { this.headers[k] = v },
  status(s) { finalStatus = s; this.statusCode = s; return this },
  json(obj) { finalBody = obj; return this },
  send(s) { finalBody = s; return this },
  end() { return this },
}

console.log(`\n=== SEND ${file} ===`)
console.log(`Mode:        ${flags.dry_run ? 'DRY RUN (no mail)' : 'LIVE SEND'}`)
if (flags.only_email) console.log(`Only-email:  ${flags.only_email}`)
if (flags.limit) console.log(`Limit:       ${flags.limit}`)
if (flags.rate_ms) console.log(`Rate ms:     ${flags.rate_ms}`)
console.log('')

const { default: handler } = await import('../api/newsletter/send.js')
const t0 = Date.now()
try {
  await handler(req, res)
} catch (err) {
  console.error('[CRASH]', err)
  process.exit(2)
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

console.log(`\n[RESPONSE ${finalStatus}] (in ${elapsed}s)`)
console.log(JSON.stringify(finalBody, null, 2))

// Exit code utile per script CI/loop esterni
if (finalStatus >= 400) process.exit(1)
if (finalBody && finalBody.failed > 0) process.exit(2)
