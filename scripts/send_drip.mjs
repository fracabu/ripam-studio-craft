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
//   --min-eta-giorni <n> non scrivere a chi si è iscritto da meno di n giorni
//                        (default 7; --min-eta-giorni 0 disattiva il filtro)
//   --min-silenzio-giorni <n>  non scrivere a chi è stato contattato da meno di n
//                        giorni su QUALSIASI canale (default 7; 0 disattiva)
//   --no-pertinenza      manda le materie a chiunque, come prima del 30/08/2026
//   --anche-senza-concorso  includi chi non ha un concorso noto a profilo
//
// PERTINENZA (dal 2026-08-30): si mandano solo le materie del concorso che la
// persona prepara (`candidati.concorsi` × campo `c` di src/data/materie.js).
// Prima si sceglieva per esaurimento — "ti mando ciò che non hai ancora" — e con
// abbastanza giri tutti ricevevano tutto: otto iscritti sono arrivati a 30+
// anteprime a testa. Chi non ha un concorso mappato viene saltato: non sapendo
// cosa gli serve, non si indovina.
//
// QUARANTENA NUOVI ISCRITTI (dal 2026-07-23): un iscritto appena confermato sta
// già ricevendo la sequenza d'ingresso (conferma + welcome/anteprima). Se il drip
// gli arriva sopra, sono 3 mail in poche ore e la reazione è la disiscrizione:
// dei 3 abbandoni veri della lista, due sono avvenuti così — uno a 2 minuti dal
// drip, ricevuto il giorno dopo l'iscrizione; l'altro dopo un drip arrivato 2h49
// dopo l'iscrizione. Il drip serve a riempire i vuoti, non a saturare l'ingresso:
// chi è dentro da meno di MIN_ETA_GIORNI lo prendiamo al giro successivo.
//
// Richiede .env.local: DATABASE_URL/POSTGRES_URL, GMAIL_USER, GMAIL_APP_PASSWORD.
// Gira a PC acceso.
// ============================================================================

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import nodemailer from 'nodemailer'
import { neon } from '@neondatabase/serverless'
import { emailShell, logoAttachment, BRAND } from '../api/_lib/email-shell.js'
import { MATERIE as CATALOGO } from '../src/data/materie.js'
import { logInvio } from '../api/_lib/invii-log.js'

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
const INVIO_ID = 'drip-2026-07-03-completamento'
const SUBJECT = 'Le ultime 5 materie: Anticorruzione, Contabilità, Logica, Patrimonio e Sicurezza'
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

// Le materie del drip: slug (per il registro), titolo, normativa, link Drive.
// `video` opzionale: se assente la card mostra solo AUDIO + MANUALE e l'invio
// viene loggato come formato 'audio-manuale' (es. Informatica, senza video EP1).
// Tutti i fileId presi da Drive ANTEPRIME (cartella=slug), permessi anyone/reader
// verificati il 2026-06-13.
const MATERIE = [
  {
    slug: 'anticorruzione-trasparenza', titolo: 'Anticorruzione e Trasparenza', norm: 'L. 190/2012 · D.Lgs. 33/2013',
    audio: 'https://drive.google.com/file/d/1_bDtTpeOFgeybg0m4rHSm47Ihku6I6nT/view',
    manuale: 'https://drive.google.com/file/d/16sQ2Cb8po8MSGsj3SFJJ0ru_VRlkivKL/view',
    // niente video EP1 → card a 2 pulsanti, formato 'audio-manuale'
  },
  {
    slug: 'contabilita-pubblica', titolo: 'Contabilità Pubblica', norm: 'L. 196/2009 · D.Lgs. 118/2011',
    audio: 'https://drive.google.com/file/d/1o1x7iwknwtKc_BheGzzHCY04u5pXk-5q/view',
    video: 'https://drive.google.com/file/d/1C-Z2g58c5-qZIrn8J4Yjc7viwKR_YFK4/view',
    manuale: 'https://drive.google.com/file/d/1EmAxlL-8-4CUbw_qmCl4FI1EQ0xtT1-K/view',
  },
  {
    slug: 'logica', titolo: 'Logica e ragionamento', norm: 'Ragionamento critico',
    audio: 'https://drive.google.com/file/d/13WNdyrZ9Q1LSkIK5UCmaY9kezDgdQD8g/view',
    manuale: 'https://drive.google.com/file/d/1ZaorlL5PFzog31vV-K2n5xaolmAnwCUO/view',
    // niente video EP1 → card a 2 pulsanti, formato 'audio-manuale'
  },
  {
    slug: 'patrimonio-culturale', titolo: 'Patrimonio Culturale', norm: 'Normativa MIC',
    audio: 'https://drive.google.com/file/d/1vOU17nrXj0nuRglbEoPsly4RwwNMMDWE/view',
    video: 'https://drive.google.com/file/d/1F_oNRF9WoCSoGjFQyoNwRvfYndTT8qK8/view',
    manuale: 'https://drive.google.com/file/d/1OdwQQxv5fXakU0F6K-fPH0wCfXXOhYAy/view',
  },
  {
    slug: 'sicurezza-lavoro', titolo: 'Sicurezza sul Lavoro', norm: 'D.Lgs. 81/2008',
    audio: 'https://drive.google.com/file/d/14M0G7y0wC1k4FBTpqchsJgxU-NvdkS3o/view',
    video: 'https://drive.google.com/file/d/1RPRoaTJNrjK2Zno37xaHg9xW2t3vUdse/view',
    manuale: 'https://drive.google.com/file/d/1zEh4-4cLBbZroEyO0oXyCiddkX-sMjqL/view',
  },
]
// formato di default per il registro; le materie senza `video` → 'audio-manuale'
const FORMATO = 'completa-avm'
const formatoDi = (m) => m.video ? FORMATO : 'audio-manuale'

