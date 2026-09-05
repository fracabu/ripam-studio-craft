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
import { glossarioBlock, glossarioAttachment } from './glossario-omaggio.js'

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

// Id della welcome corrente (env override, come sotto).
export function welcomeNewsletterId() {
  return process.env.WELCOME_NEWSLETTER_ID || '2026-05-24'
}

// Carica SOLO il meta.json della welcome. Serve a chi non manda la welcome come
// mail a sé stante ma ne riusa il contenuto — oggi api/_lib/anteprima-mail.js,
// che fonde le anteprime della welcome dentro la mail dell'anteprima richiesta
// (una mail sola invece di due nello stesso minuto).
// Ritorna { newsletterId, meta } oppure null se i file non ci sono / meta rotto.
export function loadWelcomeMeta() {
  const newsletterId = welcomeNewsletterId()
  const metaPath = join(process.cwd(), 'messaggi-clienti', 'newsletter', `${newsletterId}.meta.json`)
  if (!existsSync(metaPath)) return null
  try {
    return { newsletterId, meta: JSON.parse(readFileSync(metaPath, 'utf8')) }
  } catch (err) {
    console.error('welcome: meta.json illeggibile', newsletterId, err)
    return null
  }
}

// Vero se questo iscritto risulta già aver ricevuto la welcome.
export async function welcomeAlreadySent({ sql, subscriberId, newsletterId = welcomeNewsletterId() }) {
  try {
    const rows = await sql`
      SELECT id FROM newsletter_send_events
      WHERE subscriber_id = ${subscriberId} AND newsletter_id = ${newsletterId}
      LIMIT 1
    `
    return rows.length > 0
  } catch (err) {
    console.error('welcome: check existing send_events failed', err)
    return false // in dubbio non blocchiamo: l'ON CONFLICT più a valle protegge
  }
}

// Registra la consegna della welcome SENZA inviarla: la usa chi ha già fatto
// arrivare quel contenuto per un'altra strada (mail fusa anteprima+benvenuto).
// Scrive le stesse tre cose dell'invio normale — send_events (idempotenza),
// last_email_sent_at, e il registro anteprime della materia consegnata.
// `materiaConsegnata=false` salta quest'ultimo: se il blocco welcome non è
// finito nella mail, loggarlo farebbe credere al drip che la persona ha già
// quella materia quando non l'ha ricevuta.
export async function registerWelcomeDelivery({ sql, subscriber, meta, newsletterId = welcomeNewsletterId(), materiaConsegnata = true }) {
  await sql`
    INSERT INTO newsletter_send_events (subscriber_id, newsletter_id, status)
    VALUES (${subscriber.id}, ${newsletterId}, 'sent')
    ON CONFLICT (subscriber_id, newsletter_id) DO NOTHING
  `
  await sql`
    UPDATE newsletter_subscribers SET last_email_sent_at = now() WHERE id = ${subscriber.id}
  `
  if (materiaConsegnata && meta && meta.materia_di_oggi) {
    await logAnteprima({
      email: subscriber.email,
      nome: subscriber.nome,
      materia: meta.materia_di_oggi,
      formato: 'completa-avm',
      canale: 'welcome',
      invioId: newsletterId,
    })
  }
}

// sql: istanza Neon (passata dal chiamante per non aprire una nuova connessione)
// subscriber: { id, email, nome, unsubscribe_token }
// Ritorna { sent: boolean, skipped?: 'already_sent', error?: string }
export async function sendWelcomeNewsletter({ sql, subscriber }) {
  const newsletterId = welcomeNewsletterId()
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
  // Copre anche il caso "welcome fusa nella mail anteprima": confirm.js ha già
  // registrato la consegna, quindi da qui non riparte una seconda mail.
  if (await welcomeAlreadySent({ sql, subscriberId: subscriber.id, newsletterId })) {
    return { sent: false, skipped: 'already_sent' }
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

  // Il glossario in omaggio: stesso blocco della mail fusa anteprima+benvenuto
  // (api/_lib/glossario-omaggio.js), cosi' le due strade non divergono.
  const glossario = glossarioBlock()

  const html = htmlTpl
    .replaceAll('{{UNSUB_URL}}', unsubUrl)
    .replaceAll('{{FIRST_NAME}}', firstName)
    .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', monthYearFull)
    .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', monthYearShort)
    .replaceAll('{{GLOSSARIO}}', glossario.html)
  const text = txtTpl
    .replaceAll('{{UNSUB_URL}}', unsubUrl)
    .replaceAll('{{FIRST_NAME}}', firstName)
    .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', monthYearFull)
    .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', monthYearShort)
    .replaceAll('{{GLOSSARIO}}', glossario.text)

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
      // Allegato oltre al link: su Libero/Tiscali/Virgilio i link Drive spesso
      // non si aprono, e gli account non-Google non si possono invitare a una
      // cartella condivisa. Se il PDF manca dal bundle, parte comunque col link.
      ...(glossarioAttachment() ? { attachments: [glossarioAttachment()] } : {}),
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    // Log idempotente (send_events + last_email_sent_at) e registro anteprime:
    // la welcome CONSEGNA una materia (meta.materia_di_oggi, audio+video+manuale
    // da Drive) → va scritto, altrimenti il drip non sa che questa persona ce
    // l'ha già e gliela rimanda.
    await registerWelcomeDelivery({ sql, subscriber, meta, newsletterId })

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
