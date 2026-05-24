// Helper per comporre e inviare la mail di consegna anteprima manuale
// post-iscrizione newsletter. Usato da:
//   - api/newsletter/confirm.js   (consegna automatica al doppio opt-in)
//   - api/newsletter/subscribe.js (consegna immediata se l'utente era già confermato)
//
// Restituisce { ok: true, delivered: bool, reason?: string }:
//   - delivered=true  → mail con link Drive inviata
//   - delivered=false → fileId placeholder, mandata mail "in arrivo"
//   - throw          → errore SMTP, lascia gestire al chiamante

import nodemailer from 'nodemailer'
import { getAnteprimaDriveUrl } from './anteprime-manifest.js'

// Titolo umano per slug — speculare ai t: di src/data/materie.js.
// Tenuto in sync a mano (basso churn, evita dipendenza cross-bundle).
const MATERIA_LABEL = {
  'anticorruzione-trasparenza':  'Anticorruzione e Trasparenza',
  'cad':                         'CAD — Codice Amministrazione Digitale',
  'contabilita-pubblica':        'Contabilità Pubblica',
  'contratti-pubblici':          'Contratti Pubblici',
  'diritto-amministrativo':      'Diritto Amministrativo',
  'diritto-civile':              'Diritto Civile',
  'diritto-costituzionale':      'Diritto Costituzionale',
  'diritto-penale-pa':           'Diritto Penale PA',
  'diritto-processuale-civile':  'Diritto Processuale Civile',
  'diritto-ue':                  'Diritto dell\'Unione Europea',
  'gdpr':                        'GDPR e Privacy',
  'informatica':                 'Informatica',
  'logica':                      'Logica e Ragionamento',
  'ordinamento-pa':              'Ordinamento PA',
  'patrimonio-culturale':        'Patrimonio Culturale',
  'pubblico-impiego':            'Pubblico Impiego',
  'sicurezza-lavoro':            'Sicurezza sul Lavoro',
}

function brandFooterHtml() {
  return `<hr style="border:none;border-top:1px solid #e6dfd2;margin:24px 0">
  <p style="margin:0;font-size:12px;color:#6b6458">Francesco Capurso &middot; Ripam Studio Craft &middot; Roma &middot; P.IVA 18528431002<br>
  ripamstudiocraft@gmail.com &middot; <a href="https://ripam-studio-craft.vercel.app" style="color:#6b6458">ripam-studio-craft.vercel.app</a></p>`
}