// Teaser report custom per concorso (Drive report-custom/<slug-concorso>/), NON
// tracciati nel registro anteprime_inviate (quello è per materia, non per
// concorso) — annuncio una-tantum a tutta la lista, come nel blast CPI Sicilia
// SAC del 22/06. Un report rappresentativo per concorso + CTA per gli altri.
const REPORT_EXTRA = []

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
// Quarantena nuovi iscritti: 0 = disattivata (esplicito), default 7 giorni.
const MIN_ETA_GIORNI = args['min-eta-giorni'] !== undefined && args['min-eta-giorni'] !== true
  ? Math.max(0, Number(args['min-eta-giorni']) || 0)
  : 7
const recipientsPath = typeof args.recipients === 'string'
  ? args.recipients
  : join(ROOT, 'messaggi-clienti', 'drip', '2026-06-05.recipients.json')

// --- PERTINENZA: mandare solo materie del concorso che la persona prepara ----
// Prima del 2026-08-30 il drip sceglieva per ESAURIMENTO: "ti mando ciò che non
// hai ancora", indipendentemente dal concorso. Con abbastanza giri tutti
// ricevevano tutto (otto persone a 30+ anteprime a testa) — ed è il motivo per
// cui "la gente riceve cose che non ha chiesto". Il concorso lo sappiamo già:
// `candidati.concorsi`, riempito da api/contact.js. Ora lo usiamo.
const NO_PERTINENZA = !!args['no-pertinenza']              // torna al vecchio comportamento
const ANCHE_SENZA_CONCORSO = !!args['anche-senza-concorso'] // includi chi non ha concorso noto
// Giorni di silenzio minimi contando TUTTI i canali (drip, lead, newsletter,
// campagne): welcome/drip/newsletter avevano ognuno il proprio anti-doppione,
// ma nessuno guardava il totale. 0 = disattivato.
const MIN_SILENZIO_GIORNI = args['min-silenzio-giorni'] !== undefined && args['min-silenzio-giorni'] !== true
  ? Math.max(0, Number(args['min-silenzio-giorni']) || 0)
  : 7

// slug materia → famiglie concorso del catalogo (campo `c` di src/data/materie.js)
const FAMIGLIE_DI = new Map(CATALOGO.map(m => [m.slug, m.c || []]))
// Le famiglie realmente usate dal catalogo: se il concorso di una persona non
// compare qui, non possiamo dire quali materie le servano → non tiriamo a
// indovinare, la saltiamo (a meno di --anche-senza-concorso).
const FAMIGLIE_NOTE = new Set(CATALOGO.flatMap(m => m.c || []))

/** Sigle concorso della persona, dal profilo candidato. */
async function concorsiDi(email) {
  const r = (await sql`
    SELECT concorsi FROM candidati WHERE LOWER(email) = ${email} LIMIT 1
  `)[0]
  return (r?.concorsi || []).map(c => String(c).toUpperCase().trim()).filter(Boolean)
}

/** Le materie del drip pertinenti a quei concorsi. */
function materiePertinenti(materie, concorsi) {
  if (NO_PERTINENZA) return materie
  return materie.filter(m => {
    const fam = FAMIGLIE_DI.get(m.slug)
    if (!fam || !fam.length) return false        // materia fuori catalogo: non la mandiamo alla cieca
    return fam.some(f => concorsi.includes(f))
  })
}

