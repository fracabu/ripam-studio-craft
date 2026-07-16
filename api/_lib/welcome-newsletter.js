// Helper riusabile: consegna automatica della "welcome newsletter" al
// momento del confirm. Legge messaggi-clienti/newsletter/<id>.{html,txt,meta.json},
// fa replace dei placeholder (FIRST_NAME, UNSUB_URL, data dinamica), manda
// via Gmail SMTP e logga l'invio in newsletter_send_events (idempotente).
//
// Usato da api/newsletter/confirm.js per spedire automaticamente la newsletter
// "perenne" appena un nuovo iscritto conferma l'iscrizione (doppio opt-in
// completato). L'id della welcome corrente è in env WELCOME_NEWSLETTER_ID
// (default: 2026-05-24).
//
// Errori SMTP/IO sono catturati e loggati — non devono far fallire la pagina
// di conferma a monte: la conferma è già committata sul DB, l'utente vede
// "Ci sei" anche se la welcome arriva con qualche minuto di ritardo (retry
// manuale via scripts/send_newsletter.mjs con --only-email=...).

import nodemailer from 'nodemailer'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { logAnteprima } from './anteprime-log.js'

const ITALIAN_MONTHS = [
  'GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO',
  'LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE',
]

function deriveFirstName(nome, email) {
  const raw = (nome || '').trim().split(/\s+/)[0]
    || String(email || '').split('@')[0].split('+')[0].split(/[._-]/)[0]
    || 'ciao'
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function buildDateTokens(now = new Date()) {
  const full = `${ITALIAN_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const short = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  return { full, short }
}

// sql: istanza Neon (passata dal chiamante per non aprire una nuova connessione)
// subscriber: { id, email, nome, unsubscribe_token }
// Ritorna { sent: boolean, skipped?: 'already_sent', error?: string }
export async function sendWelcomeNewsletter({ sql, subscriber }) {
  const newsletterId = process.env.WELCOME_NEWSLETTER_ID || '2026-05-24'
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://ripam-studio-craft.vercel.app'

  if (!gmailUser || !gmailPass) {
    return { sent: false, error: 'missing_gmail_credentials' }
  }
  if (!subscriber || !subscriber.id || !subscriber.email || !subscriber.unsubscribe_token) {
    return { sent: false, error: 'missing_subscriber_fields' }
  }

  // Idempotenza: se già spedita per questo (subscriber, newsletter), skip.
  // Stessa UNIQUE(subscriber_id, newsletter_id) usata da /api/newsletter/send.
  try {
    const existing = await sql`
      SELECT id FROM newsletter_send_events
      WHERE subscriber_id = ${subscriber.id} AND newsletter_id = ${newsletterId}
      LIMIT 1
    `
    if (existing.length > 0) {
      return { sent: false, skipped: 'already_sent' }
    }
  } catch (err) {
    console.error('welcome: check existing send_events failed', err)
    // proseguiamo comunque, ON CONFLICT più sotto fa da safety net
  }

  // Carica template dal disco (Vercel deploya messaggi-clienti/ nel bundle).
  const cwd = process.cwd()
  const nlDir = join(cwd, 'messaggi-clienti', 'newsletter')
  const htmlPath = join(nlDir, `${newsletterId}.html`)
  const txtPath = join(nlDir, `${newsletterId}.txt`)
  const metaPath = join(nlDir, `${newsletterId}.meta.json`)
  if (!existsSync(htmlPath) || !existsSync(txtPath) || !existsSync(metaPath)) {
    return { sent: false, error: `welcome_files_missing_${newsletterId}` }
  }
  const htmlTpl = readFileSync(htmlPath, 'utf8')
  const txtTpl = readFileSync(txtPath, 'utf8')
  let meta
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  } catch (err) {
    return { sent: false, error: 'welcome_meta_invalid_json' }
  }
  if (!meta.subject) {
    return { sent: false, error: 'welcome_meta_missing_subject' }
  }

  const unsubUrl = `${baseUrl}/api/newsletter/unsubscribe?t=${subscriber.unsubscribe_token}`
  const firstName = deriveFirstName(subscriber.nome, subscriber.email)
  const { full: monthYearFull, short: monthYearShort } = buildDateTokens()

  const html = htmlTpl
    .replaceAll('{{UNSUB_URL}}', unsubUrl)
    .replaceAll('{{FIRST_NAME}}', firstName)
    .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', monthYearFull)
    .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', monthYearShort)
  const text = txtTpl
    .replaceAll('{{UNSUB_URL}}', unsubUrl)
    .replaceAll('{{FIRST_NAME}}', firstName)
    .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', monthYearFull)
    .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', monthYearShort)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
    ...(process.env.NODE_ENV !== 'production' ? { tls: { rejectUnauthorized: false } } : {}),
  })

  try {
    await transporter.sendMail({
      from: `"${meta.from_name || 'Ripam Studio Craft'}" <${gmailUser}>`,
      to: subscriber.email,
      replyTo: meta.reply_to || gmailUser,
      subject: meta.subject,
      text,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    // Log idempotente, anche se l'invio è già loggato da un'altra strada.
    await sql`
      INSERT INTO newsletter_send_events (subscriber_id, newsletter_id, status)
      VALUES (${subscriber.id}, ${newsletterId}, 'sent')
      ON CONFLICT (subscriber_id, newsletter_id) DO NOTHING
    `
    await sql`
      UPDATE newsletter_subscribers
      SET last_email_sent_at = now()
      WHERE id = ${subscriber.id}
    `

    // Registro anteprime: la welcome CONSEGNA una materia (meta.materia_di_oggi,
    // audio+video+manuale da Drive) → va scritto, altrimenti il drip non sa che
    // questa persona ce l'ha già e gliela rimanda. Best-effort: un errore qui
    // non deve toccare l'esito dell'invio, che è già avvenuto.
    if (meta.materia_di_oggi) {
      await logAnteprima({
        email: subscriber.email,
        nome: subscriber.nome,
        materia: meta.materia_di_oggi,
        formato: 'completa-avm',
        canale: 'welcome',
        invioId: newsletterId,
      })
    }

    return { sent: true }
  } catch (err) {
    console.error(`welcome: SMTP send failed for subscriber ${subscriber.id}`, err)
    try {
      await sql`
        INSERT INTO newsletter_send_events (subscriber_id, newsletter_id, status, error_message)
        VALUES (${subscriber.id}, ${newsletterId}, 'error', ${String(err.message || err).slice(0, 500)})
        ON CONFLICT (subscriber_id, newsletter_id) DO NOTHING
      `
    } catch {}
    return { sent: false, error: String(err.message || err) }
  }
}
