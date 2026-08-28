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
//   --light    guscio BIANCO con logo normale in alto (invece del guscio dark)
//   --attach   allegati: "file1.pdf,file2.pdf" oppure "file.pdf|Nome visibile.pdf,..."
//   --campagna slug per il registro invii (default 'lead-<data>'). Tenerlo PARLANTE
//              e stabile: è la chiave con cui i blast futuri chiedono "gliel'ho
//              già mandata?" — es. --campagna "invito-newsletter-2026-07"
//   --label    Gmail label da AGGIUNGERE al thread dopo l'invio (nomi, separati da virgola)
//              es. --label "Lead - Hot,Anteprima inviata"
//   --unlabel  Gmail label da RIMUOVERE dal thread dopo l'invio (nomi, separati da virgola)
//              es. --unlabel "Da rispondere"
//   --no-thread  NON agganciare la risposta al thread del destinatario (default:
//              la aggancia, cercando via IMAP l'ultimo messaggio ricevuto da lui
//              e mettendone il Message-ID in In-Reply-To/References). Senza
//              aggancio Gmail apre una conversazione nuova e il thread del lead
//              resta con l'ultima parola sua — cioè sembra inevaso. Usa
//              --no-thread solo per un primo contatto che deve stare per conto suo.
//   --dry-run  stampa a video e NON invia
//   --out      con --dry-run: salva la mail completa (guscio + logo) in un .html
//              da aprire nel browser per rivederla prima di dare l'ok all'invio
//   --demo     invia una mail dimostrativa a fracabu@gmail.com (verifica il logo)
//
// Le label NON passano da SMTP: --label/--unlabel agiscono via IMAP (stesse
// credenziali app-password). Dopo l'invio lo script ritrova il messaggio appena
// spedito per Message-ID nella cartella "Tutta la posta" (\All), risale al thread
// (X-GM-THRID) e applica add/del label a TUTTI i messaggi del thread — così p.es.
// "Da rispondere" sparisce anche dalla mail in arrivo del lead. Per i NOMI esatti
// delle label vedi list_labels (MCP Gmail). L'etichettatura è best-effort: se
// fallisce la mail resta inviata, viene solo stampato un warning.
// ⚠️ Non toccare le label Quiz Pro (gestite da un'altra app): non passarle qui.
//
// Richiede .env.local: GMAIL_USER, GMAIL_APP_PASSWORD. Gira a PC acceso.
// ============================================================================

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import nodemailer from 'nodemailer'
import { LOGO_DARK_B64 } from '../api/_lib/logo-dark-data.js'
import { logInvio } from '../api/_lib/invii-log.js'

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

// --- guscio LIGHT (sfondo bianco + logo normale in alto, niente header nero) -
function lightShell(innerHtml) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;margin:0;padding:0;width:100%;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
      <tr>
        <td align="left" style="padding:8px 28px 18px;border-bottom:1px solid ${BRAND.rule};">
          <a href="${BRAND.baseUrl}" style="text-decoration:none;border:0;">
            <img src="cid:logo.png" alt="Ripam Studio Craft" width="190" style="display:block;width:190px;max-width:190px;height:auto;border:0;outline:none;" />
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:26px 28px 8px;font-size:15px;line-height:1.55;color:${BRAND.ink};">
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

function logoLightAttachment() {
  return { filename: 'logo.png', content: readFileSync(join(ROOT, 'public', 'logo.png')), cid: 'logo.png', contentType: 'image/png' }
}

// --- allegati extra: "file.pdf,altro.pdf" o "file.pdf|Nome visibile.pdf,..." -
function parseAttachments(spec) {
  if (typeof spec !== 'string' || !spec.trim()) return []
  return spec.split(',').map(s => s.trim()).filter(Boolean).map(item => {
    const [p, name] = item.split('|').map(x => x.trim())
    const path = p
    return name ? { filename: name, path } : { path }
  })
}

