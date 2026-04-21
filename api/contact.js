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

  const { nome, email, concorso, prodotto, materia, note, hp } = req.body || {}

  // honeypot: se `hp` è compilato, è un bot
  if (hp) return res.status(200).json({ ok: true }) // fingi successo

  // validazione minima
  if (!nome || !email || !concorso || !prodotto) {
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

  const subject = `Nuova richiesta — ${clean(prodotto)} (${clean(concorso)})`
  const text = `Nuova richiesta dal sito Ripam Studio Craft

Nome:      ${clean(nome)}
Email:     ${clean(email)}
Concorso:  ${clean(concorso)}
Prodotto:  ${clean(prodotto)}
Materia:   ${clean(materia) || '—'}

Note:
${clean(note) || '—'}

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
    <tr><td style="padding:6px 0;color:#6b6458">Prodotto</td><td style="padding:6px 0"><strong>${clean(prodotto)}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#6b6458">Materia</td><td style="padding:6px 0">${clean(materia) || '—'}</td></tr>
  </table>
  <div style="margin-top:16px;padding:14px;background:#f5f0e8;border-left:3px solid #c6f432">
    <div style="font-size:12px;color:#6b6458;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em">Note</div>
    <div style="font-size:14px;white-space:pre-wrap">${clean(note) || '—'}</div>
  </div>
  <div style="margin-top:24px;font-size:12px;color:#6b6458">Inviato da ripam-studio-craft.vercel.app</div>
</div>`

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    })

    await transporter.sendMail({
      from: `"Ripam Studio Craft" <${user}>`,
      to: user, // invio a te stesso
      replyTo: `"${clean(nome)}" <${clean(email)}>`, // quando rispondi, va al cliente
      subject,
      text,
      html
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Mail send failed:', err)
    return res.status(500).json({ error: 'Errore invio email' })
  }
}
