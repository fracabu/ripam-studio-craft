// Serverless function Vercel: riceve POST dal form contatti e invia email
// a ripamstudiocraft@gmail.com via SMTP Gmail (nessun servizio terzo).
//
// Variabili d'ambiente richieste su Vercel:
//   GMAIL_USER           → ripamstudiocraft@gmail.com
//   GMAIL_APP_PASSWORD   → App Password generata su myaccount.google.com

import nodemailer from 'nodemailer'
import { neon } from '@neondatabase/serverless'
import { MATERIE } from '../src/data/materie.js'

const MAX_BODY = 20_000 // anti-abuse: payload > 20KB = reject

// --- Estrazione profilo dal testo libero del form -------------------------
// Il form invia solo nome/email/concorso/note: materie e formati non sono campi
// strutturati, quindi li deduciamo dal testo (best-effort). Servono a popolare
// la tabella `candidati` per avere un quadro del candidato già pronto.

// Concorsi noti (sigle dal campo `c` di materie.js + alias colloquiali).
const CONCORSI_KNOWN = ['RIPAM', 'MIC', 'MIMIT', 'ISAC', 'CPI', 'SNA', 'DIFESA']

function extractConcorsi(concorsoField = '', note = '') {
  const up = `${concorsoField} ${note}`.toUpperCase()
  const out = []
  for (const k of CONCORSI_KNOWN) if (up.includes(k)) out.push(k)
  if (/FUNZIONARI|\b1340\b/.test(up)) out.push('Funzionari')
  // il campo `concorso` del form, se informativo (scarta "Altro / non so ancora")
  const cf = String(concorsoField).trim()
  if (cf && !/non so|altro/i.test(cf)) out.push(cf)
  return [...new Set(out)]
}

// Materie: match sui nomi ufficiali / slug del catalogo (no falsi positivi).
function extractMaterie(text = '') {
  const low = text.toLowerCase()
  const out = []
  for (const m of MATERIE) {
    if (low.includes(m.t.toLowerCase()) || low.includes(m.slug)) out.push(m.t)
  }
  return [...new Set(out)]
}

// Formati: parole chiave → label canonica (allineata a order_add.mjs).
const FORMATI_RULES = [
  [/\bpodcast\b/i, 'podcast'],
  [/audio\s*lezion|audiolezion|\baudio\b/i, 'audio'],
  [/\bvideo\b/i, 'video'],
  [/\bmanuale\b|\bdispensa\b|\bpdf\b/i, 'manuale'],
  [/\breport\b/i, 'report'],
  [/simulator|simulazion/i, 'simulatore'],
]

function extractFormati(text = '') {
  const out = []
  for (const [re, label] of FORMATI_RULES) if (re.test(text)) out.push(label)
  return [...new Set(out)]
}

// Upsert best-effort del profilo candidato sul DB Neon. Accumula dedup concorsi/
// materie/formati a ogni richiesta. Non blocca mai la submit del form: se il DB
// è assente o irraggiungibile, logga e prosegue.
async function upsertCandidato({ email, nome, concorso, note, source }) {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) return // niente DB configurato (es. preview) → skip silenzioso

  const concorsi = extractConcorsi(concorso, note)
  const materie = extractMaterie(`${concorso} ${note}`)
  const formati = extractFormati(`${concorso} ${note}`)

  // Passiamo gli array come stringhe joinate ('||' separatore improbabile nel
  // testo) e li riconvertiamo con string_to_array: evita problemi di binding
  // degli array col driver HTTP. NULL se vuoto → COALESCE a array vuoto.
  const join = (arr) => (arr.length ? arr.join('||') : null)

  const sql = neon(databaseUrl)
  await sql`
    INSERT INTO candidati (
      email, nome, concorsi, materie_interesse, formati_interesse,
      note_ultima, source, n_richieste, primo_contatto, ultimo_contatto
    ) VALUES (
      ${email}, ${nome},
      COALESCE(string_to_array(${join(concorsi)}, '||'), ARRAY[]::text[]),
      COALESCE(string_to_array(${join(materie)},  '||'), ARRAY[]::text[]),
      COALESCE(string_to_array(${join(formati)},  '||'), ARRAY[]::text[]),
      ${note}, ${source}, 1, now(), now()
    )
    ON CONFLICT (email) DO UPDATE SET
      nome              = COALESCE(NULLIF(EXCLUDED.nome, ''), candidati.nome),
      concorsi          = ARRAY(SELECT DISTINCT x FROM unnest(candidati.concorsi          || EXCLUDED.concorsi)          AS x WHERE x <> ''),
      materie_interesse = ARRAY(SELECT DISTINCT x FROM unnest(candidati.materie_interesse || EXCLUDED.materie_interesse) AS x WHERE x <> ''),
      formati_interesse = ARRAY(SELECT DISTINCT x FROM unnest(candidati.formati_interesse || EXCLUDED.formati_interesse) AS x WHERE x <> ''),
      note_ultima       = EXCLUDED.note_ultima,
      source            = EXCLUDED.source,
      n_richieste       = candidati.n_richieste + 1,
      ultimo_contatto   = now()
  `
}

