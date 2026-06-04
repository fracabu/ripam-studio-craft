#!/usr/bin/env node
// ============================================================================
// Motore d'invio per le mail ai LEAD, con logo brand DARK incorporato inline.
//
// Perché esiste: le BOZZE Gmail (MCP create_draft) non possono avere il logo
// inline (il base64 dovrebbe passare dal modello → fallisce) e col logo via URL
// remoto Libero/Outlook lo bloccano → mail senza logo. Scelta dell'utente
// (2026-06-04): comporre la mail, rivederla, e INVIARLA da qui via nodemailer,
// che incorpora il logo come allegato inline `cid:logo-dark.png` → SEMPRE
// visibile, anche su Libero. Stesso meccanismo delle mail di sistema.
//
// Il guscio è la variante DARK del brand (header nero + logo chiaro, stile
// newsletter). Il contenuto specifico della mail (innerHtml + testo) si passa
// da file, così resta fuori dallo script e si rivede prima dell'invio.
//
// Uso:
//   # anteprima a video, NON invia:
//   node scripts/send_lead.mjs --to x@y.it --subject "..." --html inner.html --text corpo.txt --dry-run
//   # invio reale:
//   node scripts/send_lead.mjs --to x@y.it --subject "..." --html inner.html --text corpo.txt
//   # invio di PROVA a se stessi (fracabu@gmail.com) con contenuto demo:
//   node scripts/send_lead.mjs --demo
//
// Flag:
//   --to       destinatario (obbligatorio salvo --demo)
//   --subject  oggetto (obbligatorio salvo --demo)
//   --html     file con l'innerHtml (solo il CONTENUTO, lo script aggiunge guscio+logo)
//   --text     file col corpo plain-text (alternativa testuale)
//   --kicker   etichetta monospace in alto a destra nell'header (default "RISPOSTA")
//   --from     display name mittente (default "Francesco — Ripam Studio Craft")
//   --dry-run  stampa a video e NON invia
//   --demo     invia una mail dimostrativa a fracabu@gmail.com (verifica il logo)
//
// Richiede .env.local: GMAIL_USER, GMAIL_APP_PASSWORD. Gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import nodemailer from 'nodemailer'
import { LOGO_DARK_B64 } from '../api/_lib/logo-dark-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// --- env (.env.local a mano, niente dotenv, come gli altri script) ----------
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

// --- args -------------------------------------------------------------------
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

// --- guscio DARK (header nero + logo chiaro inline, stile newsletter) -------
const BRAND = {
  ink: '#0a0a0a', cream: '#f5f0e8', acid: '#c6f432', muted: '#6b6458', rule: '#e6dfd2',
  baseUrl: 'https://ripam-studio-craft.vercel.app',
}

function darkShell(innerHtml, kicker = 'RISPOSTA') {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.cream}" style="background:${BRAND.cream};margin:0;padding:0;width:100%;">
  <tr><td align="center" style="padding:20px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
      <tr>
        <td style="background:${BRAND.ink};padding:20px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="left" style="vertical-align:middle;">
              <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0;">
                <img src="cid:logo-dark.png" alt="Ripam Studio Craft" width="180" style="display:block;width:180px;max-width:180px;height:auto;border:0;outline:none;" />
              </a>
            </td>
            <td align="right" style="vertical-align:middle;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.14em;color:${BRAND.acid};text-transform:uppercase;line-height:1.5;white-space:nowrap;">${kicker}</td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:28px 28px 8px;font-size:15px;line-height:1.55;color:${BRAND.ink};">
          ${innerHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 28px 28px;">
          <hr style="border:none;border-top:1px solid ${BRAND.rule};margin:18px 0">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.55">Francesco Capurso &middot; Ripam Studio Craft &middot; Roma &middot; P.IVA 18528431002<br>
          <a href="mailto:ripamstudiocraft@gmail.com" style="color:${BRAND.muted}">ripamstudiocraft@gmail.com</a> &middot; <a href="${BRAND.baseUrl}" style="color:${BRAND.muted}">ripam-studio-craft.vercel.app</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`
}

function logoDarkAttachment() {
  return { filename: 'logo-dark.png', content: Buffer.from(LOGO_DARK_B64, 'base64'), cid: 'logo-dark.png', contentType: 'image/png' }
}

// --- compone subject/to/inner/text (demo o da file) -------------------------
let to, subject, innerHtml, text, kicker
if (args.demo) {
  to = 'fracabu@gmail.com'
  subject = 'TEST logo dark — Ripam Studio Craft'
  kicker = 'TEST'
  innerHtml = `<p style="margin:0 0 16px">Ciao Francesco,</p>
    <p style="margin:0 0 16px">questa è una mail di <strong>prova</strong> per verificare che il logo dark si veda nell'header nero (incorporato inline, non da URL).</p>
    <p style="margin:0 0 16px">Se vedi il logo qui sopra, il sistema d'invio lead è a posto. ✅</p>`
  text = 'Ciao Francesco, mail di prova per verificare il logo dark inline. Se vedi il logo nell\'header, il sistema funziona.'
} else {
  to = typeof args.to === 'string' ? args.to : null
  subject = typeof args.subject === 'string' ? args.subject : null
  kicker = typeof args.kicker === 'string' ? args.kicker : 'RISPOSTA'
  if (!to || !subject) {
    console.error('Uso: node scripts/send_lead.mjs --to <email> --subject "<oggetto>" --html <file> [--text <file>] [--dry-run]')
    console.error('     oppure: node scripts/send_lead.mjs --demo')
    process.exit(1)
  }
  innerHtml = typeof args.html === 'string' ? readFileSync(args.html, 'utf8') : '<p>(nessun --html fornito)</p>'
  text = typeof args.text === 'string' ? readFileSync(args.text, 'utf8') : subject
}

const html = darkShell(innerHtml, kicker)
const fromName = typeof args.from === 'string' ? args.from : 'Francesco — Ripam Studio Craft'

if (args['dry-run']) {
  console.log(`[dry-run] NON invio.`)
  console.log(`  to:      ${to}`)
  console.log(`  subject: ${subject}`)
  console.log(`  kicker:  ${kicker}`)
  console.log(`  html:    ${html.length} char (guscio dark + logo-dark inline)`)
  console.log(`  text:    ${String(text).length} char`)
  process.exit(0)
}

// --- invio ------------------------------------------------------------------
const user = process.env.GMAIL_USER
const pass = process.env.GMAIL_APP_PASSWORD
if (!user || !pass) { console.error('[FAIL] GMAIL_USER / GMAIL_APP_PASSWORD mancanti in .env.local'); process.exit(1) }

// Config robusta su Windows/Node recente: 465 esplicito + IPv4 + TLS lasco
// (proxy locale → la chain di Gmail non verifica). Stesso pattern di _tmp_send_beta.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true, family: 4,
  auth: { user, pass }, tls: { rejectUnauthorized: false },
})

try {
  const info = await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to, replyTo: user, subject, text, html,
    attachments: [logoDarkAttachment()],
  })
  console.log(`[OK] inviata a ${to} — ${info.messageId}`)
} catch (err) {
  console.error(`[FAIL] invio fallito: ${err.message}`)
  process.exit(1)
}
