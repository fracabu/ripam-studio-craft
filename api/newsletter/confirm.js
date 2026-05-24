// Serverless function Vercel: GET /api/newsletter/confirm?t=<token>
// Conferma l'iscrizione alla newsletter cliccando il link nella mail di doppio opt-in.
// Risponde con una pagina HTML brand-friendly (no redirect SPA).

import { neon } from '@neondatabase/serverless'
import { sendAnteprimaMail } from '../_lib/anteprima-mail.js'

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
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  const token = (req.query && req.query.t) || ''
  if (!token || token.length < 16 || token.length > 200) {
    return res.status(400).send(htmlPage({
      title: 'Link non valido',
      kicker: 'CONFERMA ISCRIZIONE',
      headline: 'Link <em>non valido.</em>',
      body: `<p>Il link che hai cliccato non è valido. Prova a iscriverti di nuovo dal sito, oppure scrivici a ripamstudiocraft@gmail.com.</p>`
    }))
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL')
    return res.status(500).send(htmlPage({
      title: 'Errore',
      kicker: 'CONFERMA ISCRIZIONE',
      headline: 'Errore <em>temporaneo.</em>',
      body: `<p>Riprova tra qualche minuto. Se il problema persiste scrivici a ripamstudiocraft@gmail.com.</p>`
    }))
  }

  const sql = neon(databaseUrl)

  try {
    // Conferma: setta confirmed_at solo se non già confermato.
    // Se l'utente clicca due volte, la seconda è un no-op ma rispondiamo "già confermato".
    // Selezioniamo anche nome + requested_materia per la consegna automatica
    // dell'anteprima manuale (flusso lead-magnet su /materia/<slug>).
    const rows = await sql`
      UPDATE newsletter_subscribers
      SET confirmed_at = now()
      WHERE confirm_token = ${token}
        AND confirmed_at IS NULL
      RETURNING id, email, nome, requested_materia
    `

    if (rows.length > 0) {
      const row = rows[0]

      // Se l'utente si era iscritto richiedendo l'anteprima di una materia,
      // la consegniamo immediatamente in una mail separata.
      // L'errore SMTP qui NON deve far fallire la pagina di conferma:
      // la conferma è già committata sul DB, l'utente vede comunque "Ci sei".
      // L'errore viene loggato per follow-up manuale.
      let anteprimaDelivered = null
      if (row.requested_materia) {
        try {
          const result = await sendAnteprimaMail({
            email: row.email,
            nome: row.nome,
            slug: row.requested_materia,
          })
          anteprimaDelivered = result.delivered
        } catch (mailErr) {
          console.error('Anteprima mail send failed for subscriber',
                        row.id, row.requested_materia, mailErr)
          // Lasciamo anteprimaDelivered = null → messaggio fallback nella pagina
        }
      }

      // Conferma riuscita — pagina HTML adattata se c'era una richiesta anteprima.
      if (row.requested_materia) {
        const bodyDelivered = `
          <p>La tua iscrizione alla newsletter è attiva e ti ho appena inviato l'anteprima del manuale richiesta.</p>
          <p style="font-size:13px;color:#6b6458">Controlla la posta (anche spam) — arriva da ripamstudiocraft@gmail.com con oggetto "L'anteprima di … è qui".</p>
        `
        const bodyPending = `
          <p>La tua iscrizione alla newsletter è attiva. Ti ho inviato una mail con i dettagli sull'anteprima richiesta.</p>
          <p style="font-size:13px;color:#6b6458">In questo momento sto rivedendo i manuali — l'anteprima ti arriverà non appena la nuova versione sarà pronta.</p>
        `
        const bodyError = `
          <p>La tua iscrizione alla newsletter è attiva. C'è stato un problema tecnico nell'invio dell'anteprima — ti contatterò personalmente nelle prossime ore.</p>
          <p style="font-size:13px;color:#6b6458">Se hai urgenza, scrivi a ripamstudiocraft@gmail.com.</p>
        `
        const body = anteprimaDelivered === true ? bodyDelivered
                   : anteprimaDelivered === false ? bodyPending
                   : bodyError

        return res.status(200).send(htmlPage({
          title: 'Iscrizione confermata',
          kicker: 'ISCRIZIONE CONFERMATA',
          headline: 'Ci <em>sei.</em>',
          body,
        }))
      }

      return res.status(200).send(htmlPage({
        title: 'Iscrizione confermata',
        kicker: 'ISCRIZIONE CONFERMATA',
        headline: 'Ci <em>sei.</em>',
        body: `
          <p>Grazie, la tua iscrizione alla newsletter è attiva.</p>
          <p>Riceverai al massimo 2 email al mese con novità sui materiali, anteprime, bandi e tip di studio. Puoi disiscriverti con un click dal footer di ogni email.</p>
        `
      }))
    }

    // Verifica se era già confermato (token valido ma confirmed_at già settato)
    const already = await sql`
      SELECT id FROM newsletter_subscribers
      WHERE confirm_token = ${token} AND confirmed_at IS NOT NULL
      LIMIT 1
    `

    if (already.length > 0) {
      return res.status(200).send(htmlPage({
        title: 'Iscrizione già confermata',
        kicker: 'ISCRIZIONE GIÀ ATTIVA',
        headline: 'Eri <em>già iscritto.</em>',
        body: `<p>La tua iscrizione è già attiva. Non devi fare nulla, riceverai le prossime email.</p>`
      }))
    }

    // Token non trovato o scaduto
    return res.status(404).send(htmlPage({
      title: 'Link scaduto',
      kicker: 'CONFERMA ISCRIZIONE',
      headline: 'Link <em>non più valido.</em>',
      body: `<p>Questo link di conferma non è più valido (potrebbe essere scaduto o già usato). Prova a iscriverti di nuovo dal sito, oppure scrivici a ripamstudiocraft@gmail.com.</p>`
    }))
  } catch (err) {
    console.error('Confirm DB error:', err)
    return res.status(500).send(htmlPage({
      title: 'Errore',
      kicker: 'CONFERMA ISCRIZIONE',
      headline: 'Errore <em>temporaneo.</em>',
      body: `<p>Riprova tra qualche minuto. Se il problema persiste scrivici a ripamstudiocraft@gmail.com.</p>`
    }))
  }
}