export default async function handler(req, res) {
  // CORS same-origin, in produzione Vercel e frontend stanno sullo stesso dominio
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // protezione basica contro payload enormi
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > MAX_BODY) {
    return res.status(413).json({ error: 'Payload too large' })
  }

  const { nome, email, concorso, note, hp } = req.body || {}

  // honeypot: se `hp` è compilato, è un bot
  if (hp) return res.status(200).json({ ok: true }) // fingi successo

  // validazione minima
  if (!nome || !email || !concorso || !note) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' })
  }
  if (String(nome).length > 120 || String(email).length > 160) {
    return res.status(400).json({ error: 'Dati troppo lunghi' })
  }

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars')
    return res.status(500).json({ error: 'Server not configured' })
  }

  // sanitize per email (rimuovi tag HTML dai campi utente)
  const clean = (s = '') => String(s).slice(0, 2000).replace(/[<>]/g, '')

  const subject = `Nuova richiesta — ${clean(concorso)} — ${clean(nome)}`
  const text = `Nuova richiesta dal sito Ripam Studio Craft

Nome:      ${clean(nome)}
Email:     ${clean(email)}
Concorso:  ${clean(concorso)}

Cosa serve:
${clean(note)}

---
Inviato da: ripam-studio-craft.vercel.app
`

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#0a0a0a">
  <h2 style="margin:0 0 16px;font-size:20px">Nuova richiesta dal sito</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:6px 0;color:#6b6458;width:100px">Nome</td><td style="padding:6px 0;font-weight:600">${clean(nome)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b6458">Email</td><td style="padding:6px 0"><a href="mailto:${clean(email)}">${clean(email)}</a></td></tr>
    <tr><td style="padding:6px 0;color:#6b6458">Concorso</td><td style="padding:6px 0">${clean(concorso)}</td></tr>
  </table>
  <div style="margin-top:16px;padding:14px;background:#f5f0e8;border-left:3px solid #c6f432">
    <div style="font-size:12px;color:#6b6458;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Cosa serve</div>
    <div style="font-size:14px;white-space:pre-wrap">${clean(note)}</div>
  </div>
  <div style="margin-top:24px;font-size:12px;color:#6b6458">Inviato da ripam-studio-craft.vercel.app</div>
</div>`

  // riconosce le richieste di anteprima gratuita (dal flusso del bottone "Richiedi anteprima")
  // e personalizza la conferma automatica al cliente.
  const isAnteprima = /anteprima|primo episodio/i.test(note)
  const firstName = clean(nome).split(/\s+/)[0] || clean(nome)

  const ackSubject = isAnteprima
    ? `Ho ricevuto la tua richiesta — primo episodio in arrivo`
    : `Ho ricevuto la tua richiesta — Ripam Studio Craft`

  const ackText = isAnteprima
    ? `Ciao ${firstName},