// --- etichettatura Gmail via IMAP (le label non passano da SMTP) ------------
// Trova la cartella speciale "Tutta la posta" (attributo \All), indipendente
// dalla lingua dell'account (it: "Tutta la posta", en: "All Mail").
function findAllMailBox(boxes, prefix = '') {
  for (const name of Object.keys(boxes)) {
    const box = boxes[name]
    const full = prefix + name
    if (box.attribs && box.attribs.includes('\\All')) return full
    if (box.children) {
      const sub = findAllMailBox(box.children, full + (box.delimiter || '/'))
      if (sub) return sub
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// THREADING — perché esiste (28/08/2026)
//
// Senza gli header In-Reply-To e References, Gmail apre una conversazione NUOVA
// anche quando l'oggetto è "Re: ...": il thread costruito lato client si basa su
// quegli header, non sul testo dell'oggetto. Conseguenza pratica: la risposta
// finisce in un thread a parte e in casella il thread del lead resta con
// l'ULTIMA PAROLA SUA — cioè sembra inevaso anche quando è già stato gestito.
// Il 28/08 questo ha fatto sembrare "da rispondere" Letizia, Roberta e Danilo,
// che erano già stati serviti, e ha richiesto mezz'ora di incroci a mano fra
// inviata e ricevuta per capirlo.
//
// Rimedio: prima di spedire cerco via IMAP l'ultimo messaggio ricevuto DA quel
// destinatario e mi ci aggancio. È il comportamento di DEFAULT (si disattiva
// con --no-thread): se dipendesse da un flag da ricordare, il problema
// tornerebbe la prima volta che me lo dimentico.
// ---------------------------------------------------------------------------
async function ultimoMessageIdDa({ user, pass, email }) {
  const { default: Imap } = await import('imap')
  return new Promise((resolve) => {
    const imap = new Imap({
      user, password: pass,
      host: 'imap.gmail.com', port: 993, tls: true,
      tlsOptions: { rejectUnauthorized: false, servername: 'imap.gmail.com' },
      authTimeout: 20000,
    })
    // Best-effort: se qualcosa non va si spedisce comunque, senza agganciare.
    const giveUp = () => { try { imap.end() } catch {} ; resolve(null) }
    imap.once('error', giveUp)

    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        if (err) return giveUp()
        const allMail = findAllMailBox(boxes)
        if (!allMail) return giveUp()
        imap.openBox(allMail, true, (errOpen) => {
          if (errOpen) return giveUp()
          imap.search([['FROM', email]], (errS, uids) => {
            if (errS || !uids || !uids.length) return giveUp()
            // L'ultimo UID è il messaggio più recente ricevuto da quell'indirizzo.
            const ultimo = uids[uids.length - 1]
            let mid = null
            const f = imap.fetch(ultimo, { bodies: 'HEADER.FIELDS (MESSAGE-ID)' })
            f.on('message', (msg) => {
              let buf = ''
              msg.on('body', (s) => s.on('data', (c) => { buf += c.toString('utf8') }))
              msg.once('end', () => {
                const m = buf.replace(/\r?\n[ \t]+/g, ' ').match(/^Message-ID:\s*(<[^>]+>)/im)
                if (m) mid = m[1]
              })
            })
            f.once('error', giveUp)
            f.once('end', () => { try { imap.end() } catch {} ; resolve(mid) })
          })
        })
      })
    })
    imap.connect()
  })
}

async function applyGmailLabels({ user, pass, messageId, add = [], remove = [] }) {
  const { default: Imap } = await import('imap')
  const cleanId = String(messageId).replace(/^<|>$/g, '')

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user, password: pass,
      host: 'imap.gmail.com', port: 993, tls: true,
      tlsOptions: { rejectUnauthorized: false, servername: 'imap.gmail.com' },
      authTimeout: 20000,
    })
    const fail = (e) => { try { imap.end() } catch {} ; reject(e) }
    imap.once('error', fail)

    imap.once('ready', () => {
      imap.getBoxes((err, boxes) => {
        if (err) return fail(err)
        const allMail = findAllMailBox(boxes)
        if (!allMail) return fail(new Error('Cartella "Tutta la posta" (\\All) non trovata via IMAP'))

        imap.openBox(allMail, false, (errOpen) => {
          if (errOpen) return fail(errOpen)

          // Il sent può tardare un attimo a essere indicizzato: piccola attesa+retry.
          let attempts = 0
          const findSent = () => {
            attempts++
            imap.search([['HEADER', 'MESSAGE-ID', cleanId]], (errS, uids) => {
              if (errS) return fail(errS)
              if (!uids || !uids.length) {
                if (attempts >= 4) return fail(new Error('Messaggio inviato non ancora indicizzato su IMAP'))
                return setTimeout(findSent, 2000)
              }
              const sentUid = uids[uids.length - 1]
              // Risalgo al thread (X-GM-THRID) del messaggio inviato.
              const f = imap.fetch(sentUid, { bodies: 'HEADER.FIELDS (MESSAGE-ID)' })
              let thrid = null
              f.on('message', (m) => m.once('attributes', (attrs) => { thrid = attrs['x-gm-thrid'] }))
              f.once('error', fail)
              f.once('end', () => {
                if (!thrid) return fail(new Error('X-GM-THRID non disponibile'))
                imap.search([['X-GM-THRID', thrid]], (errT, threadUids) => {
                  if (errT) return fail(errT)
                  const targets = (threadUids && threadUids.length) ? threadUids : [sentUid]
                  const doAdd = (cb) => add.length ? imap.addLabels(targets, add, cb) : cb()
                  const doDel = (cb) => remove.length ? imap.delLabels(targets, remove, cb) : cb()
                  doAdd((eA) => {
                    if (eA) return fail(eA)
                    doDel((eD) => {
                      if (eD) return fail(eD)
                      imap.end()
                      resolve({ thrid, count: targets.length })
                    })
                  })
                })
              })
            })
          }
          findSent()
        })
      })
    })

    imap.connect()
  })
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

