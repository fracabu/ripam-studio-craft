#!/usr/bin/env node
// ============================================================================
// Test diretto degli endpoint newsletter: simula req/res senza Vercel dev.
// Carica .env.local, importa l'handler, lo chiama come se fosse una richiesta HTTP.
//
// Uso:
//   node scripts/test_newsletter.mjs subscribe        # iscrive fracabu@gmail.com
//   node scripts/test_newsletter.mjs subscribe foo@bar.com Mario
//   node scripts/test_newsletter.mjs confirm <token>
//   node scripts/test_newsletter.mjs unsubscribe <token>
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---- Carica .env.local manualmente ----
function loadEnv() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
      if (m) {
        const [, key, val] = m
        const v = val.replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = v
      }
    }
  } catch {
    console.error('[FAIL] .env.local non trovato')
    process.exit(1)
  }
}
loadEnv()

// ---- Mock req/res ----
function makeReq({ method = 'POST', url = '/', body = {}, query = {} }) {
  return {
    method,
    url,
    headers: {
      'content-type': 'application/json',
      'content-length': String(JSON.stringify(body).length),
      'user-agent': 'TestNewsletter/1.0',
      'x-forwarded-for': '127.0.0.1',
    },
    socket: { remoteAddress: '127.0.0.1' },
    body,
    query,
  }
}

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    bodySent: null,
    setHeader(k, v) { this.headers[k] = v },
    status(s) { this.statusCode = s; return this },
    json(obj) { this.bodySent = obj; console.log(`\n[RESPONSE ${this.statusCode}]`, JSON.stringify(obj, null, 2)); return this },
    send(s) { this.bodySent = s; const isHtml = typeof s === 'string' && s.startsWith('<!DOCTYPE'); console.log(`\n[RESPONSE ${this.statusCode}] ${isHtml ? '<HTML page>' : s}`); return this },
    end() { console.log(`\n[RESPONSE ${this.statusCode}] (empty)`); return this },
  }
  return res
}

// ---- Routing test ----
const [, , cmd, ...rest] = process.argv

async function runSubscribe() {
  const email = rest[0] || 'fracabu@gmail.com'
  const nome = rest[1] || 'Francesco'
  console.log(`\n=== TEST subscribe ===\nEmail: ${email}\nNome:  ${nome}\n`)
  const { default: handler } = await import('../api/newsletter/subscribe.js')
  const req = makeReq({
    method: 'POST',
    body: {
      email, nome, source: 'home',
      consent_text: 'Acconsento a ricevere occasionalmente novita su materiali e iniziative di Ripam Studio Craft. Posso revocare in qualsiasi momento.',
    },
  })
  await handler(req, makeRes())
}

async function runConfirm() {
  const token = rest[0]
  if (!token) { console.error('Usage: node test_newsletter.mjs confirm <token>'); process.exit(1) }
  console.log(`\n=== TEST confirm ===\nToken: ${token.slice(0, 16)}...\n`)
  const { default: handler } = await import('../api/newsletter/confirm.js')
  const req = makeReq({ method: 'GET', query: { t: token } })
  await handler(req, makeRes())
}

async function runUnsubscribe() {
  const token = rest[0]
  if (!token) { console.error('Usage: node test_newsletter.mjs unsubscribe <token>'); process.exit(1) }
  console.log(`\n=== TEST unsubscribe ===\nToken: ${token.slice(0, 16)}...\n`)
  const { default: handler } = await import('../api/newsletter/unsubscribe.js')
  const req = makeReq({ method: 'GET', query: { t: token } })
  await handler(req, makeRes())
}

async function listSubscribers() {
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
  const rows = await sql`
    SELECT id, email, nome, source, confirmed_at, unsubscribed_at,
           LEFT(confirm_token, 16) AS confirm_token_preview,
           LEFT(unsubscribe_token, 16) AS unsubscribe_token_preview,
           consent_at
    FROM newsletter_subscribers
    ORDER BY id DESC
    LIMIT 20
  `
  console.log(`\n=== ISCRITTI (${rows.length}) ===\n`)
  for (const r of rows) {
    console.log(`#${r.id}  ${r.email}  [${r.confirmed_at ? 'CONFIRMED' : 'pending'}${r.unsubscribed_at ? ', unsub' : ''}]  src=${r.source}`)
    console.log(`     confirm token (first 16): ${r.confirm_token_preview}...`)
    console.log(`     unsub   token (first 16): ${r.unsubscribe_token_preview}...`)
    console.log()
  }
}

const commands = { subscribe: runSubscribe, confirm: runConfirm, unsubscribe: runUnsubscribe, list: listSubscribers }
const fn = commands[cmd]
if (!fn) {
  console.error(`Usage:
  node scripts/test_newsletter.mjs subscribe [email] [nome]
  node scripts/test_newsletter.mjs confirm <token>
  node scripts/test_newsletter.mjs unsubscribe <token>
  node scripts/test_newsletter.mjs list`)
  process.exit(1)
}

try { await fn() } catch (err) { console.error('\n[CRASH]', err); process.exit(2) }
