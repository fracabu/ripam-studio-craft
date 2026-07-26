// Serverless function Vercel: POST /api/newsletter/subscribe
// Riceve email + consenso, salva subscriber in stato 'pending',
// genera token di conferma, invia mail di doppio opt-in via Gmail SMTP.
//
// Variabili d'ambiente richieste:
//   DATABASE_URL          → connection string Neon (Vercel-injected)
//   GMAIL_USER            → ripamstudiocraft@gmail.com
//   GMAIL_APP_PASSWORD    → App Password Gmail
//   PUBLIC_BASE_URL       → es. https://ripam-studio-craft.vercel.app
//
// Body atteso (JSON):
//   { email: string,
//     nome?: string,
//     source?: 'home' | 'scrivimi' | 'telegram' | 'anteprima',
//     requested_materia?: string,  // slug materia, solo se source='anteprima'
//     consent_text: string,        // testo della checkbox al momento del consenso
//     hp?: string }                // honeypot anti-bot

import { neon } from '@neondatabase/serverless'
import nodemailer from 'nodemailer'
import { randomBytes } from 'node:crypto'
import { ANTEPRIME_SLUGS } from '../_lib/anteprime-manifest.js'
import { sendAnteprimaMail } from '../_lib/anteprima-mail.js'
import { emailShell, emailButton, logoAttachment } from '../_lib/email-shell.js'

const MAX_BODY = 4_000

// In-memory rate limit per IP (best effort, regge solo nello stesso warm container).
// Bloccare massivamente è compito di Vercel WAF; questo serve a fermare un loop
// banale di un singolo IP.
const rateLimitBuckets = new Map()
const RATE_WINDOW_MS = 60 * 60 * 1000   // 1h
const RATE_MAX = 5                      // max 5 iscrizioni / IP / ora

function rateLimit(ip) {
  if (!ip) return true
  const now = Date.now()
  const bucket = rateLimitBuckets.get(ip) || []
  const fresh = bucket.filter(t => now - t < RATE_WINDOW_MS)
  if (fresh.length >= RATE_MAX) return false
  fresh.push(now)
  rateLimitBuckets.set(ip, fresh)
  return true
}

function clean(s = '', max = 500) {
  return String(s).slice(0, max).replace(/[<>]/g, '')
}

