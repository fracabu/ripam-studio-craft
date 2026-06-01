// Composer delle bozze di risposta ai lead dal form /scrivimi.
// USATO SOLO dalla skill `auto-risposte-lead` (via scripts/lead-draft.mjs) —
// NON è un endpoint serverless e non invia nulla: produce solo { subject,
// text, html } che la skill mette in una BOZZA Gmail da rivedere a mano.
//
// I quattro modelli (M1–M4) sono speculari a
//   messaggi-clienti/template-risposte-lead.md
// ma qui il footer legale arriva dal guscio email-shell.js (single source of
// truth), quindi nel corpo resta solo la firma "Francesco + Telegram".
//
// Le richieste Quiz Pro NON passano da qui: sono già in carico alla skill
// `quiz-pro-onboard`.

import { emailShell, emailButton, BRAND } from './email-shell.js'
import { MATERIA_LABEL } from './anteprima-mail.js'

const TELEGRAM_URL = 'https://t.me/fcapurso'

// Firma comune (il footer legale lo aggiunge il guscio).
function sigText() {
  return `A presto,
Francesco — Ripam Studio Craft
Telegram: @fcapurso`
}
function sigHtml() {
  return `<p style="margin:24px 0 0;font-size:15px">A presto,<br>
  <strong>Francesco</strong> — Ripam Studio Craft<br>
  <a href="${TELEGRAM_URL}" style="color:${BRAND.ink}">Telegram @fcapurso</a></p>`
}

// Normalizza il subject in un "Re: ..." per agganciare il thread del lead.
function replySubject(originalSubject) {
  const s = (originalSubject || '').trim()
  if (!s) return 'Re: la tua richiesta — Ripam Studio Craft'
  return /^re:/i.test(s) ? s : `Re: ${s}`
}

// M1 — "Non so ancora": orienta con due domande. (lead Medio)
function buildM1({ firstName }) {
  const text = `Ciao ${firstName} 👋

grazie per avermi scritto! Per indirizzarti al meglio, due domande veloci:

1. Quale concorso stai preparando (o quale ti interessa di più)?
2. Quali materie ti danno più filo da torcere?

Intanto, se non l'hai già fatto, iscriviti alla newsletter dal form sul sito (spunta la casella della privacy): ricevi gratis un'anteprima audio + video + manuale per ogni materia disponibile, così ti fai un'idea del materiale.

Appena mi dici concorso e materia ti preparo qualcosa di mirato.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong> 👋</p>
  <p style="margin:0 0 14px;font-size:15px">grazie per avermi scritto! Per indirizzarti al meglio, due domande veloci:</p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px">
    <li style="margin:0 0 6px"><strong>Quale concorso</strong> stai preparando (o quale ti interessa di più)?</li>
    <li><strong>Quali materie</strong> ti danno più filo da torcere?</li>
  </ol>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Intanto, se non l'hai già fatto, iscriviti alla <strong>newsletter</strong> dal form sul sito (spunta la casella della privacy): ricevi gratis un'anteprima audio + video + manuale per ogni materia disponibile, così ti fai un'idea del materiale.</p>
  <p style="margin:0 0 4px;font-size:15px">Appena mi dici concorso e materia ti preparo qualcosa di mirato.</p>
  ${sigHtml()}`

  return { inner, text, kicker: '' }
}

// M2 — materia indicata ma manca il formato: elenca i formati. (lead Hot)
function buildM2({ firstName, materiaLabel }) {
  const text = `Ciao ${firstName},

perfetto, ${materiaLabel}. Per prepararti la cosa giusta, fammi sapere in che formato preferisci studiare:

- 🎙️ Podcast — due voci che discutono la materia, da ascoltare in auto/palestra
- 🎧 Audio lezioni — lettura integrale, studio strutturato
- 🎥 Video lezioni — le stesse lezioni in formato visivo
- 📄 Report — sintesi PDF per ripasso veloce
- 📚 Manuale completo — manuale editoriale 200-300 pp

Dimmi quale ti serve e ti mando un'anteprima + la serie completa della materia.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">perfetto, <strong>${materiaLabel}</strong>. Per prepararti la cosa giusta, fammi sapere <strong>in che formato</strong> preferisci studiare:</p>
  <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;color:#2a2a2a;line-height:1.7;list-style:none">
    <li>🎙️ <strong>Podcast</strong> — due voci che discutono la materia, da ascoltare in auto/palestra</li>
    <li>🎧 <strong>Audio lezioni</strong> — lettura integrale, studio strutturato</li>
    <li>🎥 <strong>Video lezioni</strong> — le stesse lezioni in formato visivo</li>
    <li>📄 <strong>Report</strong> — sintesi PDF per ripasso veloce</li>
    <li>📚 <strong>Manuale completo</strong> — manuale editoriale 200-300 pp</li>
  </ul>
  <p style="margin:0 0 4px;font-size:15px">Dimmi quale ti serve e ti mando un'anteprima + la serie completa della materia.</p>
  ${sigHtml()}`

  return { inner, text, kicker: '' }
}

