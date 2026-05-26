// Serverless function Vercel: POST /api/newsletter/send
// Spedisce una newsletter draft (HTML+txt+meta in messaggi-clienti/newsletter/)
// a tutti gli iscritti CONFIRMED e non-unsubscribed, con idempotenza via
// newsletter_send_events.UNIQUE(subscriber_id, newsletter_id).
//
// Sicurezza: protetto da header X-Admin-Secret == process.env.ADMIN_SECRET.
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
  const { file, dry_run, only_email, limit, rate_ms } = body
  if (!file || typeof file !== 'string' || !/^[\w.-]{1,64}$/.test(file)) {
    return res.status(400).json({ error: 'Parametro "file" mancante o non valido' })
  }

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
    const text = txtTpl
      .replaceAll('{{UNSUB_URL}}', unsubUrl)
      .replaceAll('{{FIRST_NAME}}', firstName)

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
      results.failed.push({ id: r.id, email: r.email, error: String(err.message || err) })
    }

    // Pausa tra una mail e la successiva (skip dopo l'ultima)
    if (i < rows.length - 1) await sleep(effRate)
  }

  return res.status(200).json({
    ok: true,
    newsletter_id: newsletterId,
    subject: meta.subject,
    sent: results.sent.length,
    failed: results.failed.length,
    remaining_after: remainingAfter != null ? Math.max(0, remainingAfter) : null,
    details: results,
  })
}