const useLight = !!args.light
const html = useLight ? lightShell(innerHtml) : darkShell(innerHtml, kicker)
const fromName = typeof args.from === 'string' ? args.from : 'Francesco — Ripam Studio Craft'
const extraAttachments = parseAttachments(args.attach)

const splitLabels = (v) => typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []
const addLabels = splitLabels(args.label)
const delLabels = splitLabels(args.unlabel)

// Slug per il registro invii: esplicito se passato, altrimenti 'lead-<data>'.
const campagna = typeof args.campagna === 'string'
  ? args.campagna
  : `lead-${new Date().toISOString().slice(0, 10)}`

if (args['dry-run']) {
  console.log(`[dry-run] NON invio.`)
  console.log(`  to:      ${to}`)
  console.log(`  subject: ${subject}`)
  console.log(`  guscio:  ${useLight ? 'LIGHT (sfondo bianco + logo.png)' : `DARK (header nero + logo-dark, kicker "${kicker}")`}`)
  console.log(`  html:    ${html.length} char`)
  console.log(`  text:    ${String(text).length} char`)
  console.log(`  campagna: ${campagna}  (registro invii_email)`)
  if (extraAttachments.length) {
    console.log(`  allegati: ${extraAttachments.length}`)
    for (const a of extraAttachments) console.log(`    - ${a.filename || a.path}`)
  }
  if (addLabels.length) console.log(`  +label:  ${addLabels.join(', ')}`)
  if (delLabels.length) console.log(`  -label:  ${delLabels.join(', ')}`)
  // --out <file>: salva la mail COMPLETA (guscio + contenuto) per aprirla nel
  // browser e rivederla com'è davvero, prima di dare l'ok all'invio. Il logo
  // viaggia come cid: → qui va sostituito col data URI, altrimenti nel file
  // locale resta un'immagine rotta.
  if (typeof args.out === 'string') {
    const preview = html
      .replace(/cid:logo-dark\.png/g, `data:image/png;base64,${LOGO_DARK_B64}`)
      .replace(/cid:logo\.png/g, `data:image/png;base64,${readFileSync(join(ROOT, 'public', 'logo.png')).toString('base64')}`)
    writeFileSync(args.out, `<!doctype html><meta charset="utf-8"><title>${subject}</title>${preview}`, 'utf8')
    console.log(`  anteprima salvata: ${args.out}`)
  }
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

// Aggancio al thread del lead (vedi il commento su ultimoMessageIdDa).
let inReplyTo = null
if (!args['no-thread'] && !args.demo) {
  try {
    inReplyTo = await ultimoMessageIdDa({ user, pass, email: to })
    if (inReplyTo) console.log(`[i]  aggancio al thread esistente (${inReplyTo})`)
    else console.log('[i]  nessun messaggio precedente da questo indirizzo: parte un thread nuovo')
  } catch {
    console.log('[i]  threading non riuscito: parte un thread nuovo')
  }
}

try {
  const info = await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to, replyTo: user, subject, text, html,
    ...(inReplyTo ? { inReplyTo, references: [inReplyTo] } : {}),
    attachments: [useLight ? logoLightAttachment() : logoDarkAttachment(), ...extraAttachments],
  })
  console.log(`[OK] inviata a ${to} — ${info.messageId}`)

  // Registro invii: la riga va scritta SEMPRE, anche per una singola mail a un
  // lead. È così che il prossimo blast sa di non ricontattare questa persona.
  const esitoLog = await logInvio({
    email: to, campagna, oggetto: subject, tipo: 'lead', canale: 'lead',
    messageId: info.messageId,
  })
  if (esitoLog === 'inserita') console.log(`[OK] registro invii: '${campagna}'`)
  else if (esitoLog === 'gia-presente') console.log(`[i]  registro invii: '${campagna}' già registrata per ${to}`)
  else if (esitoLog === 'skip-no-db') console.log('[WARN] registro invii saltato: manca DATABASE_URL')

  // Etichettatura best-effort: la mail è già partita, un errore qui non è fatale.
  if (addLabels.length || delLabels.length) {
    try {
      const r = await applyGmailLabels({ user, pass, messageId: info.messageId, add: addLabels, remove: delLabels })
      const parts = []
      if (addLabels.length) parts.push(`+[${addLabels.join(', ')}]`)
      if (delLabels.length) parts.push(`-[${delLabels.join(', ')}]`)
      console.log(`[OK] label aggiornate su ${r.count} messaggi del thread: ${parts.join(' ')}`)
    } catch (e) {
      console.error(`[WARN] invio ok, ma etichettatura fallita: ${e.message}`)
      console.error(`       applica le label a mano (oggetto: "${subject}").`)
    }
  }
} catch (err) {
  console.error(`[FAIL] invio fallito: ${err.message}`)
  process.exit(1)
}