function buildDeliveredEmail({ firstName, materiaLabel, driveUrl }) {
  const subject = `L'anteprima di ${materiaLabel} è qui — Ripam Studio Craft`

  const text = `Ciao ${firstName},

ecco l'anteprima del manuale di ${materiaLabel} (15 pp, PDF) come promesso:

${driveUrl}

Il link apre la visualizzazione su Google Drive — da lì puoi scaricarlo o leggerlo direttamente nel browser. Nessuna registrazione richiesta.

Cosa trovi dentro: l'indice completo del manuale, l'introduzione e i primi due capitoli per intero, in modo che tu possa valutare lo stile e la profondità prima di chiedere il manuale completo.

Sei anche ufficialmente iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email.

Per qualunque cosa, rispondi pure a questa email.

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002
`

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0a0a;line-height:1.55;background:#f5f0e8">
  <div style="background:#0a0a0a;color:#f5f0e8;padding:14px 20px;margin:-24px -24px 24px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.12em;font-weight:700">
    RIPAM STUDIO CRAFT &middot; ANTEPRIMA MANUALE
  </div>
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ecco l'anteprima del manuale di <strong>${materiaLabel}</strong> (15 pp, PDF) come promesso:</p>
  <p style="margin:24px 0;text-align:center">
    <a href="${driveUrl}" style="display:inline-block;background:#c6f432;color:#0a0a0a;padding:14px 28px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid #0a0a0a;box-shadow:4px 4px 0 #0a0a0a">APRI L'ANTEPRIMA &rarr;</a>
  </p>
  <p style="margin:18px 0;font-size:14px;color:#2a2a2a">Il link apre la visualizzazione su Google Drive — da lì puoi <strong>scaricarlo</strong> o leggerlo direttamente nel browser. Nessuna registrazione richiesta.</p>
  <p style="margin:18px 0;font-size:14px;color:#2a2a2a"><strong>Cosa trovi dentro:</strong> indice completo del manuale, introduzione e primi due capitoli per intero. Così puoi valutare stile e profondità prima di chiedere il manuale completo.</p>
  <p style="margin:18px 0;font-size:13px;color:#6b6458">Sei anche ufficialmente iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email. Per qualunque cosa, rispondi pure a questa mail.</p>
  ${brandFooterHtml()}
</div>`

  return { subject, text, html }
}

function buildPendingEmail({ firstName, materiaLabel }) {
  // Caso: utente ha richiesto un'anteprima per cui il fileId non è ancora
  // nel manifest (anteprima in fase di redesign, non ancora caricata su Drive).
  // Non lasciamo l'utente senza risposta — gli diciamo che la riceverà a breve.
  const subject = `L'anteprima di ${materiaLabel} arriva a breve — Ripam Studio Craft`

  const text = `Ciao ${firstName},

grazie per aver richiesto l'anteprima del manuale di ${materiaLabel}.

In questo momento sto rivedendo formattazione e design dei manuali, quindi l'anteprima ti arriverà via email non appena la nuova versione sarà pronta (giorni, non settimane).

Nel frattempo sei iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email.

Per qualunque cosa, rispondi pure a questa email.

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002
`

  const html = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a0a0a;line-height:1.55;background:#f5f0e8">
  <div style="background:#0a0a0a;color:#f5f0e8;padding:14px 20px;margin:-24px -24px 24px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.12em;font-weight:700">
    RIPAM STUDIO CRAFT &middot; ANTEPRIMA IN ARRIVO
  </div>
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">grazie per aver richiesto l'anteprima del manuale di <strong>${materiaLabel}</strong>.</p>
  <p style="margin:0 0 18px;font-size:15px">In questo momento sto rivedendo formattazione e design dei manuali, quindi l'anteprima ti arriverà via email non appena la nuova versione sarà pronta (giorni, non settimane).</p>
  <p style="margin:18px 0;font-size:13px;color:#6b6458">Nel frattempo sei iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email.</p>
  ${brandFooterHtml()}
</div>`

  return { subject, text, html }
}

// Costruisce il transporter Gmail. In dev locale (Node 24) la chain TLS di
// Gmail SMTP viene rifiutata: in prod Vercel (Node 18) non succede.
function buildTransporter({ user, pass }) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    ...(process.env.NODE_ENV !== 'production' ? { tls: { rejectUnauthorized: false } } : {}),
  })
}

// Invia la mail anteprima a `email`. Sceglie automaticamente tra "consegna"
// e "in arrivo" in base alla presenza del fileId nel manifest.
//
// Throw se mancano env vars Gmail o se l'invio SMTP fallisce.
export async function sendAnteprimaMail({ email, nome, slug }) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    throw new Error('Missing Gmail env vars (GMAIL_USER, GMAIL_APP_PASSWORD)')
  }

  const materiaLabel = MATERIA_LABEL[slug] || slug
  const firstName = (nome || '').split(/\s+/)[0] || 'ciao'
  const driveUrl = getAnteprimaDriveUrl(slug)

  const { subject, text, html } = driveUrl
    ? buildDeliveredEmail({ firstName, materiaLabel, driveUrl })
    : buildPendingEmail({ firstName, materiaLabel })

  const transporter = buildTransporter({ user, pass })

  await transporter.sendMail({
    from: `"Ripam Studio Craft" <${user}>`,
    to: email,
    replyTo: user,
    subject,
    text,
    html,
  })

  return { ok: true, delivered: !!driveUrl }
}
