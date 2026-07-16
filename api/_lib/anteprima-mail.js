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
import { getAnteprimaDriveUrls } from './anteprime-manifest.js'
import { emailShell, emailButton, logoAttachment } from './email-shell.js'
import { logAnteprima } from './anteprime-log.js'

// Titolo umano per slug — speculare ai t: di src/data/materie.js.
// Tenuto in sync a mano (basso churn, evita dipendenza cross-bundle).
// Esportato anche per lead-mail.js (skill auto-risposte-lead).
export const MATERIA_LABEL = {
  'diritto-amministrativo':      'Diritto Amministrativo',
  'pubblico-impiego':            'Pubblico Impiego',
  'contratti-pubblici':          'Contratti Pubblici',
  'ordinamento-pa':              'Ordinamento PA',
  'diritto-penale-pa':           'Diritto Penale PA',
  'cad':                         'CAD — Amministrazione Digitale',
  'diritto-costituzionale':      'Diritto Costituzionale',
  'diritto-ue':                  'Diritto dell\'Unione Europea',
  'gdpr':                        'GDPR e Privacy',
  'informatica':                 'Informatica',
  'inglese-a2':                  'Inglese livello A2',
  'logica':                      'Logica e ragionamento',
  'sicurezza-lavoro':            'Sicurezza sul Lavoro',
  'patrimonio-culturale':        'Patrimonio Culturale',
  'beni-culturali':              'Beni Culturali',
  'archeologia-arte-musei':      'Archeologia, Arte, Musei',
  'scavo-archeologico':          'Scavo e Ricerca Archeologica',
  'marketing-comunicazione':     'Marketing e Comunicazione',
  'organizzazione-mic':          'Organizzazione MIC',
  'diritto-civile':              'Diritto Civile',
  'contabilita-pubblica':        'Contabilità Pubblica',
  'agile-sviluppo-test':         'Agile, Sviluppo e Testing',
  'analisi-fenomeni-mercato':    'Analisi dei Fenomeni di Mercato',
  'analisi-micro-macro':         'Analisi Micro e Macroeconomica',
  'anticorruzione-trasparenza':  'Anticorruzione e Trasparenza',
  'architetture-web':            'Architetture Web',
  'contabilita-dlgs118-cpi':     'Contabilità Armonizzata (CPI)',
  'data-science':                'Data Science',
  'diritto-commerciale':         'Diritto Commerciale',
  'diritto-processuale-civile':  'Diritto Processuale Civile',
  'documentazione-amministrativa': 'Documentazione Amministrativa',
  'econometria':                 'Econometria',
  'economia-politica':           'Economia Politica',
  'elaborazione-basi-dati':      'Elaborazione Basi di Dati',
  'informatica-avanzata':        'Informatica Avanzata',
  'metodi-statistici':           'Metodi Statistici',
  'ordinamento-difesa':          'Ordinamento della Difesa',
  'ordinamento-fvg':             'Ordinamento Regione FVG',
  'programmazione-python-r':     'Programmazione Python e R',
  'project-management':          'Project Management',
  'ragioneria':                  'Ragioneria',
  'scienza-finanze':             'Scienza delle Finanze',
  'situazionali':                'Test Situazionali',
  'statistica-inferenziale':     'Statistica Inferenziale',
  'statistica-pa':               'Statistica per la PA',
  'valutazione-politiche-pubbliche': 'Valutazione Politiche Pubbliche',
}

