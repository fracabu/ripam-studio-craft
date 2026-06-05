#!/usr/bin/env node
// ============================================================================
// DRIP ANTEPRIME — invio "a goccia" di nuove materie agli iscritti newsletter.
//
// Perché: la welcome dà UNA materia e promette "le prossime nelle prossime
// settimane", ma quelle mail non partono da sole. Questo script le manda:
// sceglie 3 materie (config MATERIE qui sotto), e a ogni iscritto della lista
// invia SOLO quelle che non ha già ricevuto (check sul registro Neon
// `anteprime_inviate`), poi logga l'invio nel registro (anti-doppione).
//
// Logo brand DARK inline (cid:logo-dark.png), stesso meccanismo di send_lead.mjs
// → sempre visibile anche su Libero/Outlook. Unsubscribe one-click per ciascuno.
//
// Uso:
//   # 1) anteprima a Francesco (mail completa, NON logga, NON tocca i 14):
//   node scripts/send_drip.mjs --preview fracabu@gmail.com
//   # 2) prova a vuoto (mostra chi/cosa riceverebbe, NON invia, NON logga):
//   node scripts/send_drip.mjs --dry-run
//   # 3) invio reale ai destinatari del file + logging nel registro:
//   node scripts/send_drip.mjs --apply
//
// Flag:
//   --recipients <file>  JSON array di email (default messaggi-clienti/drip/<oggi>.recipients.json)
//   --preview <email>    manda la mail completa (3 materie) a <email>, no logging
//   --dry-run            default: stampa il piano senza inviare
//   --apply              invio reale + logging
//   --rate <ms>          pausa tra un invio e l'altro (default 1500ms, limiti Gmail)
//
// Richiede .env.local: DATABASE_URL/POSTGRES_URL, GMAIL_USER, GMAIL_APP_PASSWORD.
// Gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import nodemailer from 'nodemailer'
import { neon } from '@neondatabase/serverless'
import { LOGO_DARK_B64 } from '../api/_lib/logo-dark-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// --- env (.env.local a mano, come gli altri script) -------------------------
try {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { console.error('[FAIL] .env.local non trovato'); process.exit(1) }

// ============================================================================
// CONFIG DELL'INVIO — cambia qui per i drip successivi
// ============================================================================
const INVIO_ID = 'drip-2026-06-05'
const SUBJECT = '3 nuove materie da scaricare: Pubblico Impiego, Contratti, Ordinamento PA'
const KICKER = 'NUOVE MATERIE'
// IMPORTANTE: in locale .env.local ha PUBLIC_BASE_URL=http://localhost:5173 (dev).
// Le mail vanno SEMPRE col dominio di produzione, altrimenti i link /scrivimi e
// di disiscrizione puntano a localhost (stesso motivo per cui send_newsletter.mjs
// forza il dominio live). Se l'env è localhost o assente, usiamo produzione.
const PROD_URL = 'https://ripam-studio-craft.vercel.app'
const _envUrl = process.env.PUBLIC_BASE_URL
const BASE_URL = (_envUrl && !/localhost|127\.0\.0\.1/.test(_envUrl)) ? _envUrl : PROD_URL
if (_envUrl && /localhost|127\.0\.0\.1/.test(_envUrl)) {
  console.log(`[i] PUBLIC_BASE_URL è "${_envUrl}" (dev): forzo i link mail a ${PROD_URL}`)
}

// Le 3 materie del drip: slug (per il registro), titolo, normativa, link Drive.
const MATERIE = [
  {
    slug: 'pubblico-impiego', titolo: 'Pubblico Impiego', norm: 'D.Lgs. 165/2001',
    audio: 'https://drive.google.com/file/d/1thiu-C7vC9tjYhRp1tpKhBYhECPqRr_z/view',
    video: 'https://drive.google.com/file/d/1bbRz9Qz0tqwMod5EJsW7Nhqd3sk7P4fS/view',
    manuale: 'https://drive.google.com/file/d/1p5lak1Eo0_WIR2b4BOGWqd2gBctxKFPS/view',
  },
  {
    slug: 'contratti-pubblici', titolo: 'Contratti Pubblici', norm: 'D.Lgs. 36/2023',
    audio: 'https://drive.google.com/file/d/1_9hYVJ58V1vq9VzYhII9j3EwQIutlc8G/view',
    video: 'https://drive.google.com/file/d/1ZoTTz-nkQrdy6XhmNXKwtmc4gJnqhMFS/view',
    manuale: 'https://drive.google.com/file/d/1c0ECzLDP5Xj4IOS6e6TKTTnvdlLqTroK/view',
  },
  {
    slug: 'ordinamento-pa', titolo: 'Ordinamento PA', norm: 'D.Lgs. 300/1999',
    audio: 'https://drive.google.com/file/d/1APPFfLTE5nYof4K24Ezo4GF4BxpwnntR/view',
    video: 'https://drive.google.com/file/d/1gd1fn8tgeDBYd7tZbyNAH7qkOP2RJnKA/view',
    manuale: 'https://drive.google.com/file/d/1uVqAZUbbdJDSdDiIvFpgZUoKZBWAufZC/view',
  },
]
const FORMATO = 'completa-avm'

// --- args -------------------------------------------------------------------
function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]; if (!a.startsWith('--')) continue
    const key = a.slice(2); const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) out[key] = true
    else { out[key] = next; i++ }
  }
  return out
}
const args = parseArgs(process.argv.slice(2))
const RATE = Number(args.rate) > 0 ? Number(args.rate) : 1500
const recipientsPath = typeof args.recipients === 'string'
  ? args.recipients
  : join(ROOT, 'messaggi-clienti', 'drip', '2026-06-05.recipients.json')