function generateToken() {
  return randomBytes(32).toString('base64url')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > MAX_BODY) {
    return res.status(413).json({ error: 'Payload too large' })
  }

  // req.body può lanciare se Vercel non riesce a parsare il JSON (es. quote
  // mangiate da PowerShell). Lo wrappo in try/catch e ritorno 400 chiaro.
  let body = {}
  try {
    body = req.body || {}
  } catch (err) {
    return res.status(400).json({ error: 'Body JSON non valido' })
  }
  const { email, nome, source, requested_materia, consent_text, hp } = body

  // honeypot: fingi successo, non fare nulla
  if (hp) {
    console.warn('Honeypot triggered — iscrizione scartata:', { email, hp: String(hp).slice(0, 80) })
    return res.status(200).json({ ok: true })
  }

  // validazione minima
  if (!email || !consent_text) {
    return res.status(400).json({ error: 'Email e consenso obbligatori' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' })
  }
  if (String(email).length > 160 || String(nome || '').length > 120) {
    return res.status(400).json({ error: 'Dati troppo lunghi' })
  }
  const allowedSources = new Set(['home', 'scrivimi', 'telegram', 'admin', 'anteprima'])
  const finalSource = allowedSources.has(source) ? source : 'home'

  // requested_materia accettato solo per source='anteprima' e solo se
  // lo slug è presente nel manifest (altrimenti silenzioso null — non
  // rompere l'iscrizione se il frontend passa uno slug sconosciuto).
  let finalRequestedMateria = null
  if (finalSource === 'anteprima' && typeof requested_materia === 'string') {
    const slug = requested_materia.trim().toLowerCase()
    if (ANTEPRIME_SLUGS.has(slug)) finalRequestedMateria = slug
  }

  // rate limit
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
              || req.socket?.remoteAddress
              || ''
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Troppe richieste, riprova tra un\'ora' })
  }

  // env check
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://ripam-studio-craft.vercel.app'
  if (!databaseUrl || !user || !pass) {
    console.error('Missing env: DATABASE_URL/POSTGRES_URL, GMAIL_USER, GMAIL_APP_PASSWORD')
    return res.status(500).json({ error: 'Server not configured' })
  }

  const sql = neon(databaseUrl)
  const emailLower = String(email).toLowerCase().trim()
  const cleanNome = clean(nome || '', 120)
  const cleanConsent = clean(consent_text, 1500)
  const userAgent = clean(req.headers['user-agent'] || '', 500)
  const confirmToken = generateToken()
  const unsubscribeToken = generateToken()

  let isAlreadyConfirmed = false
  let subscriberId = null
  let prevRequestedMateria = null
  let prevUpdatedAt = null

  try {
    // Verifica se esiste già un subscriber con questa email (case-insensitive).
    // Leggiamo anche requested_materia + updated_at per dedup invio anteprima
    // (vedi branch isAlreadyConfirmed più sotto).
    const existing = await sql`
      SELECT id, confirmed_at, unsubscribed_at,
             requested_materia, updated_at
      FROM newsletter_subscribers
      WHERE LOWER(email) = ${emailLower}
      LIMIT 1
    `

    if (existing.length > 0) {
      const row = existing[0]
      subscriberId = row.id
      prevRequestedMateria = row.requested_materia || null
      prevUpdatedAt = row.updated_at ? new Date(row.updated_at) : null

      if (row.confirmed_at && !row.unsubscribed_at) {
        // Già confermato e attivo: non rifare confirm flow, ma rispondi ok.
        // Non rivelare che è già iscritto (anti-enumeration).
        isAlreadyConfirmed = true
      } else {
        // Esisteva ma è non-confermato o disiscritto → rigenero i token e
        // riapro il flusso conferma. Reset anche unsubscribed_at se era disiscritto
        // (è una reiscrizione esplicita).
        await sql`
          UPDATE newsletter_subscribers SET
            nome = ${cleanNome || null},
            source = ${finalSource},
            requested_materia = ${finalRequestedMateria},
            consent_text = ${cleanConsent},
            consent_ip = ${ip || null},
            consent_user_agent = ${userAgent || null},
            consent_at = now(),
            confirm_token = ${confirmToken},
            confirmed_at = NULL,
            unsubscribe_token = ${unsubscribeToken},
            unsubscribed_at = NULL,
            unsubscribe_reason = NULL
          WHERE id = ${subscriberId}
        `
      }
    } else {
      // Nuovo subscriber
      const inserted = await sql`
        INSERT INTO newsletter_subscribers
          (email, nome, source, requested_materia, consent_text,
           consent_ip, consent_user_agent, confirm_token, unsubscribe_token)
        VALUES
          (${emailLower}, ${cleanNome || null}, ${finalSource},
           ${finalRequestedMateria}, ${cleanConsent},
           ${ip || null}, ${userAgent || null},
           ${confirmToken}, ${unsubscribeToken})
        RETURNING id
      `
      subscriberId = inserted[0].id
    }
  } catch (err) {
    console.error('DB insert/update failed:', err)
    return res.status(500).json({ error: 'Errore database' })
  }

  // Se era già confermato non rimandare la mail di doppio opt-in.
  // MA: se la richiesta corrente è 'anteprima' con uno slug valido, consegniamo
  // subito l'anteprima — l'utente ha già consenso valido in archivio, gli
  // diamo il valore promesso senza obbligarlo a riconfermare.
  if (isAlreadyConfirmed) {
    if (finalRequestedMateria) {
      // Dedup: se la stessa email aveva già richiesto la stessa anteprima
      // negli ultimi 5 minuti, no-op silenzioso. Evita 4 mail identiche per
      // tap multipli / doppio click su mobile / retry app webview.
      const FIVE_MIN_MS = 5 * 60 * 1000
      const isDuplicateRecent =
        prevRequestedMateria === finalRequestedMateria &&
        prevUpdatedAt instanceof Date &&
        (Date.now() - prevUpdatedAt.getTime()) < FIVE_MIN_MS

      if (!isDuplicateRecent) {
        try {
          await sql`
            UPDATE newsletter_subscribers
            SET requested_materia = ${finalRequestedMateria}
            WHERE id = ${subscriberId}
          `
          await sendAnteprimaMail({
            email: emailLower,
            nome: cleanNome,
            slug: finalRequestedMateria,
          })
        } catch (mailErr) {
          console.error('Anteprima immediate-send failed for subscriber',
                        subscriberId, finalRequestedMateria, mailErr)
          // Non rivelare al frontend che era già confermato.
        }
      } else {
        console.log('Anteprima dedup skip for subscriber',
                    subscriberId, finalRequestedMateria,
                    'last update', prevUpdatedAt.toISOString())
      }
    }
    return res.status(200).json({ ok: true, status: 'pending' })
  }

  // Invia mail di doppio opt-in
  const confirmUrl = `${baseUrl}/api/newsletter/confirm?t=${confirmToken}`
  const firstName = cleanNome.split(/\s+/)[0] || 'ciao'

  const subject = 'Conferma la tua iscrizione — Ripam Studio Craft'

  const text = `Ciao ${firstName},

ti sei iscritto alla newsletter di Ripam Studio Craft. Manca solo un click per attivare l'iscrizione:

${confirmUrl}

Se non sei stato tu, ignora questa email — senza il click non riceverai nulla.

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002
`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ti sei iscritto alla newsletter di <strong>Ripam Studio Craft</strong>. Manca solo un click per attivare l'iscrizione:</p>
  <p style="margin:24px 0;text-align:center">
    ${emailButton(confirmUrl, 'CONFERMA ISCRIZIONE &rarr;')}
  </p>
  <p style="margin:18px 0;font-size:13px;color:#6b6458">Se non sei stato tu, ignora questa email — senza il click non riceverai nulla. Il link scade tra 30 giorni.</p>`

  const html = emailShell(inner, 'CONFERMA ISCRIZIONE')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    // In dev locale Node 24 rifiuta la chain TLS di Gmail SMTP; in produzione
    // Vercel (Node 18) il problema non si presenta.
    ...(process.env.NODE_ENV !== 'production' ? { tls: { rejectUnauthorized: false } } : {}),
  })

  try {
    await transporter.sendMail({
      from: `"Ripam Studio Craft" <${user}>`,
      to: emailLower,
      replyTo: user,
      subject,
      text,
      html,
      attachments: [logoAttachment()],
    })
  } catch (err) {
    console.error('Confirm mail send failed:', err)
    return res.status(500).json({ error: 'Errore invio email di conferma' })
  }

  return res.status(200).json({ ok: true, status: 'pending' })
}