// Metadati per formato anteprima usati da M3 (label + CTA). `generic` è il
// fallback quando arriva un solo `link` non tipizzato (retrocompat).
const M3_KINDS = {
  audio: { emoji: '🎧', noun: 'audio', detail: '(episodio 1)', btn: "🎧 ASCOLTA L'ANTEPRIMA" },
  video: { emoji: '🎥', noun: 'video', detail: '(episodio 1)', btn: "🎥 GUARDA L'ANTEPRIMA" },
  manuale: { emoji: '📚', noun: 'manuale', detail: '(15 pagine, PDF)', btn: '📚 APRI IL MANUALE' },
  generic: { emoji: '▶', noun: '', detail: '', btn: "▶ APRI L'ANTEPRIMA" },
}

// M3 — materia + formato: consegna una o più anteprime (audio/video/manuale).
// `links` è un array { kind, url }: con un solo elemento è la vecchia mail a CTA
// singola; con più elementi le bundla tutte in una mail sola (caso "materia
// completa": audio EP1 + video EP1 + manuale, una mail invece di tre). (lead Hot)
function buildM3({ firstName, materiaLabel, links }) {
  const multi = links.length > 1
  const introNoun = multi ? 'le anteprime' : "un'anteprima"
  const closing = multi
    ? 'Se ti convincono, ti preparo la serie completa della materia nel formato che preferisci. Fammi sapere e procediamo.'
    : 'Se ti convince, ti preparo la serie completa della materia nel formato che mi hai chiesto. Fammi sapere e procediamo.'

  const meta = (k) => M3_KINDS[k.kind] || M3_KINDS.generic
  const textLabel = (k) => {
    const m = meta(k)
    return `${m.emoji} Anteprima${m.noun ? ' ' + m.noun : ''}${m.detail ? ' ' + m.detail : ''}`
  }
  const htmlLabel = (k) => {
    const m = meta(k)
    return `${m.emoji} <strong>Anteprima${m.noun ? ' ' + m.noun : ''}</strong>${m.detail ? ' ' + m.detail : ''}`
  }

  const textLinks = links.map((k) => `${textLabel(k)}:\n${k.url}`).join('\n\n')
  const text = `Ciao ${firstName},

perfetto, ${materiaLabel}. Intanto ti mando ${introNoun} così vedi com'è fatto il materiale:

${textLinks}

${closing}

${sigText()}`

  const htmlBlocks = links
    .map((k) => `
  <p style="margin:0 0 8px;font-size:14px;color:#2a2a2a">${htmlLabel(k)}</p>
  <p style="margin:0 0 20px;text-align:center">${emailButton(k.url, meta(k).btn)}</p>`)
    .join('')
  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">perfetto, <strong>${materiaLabel}</strong>. Intanto ti mando ${introNoun} così vedi com'è fatto il materiale:</p>${htmlBlocks}
  <p style="margin:6px 0 0;font-size:15px">${closing}</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'ANTEPRIMA' }
}

// M4 pending — anteprima manuale richiesta ma non ancora disponibile su Drive
// (cartella "Manuale Anteprima" assente e manifest null). Non mandiamo un link
// rotto: diciamo che arriva a breve.
function buildM4Pending({ firstName, materiaLabel }) {
  const text = `Ciao ${firstName},

grazie per aver chiesto l'anteprima del manuale di ${materiaLabel}.

In questo momento sto ultimando la versione definitiva del manuale, quindi l'anteprima (15 pagine: copertina, termini d'uso e indice dei capitoli) ti arriva via email appena è pronta — giorni, non settimane.

Nel frattempo, se ti serve, posso mandarti subito un'anteprima audio o video della materia: dimmi pure.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">grazie per aver chiesto l'anteprima del <strong>manuale di ${materiaLabel}</strong>.</p>
  <p style="margin:0 0 18px;font-size:15px">In questo momento sto ultimando la versione definitiva del manuale, quindi l'anteprima (15 pagine: copertina, termini d'uso e indice dei capitoli) ti arriva via email appena è pronta — <strong>giorni, non settimane</strong>.</p>
  <p style="margin:0 0 4px;font-size:15px">Nel frattempo, se ti serve, posso mandarti subito un'anteprima <strong>audio</strong> o <strong>video</strong> della materia: dimmi pure.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'ANTEPRIMA MANUALE' }
}

// M4 — richiesta esplicita anteprima MANUALE (15 pp). (lead Hot)
function buildM4({ firstName, materiaLabel, link }) {
  const text = `Ciao ${firstName},

ecco l'anteprima del manuale di ${materiaLabel} (15 pagine, PDF): copertina, termini d'uso e l'indice completo dei capitoli, così vedi com'è strutturato.

👉 Apri l'anteprima: ${link}

Il manuale completo è 200-300 pagine con tabelle, FAQ e quiz per capitolo. Se ti interessa proseguire, scrivimi pure.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ecco l'anteprima del <strong>manuale di ${materiaLabel}</strong> (15 pagine, PDF): copertina, termini d'uso e l'indice completo dei capitoli, così vedi com'è strutturato.</p>
  <p style="margin:24px 0;text-align:center">${emailButton(link, "👁 APRI L'ANTEPRIMA")}</p>
  <p style="margin:18px 0;font-size:15px">Il manuale completo è 200-300 pagine con tabelle, FAQ e quiz per capitolo. Se ti interessa proseguire, scrivimi pure.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'ANTEPRIMA MANUALE' }
}