// --- brand dark shell (identico a send_lead.mjs) ----------------------------
const BRAND = { ink: '#0a0a0a', cream: '#f5f0e8', acid: '#c6f432', muted: '#6b6458', rule: '#e6dfd2', baseUrl: BASE_URL }
function darkShell(innerHtml, kicker) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.cream}" style="background:${BRAND.cream};margin:0;padding:0;width:100%;">
  <tr><td align="center" style="padding:20px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
      <tr><td style="background:${BRAND.ink};padding:20px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="left" style="vertical-align:middle;">
            <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0;"><img src="cid:logo-dark.png" alt="Ripam Studio Craft" width="180" style="display:block;width:180px;max-width:180px;height:auto;border:0;outline:none;" /></a>
          </td>
          <td align="right" style="vertical-align:middle;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.14em;color:${BRAND.acid};text-transform:uppercase;line-height:1.5;white-space:nowrap;">${kicker}</td>
        </tr></table>
      </td></tr>
      <tr><td bgcolor="${BRAND.cream}" style="background:${BRAND.cream};padding:28px 28px 8px;font-size:15px;line-height:1.55;color:${BRAND.ink};">
        ${innerHtml}
      </td></tr>
      <tr><td style="padding:8px 28px 28px;">
        <hr style="border:none;border-top:1px solid ${BRAND.rule};margin:18px 0">
        <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.55">Francesco Capurso &middot; Ripam Studio Craft &middot; Roma &middot; P.IVA 18528431002<br>
        <a href="mailto:ripamstudiocraft@gmail.com" style="color:${BRAND.muted}">ripamstudiocraft@gmail.com</a> &middot; <a href="${BRAND.baseUrl}" style="color:${BRAND.muted}">ripam-studio-craft.vercel.app</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>`
}
function logoDarkAttachment() {
  return { filename: 'logo-dark.png', content: Buffer.from(LOGO_DARK_B64, 'base64'), cid: 'logo-dark.png', contentType: 'image/png' }
}

// --- builder contenuto -------------------------------------------------------
// Solo nome reale: se manca, ritorna '' → saluto "Ciao," (evita "Ciao Giber81").
function deriveFirstName(nome) {
  const raw = (nome || '').trim().split(/\s+/)[0]
  if (!raw) return ''
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}
function pill(href, label, opts = {}) {
  const bg = opts.orange ? '#ff6b1a' : BRAND.ink
  const fg = opts.orange ? BRAND.ink : BRAND.cream
  const border = opts.orange ? `border:2px solid ${BRAND.ink};` : ''
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;margin:0 6px 8px 0;${border}">${label} &#x2913;</a>`
}
function materiaCard(m) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
    <tr><td style="border:2px solid ${BRAND.ink};padding:18px 20px;background:${BRAND.cream};">
      <div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:${BRAND.muted};margin-bottom:6px;text-transform:uppercase;">${m.norm} &middot; ${m.titolo}</div>
      <div style="font-size:22px;font-weight:800;color:${BRAND.ink};margin-bottom:14px;letter-spacing:-0.02em;line-height:1.15;">${m.titolo} &mdash; EP1</div>
      ${pill(m.audio, 'AUDIO EP1')}${pill(m.video, 'VIDEO EP1')}${pill(m.manuale, 'MANUALE PDF', { orange: true })}
    </td></tr>
  </table>`
}
function buildHtml(firstName, materie, unsubUrl) {
  const n = materie.length
  const parolaMaterie = n === 1 ? 'una materia' : `${n} materie`
  const cards = materie.map(materiaCard).join('\n')
  const saluto = firstName ? `Ciao <strong>${firstName}</strong>,` : 'Ciao,'
  return `<p style="margin:0 0 14px">${saluto}</p>
  <p style="margin:0 0 16px">quando ti sei iscritto ti avevo promesso che ti avrei mandato <strong>nuove materie</strong> a mano a mano. Eccoti <strong>${parolaMaterie}</strong> tra le più richieste per i concorsi pubblici &mdash; ognuna con <strong>Audio EP1, Video EP1 e anteprima del Manuale</strong> (PDF). Clicchi e scarichi, senza passare dal form.</p>
  ${cards}
  <p style="margin:18px 0 0">Ti serve una materia che non trovi qui, o il manuale completo di una di queste? Rispondi a questa mail o usa il <a href="${BASE_URL}/scrivimi" style="color:${BRAND.ink};font-weight:700">form del sito</a>.</p>
  <p style="margin:16px 0 0">A presto,<br><strong>Francesco Capurso</strong></p>
  <p style="margin:18px 0 0;font-size:11px;color:${BRAND.muted};font-family:'Courier New',monospace;letter-spacing:.06em"><a href="${unsubUrl}" style="color:${BRAND.muted};text-decoration:underline">DISISCRIVITI ONE-CLICK</a> &middot; ricevi max 1-2 mail al mese</p>`
}
function buildText(firstName, materie, unsubUrl) {
  const lines = []
  lines.push(firstName ? `Ciao ${firstName},` : 'Ciao,', '')
  lines.push(`quando ti sei iscritto ti avevo promesso nuove materie a mano a mano.`)
  lines.push(`Eccoti ${materie.length === 1 ? 'una materia' : materie.length + ' materie'} tra le più richieste per i concorsi pubblici,`)
  lines.push(`ognuna con Audio EP1, Video EP1 e anteprima del Manuale (PDF):`, '')
  for (const m of materie) {
    lines.push(`${m.titolo.toUpperCase()} (${m.norm})`)
    lines.push(`  Audio EP1   -> ${m.audio}`)
    lines.push(`  Video EP1   -> ${m.video}`)
    lines.push(`  Manuale PDF -> ${m.manuale}`, '')
  }
  lines.push(`Ti serve un'altra materia o il manuale completo? Rispondi a questa mail o usa il form:`)
  lines.push(`${BASE_URL}/scrivimi`, '')
  lines.push('A presto,', 'Francesco Capurso — Ripam Studio Craft', '')
  lines.push(`Disiscriviti one-click: ${unsubUrl}`)
  return lines.join('\n')
}

