// Serverless function Vercel: POST /api/newsletter/send
// Spedisce una newsletter draft (HTML+txt+meta in messaggi-clienti/newsletter/)
// a tutti gli iscritti CONFIRMED e non-unsubscribed, con idempotenza via
// newsletter_send_events.UNIQUE(subscriber_id, newsletter_id).
//
// Sicurezza: protetto da header X-Admin-Secret == process.env.ADMIN_SECRET.
//
// DUE REGISTRI, DUE SCOPI DIVERSI — si scrive in entrambi:
//   - newsletter_send_events: idempotenza di QUESTO endpoint (l'anti-join qui
//     sotto legge solo questa tabella). Governa chi riceve la prossima chiamata.
//   - invii_email (via _lib/invii-log.js): registro trasversale "a chi ho mandato
//     cosa". È quello che i blast futuri interrogano con giaRicevuto() per non
//     ricontattare chi ha già visto una comunicazione. Chi non logga qui, per il
//     sistema non è partito → doppione alla campagna successiva.
// Lo slug campagna è `newsletter-<basename>` (la data è già nel basename, quindi
// ogni numero resta una campagna distinta) oppure meta.campagna se specificato.
//
// Body atteso:
//   {
//     file: '2026-05-24',          // basename dei 3 file (senza estensione)
//     dry_run?: true,              // default false: se true, NON manda nessuna mail e ritorna solo la lista
//     only_email?: 'a@b.it',       // facoltativo: spedisce solo a questo indirizzo (test mirato)
//     limit?: 30,                  // facoltativo: max destinatari in questa chiamata (default 30 per stare sotto i timeout serverless)
//     rate_ms?: 1300               // facoltativo: pausa tra una mail e l'altra (default 1300ms = ~46/min, sotto i 50/min di Gmail)
//   }
//
// Note operative:
//   - Vercel serverless function timeout: 10s (hobby), 60s (pro). Con rate_ms=1300
//     un singolo invoke puo' processare ~45 mail in 60s. Per liste piu' grandi
//     riesegui l'endpoint: i destinatari gia' processati sono filtrati via
//     anti-join su send_events.
//   - L'endpoint NON consuma il file della newsletter: lo legge ad ogni invoke.
//   - Per dev locale (Vercel CLI rotto su Windows), usa scripts/send_newsletter.mjs
//     che chiama questo handler in-process.

import { neon } from '@neondatabase/serverless'
import nodemailer from 'nodemailer'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { logInvio } from '../_lib/invii-log.js'