/** Giorni dall'ultimo contatto su QUALSIASI canale (registro invii + anteprime). */
async function giorniDiSilenzio(email) {
  const r = (await sql`
    SELECT GREATEST(
             COALESCE((SELECT MAX(inviata_at) FROM invii_email      WHERE LOWER(email) = ${email}), 'epoch'::timestamptz),
             COALESCE((SELECT MAX(inviata_at) FROM anteprime_inviate WHERE LOWER(email) = ${email}), 'epoch'::timestamptz)
           ) AS ultimo`)[0]
  const ultimo = r?.ultimo ? new Date(r.ultimo).getTime() : 0
  if (!ultimo || ultimo < new Date('2000-01-01').getTime()) return Infinity
  return (Date.now() - ultimo) / 86_400_000
}

// --- guscio: importato da api/_lib/email-shell.js ---------------------------
// Era una copia locale del guscio dark di send_lead.mjs, footer legale
// compreso: due file da aggiornare a ogni cambio di P.IVA o palette, con la
// certezza di dimenticarne uno. Fonte unica dal 31/08/2026.
const darkShell = (innerHtml, kicker) => emailShell(innerHtml, kicker)
const logoDarkAttachment = () => logoAttachment()

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
      ${pill(m.audio, 'AUDIO EP1')}${m.video ? pill(m.video, 'VIDEO EP1') : ''}${pill(m.manuale, 'MANUALE PDF', { orange: true })}
    </td></tr>
  </table>`
}
function reportCard(r) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
    <tr><td style="border:2px solid ${BRAND.ink};padding:18px 20px;background:${BRAND.cream};">
      <div style="font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.12em;color:${BRAND.muted};margin-bottom:6px;text-transform:uppercase;">REPORT CUSTOM &middot; ${r.concorso}</div>
      <div style="font-size:22px;font-weight:800;color:${BRAND.ink};margin-bottom:10px;letter-spacing:-0.02em;line-height:1.15;">${r.titolo}</div>
      ${pill(r.url, 'ANTEPRIMA REPORT', { orange: true })}
      <div style="margin-top:10px;font-size:13px;color:${BRAND.muted}">+ altri ${r.altri} report per questo concorso &mdash; rispondi a questa mail per riceverli.</div>
    </td></tr>
  </table>`
}
function buildHtml(firstName, materie, unsubUrl) {
  const n = materie.length
  const parolaMaterie = n === 1 ? 'una materia' : `${n} materie`
  const cards = materie.map(materiaCard).join('\n')
  const reportCards = REPORT_EXTRA.map(reportCard).join('\n')
  const saluto = firstName ? `Ciao <strong>${firstName}</strong>,` : 'Ciao,'
  return `<p style="margin:0 0 14px">${saluto}</p>
  <p style="margin:0 0 16px">quando ti sei iscritto ti avevo promesso che ti avrei mandato <strong>nuove materie</strong> a mano a mano. Eccoti <strong>${parolaMaterie}</strong> tra le più richieste per i concorsi pubblici &mdash; ognuna con <strong>Audio EP1, Video EP1 e anteprima del Manuale</strong> (PDF). Clicchi e scarichi, senza passare dal form.</p>
  ${cards}
  ${REPORT_EXTRA.length ? `<p style="margin:20px 0 16px">Ho anche preparato dei <strong>report di studio su misura per concorso specifico</strong> &mdash; qui un'anteprima per due concorsi molto richiesti:</p>
  ${reportCards}` : ''}
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
    if (m.video) lines.push(`  Video EP1   -> ${m.video}`)
    lines.push(`  Manuale PDF -> ${m.manuale}`, '')
  }
  if (REPORT_EXTRA.length) {
    lines.push(`Ho anche preparato dei report di studio su misura per concorso specifico,`)
    lines.push(`ecco un'anteprima per due concorsi molto richiesti:`, '')
    for (const r of REPORT_EXTRA) {
      lines.push(`REPORT CUSTOM - ${r.concorso}: ${r.titolo}`)
      lines.push(`  Anteprima -> ${r.url}`)
      lines.push(`  (+ altri ${r.altri} report per questo concorso, rispondi a questa mail)`, '')
    }
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
    console.log(`     (${MATERIE.length} materie, nessun logging sul registro)`)
  } catch (e) { console.error(`[FAIL] ${e.message}`); process.exit(1) }
  process.exit(0)
}

// ============================================================================
// MODE: DRY-RUN / APPLY — invio ai destinatari del file
// ============================================================================
const apply = !!args.apply
const emails = JSON.parse(readFileSync(recipientsPath, 'utf8')).map(e => String(e).toLowerCase().trim())
console.log(`\n${apply ? '== INVIO REALE ==' : '== DRY-RUN (nessun invio) =='}`)
console.log(`Invio: ${INVIO_ID} · ${emails.length} destinatari nel file · materie: ${MATERIE.map(m => m.slug).join(', ')}`)
console.log(`Quarantena nuovi iscritti: ${MIN_ETA_GIORNI > 0 ? `salto chi è iscritto da meno di ${MIN_ETA_GIORNI} giorni` : 'DISATTIVATA (--min-eta-giorni 0)'}\n`)