// NL — nurture per chi ha chiesto SOLO le credenziali Quiz Pro: invito alla
// newsletter per restare aggiornato + apertura a un'anteprima materia. (Cold)
function buildNL({ firstName }) {
  const site = 'https://ripam-studio-craft.vercel.app'
  const text = `Ciao ${firstName},

hai richiesto le credenziali di RIPAM Studio Quiz Pro — spero ti stiano tornando utili per allenarti con i quiz!

Volevo dirti che oltre al simulatore preparo di continuo nuovi materiali di studio: podcast, audio e video lezioni, report e manuali sulle materie dei concorsi.

Per non perderti le novità, iscriviti alla newsletter dal form sul sito (basta spuntare la casella della privacy): massimo 2 email al mese, niente spam, e ti disiscrivi con un click quando vuoi. Iscrivendoti ricevi gratis anche le anteprime (audio + video + manuale) delle materie disponibili.

Iscriviti qui: ${site}

E se c'è una materia di cui vuoi subito un'anteprima, rispondi a questa email e te la mando.

A presto,
Francesco — Ripam Studio Craft
Telegram: @fcapurso`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">hai richiesto le credenziali di <strong>RIPAM Studio Quiz Pro</strong> — spero ti stiano tornando utili per allenarti con i quiz!</p>
  <p style="margin:0 0 14px;font-size:15px">Volevo dirti che oltre al simulatore preparo di continuo nuovi materiali di studio: <strong>podcast, audio e video lezioni, report e manuali</strong> sulle materie dei concorsi.</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Per non perderti le novità, iscriviti alla <strong>newsletter</strong> dal form sul sito (basta spuntare la casella della privacy): massimo 2 email al mese, niente spam, e ti disiscrivi con un click quando vuoi. Iscrivendoti ricevi gratis anche le <strong>anteprime</strong> (audio + video + manuale) delle materie disponibili.</p>
  <p style="margin:22px 0;text-align:center">${emailButton(site, 'ISCRIVITI ALLA NEWSLETTER')}</p>
  <p style="margin:0 0 4px;font-size:15px">E se c'è una materia di cui vuoi subito un'anteprima, <strong>rispondi a questa email</strong> e te la mando.</p>
  ${sigHtml()}`

  return { inner, text, kicker: '' }
}

// Dispatcher. `category` ∈ {M1,M2,M3,M4,NL}.
//   M1                 → nessun dato extra
//   M2/M3/M4           → slug (per materiaLabel)
//   M3                 → audio/video/manuale (URL anteprime Drive, uno o più);
//                        in alternativa `link` come anteprima singola generica
//   M4                 → link (URL anteprima manuale; se assente → "in arrivo")
// Ritorna { subject, text, html }. Throw se mancano dati obbligatori.
export function buildLeadEmail({ category, nome, slug, link, audio, video, manuale, originalSubject }) {
  const rawFirst = (nome || '').trim().split(/\s+/)[0] || 'ciao'
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
  const materiaLabel = slug ? (MATERIA_LABEL[slug] || slug) : ''
  // NL è una campagna a sé (non una risposta in-thread): subject fisso.
  const subject = category === 'NL'
    ? 'Resta aggiornato sui nuovi materiali — Ripam Studio Craft'
    : replySubject(originalSubject)

  let built
  switch (category) {
    case 'M1':
      built = buildM1({ firstName })
      break
    case 'NL':
      built = buildNL({ firstName })
      break
    case 'M2':
      if (!slug) throw new Error('M2 richiede slug materia')
      built = buildM2({ firstName, materiaLabel })
      break
    case 'M3': {
      if (!slug) throw new Error('M3 richiede slug materia')
      const links = []
      if (audio) links.push({ kind: 'audio', url: audio })
      if (video) links.push({ kind: 'video', url: video })
      if (manuale) links.push({ kind: 'manuale', url: manuale })
      if (!links.length && link) links.push({ kind: 'generic', url: link })
      if (!links.length) throw new Error('M3 richiede almeno un link anteprima (audio/video/manuale o link)')
      built = buildM3({ firstName, materiaLabel, links })
      break
    }
    case 'M4':
      if (!slug) throw new Error('M4 richiede slug materia')
      built = link
        ? buildM4({ firstName, materiaLabel, link })
        : buildM4Pending({ firstName, materiaLabel })
      break
    default:
      throw new Error(`Categoria sconosciuta: ${category} (attese M1|M2|M3|M4)`)
  }

  return { subject, text: built.text, html: emailShell(built.inner, built.kicker) }
}