const DEFAULT_LIMIT = 30
const DEFAULT_RATE_MS = 1300
const MAX_LIMIT = 200
const MIN_RATE_MS = 800

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Auth via header
  const secret = req.headers['x-admin-secret'] || req.headers['x-admin-secret'.toLowerCase()]
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let body = {}
  try {
    body = req.body || {}
  } catch {
    return res.status(400).json({ error: 'Body JSON non valido' })
  }
  const { file, dry_run, only_email, limit, rate_ms, require_received } = body
  if (!file || typeof file !== 'string' || !/^[\w.-]{1,64}$/.test(file)) {
    return res.status(400).json({ error: 'Parametro "file" mancante o non valido' })
  }
  // Filtro audience opzionale: manda SOLO a chi ha gia' ricevuto un altro numero
  // (newsletter_id passato qui). Serve alle serie a puntate: "il n.2 va solo a chi
  // ha ricevuto il n.1", senza agganciare i nuovi iscritti arrivati dopo. null =
  // nessun filtro (comportamento storico: tutti gli active non ancora serviti).
  const requireReceived = (typeof require_received === 'string' && /^[\w.-]{1,64}$/.test(require_received))
    ? require_received
    : null

  const effLimit = Math.min(Math.max(parseInt(limit || DEFAULT_LIMIT, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT)
  const effRate = Math.max(parseInt(rate_ms || DEFAULT_RATE_MS, 10) || DEFAULT_RATE_MS, MIN_RATE_MS)

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://ripam-studio-craft.vercel.app'
  if (!databaseUrl || !gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Server not configured (DATABASE_URL / GMAIL_*)' })
  }

  // Risolvi la cartella newsletter rispetto alla project root.
  // In Vercel l'esecuzione e' dalla project root; in locale dipende dal cwd.
  const cwd = process.cwd()
  const nlDir = join(cwd, 'messaggi-clienti', 'newsletter')
  const htmlPath = join(nlDir, `${file}.html`)
  const txtPath = join(nlDir, `${file}.txt`)
  const metaPath = join(nlDir, `${file}.meta.json`)
  if (!existsSync(htmlPath) || !existsSync(txtPath) || !existsSync(metaPath)) {
    return res.status(404).json({ error: `File newsletter mancanti: ${file}.{html,txt,meta.json}` })
  }
  const htmlTpl = readFileSync(htmlPath, 'utf8')
  const txtTpl = readFileSync(txtPath, 'utf8')
  let meta
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  } catch (e) {
    return res.status(500).json({ error: 'meta.json non valido', detail: e.message })
  }
  if (!meta.subject) return res.status(400).json({ error: 'meta.subject mancante' })

  const newsletterId = file  // usiamo il basename come id idempotente
  // Slug campagna per il registro invii_email. Il basename contiene gia' la data
  // (2026-07-16), quindi ogni numero e' una campagna a se': l'unique
  // (LOWER(email), campagna) non collassa piu' invii in una riga sola.
  const campagna = (typeof meta.campagna === 'string' && meta.campagna.trim())
    ? meta.campagna.trim()
    : `newsletter-${newsletterId}`
  const sql = neon(databaseUrl)

  // Anti-join: prendi gli active che NON hanno gia' una row send_events per questa newsletter.
  let rows
  try {
    if (only_email) {
      const emailLower = String(only_email).toLowerCase().trim()
      rows = await sql`
        SELECT s.id, s.email, s.nome, s.unsubscribe_token
        FROM newsletter_subscribers s
        LEFT JOIN newsletter_send_events e
          ON e.subscriber_id = s.id AND e.newsletter_id = ${newsletterId}
        WHERE LOWER(s.email) = ${emailLower}
          AND s.confirmed_at IS NOT NULL
          AND s.unsubscribed_at IS NULL
          AND s.bounce_count < 3
          AND e.id IS NULL
        LIMIT 1
      `
    } else {
      rows = await sql`
        SELECT s.id, s.email, s.nome, s.unsubscribe_token
        FROM newsletter_subscribers s
        LEFT JOIN newsletter_send_events e
          ON e.subscriber_id = s.id AND e.newsletter_id = ${newsletterId}
        WHERE s.confirmed_at IS NOT NULL
          AND s.unsubscribed_at IS NULL
          AND s.bounce_count < 3
          AND e.id IS NULL
          AND (${requireReceived}::text IS NULL OR EXISTS (
            SELECT 1 FROM newsletter_send_events e2
            WHERE e2.subscriber_id = s.id AND e2.newsletter_id = ${requireReceived}
          ))
        ORDER BY s.confirmed_at ASC
        LIMIT ${effLimit}
      `
    }
  } catch (err) {
    console.error('DB select recipients failed:', err)
    return res.status(500).json({ error: 'Errore database recipients' })
  }

  // Conta anche il totale "active eleggibili" per dare un remaining preciso
  let remainingAfter = null
  try {
    const remRows = await sql`
      SELECT COUNT(*)::int AS n
      FROM newsletter_subscribers s
      LEFT JOIN newsletter_send_events e
        ON e.subscriber_id = s.id AND e.newsletter_id = ${newsletterId}
      WHERE s.confirmed_at IS NOT NULL
        AND s.unsubscribed_at IS NULL
        AND s.bounce_count < 3
        AND e.id IS NULL
        AND (${requireReceived}::text IS NULL OR EXISTS (
          SELECT 1 FROM newsletter_send_events e2
          WHERE e2.subscriber_id = s.id AND e2.newsletter_id = ${requireReceived}
        ))
    `
    remainingAfter = Math.max(0, (remRows[0]?.n || 0) - rows.length)
  } catch {
    remainingAfter = null
  }

  if (dry_run) {
    return res.status(200).json({
      ok: true,
      dry_run: true,
      newsletter_id: newsletterId,
      subject: meta.subject,
      preheader: meta.preheader || null,
      recipients_count: rows.length,
      remaining_after: remainingAfter,
      recipients: rows.map(r => ({ id: r.id, email: r.email, nome: r.nome })),
    })
  }

  // Invio reale: prepara transporter Gmail (stesso schema di subscribe.js)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
    ...(process.env.NODE_ENV !== 'production' ? { tls: { rejectUnauthorized: false } } : {}),
  })

  // Data dinamica dell'invio (uguale per tutti i destinatari di questa run).
  // FULL = "MAGGIO 2026" (uppercase), SHORT = "05/2026". Usate nei template
  // di newsletter "welcome perenne" che evolve nel tempo: chi si iscrive a
  // giugno deve vedere "06/2026" nel kicker, non "05/2026" hardcoded.
  const now = new Date()
  const monthsIt = ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO',
                    'LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE']
  const currentMonthYearFull = `${monthsIt[now.getMonth()]} ${now.getFullYear()}`
  const currentMonthYearShort = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

  // Righe che il registro invii_email non e' riuscito a scrivere: la mail e'
  // partita comunque (non si "disinvia"), ma la persona risultera' mai contattata
  // al prossimo giaRicevuto() → va segnalato all'admin, non ingoiato.
  const registroKo = []
  const results = { sent: [], failed: [] }
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const unsubUrl = `${baseUrl}/api/newsletter/unsubscribe?t=${r.unsubscribe_token}`
    // FIRST_NAME: primo token del campo nome se presente, altrimenti deriva
    // dalla local-part dell'email (es. "mario.rossi+test@gmail.com" -> "Mario").
    const firstNameRaw = (r.nome || '').trim().split(/\s+/)[0]
      || String(r.email || '').split('@')[0].split('+')[0].split(/[._-]/)[0]
      || 'ciao'
    const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase()
    const html = htmlTpl
      .replaceAll('{{UNSUB_URL}}', unsubUrl)
      .replaceAll('{{FIRST_NAME}}', firstName)
      .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', currentMonthYearFull)
      .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', currentMonthYearShort)
    const text = txtTpl
      .replaceAll('{{UNSUB_URL}}', unsubUrl)
      .replaceAll('{{FIRST_NAME}}', firstName)
      .replaceAll('{{CURRENT_MONTH_YEAR_FULL}}', currentMonthYearFull)
      .replaceAll('{{CURRENT_MONTH_YEAR_SHORT}}', currentMonthYearShort)

    try {
      const info = await transporter.sendMail({
        from: `"${meta.from_name || 'Ripam Studio Craft'}" <${gmailUser}>`,
        to: r.email,
        replyTo: meta.reply_to || gmailUser,
        subject: meta.subject,
        text,
        html,
        headers: {
          // RFC 8058 one-click unsubscribe (Gmail/Apple mostrano bottone nativo)
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })

      // Log idempotente: ON CONFLICT DO NOTHING su UNIQUE(subscriber_id, newsletter_id)
      await sql`
        INSERT INTO newsletter_send_events (subscriber_id, newsletter_id, status)
        VALUES (${r.id}, ${newsletterId}, 'sent')
        ON CONFLICT (subscriber_id, newsletter_id) DO NOTHING
      `
      // Aggiorna last_email_sent_at del subscriber (informativo)
      await sql`
        UPDATE newsletter_subscribers
        SET last_email_sent_at = now()
        WHERE id = ${r.id}
      `

      // Registro invii trasversale: e' cio' che i blast futuri interrogano.
      if (await logInvio({
        email: r.email, nome: r.nome, campagna, oggetto: meta.subject,
        tipo: 'newsletter', canale: 'blast', messageId: info.messageId, esito: 'sent',
      }) === 'errore') registroKo.push(r.email)

      results.sent.push({ id: r.id, email: r.email, messageId: info.messageId })
    } catch (err) {
      console.error(`Send failed for ${r.email}:`, err)
      // Loggo comunque l'errore (status='error') per non riprovare in loop infinito.
      // Per consentire un retry esplicito, l'admin puo' fare DELETE manuale della riga.
      try {
        await sql`
          INSERT INTO newsletter_send_events (subscriber_id, newsletter_id, status, error_message)
          VALUES (${r.id}, ${newsletterId}, 'error', ${String(err.message || err).slice(0, 500)})
          ON CONFLICT (subscriber_id, newsletter_id) DO NOTHING
        `
      } catch {}
      // Anche il fallimento va a registro (esito='failed'): occupa lo slot
      // dell'unique, quindi per rimandare si cancella la riga a mano — esplicito.
      if (await logInvio({
        email: r.email, nome: r.nome, campagna, oggetto: meta.subject,
        tipo: 'newsletter', canale: 'blast', esito: 'failed',
        errore: String(err.message || err).slice(0, 500),
      }) === 'errore') registroKo.push(r.email)
      results.failed.push({ id: r.id, email: r.email, error: String(err.message || err) })
    }

    // Pausa tra una mail e la successiva (skip dopo l'ultima)
    if (i < rows.length - 1) await sleep(effRate)
  }

  return res.status(200).json({
    ok: true,
    newsletter_id: newsletterId,
    subject: meta.subject,
    campagna,
    sent: results.sent.length,
    failed: results.failed.length,
    remaining_after: remainingAfter != null ? Math.max(0, remainingAfter) : null,
    // Se non e' 0, quelle persone hanno ricevuto la mail ma non risultano a
    // registro: il prossimo blast le ricontattera'. Vanno loggate a mano.
    registro_invii_ko: registroKo.length,
    ...(registroKo.length ? { registro_invii_ko_emails: registroKo } : {}),
    details: results,
  })
}