const transporter = apply ? makeTransport() : null
let sent = 0, skipped = 0, errors = 0

for (const email of emails) {
  // dati iscritto + stato
  const sub = (await sql`
    SELECT id, nome, unsubscribe_token, confirmed_at, unsubscribed_at, created_at
    FROM newsletter_subscribers WHERE LOWER(email) = ${email} LIMIT 1
  `)[0]
  if (!sub) { console.log(`[skip] ${email} — non in newsletter_subscribers`); skipped++; continue }
  if (!sub.confirmed_at || sub.unsubscribed_at) { console.log(`[skip] ${email} — non confermato o disiscritto`); skipped++; continue }

  // Quarantena: chi è appena entrato sta ancora ricevendo la sequenza di
  // benvenuto — il drip sopra a quella è la causa nota di disiscrizione.
  if (MIN_ETA_GIORNI > 0) {
    const eta = (Date.now() - new Date(sub.created_at).getTime()) / 86_400_000
    if (eta < MIN_ETA_GIORNI) {
      console.log(`[skip] ${email} — iscritto da ${eta.toFixed(1)}g (< ${MIN_ETA_GIORNI}g): in sequenza di benvenuto, lo prendo al prossimo drip`)
      skipped++; continue
    }
  }

  // Silenzio minimo su TUTTI i canali: se ha sentito parlare di noi da poco,
  // il drip aspetta. Vale anche se il contatto è stato una risposta a mano.
  if (MIN_SILENZIO_GIORNI > 0) {
    const silenzio = await giorniDiSilenzio(email)
    if (silenzio < MIN_SILENZIO_GIORNI) {
      console.log(`[skip] ${email} — contattata ${silenzio.toFixed(1)}g fa (< ${MIN_SILENZIO_GIORNI}g di silenzio richiesti)`)
      skipped++; continue
    }
  }

  // Pertinenza: le materie del concorso che prepara, non l'inventario residuo.
  const concorsi = await concorsiDi(email)
  const concorsiUtili = concorsi.filter(c => FAMIGLIE_NOTE.has(c))
  if (!NO_PERTINENZA && !concorsiUtili.length && !ANCHE_SENZA_CONCORSO) {
    const perche = concorsi.length
      ? `concorso "${concorsi.join(', ')}" non mappato sul catalogo materie`
      : 'nessun concorso noto a profilo'
    console.log(`[skip] ${email} — ${perche}: non so cosa le serve, non tiro a indovinare`)
    skipped++; continue
  }

  // materie già ricevute (qualsiasi formato) → escludile
  const got = (await sql`
    SELECT DISTINCT materia FROM anteprime_inviate WHERE LOWER(email) = ${email}
  `).map(r => r.materia)
  const nonRicevute = MATERIE.filter(m => !got.includes(m.slug))
  const daInviare = concorsiUtili.length ? materiePertinenti(nonRicevute, concorsiUtili) : nonRicevute
  if (!daInviare.length) {
    const motivo = nonRicevute.length
      ? `le ${nonRicevute.length} materie che le mancano non sono del suo concorso (${concorsiUtili.join(', ')})`
      : `ha già tutte e ${MATERIE.length} le materie`
    console.log(`[skip] ${email} — ${motivo}`)
    skipped++; continue
  }

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
        VALUES (${email}, ${sub.nome}, ${m.slug}, ${formatoDi(m)}, 'drip', ${INVIO_ID})
        ON CONFLICT (LOWER(email), materia, formato) DO NOTHING
      `
    }
    // Registro trasversale: senza questa riga il drip resta invisibile agli altri
    // canali e il tetto di silenzio non lo conta (regola: chi non logga, per il
    // sistema non è partito).
    await logInvio({
      email, nome: sub.nome, campagna: INVIO_ID, oggetto: SUBJECT,
      tipo: 'drip', canale: 'drip', messageId: info.messageId, esito: 'sent',
    })
    await sql`UPDATE newsletter_subscribers SET last_email_sent_at = now() WHERE id = ${sub.id}`
    sent++
  } catch (e) { console.error(`        [FAIL] ${e.message}`); errors++ }
  await sleep(RATE)
}

console.log(`\n=== Fatto ===`)
console.log(`${apply ? 'Inviate' : 'Pianificate'}: ${sent} · Saltati: ${skipped}` + (apply ? ` · Errori: ${errors}` : ''))
if (!apply) console.log(`\nPer inviare davvero: node scripts/send_drip.mjs --apply`)