ho ricevuto la tua richiesta per l'anteprima gratuita. Ti rispondo entro 6-24 ore con il link al primo episodio direttamente in questa casella di posta.

Nel frattempo, se vuoi anticipare qualcosa o preferisci scrivermi su Telegram, mi trovi qui: https://t.me/fcapurso

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002

---
Questa è una conferma automatica. Ti rispondo a mano io appena posso.
`
    : `Ciao ${firstName},

ho ricevuto la tua richiesta. Ti rispondo entro 6-24 ore con domande, idee o una proposta concreta in base a quello che mi hai scritto.

Se preferisci accelerare, sono anche su Telegram: https://t.me/fcapurso

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002

---
Questa è una conferma automatica. Ti rispondo a mano io appena posso.
`

  const ackHtml = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#0a0a0a;line-height:1.55">
  <p style="margin:0 0 14px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px">${
    isAnteprima
      ? `ho ricevuto la tua richiesta per l'anteprima gratuita. Ti rispondo entro <strong>6-24 ore</strong> con il link al primo episodio direttamente in questa casella di posta.`
      : `ho ricevuto la tua richiesta. Ti rispondo entro <strong>6-24 ore</strong> con domande, idee o una proposta concreta in base a quello che mi hai scritto.`
  }</p>
  <p style="margin:0 0 14px">${
    isAnteprima
      ? `Nel frattempo, se vuoi anticipare qualcosa, sono anche su Telegram:`
      : `Se preferisci accelerare, sono anche su Telegram:`
  } <a href="https://t.me/fcapurso" style="color:#0a0a0a">@fcapurso</a></p>
  <p style="margin:24px 0 4px">A presto,</p>
  <p style="margin:0 0 4px"><strong>Francesco</strong></p>
  <p style="margin:0;color:#6b6458;font-size:13px">Ripam Studio Craft · ripamstudiocraft@gmail.com · P.IVA 18528431002</p>
  <hr style="border:none;border-top:1px solid #e6dfd2;margin:24px 0 12px">
  <p style="margin:0;color:#6b6458;font-size:12px">Questa è una conferma automatica. Ti rispondo a mano io appena posso.</p>
</div>`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })

  // 1) email a Francesco (notifica nuova richiesta) — critica, se fallisce ritorniamo 500
  try {
    await transporter.sendMail({
      from: `"Ripam Studio Craft" <${user}>`,
      to: user,
      replyTo: `"${clean(nome)}" <${clean(email)}>`,
      subject,
      text,
      html
    })
  } catch (err) {
    console.error('Notify mail failed:', err)
    return res.status(500).json({ error: 'Errore invio email' })
  }

  // 2) conferma automatica al cliente — awaitata ma in try/catch separato:
  // se fallisce non blocca la submit (la richiesta è già arrivata al titolare).
  // IMPORTANTE: in Vercel serverless le promise non-awaited vengono troncate
  // alla return della response, quindi serve await anche per il "best effort".
  try {
    await transporter.sendMail({
      from: `"Francesco — Ripam Studio Craft" <${user}>`,
      to: clean(email),
      replyTo: user,
      subject: ackSubject,
      text: ackText,
      html: ackHtml
    })
  } catch (err) {
    console.error('Ack mail failed (non blocking):', err)
  }

  // 3) upsert profilo candidato sul DB — best effort, non blocca la submit.
  //    Popola `candidati` (concorso + materie/formati d'interesse) per avere
  //    un quadro del candidato già pronto a ogni richiesta dal form.
  try {
    const source = isAnteprima
      ? 'anteprima'
      : /quiz\s*pro|credenzial/i.test(note)
        ? 'quizpro'
        : 'form'
    await upsertCandidato({
      email: clean(email).toLowerCase().trim(),
      nome: clean(nome),
      concorso: clean(concorso),
      note: clean(note),
      source,
    })
  } catch (err) {
    console.error('Candidato upsert failed (non blocking):', err)
  }

  return res.status(200).json({ ok: true })
}
