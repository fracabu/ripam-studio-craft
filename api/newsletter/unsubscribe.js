// Serverless function Vercel: GET /api/newsletter/unsubscribe?t=<token>
// Disiscrive con un click dal link in fondo a ogni newsletter.
// RFC 8058 compatible: supporta anche POST con List-Unsubscribe-Post header
// per Gmail/Apple one-click unsubscribe (richiesto da policy 2024).

import { neon } from '@neondatabase/serverless'

function htmlPage({ title, kicker, headline, body, color = '#c6f432' }) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title} — Ripam Studio Craft</title>
<style>
  body{margin:0;padding:0;background:#f5f0e8;color:#0a0a0a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55}
  .wrap{max-width:560px;margin:0 auto;padding:60px 24px}
  .stamp{background:#0a0a0a;color:#f5f0e8;padding:14px 20px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.12em;font-weight:700;display:inline-block;margin-bottom:24px}
  h1{font-size:clamp(28px,4vw,40px);font-weight:700;letter-spacing:-.025em;line-height:1.1;margin:0 0 18px}
  h1 em{font-style:normal;background:${color};color:#0a0a0a;padding:0 .15em}
  p{font-size:15px;color:#2a2a2a;margin:0 0 14px}
  .btn{display:inline-block;background:#0a0a0a;color:#f5f0e8;padding:12px 22px;text-decoration:none;font-weight:700;font-size:14px;border:2px solid #0a0a0a;box-shadow:4px 4px 0 #c6f432;margin-top:18px}
  .btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #c6f432}
  .foot{margin-top:48px;padding-top:24px;border-top:1px solid #e6dfd2;font-size:12px;color:#6b6458}
</style>
</head>
<body>
<div class="wrap">
  <div class="stamp">${kicker}</div>
  <h1>${headline}</h1>
  ${body}
  <a class="btn" href="https://ripam-studio-craft.vercel.app">TORNA AL SITO &rarr;</a>
  <div class="foot">Francesco Capurso · Ripam Studio Craft · Roma · P.IVA 18528431002 · ripamstudiocraft@gmail.com</div>
</div>
</body>
</html>`
}

export default async function handler(req, res) {
  // Gmail/Apple one-click unsubscribe usa POST (RFC 8058). Accettiamo entrambi.
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = (req.query && req.query.t) || (req.body && req.body.t) || ''

  // Per richieste POST (one-click) rispondiamo JSON minimale per non rompere
  // il client email. Per GET (link browser) rispondiamo pagina HTML.
  const isPost = req.method === 'POST'

  if (!token || token.length < 16 || token.length > 200) {
    if (isPost) return res.status(400).json({ ok: false, error: 'invalid_token' })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(400).send(htmlPage({
      title: 'Link non valido',
      kicker: 'DISISCRIZIONE',
      headline: 'Link <em>non valido.</em>',
      body: `<p>Il link che hai cliccato non è valido. Se non vuoi più ricevere email rispondi a una qualsiasi delle nostre con "CANCELLAMI" o scrivici a ripamstudiocraft@gmail.com.</p>`
    }))
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL')
    if (isPost) return res.status(500).json({ ok: false })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage({
      title: 'Errore',
      kicker: 'DISISCRIZIONE',
      headline: 'Errore <em>temporaneo.</em>',
      body: `<p>Riprova tra qualche minuto.</p>`
    }))
  }

  const sql = neon(databaseUrl)

  try {
    const rows = await sql`
      UPDATE newsletter_subscribers
      SET unsubscribed_at = now()
      WHERE unsubscribe_token = ${token}
        AND unsubscribed_at IS NULL
      RETURNING id
    `

    // Se POST (one-click client email), rispondi minimo
    if (isPost) {
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    if (rows.length > 0) {
      return res.status(200).send(htmlPage({
        title: 'Disiscritto',
        kicker: 'DISISCRIZIONE COMPLETATA',
        headline: 'Fatto, <em>via dalla lista.</em>',
        body: `
          <p>Non riceverai più email dalla newsletter di Ripam Studio Craft.</p>
          <p>Se hai un momento, ci aiuti a migliorare: scrivici a ripamstudiocraft@gmail.com cosa non ti è piaciuto. Niente obbligo, niente form — basta una riga.</p>
        `
      }))
    }

    // Token non trovato o già disiscritto
    return res.status(200).send(htmlPage({
      title: 'Già disiscritto',
      kicker: 'DISISCRIZIONE',
      headline: 'Eri <em>già disiscritto.</em>',
      body: `<p>Non sei più nella lista. Se continui a ricevere email scrivici a ripamstudiocraft@gmail.com e risolviamo a mano.</p>`
    }))
  } catch (err) {
    console.error('Unsubscribe DB error:', err)
    if (isPost) return res.status(500).json({ ok: false })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(500).send(htmlPage({
      title: 'Errore',
      kicker: 'DISISCRIZIONE',
      headline: 'Errore <em>temporaneo.</em>',
      body: `<p>Riprova tra qualche minuto.</p>`
    }))
  }
}