function buildDeliveredEmail({ firstName, materiaLabel, viewUrl, downloadUrl }) {
  const subject = `L'anteprima di ${materiaLabel} è qui — Ripam Studio Craft`

  const text = `Ciao ${firstName},

ecco l'anteprima del manuale di ${materiaLabel} (15 pp, PDF) come promesso.

📥 Scarica subito il PDF:
${downloadUrl}

👁  Oppure aprilo nel browser:
${viewUrl}

Il link di download fa partire il file direttamente. Quello "apri nel browser" mostra il PDF su Google Drive (utile se vuoi leggerlo senza scaricare).

Cosa trovi dentro: l'indice completo del manuale, l'introduzione e i primi due capitoli per intero, in modo che tu possa valutare lo stile e la profondità prima di chiedere il manuale completo.

Sei anche ufficialmente iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email.

Per qualunque cosa, rispondi pure a questa email.

A presto,
Francesco
— Ripam Studio Craft
ripamstudiocraft@gmail.com · P.IVA 18528431002
`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ecco l'anteprima del manuale di <strong>${materiaLabel}</strong> (15 pp, PDF) come promesso.</p>
  <p style="margin:24px 0;text-align:center">
    ${emailButton(downloadUrl, '&darr; SCARICA IL PDF')}
  </p>
  <p style="margin:14px 0;text-align:center;font-size:13px;color:#6b6458">
    oppure <a href="${viewUrl}" style="color:#0a0a0a;font-weight:700;text-decoration:underline">apri nel browser</a> (Google Drive)
  </p>
  <p style="margin:18px 0;font-size:14px;color:#2a2a2a">Il pulsante avvia il download diretto del PDF — non serve account Google né autorizzazioni. Il link "apri nel browser" mostra il PDF su Drive, utile se preferisci leggerlo online.</p>
  <p style="margin:18px 0;font-size:14px;color:#2a2a2a"><strong>Cosa trovi dentro:</strong> indice completo del manuale, introduzione e primi due capitoli per intero. Così puoi valutare stile e profondità prima di chiedere il manuale completo.</p>
  <p style="margin:18px 0;font-size:13px;color:#6b6458">Sei anche ufficialmente iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email. Per qualunque cosa, rispondi pure a questa mail.</p>`

  const html = emailShell(inner, 'ANTEPRIMA MANUALE')

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

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">grazie per aver richiesto l'anteprima del manuale di <strong>${materiaLabel}</strong>.</p>
  <p style="margin:0 0 18px;font-size:15px">In questo momento sto rivedendo formattazione e design dei manuali, quindi l'anteprima ti arriverà via email non appena la nuova versione sarà pronta (giorni, non settimane).</p>
  <p style="margin:18px 0;font-size:13px;color:#6b6458">Nel frattempo sei iscritto alla newsletter: massimo 2 email al mese con anteprime, bandi e novità. Puoi disiscriverti con un click dal footer di ogni email.</p>`

  const html = emailShell(inner, 'ANTEPRIMA IN ARRIVO')

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
// `canale` finisce nel registro anteprime (welcome | drip | lead | blast | manuale):
// serve a sapere DA DOVE è arrivata la consegna, non solo che è avvenuta.
export async function sendAnteprimaMail({ email, nome, slug, canale = 'welcome' }) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    throw new Error('Missing Gmail env vars (GMAIL_USER, GMAIL_APP_PASSWORD)')
  }

  const materiaLabel = MATERIA_LABEL[slug] || slug
  const firstName = (nome || '').split(/\s+/)[0] || 'ciao'
  const urls = getAnteprimaDriveUrls(slug)

  const { subject, text, html } = urls
    ? buildDeliveredEmail({ firstName, materiaLabel, ...urls })
    : buildPendingEmail({ firstName, materiaLabel })

  const transporter = buildTransporter({ user, pass })

  await transporter.sendMail({
    from: `"Ripam Studio Craft" <${user}>`,
    to: email,
    replyTo: user,
    subject,
    text,
    html,
    attachments: [logoAttachment()],
  })

  // Registro anteprime: si logga SOLO la consegna vera (urls presenti). La mail
  // "in arrivo" (fileId non ancora caricato) non ha consegnato nulla → loggarla
  // farebbe credere al drip che la persona ha già la materia, e non l'avrebbe.
  if (urls) {
    await logAnteprima({ email, nome, materia: slug, formato: 'manuale', canale })
  }

  return { ok: true, delivered: !!urls }
}
