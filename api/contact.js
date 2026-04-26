// Serverless function Vercel: riceve POST dal form contatti e invia email
// a ripamstudiocraft@gmail.com via SMTP Gmail (nessun servizio terzo).
//
// Variabili d'ambiente richieste su Vercel:
//   GMAIL_USER           → ripamstudiocraft@gmail.com
//   GMAIL_APP_PASSWORD   → App Password generata su myaccount.google.com

import nodemailer from 'nodemailer'

const MAX_BODY = 20_000 // anti-abuse: payload > 20KB = reject

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

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    })

    // 1) email a Francesco (notifica nuova richiesta)
    await transporter.sendMail({
      from: `"Ripam Studio Craft" <${user}>`,
      to: user,
      replyTo: `"${clean(nome)}" <${clean(email)}>`,
      subject,
      text,
      html
    })

    // 2) conferma automatica al cliente (best effort: se fallisce non blocca la submit)
    transporter.sendMail({
      from: `"Francesco — Ripam Studio Craft" <${user}>`,
      to: clean(email),
      replyTo: user,
      subject: ackSubject,
      text: ackText,
      html: ackHtml
    }).catch(err => console.error('Ack mail failed (non blocking):', err))

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Mail send failed:', err)
    return res.status(500).json({ error: 'Errore invio email' })
  }
}