// --- transporter -------------------------------------------------------------
const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) { console.error('[FAIL] DATABASE_URL mancante'); process.exit(1) }
const sql = neon(databaseUrl)
function makeTransport() {
  if (!user || !pass) { console.error('[FAIL] GMAIL_USER / GMAIL_APP_PASSWORD mancanti'); process.exit(1) }
  return nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, family: 4, auth: { user, pass }, tls: { rejectUnauthorized: false } })
}
async function sendMail(transporter, to, subject, html, text, unsubUrl) {
  const headers = { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
  if (unsubUrl && !unsubUrl.endsWith('PREVIEW')) headers['List-Unsubscribe'] = `<${unsubUrl}>`
  return transporter.sendMail({
    from: `"Francesco — Ripam Studio Craft" <${user}>`,
    to, replyTo: user, subject, text, html,
    attachments: [logoDarkAttachment()],
    headers,
  })
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ============================================================================
// MODE: RENDER — stampa HTML+testo della mail completa, NON invia (debug link)
// ============================================================================
if (args.render) {
  const unsubUrl = `${BASE_URL}/api/newsletter/unsubscribe?t=TOKEN`
  const html = darkShell(buildHtml('Francesco', MATERIE, unsubUrl), KICKER)
  const text = buildText('Francesco', MATERIE, unsubUrl)
  console.log('===== HTML =====\n' + html + '\n\n===== TEXT =====\n' + text)
  process.exit(0)
}

// ============================================================================
// MODE: PREVIEW — mail completa (3 materie) a un indirizzo, niente DB log
// ============================================================================
if (typeof args.preview === 'string') {
  const to = args.preview
  const firstName = deriveFirstName('Francesco')
  const unsubUrl = `${BASE_URL}/api/newsletter/unsubscribe?t=PREVIEW`
  const html = darkShell(buildHtml(firstName, MATERIE, unsubUrl), KICKER)
  const text = buildText(firstName, MATERIE, unsubUrl)
  const transporter = makeTransport()
  try {
    const info = await sendMail(transporter, to, `[ANTEPRIMA] ${SUBJECT}`, html, text, unsubUrl)
    console.log(`[OK] anteprima inviata a ${to} — ${info.messageId}`)
    console.log(`     (3 materie, nessun logging sul registro)`)
  } catch (e) { console.error(`[FAIL] ${e.message}`); process.exit(1) }
  process.exit(0)
}

// ============================================================================
// MODE: DRY-RUN / APPLY — invio ai destinatari del file
// ============================================================================
const apply = !!args.apply
const emails = JSON.parse(readFileSync(recipientsPath, 'utf8')).map(e => String(e).toLowerCase().trim())
console.log(`\n${apply ? '== INVIO REALE ==' : '== DRY-RUN (nessun invio) =='}`)
console.log(`Invio: ${INVIO_ID} · ${emails.length} destinatari nel file · materie: ${MATERIE.map(m => m.slug).join(', ')}\n`)

const transporter = apply ? makeTransport() : null
let sent = 0, skipped = 0, errors = 0

for (const email of emails) {
  // dati iscritto + stato
  const sub = (await sql`
    SELECT id, nome, unsubscribe_token, confirmed_at, unsubscribed_at
    FROM newsletter_subscribers WHERE LOWER(email) = ${email} LIMIT 1
  `)[0]
  if (!sub) { console.log(`[skip] ${email} — non in newsletter_subscribers`); skipped++; continue }
  if (!sub.confirmed_at || sub.unsubscribed_at) { console.log(`[skip] ${email} — non confermato o disiscritto`); skipped++; continue }

  // materie già ricevute (qualsiasi formato) → escludile
  const got = (await sql`
    SELECT DISTINCT materia FROM anteprime_inviate WHERE LOWER(email) = ${email}
  `).map(r => r.materia)
  const daInviare = MATERIE.filter(m => !got.includes(m.slug))
  if (!daInviare.length) { console.log(`[skip] ${email} — ha già tutte e ${MATERIE.length} le materie`); skipped++; continue }

  const firstName = deriveFirstName(sub.nome, email)
  const skippedMat = MATERIE.filter(m => got.includes(m.slug)).map(m => m.slug)
  const tag = skippedMat.length ? `  (salto: ${skippedMat.join(', ')})` : ''
  console.log(`[${apply ? 'send' : 'plan'}] ${email} (${firstName}) → ${daInviare.map(m => m.slug).join(', ')}${tag}`)

  if (!apply) { sent++; continue }

  const unsubUrl = `${BASE_URL}/api/newsletter/unsubscribe?t=${sub.unsubscribe_token}`
  const html = darkShell(buildHtml(firstName, daInviare, unsubUrl), KICKER)
  const text = buildText(firstName, daInviare, unsubUrl)
  try {
    const info = await sendMail(transporter, email, SUBJECT, html, text, unsubUrl)
    console.log(`        [OK] ${info.messageId}`)
    // log nel registro (una riga per materia)
    for (const m of daInviare) {
      await sql`
        INSERT INTO anteprime_inviate (email, nome, materia, formato, canale, invio_id)
        VALUES (${email}, ${sub.nome}, ${m.slug}, ${FORMATO}, 'drip', ${INVIO_ID})
        ON CONFLICT (LOWER(email), materia, formato) DO NOTHING
      `
    }
    await sql`UPDATE newsletter_subscribers SET last_email_sent_at = now() WHERE id = ${sub.id}`
    sent++
  } catch (e) { console.error(`        [FAIL] ${e.message}`); errors++ }
  await sleep(RATE)
}

console.log(`\n=== Fatto ===`)
console.log(`${apply ? 'Inviate' : 'Pianificate'}: ${sent} · Saltati: ${skipped}` + (apply ? ` · Errori: ${errors}` : ''))
if (!apply) console.log(`\nPer inviare davvero: node scripts/send_drip.mjs --apply`)
