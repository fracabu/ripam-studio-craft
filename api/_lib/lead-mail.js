// Composer delle bozze di risposta ai lead dal form /scrivimi.
// USATO SOLO dalla skill `auto-risposte-lead` (via scripts/lead-draft.mjs) —
// NON è un endpoint serverless e non invia nulla: produce solo { subject,
// text, html } che la skill mette in una BOZZA Gmail da rivedere a mano.
//
// I modelli (M1–M5) sono speculari a
//   messaggi-clienti/template-risposte-lead.md
// ma qui il footer legale arriva dal guscio email-shell.js (single source of
// truth), quindi nel corpo resta solo la firma "Francesco + Telegram".
//
// Le richieste Quiz Pro NON passano da qui: sono già in carico alla skill
// `quiz-pro-onboard`.

import { emailShell, emailButton, BRAND } from './email-shell.js'
import { MATERIA_LABEL } from './anteprima-mail.js'
import { getReportCustomBundle } from './report-custom-manifest.js'

const TELEGRAM_URL = 'https://t.me/fcapurso'

// Listino dei prodotti COMPLETI (unico per materie a catalogo e produzione su
// misura). Deciso 2026-06-01. ⚠️ NON è speculare a src/data/formati.js (quelli
// sono i prezzi "da" del sito, più bassi e NON mostrati pubblicamente): questi
// sono i prezzi di vendita reali comunicati ai lead via email.
// ⚠️ Listino rivisto il 2026-07-31. Due cose sono cambiate insieme:
//  1) POTATURA. Fuori catalogo le "audio lezioni" monovoce e i report generati
//     con NotebookLM (erano 9,99 € mentre i report veri si vendono a 29-30 €).
//     Le ex "video lezioni" si chiamano ora AUDIO LEZIONI CON SUPPORTO VISIVO:
//     è quello che sono sempre state. Chiave interna invariata (`video`).
//  2) PREZZI PER MATERIA (serie completa = 8 episodi), allineati al praticato
//     reale sulle fatture, non ai vecchi "prezzi da" del sito.
const PREZZI = { podcast: '29 €', video: '35 €', manuale: '39 €', report: '29 €' }

// Bundle. NON vanno mai nella prima mail: servono al secondo giro, quando il
// lead ha visto le anteprime e chiede le condizioni. Curva: -20% a 3 materie,
// -35% a 5, -60% su tutte (~10). I valori a 3 e 5 report cadono esatti sul
// listino già praticato (69 € e 99 €).
export const BUNDLE = {
  materiaCompleta: '119 €', // podcast + audio/visivo + report + manuale (da 132 €)
  podcast: { 3: '69 €', 5: '95 €', tutte: '115 €' },
  video: { 3: '85 €', 5: '115 €', tutte: '139 €' },
  manuale: { 3: '95 €', 5: '129 €', tutte: '159 €' },
  report: { 3: '69 €', 5: '99 €', tutte: '149 €' },
  completo: { 3: '299 €', 5: '399 €', tutte: '549 €' },
}

const COMPLETO_LABEL = {
  manuale: 'Il Manuale completo',
  video: 'Le Audio Lezioni con supporto visivo (serie completa)',
  report: 'Il Report completo',
  podcast: 'La Serie Podcast completa',
}

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

// M1 — "Non so ancora": risposta standard per i lead vaghi. Scalda con
// empatia + spiega l'offerta, poi UNA sola domanda soft. (lead Medio)
//   subscribed=false → CTA "iscriviti e ricevi le anteprime gratis" (regalo).
//   subscribed=true  → il lead è GIÀ iscritto (ha già ricevuto il blast con le
//                      anteprime): niente CTA iscrizione, si valorizza ciò che
//                      gli arriva già e si pivota subito alla domanda.
function buildM1({ firstName, subscribed }) {
  const site = 'https://ripam-studio-craft.vercel.app'

  const greetText = `Ciao ${firstName} 👋

ci sta non avere ancora le idee chiare: è proprio il momento in cui posso esserti più utile.

In due righe, come lavoro: per ogni materia dei concorsi pubblici preparo materiali di studio fatti con l'AI su fonti ufficiali — audio lezioni con supporto visivo, report e manuali. Così studi nel formato che ti viene più comodo: in cuffia, davanti allo schermo o su carta.

${bloccoGratisText()}`
  const greetHtml = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong> 👋</p>
  <p style="margin:0 0 14px;font-size:15px">ci sta non avere ancora le idee chiare: è proprio il momento in cui posso esserti <strong>più utile</strong>.</p>
  <p style="margin:0 0 14px;font-size:15px">In due righe, come lavoro: per ogni materia dei concorsi pubblici preparo materiali di studio fatti con l'AI <strong>su fonti ufficiali</strong> — audio lezioni con supporto visivo, report e manuali. Studi nel formato che ti viene più comodo: in cuffia, davanti allo schermo o su carta.</p>${bloccoGratisHtml()}`

  const closeText = `E se mi dici quale concorso prepari (o anche solo la materia che ti preoccupa di più), ti rispondo con un consiglio mirato su da dove partire.`
  const closeHtml = `<p style="margin:0 0 4px;font-size:15px">E se mi dici <strong>quale concorso</strong> prepari (o anche solo la materia che ti preoccupa di più), ti rispondo con un consiglio mirato su <strong>da dove partire</strong>.</p>`

  if (subscribed) {
    const text = `${greetText}

Visto che sei già iscritto alla newsletter, le anteprime — audio con supporto visivo + manuale — di tutte le materie già pronte ti stanno già arrivando: le apri, le scarichi e le provi. Sono il modo migliore per capire se il mio materiale fa per te.

${closeText}

${sigText()}`
    const inner = `${greetHtml}
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Visto che sei <strong>già iscritto alla newsletter</strong>, le anteprime — audio con supporto visivo + manuale — di tutte le materie già pronte ti stanno già arrivando: le apri, le scarichi e le provi. Sono il modo migliore per capire se il mio materiale fa per te.</p>
  ${closeHtml}
  ${sigHtml()}`
    return { inner, text, kicker: '' }
  }

  const text = `${greetText}

Il modo più veloce per capire se fanno per te: iscriviti alla newsletter dal sito (spunta la casella della privacy) e ricevi GRATIS le anteprime — audio con supporto visivo + manuale — di tutte le materie già pronte. Le scarichi, le provi, zero impegno.

👉 ${site}

${closeText}

${sigText()}`
  const inner = `${greetHtml}
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Il modo più veloce per capire se fanno per te: iscriviti alla <strong>newsletter</strong> (spunta la casella della privacy) e ricevi <strong>gratis le anteprime</strong> — podcast + audio con supporto visivo + manuale — di tutte le materie già pronte. Le scarichi, le provi, zero impegno.</p>
  <p style="margin:22px 0;text-align:center">${emailButton(site, 'RICEVI LE ANTEPRIME GRATIS')}</p>
  ${closeHtml}
  ${sigHtml()}`
  return { inner, text, kicker: '' }
}

// M2 — materia indicata ma manca il formato: elenca i formati. (lead Hot)
function buildM2({ firstName, materiaLabel }) {
  const text = `Ciao ${firstName},

perfetto, ${materiaLabel}. Prima di prepararti qualcosa ti do quello che puoi già usare oggi.

${bloccoGratisText()}

Poi, per mandarti l'anteprima giusta, fammi sapere in che formato preferisci studiare:

- 🎙️ Podcast — due voci che discutono la materia, da ascoltare in auto o in palestra
- 🎥 Audio lezioni con supporto visivo — la lezione letta per intero, con i punti chiave a schermo
- 📄 Report — la dispensa sul programma del tuo bando
- 📚 Manuale completo — manuale editoriale 200-300 pp

${bloccoPianoText()}

${bloccoCanaliText()}

Dimmi il formato e ti mando subito l'anteprima.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">perfetto, <strong>${materiaLabel}</strong>. Prima di prepararti qualcosa ti do quello che puoi già usare oggi.</p>${bloccoGratisHtml()}
  <p style="margin:0 0 10px;font-size:15px">Poi, per mandarti l'anteprima giusta, fammi sapere <strong>in che formato</strong> preferisci studiare:</p>
  <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;color:#2a2a2a;line-height:1.7;list-style:none">
    <li>🎙️ <strong>Podcast</strong> — due voci che discutono la materia, da ascoltare in auto o in palestra</li>
    <li>🎥 <strong>Audio lezioni con supporto visivo</strong> — la lezione letta per intero, con i punti chiave a schermo</li>
    <li>📄 <strong>Report</strong> — la dispensa sul programma del tuo bando</li>
    <li>📚 <strong>Manuale completo</strong> — manuale editoriale 200-300 pp</li>
  </ul>${bloccoPianoHtml()}${bloccoCanaliHtml()}
  <p style="margin:0 0 4px;font-size:15px">Dimmi il formato e ti mando subito l'anteprima.</p>
  ${sigHtml()}`

  return { inner, text, kicker: '' }
}

// Metadati per formato anteprima usati da M3 (label + CTA). `generic` è il
// fallback quando arriva un solo `link` non tipizzato (retrocompat).
// ============================================================================
// BLOCCHI DELLA SCALA (2026-07-31). L'ordine con cui si offre qualcosa a un
// lead è fisso: prima tutto il gratis da consumare, poi il piano di studio e i
// canali, poi le anteprime della newsletter — e solo se serve davvero si compra.
// I prezzi NON escono mai nella prima mail: si mandano quando il lead risponde
// e li chiede. Questi blocchi si montano dentro M3/M4/M5 invece di riscriverli.
// ============================================================================
const GRATIS = [
  ['https://www.ripamstudio.it/', 'simulatori, riassunti, report di studio, decaloghi e flashcard'],
  ['https://ripam-studio-quiz-pro.vercel.app/', "quiz generati dall'AI direttamente dagli articoli di legge (5.500+ articoli, 26 leggi); le credenziali le chiedi dal sito, gratis"],
  ['https://ripam-studio-logica.vercel.app/', 'simulazioni di logica e ragionamento'],
]
const SOCIAL = { telegram: 'https://t.me/ripam3997studio', facebook: 'https://www.facebook.com/profile.php?id=61586971824622' }

function bloccoGratisText() {
  return `Prima però ti segnalo una cosa che quasi nessuno sfrutta: buona parte di quello che faccio è gratis, e non devi chiedermela.

${GRATIS.map(([url, d]) => `- ${url}\n  ${d}`).join('\n')}

Comincia da lì. Se ti basta quello, hai risolto senza spendere un euro — ed è un esito che mi va benissimo.`
}
function bloccoGratisHtml() {
  return `
  <p style="margin:18px 0 8px;font-size:15px">Prima però ti segnalo una cosa che quasi nessuno sfrutta: <strong>buona parte di quello che faccio è gratis</strong>, e non devi chiedermela.</p>
  <ul style="margin:0 0 14px;padding-left:18px;font-size:14px;line-height:1.6;list-style:none">${GRATIS.map(([url, d]) => `<li style="margin:0 0 8px">▸ <a href="${url}" style="color:${BRAND.ink};font-weight:700">${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a><br><span style="color:#2a2a2a">${d}</span></li>`).join('')}</ul>
  <p style="margin:0 0 16px;font-size:15px">Comincia da lì. Se ti basta quello, <strong>hai risolto senza spendere un euro</strong> — ed è un esito che mi va benissimo.</p>`
}

function bloccoPianoText() {
  return `Poi, prima del materiale, viene il piano. Studiare senza un ordine è il modo più rapido per arrivare alla prova con metà programma fatto bene e metà toccato di sfuggita — quasi sempre la metà sbagliata, perché si parte da ciò che piace invece che da ciò che pesa.

Se mi rispondi con tre informazioni:

1) da quanto ci stai lavorando e quante ore al giorno riesci davvero a metterci;
2) le due o tre materie che senti più scoperte;
3) che formazione hai alle spalle (una riga basta);

ti preparo un piano di studio cucito sul tuo concorso e sul tuo tempo reale, e te lo mando gratis. Serve anche a capire cosa vale la pena comprare e cosa no: capita spesso che a qualcuno servano due report, non dieci. Meglio saperlo prima.`
}
function bloccoPianoHtml() {
  return `
  <p style="margin:0 0 12px;font-size:15px">Poi, prima del materiale, viene <strong>il piano</strong>. Studiare senza un ordine è il modo più rapido per arrivare alla prova con metà programma fatto bene e metà toccato di sfuggita — quasi sempre la metà sbagliata, perché si parte da ciò che piace invece che da ciò che pesa.</p>
  <p style="margin:0 0 8px;font-size:15px">Se mi rispondi con tre informazioni:</p>
  <ol style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.6">
    <li>da quanto ci stai lavorando e quante ore al giorno riesci davvero a metterci;</li>
    <li>le due o tre materie che senti più scoperte;</li>
    <li>che formazione hai alle spalle (una riga basta);</li>
  </ol>
  <p style="margin:0 0 16px;font-size:15px">ti preparo un <strong>piano di studio</strong> cucito sul tuo concorso e sul tuo tempo reale, e te lo mando <strong>gratis</strong>. Serve anche a capire cosa vale la pena comprare e cosa no: capita spesso che a qualcuno servano <em>due</em> report, non dieci. Meglio saperlo prima.</p>`
}

function bloccoCanaliText() {
  return `Le cose nuove le pubblico qui, se vuoi restare aggiornata/o senza pensarci:
- Telegram: ${SOCIAL.telegram}
- Facebook: ${SOCIAL.facebook}
- Newsletter dal sito: anteprime complete delle materie pronte, gratis per gli iscritti`
}
function bloccoCanaliHtml() {
  return `
  <p style="margin:0 0 6px;font-size:14px;color:#2a2a2a">Le cose nuove le pubblico qui, se vuoi restare aggiornata/o senza pensarci:</p>
  <ul style="margin:0 0 16px;padding-left:18px;font-size:14px;line-height:1.6;list-style:none">
    <li>▸ Telegram: <a href="${SOCIAL.telegram}" style="color:${BRAND.ink}">${SOCIAL.telegram.replace('https://', '')}</a></li>
    <li>▸ Facebook: <a href="${SOCIAL.facebook}" style="color:${BRAND.ink}">la pagina di Ripam Studio</a></li>
    <li>▸ Newsletter dal sito: anteprime complete delle materie pronte, gratis per gli iscritti</li>
  </ul>`
}

const M3_KINDS = {
  podcast: { emoji: '🎙️', noun: 'podcast', detail: '(episodio 1)', btn: "🎙️ ASCOLTA IL PODCAST", price: PREZZI.podcast, completo: COMPLETO_LABEL.podcast },
  // `audio` = audio lezione monovoce: FUORI CATALOGO dal 31/07/2026. Il kind
  // resta perché su Drive quei file esistono ancora e possono essere mandati
  // come anteprima, ma non ha più un prezzo: non è più un prodotto in vendita.
  audio: { emoji: '🎧', noun: 'audio', detail: '(episodio 1)', btn: "🎧 ASCOLTA L'ANTEPRIMA" },
  video: { emoji: '🎥', noun: 'audio lezione con supporto visivo', detail: '(episodio 1)', btn: "🎥 GUARDA L'ANTEPRIMA", price: PREZZI.video, completo: COMPLETO_LABEL.video },
  manuale: { emoji: '📚', noun: 'manuale', detail: '(15 pagine, PDF)', btn: '📚 APRI IL MANUALE', price: PREZZI.manuale, completo: COMPLETO_LABEL.manuale },
  report: { emoji: '📄', noun: 'report', detail: '(PDF)', btn: "📄 APRI L'ANTEPRIMA", price: PREZZI.report, completo: COMPLETO_LABEL.report },
  generic: { emoji: '▶', noun: '', detail: '', btn: "▶ APRI L'ANTEPRIMA" },
}

// M3 — materia + formato: consegna una o più anteprime (audio/video/manuale).
// `links` è un array { kind, url }: con un solo elemento è la vecchia mail a CTA
// singola; con più elementi le bundla tutte in una mail sola (caso "materia
// completa": audio EP1 + video EP1 + manuale, una mail invece di tre). (lead Hot)
function buildM3({ firstName, materiaLabel, links }) {
  const multi = links.length > 1
  const introNoun = multi ? 'le anteprime' : "un'anteprima"

  const meta = (k) => M3_KINDS[k.kind] || M3_KINDS.generic
  const textLabel = (k) => {
    const m = meta(k)
    return `${m.emoji} Anteprima${m.noun ? ' ' + m.noun : ''}${m.detail ? ' ' + m.detail : ''}`
  }
  const htmlLabel = (k) => {
    const m = meta(k)
    return `${m.emoji} <strong>Anteprima${m.noun ? ' ' + m.noun : ''}</strong>${m.detail ? ' ' + m.detail : ''}`
  }

  // NIENTE PREZZI QUI (2026-07-31). Prima si consuma il gratis, poi il piano,
  // poi i canali: le condizioni si mandano solo se il lead risponde e le chiede.
  const closing = `E se dopo aver visto tutto questo il materiale completo di ${materiaLabel} ti serve davvero, dimmelo e ti mando condizioni e modalità. Nessuna fretta: preferisco non buttarti lì un prezzo prima che tu abbia capito se il materiale ti piace.`

  const textLinks = links.map((k) => `${textLabel(k)}:\n${k.url}`).join('\n\n')
  const text = `Ciao ${firstName},

perfetto, ${materiaLabel}. Ecco ${introNoun}, così vedi com'è fatto il materiale prima di qualunque altro discorso:

${textLinks}

${bloccoGratisText()}

${bloccoPianoText()}

${bloccoCanaliText()}

${closing}

${sigText()}`

  const htmlBlocks = links
    .map((k) => `
  <p style="margin:0 0 8px;font-size:14px;color:#2a2a2a">${htmlLabel(k)}</p>
  <p style="margin:0 0 20px;text-align:center">${emailButton(k.url, meta(k).btn)}</p>`)
    .join('')
  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">perfetto, <strong>${materiaLabel}</strong>. Ecco ${introNoun}, così vedi com'è fatto il materiale prima di qualunque altro discorso:</p>${htmlBlocks}${bloccoGratisHtml()}${bloccoPianoHtml()}${bloccoCanaliHtml()}
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
  // Niente prezzo del manuale qui: vale la stessa scala di M3 (2026-07-31).
  const text = `Ciao ${firstName},

ecco l'anteprima del manuale di ${materiaLabel} (15 pagine, PDF): copertina, termini d'uso e l'indice completo dei capitoli, così vedi com'è strutturato.

👉 Apri l'anteprima: ${link}

${bloccoGratisText()}

${bloccoPianoText()}

${bloccoCanaliText()}

Il manuale completo è 200-300 pagine con tabelle, FAQ e quiz per capitolo. Se dopo tutto il resto ti serve davvero, scrivimi e ti mando le condizioni.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ecco l'anteprima del <strong>manuale di ${materiaLabel}</strong> (15 pagine, PDF): copertina, termini d'uso e l'indice completo dei capitoli, così vedi com'è strutturato.</p>
  <p style="margin:24px 0;text-align:center">${emailButton(link, "👁 APRI L'ANTEPRIMA")}</p>${bloccoGratisHtml()}${bloccoPianoHtml()}${bloccoCanaliHtml()}
  <p style="margin:0 0 4px;font-size:15px">Il manuale completo è 200-300 pagine con tabelle, FAQ e quiz per capitolo. Se dopo tutto il resto ti serve davvero, scrivimi e ti mando le condizioni.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'ANTEPRIMA MANUALE' }
}

// M5 — materia NON a catalogo (produzione su misura). Il lead chiede una
// materia che non ho ancora prodotto: offro di crearla su misura (fonti
// ufficiali + analisi delle banche dati pubbliche), chiedo il bando per
// calibrare la profondità e offro un'anteprima entro 1-2 giorni. `materia` è
// TESTO LIBERO (niente slug: non è in materie.js). `formats` = sottoinsieme di
// ['manuale','audio','video']; se vuoto → solo manuale (default). (lead Hot)
// Ordine di risalita: dal più leggero al più impegnativo (podcast → audio con
// supporto visivo → report → manuale). L'audio lezione monovoce non c'è più.
const PROD_ORDER = ['video', 'report', 'manuale']  // podcast fuori catalogo dal 30/08/2026: resta consegnabile su richiesta, non si propone
const PROD_LABEL = { podcast: 'Serie podcast', video: 'Audio lezioni con supporto visivo', report: 'Report di studio', manuale: 'Manuale completo' }
function buildM5({ firstName, materia, formats }) {
  const sel = PROD_ORDER.filter((f) => (formats || []).includes(f))
  const list = sel.length ? sel : ['manuale']
  const multi = list.length > 1
  const hasManuale = list.includes('manuale')

  // Cosa posso prepararti — SENZA prezzi (2026-07-31): le condizioni arrivano
  // quando il lead risponde col bando, non prima.
  let prezziText, prezziHtml
  if (!multi) {
    prezziText = `Su ${materia} ti preparerei il ${PROD_LABEL[list[0]].toLowerCase()}.`
    prezziHtml = `<p style="margin:0 0 14px;font-size:15px">Su <strong>${materia}</strong> ti preparerei il <strong>${PROD_LABEL[list[0]].toLowerCase()}</strong>.</p>`
  } else {
    prezziText = `Ecco cosa posso prepararti su ${materia}:\n` + list.map((f) => `- ${PROD_LABEL[f]}`).join('\n')
    prezziHtml = `<p style="margin:18px 0 6px;font-size:15px">Ecco cosa posso prepararti su <strong>${materia}</strong>:</p>
  <ul style="margin:0 0 16px;padding-left:18px;font-size:16px;line-height:1.8;list-style:none">${list.map((f) => `<li>📦 <strong>${PROD_LABEL[f]}</strong></li>`).join('')}</ul>`
  }

  const anteprima = hasManuale ? "un'anteprima di una ventina di pagine del manuale" : 'un breve estratto di prova'

  const text = `Ciao ${firstName},

grazie per l'interesse su ${materia}: ti rispondo subito e in modo trasparente.

Al momento su ${materia} non ho ancora prodotto materiale — non è ancora nel mio catalogo. Però posso crearlo su misura, costruito esattamente come tutti gli altri.

Due cose che voglio tu sappia, perché sono il cuore del mio lavoro:

1) Tutti i miei materiali sono basati su fonti ufficiali — normativa e documentazione reale, non riassunti generici.

2) Lavoro sui quesiti già usciti. Ho raccolto le banche dati pubbliche dei concorsi, dai PDF ufficiali RIPAM dove esistono alle raccolte pubbliche dei quesiti degli anni scorsi: se per ${materia} c'è materiale, costruisco il report guidandomi sull'analisi di quelle domande, così studi mirato su ciò che davvero viene chiesto. È il metodo con cui realizzo tutti gli altri.

Per calibrare bene il livello di profondità, mi faresti un grande favore se mi mandassi il bando del concorso specifico in cui chiedono questa materia: così capisco esattamente quanto andare a fondo.

Per farti capire come sarà: le anteprime che mando agli iscritti alla newsletter (audio lezioni con supporto visivo e manuale) sono lo stesso identico formato che avrai anche tu.

${prezziText}

${bloccoGratisText()}

E per non farti decidere "al buio": se sei interessata/o, entro un giorno o due ti preparo ${anteprima}, così vedi com'è prima di decidere. Nessun impegno, e le condizioni te le mando solo se a quel punto ti serve davvero.

Se ti va, rispondi a questa mail con il bando (o il nome del concorso) e parto subito.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">grazie per l'interesse su <strong>${materia}</strong>: ti rispondo subito e in modo trasparente.</p>
  <p style="margin:0 0 14px;font-size:15px">Al momento su ${materia} <strong>non ho ancora prodotto materiale</strong> — non è ancora nel mio catalogo. Però posso <strong>crearlo su misura</strong>, costruito esattamente come tutti gli altri.</p>
  <p style="margin:0 0 10px;font-size:15px">Due cose che voglio tu sappia, perché sono il cuore del mio lavoro:</p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px">
    <li style="margin:0 0 10px"><strong>Tutti i miei materiali sono basati su fonti ufficiali</strong> — normativa e documentazione reale, non riassunti generici.</li>
    <li><strong>Lavoro sui quesiti già usciti.</strong> Ho raccolto le banche dati pubbliche dei concorsi, dai PDF ufficiali RIPAM dove esistono alle raccolte pubbliche dei quesiti degli anni scorsi: se per ${materia} c'è materiale, costruisco il report <strong>guidandomi sull'analisi di quelle domande</strong>, così studi mirato su ciò che davvero viene chiesto.</li>
  </ol>
  <p style="margin:0 0 14px;font-size:15px">Per calibrare bene il <strong>livello di profondità</strong>, mi faresti un grande favore se mi mandassi il <strong>bando del concorso specifico</strong>: così capisco esattamente quanto andare a fondo.</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Per farti capire come sarà: le anteprime che mando agli iscritti alla newsletter (audio lezioni con supporto visivo e manuale) sono lo stesso identico formato che avrai anche tu.</p>
  ${prezziHtml}${bloccoGratisHtml()}
  <p style="margin:0 0 4px;font-size:15px">E per non farti decidere «al buio»: se sei interessata/o, <strong>entro un giorno o due ti preparo ${anteprima}</strong>, così vedi com'è prima di decidere. Nessun impegno, e le condizioni te le mando solo se a quel punto ti serve davvero. Rispondi con il <strong>bando</strong> (o il nome del concorso) e parto subito.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'PRODUZIONE SU MISURA' }
}

// RC — bundle anteprime REPORT STUDIO CUSTOM per un concorso/profilo specifico.
// Consegna su richiesta esplicita uno o più estratti (Drive) dei report cuciti
// su misura per quel concorso. `bundle` = { concorso, reports:[{label,viewUrl}] }
// dal report-custom-manifest. `prezzo` (opzionale, testo libero) → se passato
// mostra il blocco prezzo del completo; se assente → CTA soft "ti mando le
// condizioni" (i report custom hanno listino client-specific: meglio non
// inchiodare una tariffa di default e rischiare di sbagliarla). (lead Hot)
function buildRC({ firstName, bundle, prezzo }) {
  const { concorso, reports, gruppi } = bundle
  // multiBandi: il lead ha chiesto report di PIÙ concorsi (tipico di chi clicca
  // più card della vetrina). Si risponde con UNA mail sola, con i link raggruppati
  // per bando — mandarne una per bando satura la casella ed è la via più rapida
  // alla disiscrizione.
  const multiBandi = Array.isArray(gruppi) && gruppi.length > 1
  const gruppiEff = multiBandi ? gruppi : [{ concorso, reports }]
  const multi = reports.length > 1
  const introNoun = multi ? "ecco le anteprime dei report" : "ecco l'anteprima del report"
  const introText = multiBandi
    ? `${introNoun} che ho preparato su misura, divisi per i concorsi che hai guardato:`
    : `${introNoun} che ho preparato su misura per il tuo concorso, ${concorso}:`
  const introHtml = multiBandi
    ? `${introNoun} che ho preparato su misura, <strong>divisi per i concorsi che hai guardato</strong>:`
    : `${introNoun} che ho preparato su misura per il tuo concorso, <strong>${concorso}</strong>:`

  const estrattoText = multi
    ? 'Di ognuno sono le prime pagine — copertina, indice e l\'inizio delle sezioni — così vedi come ragiona il materiale prima di decidere.'
    : 'Sono le prime pagine — copertina, indice e l\'inizio delle sezioni — così vedi come ragiona il materiale prima di decidere.'

  // Credibilità: da dove viene il contenuto. L'architettura delle fonti si
  // COMUNICA, non si spiega (niente "wiki"/"LLM": a un candidato non dicono
  // nulla). Il contrasto "base costruita sulle fonti" vs "appunti raccolti in
  // giro" fa il lavoro. "mi ci attengo" = strictly bando, che è anche il
  // posizionamento del brand (studia solo quello che serve).
  const metodoText = `Come nasce un report: sotto c'è una base di conoscenza costruita solo su fonti ufficiali, tenute collegate tra loro e aggiornate; sopra ci metto il programma del bando e mi ci attengo — dentro c'è quello che il bando chiede, niente capitoli in più per fare volume. Dove esiste una banca dati ufficiale guardo anche le domande già uscite nelle prove.`

  const completoText = `Il report completo è la dispensa integrale: tutte le sezioni, i punti dove si sbaglia più spesso e i quiz commentati. E sulle stesse materie il PDF non è l'unica strada: ci sono audio lezioni e podcast per studiare mentre ti muovi, video lezioni, i manuali completi e il simulatore di quiz.`

  // Il PIANO viene prima del prodotto: è l'offerta a più alto valore percepito
  // e a costo zero per il lead. Le 3 domande sono il "prezzo" da pagare, ed è
  // ciò che qualifica davvero il contatto (tempo reale disponibile, materie
  // deboli, base di partenza). Regola commerciale 30/07/2026: prezzi solo se
  // li chiede.
  //
  // ⚠️ NON si chiede "quando hai la prova" (dal 07/08/2026): per la maggior
  // parte dei bandi aperti il diario d'esame non è ancora uscito - l'INPS 499
  // non ce l'ha, e il calendario RIPAM 1340 del 30/06 ha lasciato fuori proprio
  // il profilo AMM. È una domanda a cui il candidato non sa rispondere, e la
  // data la sappiamo noi dal wiki bandi: si chiede solo ciò che serve a
  // COSTRUIRE il piano.
  const pianoText = `Ma prima del materiale viene una cosa che conta di più: il piano. Studiare senza un ordine è il modo più rapido per arrivare alla prova con metà programma fatto bene e metà toccato di sfuggita — e quasi sempre la metà sbagliata, perché si parte da ciò che piace invece che da ciò che pesa.

Se mi rispondi con tre informazioni:

1) da quanto ci stai lavorando e quante ore al giorno riesci davvero a metterci;
2) le due o tre materie che senti più scoperte;
3) che formazione hai alle spalle (una riga basta);

ti preparo un piano di studio cucito sul tuo concorso e sul tuo tempo reale: quali materie in che ordine, quanto dedicare a ciascuna, dove conviene stringere e dove no. Te lo mando gratis.

E serve anche a un'altra cosa: capire cosa vale la pena comprare e cosa no. Dal piano si vede dove te la cavi da sola/o — e lì non ti serve niente di mio — e dove invece un materiale fatto bene ti fa risparmiare settimane. Capita spesso che a qualcuno servano due report, non dieci: meglio saperlo prima di spendere.

Se poi preferisci un formato diverso dal PDF, scrivimelo nella stessa risposta e ti mando l'anteprima anche di quello.`

  // Il prezzo si mostra SOLO se passato esplicitamente (--prezzo): tariffe
  // client-specific, meglio nessun numero che quello sbagliato.
  let prezzoText = ''
  let prezzoHtml = ''
  let chiusuraPrezzoText = ''
  let chiusuraPrezzoHtml = ''
  if (prezzo) {
    prezzoText = `\nReport completo: ${prezzo}.\n`
    prezzoHtml = `<p style="background:${BRAND.acid};border:2px solid ${BRAND.ink};padding:12px 16px;font-size:16px;font-weight:700;margin:18px 0">Report completo: ${prezzo}</p>`
    chiusuraPrezzoText = `\nE se vuoi procedere subito, rispondi e ti mando le istruzioni per il pagamento.\n`
    chiusuraPrezzoHtml = `<p style="margin:16px 0 0;font-size:15px">E se vuoi procedere subito, rispondi e ti mando le istruzioni per il pagamento.</p>`
  }

  const textLinks = gruppiEff
    .map((g) => {
      const righe = g.reports.map((r) => `📄 ${r.label}:\n${r.viewUrl}`).join('\n\n')
      return multiBandi ? `▸ ${g.concorso}\n\n${righe}` : righe
    })
    .join('\n\n')
  const text = `Ciao ${firstName},

${introText}

${textLinks}

${estrattoText}

${metodoText}

${completoText}
${prezzoText}
${pianoText}
${chiusuraPrezzoText}
${sigText()}`

  const htmlBlocks = gruppiEff
    .map((g) => {
      const testata = multiBandi
        ? `
  <p style="margin:22px 0 12px;padding:8px 12px;background:${BRAND.ink};color:${BRAND.acid};font-family:'Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${g.concorso}</p>`
        : ''
      return testata + g.reports
        .map((r) => `
  <p style="margin:0 0 8px;font-size:14px;color:#2a2a2a">📄 <strong>${r.label}</strong></p>
  <p style="margin:0 0 20px;text-align:center">${emailButton(r.viewUrl, "📄 APRI L'ANTEPRIMA")}</p>`)
        .join('')
    })
    .join('')

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">${introHtml}</p>${htmlBlocks}
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">${estrattoText}</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Come nasce un report: sotto c'è una <strong>base di conoscenza costruita solo su fonti ufficiali</strong>, tenute collegate tra loro e aggiornate; sopra ci metto il <strong>programma del bando e mi ci attengo</strong> — dentro c'è quello che il bando chiede, niente capitoli in più per fare volume. Dove esiste una banca dati ufficiale guardo anche le domande già uscite nelle prove.</p>
  <p style="margin:0 0 14px;font-size:15px">Il <strong>report completo</strong> è la dispensa integrale: tutte le sezioni, i punti dove si sbaglia più spesso e i quiz commentati. E sulle stesse materie il PDF non è l'unica strada: ci sono <strong>audio lezioni e podcast</strong> per studiare mentre ti muovi, <strong>video lezioni</strong>, i <strong>manuali completi</strong> e il <strong>simulatore di quiz</strong>.</p>${prezzoHtml}
  <p style="margin:18px 0 14px;font-size:15px">Ma prima del materiale viene una cosa che conta di più: <strong>il piano</strong>. Studiare senza un ordine è il modo più rapido per arrivare alla prova con metà programma fatto bene e metà toccato di sfuggita — e quasi sempre la metà sbagliata, perché si parte da ciò che piace invece che da ciò che pesa.</p>
  <p style="margin:0 0 10px;font-size:15px">Se mi rispondi con <strong>tre informazioni</strong>:</p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7">
    <li style="margin:0 0 8px"><strong>da quanto ci stai lavorando</strong> e quante ore al giorno riesci davvero a metterci;</li>
    <li style="margin:0 0 8px">le <strong>due o tre materie</strong> che senti più scoperte;</li>
    <li>che <strong>formazione</strong> hai alle spalle (una riga basta).</li>
  </ol>
  <p style="margin:0 0 14px;font-size:15px">ti preparo un <strong>piano di studio cucito sul tuo concorso e sul tuo tempo reale</strong>: quali materie in che ordine, quanto dedicare a ciascuna, dove conviene stringere e dove no. <strong>Te lo mando gratis.</strong></p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">E serve anche a un'altra cosa: <strong>capire cosa vale la pena comprare e cosa no</strong>. Dal piano si vede dove te la cavi da sola/o — e lì non ti serve niente di mio — e dove invece un materiale fatto bene ti fa risparmiare settimane. Capita spesso che a qualcuno servano due report, non dieci: meglio saperlo prima di spendere.</p>
  <p style="margin:0 0 4px;font-size:15px">Se poi preferisci un formato diverso dal PDF, scrivimelo nella stessa risposta e ti mando l'anteprima anche di quello.</p>${chiusuraPrezzoHtml}
  ${sigHtml()}`

  return { inner, text, kicker: 'REPORT SU MISURA' }
}

// ---------------------------------------------------------------------------
// CO — COACHING NOTEBOOKLM (form /scrivimi → "Cosa serve: Coaching NotebookLM")
// ---------------------------------------------------------------------------
// Due varianti, in ordine di conversazione:
//   1) DEFAULT (esplorativa, NIENTE prezzi) — è la prima risposta: si spiega
//      cos'è la sessione e si chiedono le 3 info che servono a tarare il
//      livello (punto di partenza, dispositivo, disponibilità). Regola
//      commerciale: i prezzi si danno solo quando il lead li chiede o quando
//      si è capito da dove parte.
//   2) livelli=true — l'offerta vera: i 3 livelli col listino (39/39/59,
//      percorso 99 invece di 137) e la proposta di fissare la sessione.
//      `livello` (base|avanzata|pro) = quello consigliato, va in grassetto.
// Fonte dei contenuti: messaggi-clienti/coaching-notebooklm-livelli.md.
const COACHING_PREZZI = { base: '39 €', avanzata: '39 €', pro: '59 €', percorso: '99 €', percorsoPieno: '137 €' }
const COACHING_LIVELLI = [
  {
    k: 'base',
    breve: 'Base',
    emoji: '🟢',
    nome: 'BASE — «Da zero a operativa»',
    perChi: 'parti da zero con NotebookLM (o l\'hai aperto una volta e chiuso subito)',
    cosa: 'giro completo dell\'ambiente, carichi la tua prima fonte (manuale, dispensa, normativa), impari a interrogarla con le risposte ancorate al documento, generi i primi materiali di studio (riassunti, guida, FAQ, audio ripasso) e li scarichi',
    esci: 'un notebook funzionante sulla tua materia + i primi materiali pronti',
  },
  {
    k: 'avanzata',
    breve: 'Avanzata',
    emoji: '🟡',
    nome: 'AVANZATA — «Da utente a power user»',
    perChi: 'hai già le basi e vuoi il salto di qualità',
    cosa: 'Deep Research come fonte alternativa, personalizzazione degli output prima di generarli, il ciclo report → fonte (il notebook migliora a ogni giro), lavoro multi-fonte (bando + normativa + appunti)',
    esci: 'un notebook che si auto-migliora e output tagliati sul tuo concorso',
  },
  {
    k: 'pro',
    breve: 'Pro',
    emoji: '🔴',
    nome: 'PRO — «Il sistema replicabile»',
    perChi: 'vuoi il metodo completo, quello con cui preparo i materiali per i miei clienti',
    cosa: 'la pipeline da concorso (bando e quiz storici come fonti → contenuti per ogni materia), l\'organizzazione del sistema e il Prompt Pack usato dal vivo sulla tua materia',
    esci: 'un metodo che si replica su tutte le materie — incluso il Prompt Pack (10-15 prompt commentati) e un mini follow-up dopo una settimana',
  },
]

function buildCO({ firstName, livelli, livello }) {
  // --- variante 1: esplorativa, niente prezzi ---
  if (!livelli) {
    const text = `Ciao ${firstName},

grazie per l'interesse sulla coaching NotebookLM: te la spiego in due righe, poi ti chiedo tre cose per tararla su di te.

È una sessione 1:1 online di un'ora, in videochiamata con condivisione schermo. Non è una lezione teorica: si lavora sulla TUA materia di concorso, e alla fine ti porti a casa un notebook funzionante e materiali di studio veri, subito usabili. L'obiettivo è che poi tu sappia rifartelo da sola/o su qualsiasi fonte.

Per capire da dove partire, dimmi:

1) NotebookLM: parti da zero, hai già le basi, o lo usi già e vuoi il salto di qualità?
2) Da che dispositivo lavori di solito? (nota onesta: NotebookLM dà il meglio da computer, col browser — da tablet diverse funzioni sono limitate. Se hai solo il tablet la facciamo lo stesso, tarata su quello.)
3) Che giorni e che fasce orarie ti sono comode?

Con queste tre risposte ti dico esattamente da quale livello conviene partire e ti propongo un paio di date.

${sigText()}`

    const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">grazie per l'interesse sulla <strong>coaching NotebookLM</strong>: te la spiego in due righe, poi ti chiedo tre cose per tararla su di te.</p>
  <p style="margin:0 0 14px;font-size:15px">È una <strong>sessione 1:1 online di un'ora</strong>, in videochiamata con condivisione schermo. Non è una lezione teorica: si lavora sulla <strong>tua materia di concorso</strong>, e alla fine ti porti a casa un notebook funzionante e materiali di studio veri, subito usabili. L'obiettivo è che poi tu sappia rifartelo da sola/o su qualsiasi fonte.</p>
  <p style="margin:0 0 10px;font-size:15px">Per capire da dove partire, dimmi:</p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7">
    <li style="margin:0 0 8px"><strong>NotebookLM</strong>: parti da zero, hai già le basi, o lo usi già e vuoi il salto di qualità?</li>
    <li style="margin:0 0 8px">Da che <strong>dispositivo</strong> lavori di solito? <span style="color:#2a2a2a">(nota onesta: NotebookLM dà il meglio da computer, col browser — da tablet diverse funzioni sono limitate. Se hai solo il tablet la facciamo lo stesso, tarata su quello.)</span></li>
    <li>Che <strong>giorni e fasce orarie</strong> ti sono comode?</li>
  </ol>
  <p style="margin:0 0 4px;font-size:15px">Con queste tre risposte ti dico esattamente da quale livello conviene partire e ti propongo un paio di date.</p>
  ${sigHtml()}`

    return { inner, text, kicker: 'COACHING' }
  }

  // --- variante 2: offerta coi 3 livelli e il listino ---
  const cons = COACHING_LIVELLI.find((l) => l.k === livello) || null
  const consText = cons
    ? `\nNel tuo caso partirei dalla ${cons.breve}: ${cons.perChi}.\n`
    : ''
  const consHtml = cons
    ? `<p style="margin:0 0 14px;font-size:15px">Nel tuo caso partirei dalla <strong>${cons.breve}</strong>: ${cons.perChi}.</p>`
    : ''

  const livText = COACHING_LIVELLI.map((l) => `${l.emoji} ${l.nome} — ${COACHING_PREZZI[l.k]} (1 ora)
Per chi è: ${l.perChi}.
Cosa facciamo: ${l.cosa}.
Te ne esci con: ${l.esci}.`).join('\n\n')

  const livHtml = COACHING_LIVELLI.map((l) => `
  <div style="border:2px solid ${BRAND.ink};padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 8px;font-size:16px;font-weight:700">${l.emoji} ${l.nome} — ${COACHING_PREZZI[l.k]}</p>
    <p style="margin:0 0 6px;font-size:14px;color:#2a2a2a"><strong>Per chi è:</strong> ${l.perChi}.</p>
    <p style="margin:0 0 6px;font-size:14px;color:#2a2a2a"><strong>Cosa facciamo:</strong> ${l.cosa}.</p>
    <p style="margin:0;font-size:14px;color:#2a2a2a"><strong>Te ne esci con:</strong> ${l.esci}.</p>
  </div>`).join('')

  const text = `Ciao ${firstName},

ecco come è organizzata la coaching NotebookLM. Tre livelli da un'ora, ognuno completo in sé: puoi fare solo il primo, fermarti quando vuoi, o partire direttamente da quello che ti serve.

${livText}
${consText}
Percorso completo (tutti e 3 i livelli, 3 ore + materiali): ${COACHING_PREZZI.percorso} invece di ${COACHING_PREZZI.percorsoPieno} — la Base è come se fosse in omaggio.

Si fa su Google Meet con condivisione schermo, e si lavora sul tuo concorso e sulla tua materia, non su esempi finti.

Se ti va, dimmi il livello e due o tre fasce orarie che ti tornano: ti mando il link della videochiamata.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 18px;font-size:15px">ecco come è organizzata la <strong>coaching NotebookLM</strong>. Tre livelli da un'ora, ognuno completo in sé: puoi fare solo il primo, fermarti quando vuoi, o <strong>partire direttamente da quello che ti serve</strong>.</p>
  ${livHtml}
  ${consHtml}
  <p style="background:${BRAND.acid};border:2px solid ${BRAND.ink};padding:12px 16px;font-size:16px;font-weight:700;margin:18px 0">Percorso completo (3 livelli, 3 ore + materiali): ${COACHING_PREZZI.percorso} invece di ${COACHING_PREZZI.percorsoPieno}</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Si fa su <strong>Google Meet</strong> con condivisione schermo, e si lavora sul tuo concorso e sulla tua materia, non su esempi finti.</p>
  <p style="margin:0 0 4px;font-size:15px">Se ti va, dimmi il <strong>livello</strong> e due o tre <strong>fasce orarie</strong> che ti tornano: ti mando il link della videochiamata.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'COACHING' }
}

// ---------------------------------------------------------------------------
// TL — TOOL SU MISURA (form /scrivimi → "Cosa serve: Tool su misura")
// ---------------------------------------------------------------------------
// Qui NON esiste un listino: serve un preventivo vero. La prima mail QUALIFICA
// — spiega le fasi (la Fase 1 è gratuita) e chiede i 4 punti senza i quali un
// preventivo è aria fritta. `range` e `tempi` (testo libero) sono OPZIONALI: si
// passano solo quando lo scope è già chiaro e si vuole dare una fascia
// indicativa. Regola dal template 04: mai un prezzo "tutto compreso al buio".
function buildTL({ firstName, tool, range, tempi }) {
  const cosa = tool
    ? `Ho capito che ti serve ${tool}. Se ho frainteso dimmelo subito, così aggiusto il tiro prima di andare avanti.`
    : `Prima di parlare di numeri voglio capire bene cosa ti serve: un preventivo fatto al buio è un pessimo affare per entrambi.`

  const fasciaText = range
    ? `\nPer un lavoro di questo tipo la fascia indicativa è ${range}${tempi ? `, con tempi di ${tempi}` : ''}. Il numero preciso lo fissiamo alla fine della Fase 1, quando sappiamo esattamente cosa include e cosa no: fino a quel punto non ti chiedo nulla.\n`
    : `\nIl prezzo lo fissiamo alla fine della Fase 1, quando sappiamo esattamente cosa include e cosa no: fino a quel punto non ti chiedo nulla.\n`
  const fasciaHtml = range
    ? `<p style="background:${BRAND.acid};border:2px solid ${BRAND.ink};padding:12px 16px;font-size:16px;font-weight:700;margin:18px 0">Fascia indicativa: ${range}${tempi ? ` · tempi ${tempi}` : ''}</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Il numero preciso lo fissiamo alla fine della Fase 1, quando sappiamo esattamente cosa include e cosa no: fino a quel punto non ti chiedo nulla.</p>`
    : `<p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Il prezzo lo fissiamo alla fine della <strong>Fase 1</strong>, quando sappiamo esattamente cosa include e cosa no: fino a quel punto non ti chiedo nulla.</p>`

  const text = `Ciao ${firstName},

grazie per avermi scritto per un tool su misura.

${cosa}

Come lavoro, per fasi:

1) Scope definitivo — GRATIS. Mettiamo nero su bianco cosa è incluso e cosa no, i dati di partenza e dove va pubblicato.
2) Prototipo navigabile — ti mando un link con la prima versione funzionante: ci clicchi dentro e vedi se la direzione è giusta. Qui le modifiche "forti" non costano.
3) Sviluppo completo — tutte le funzioni concordate, contenuti veri, test su mobile e desktop.
4) Consegna e supporto — link pubblico o pacchetto con le istruzioni, e un mese di supporto incluso.
${fasciaText}
Per prepararti la Fase 1 mi servono quattro risposte:

1) Cosa deve fare il tool e a chi serve (una o due righe bastano).
2) Web o da usare offline? E lo pubblichi tu o me ne occupo io?
3) I contenuti (domande, testi, materiali) li hai già o vanno prodotti?
4) Ci sono scadenze vincolanti — una data di prova, un evento, una consegna?

Rispondi anche solo a queste quattro e ti mando una proposta concreta, con fasi e costi.

${sigText()}`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">grazie per avermi scritto per un <strong>tool su misura</strong>.</p>
  <p style="margin:0 0 16px;font-size:15px">${cosa}</p>
  <p style="margin:0 0 10px;font-size:15px"><strong>Come lavoro, per fasi:</strong></p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7">
    <li style="margin:0 0 8px"><strong>Scope definitivo — gratis.</strong> Mettiamo nero su bianco cosa è incluso e cosa no, i dati di partenza e dove va pubblicato.</li>
    <li style="margin:0 0 8px"><strong>Prototipo navigabile.</strong> Ti mando un link con la prima versione funzionante: ci clicchi dentro e vedi se la direzione è giusta. Qui le modifiche «forti» non costano.</li>
    <li style="margin:0 0 8px"><strong>Sviluppo completo.</strong> Tutte le funzioni concordate, contenuti veri, test su mobile e desktop.</li>
    <li><strong>Consegna e supporto.</strong> Link pubblico o pacchetto con le istruzioni, e <strong>un mese di supporto incluso</strong>.</li>
  </ol>
  ${fasciaHtml}
  <p style="margin:0 0 10px;font-size:15px"><strong>Per prepararti la Fase 1 mi servono quattro risposte:</strong></p>
  <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7">
    <li style="margin:0 0 8px">Cosa deve <strong>fare</strong> il tool e <strong>a chi serve</strong> (una o due righe bastano).</li>
    <li style="margin:0 0 8px"><strong>Web o offline</strong>? E lo pubblichi tu o me ne occupo io?</li>
    <li style="margin:0 0 8px">I <strong>contenuti</strong> (domande, testi, materiali) li hai già o vanno prodotti?</li>
    <li>Ci sono <strong>scadenze vincolanti</strong> — una data di prova, un evento, una consegna?</li>
  </ol>
  <p style="margin:0 0 4px;font-size:15px">Rispondi anche solo a queste quattro e ti mando una proposta concreta, con fasi e costi.</p>
  ${sigHtml()}`

  return { inner, text, kicker: 'TOOL SU MISURA' }
}

// NL — nurture per chi ha chiesto SOLO le credenziali Quiz Pro: invito alla
// newsletter per restare aggiornato + apertura a un'anteprima materia. (Cold)
function buildNL({ firstName }) {
  const site = 'https://ripam-studio-craft.vercel.app'
  const text = `Ciao ${firstName},

hai richiesto le credenziali di RIPAM Studio Quiz Pro — spero ti stiano tornando utili per allenarti con i quiz!

Volevo dirti che oltre al simulatore preparo di continuo nuovi materiali di studio: audio lezioni con supporto visivo, report e manuali sulle materie dei concorsi.

Per non perderti le novità, iscriviti alla newsletter dal form sul sito (basta spuntare la casella della privacy): massimo 2 email al mese, niente spam, e ti disiscrivi con un click quando vuoi. Iscrivendoti ricevi gratis anche le anteprime (podcast + audio con supporto visivo + manuale) delle materie disponibili.

Iscriviti qui: ${site}

E se c'è una materia di cui vuoi subito un'anteprima, rispondi a questa email e te la mando.

A presto,
Francesco — Ripam Studio Craft
Telegram: @fcapurso`

  const inner = `
  <p style="margin:0 0 14px;font-size:15px">Ciao <strong>${firstName}</strong>,</p>
  <p style="margin:0 0 14px;font-size:15px">hai richiesto le credenziali di <strong>RIPAM Studio Quiz Pro</strong> — spero ti stiano tornando utili per allenarti con i quiz!</p>
  <p style="margin:0 0 14px;font-size:15px">Volevo dirti che oltre al simulatore preparo di continuo nuovi materiali di studio: <strong>audio lezioni con supporto visivo, report e manuali</strong> sulle materie dei concorsi.</p>
  <p style="margin:0 0 14px;font-size:14px;color:#2a2a2a">Per non perderti le novità, iscriviti alla <strong>newsletter</strong> dal form sul sito (basta spuntare la casella della privacy): massimo 2 email al mese, niente spam, e ti disiscrivi con un click quando vuoi. Iscrivendoti ricevi gratis anche le <strong>anteprime</strong> (podcast + audio con supporto visivo + manuale) delle materie disponibili.</p>
  <p style="margin:22px 0;text-align:center">${emailButton(site, 'ISCRIVITI ALLA NEWSLETTER')}</p>
  <p style="margin:0 0 4px;font-size:15px">E se c'è una materia di cui vuoi subito un'anteprima, <strong>rispondi a questa email</strong> e te la mando.</p>
  ${sigHtml()}`

  return { inner, text, kicker: '' }
}

// Dispatcher. `category` ∈ {M1,M2,M3,M4,M5,RC,CO,TL,NL}.
//   M1                 → nessun dato extra
//   M2/M3/M4           → slug (per materiaLabel)
//   M3                 → podcast/audio/video/manuale/report (URL anteprime
//                        Drive, uno o più); in alternativa `link` come anteprima
//                        singola generica. Aggiunge il prezzo del completo
//                        (listino PREZZI). NB: podcast ≠ audio lezione.
//   M4                 → link (URL anteprima manuale; se assente → "in arrivo").
//                        Aggiunge il prezzo del manuale completo.
//   M5                 → materia (TESTO LIBERO, non a catalogo) + formats
//                        (sottoinsieme di manuale/audio/video; vuoto → solo
//                        manuale). Niente slug, niente link.
//   RC                 → concorso (chiave report-custom-manifest) → bundle di
//                        anteprime report su misura. `reports` (opzionale) =
//                        sottoinsieme di chiavi report da includere (default:
//                        tutte le disponibili). `prezzo` (opzionale, testo) →
//                        mostra il prezzo del report completo. Niente slug.
//   CO                 → coaching NotebookLM. Default = mail esplorativa senza
//                        prezzi (3 domande di qualificazione). `livelli=true` →
//                        offerta coi 3 livelli e il listino; `livello`
//                        (base|avanzata|pro) = quello consigliato.
//   TL                 → tool su misura: qualificazione a 4 domande + fasi.
//                        `tool` (testo libero) = cosa ha chiesto; `range` e
//                        `tempi` (testo libero, opzionali) = fascia indicativa.
// Ritorna { subject, text, html }. Throw se mancano dati obbligatori.
export function buildLeadEmail({ category, nome, slug, link, podcast, audio, video, manuale, report, materia, formats, concorso, reports, prezzo, livelli, livello, tool, range, tempi, subscribed, originalSubject }) {
  const rawFirst = (nome || '').trim().split(/\s+/)[0] || 'ciao'
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase()
  const materiaLabel = slug ? (MATERIA_LABEL[slug] || slug) : ''

  // RC: risolvo il bundle in anticipo (serve sia al subject sia al composer).
  // Filtro opzionale `reports` = sottoinsieme di chiavi (CSV o array).
  let rcBundle = null
  if (category === 'RC') {
    if (!concorso) throw new Error('RC richiede concorso (chiave report-custom-manifest)')
    // `concorso` = UNA chiave, oppure PIÙ chiavi separate da virgola. Il secondo
    // caso serve a chi clicca più card della vetrina e chiede report di bandi
    // diversi: una mail sola con i link raggruppati per bando.
    const chiavi = String(concorso).split(',').map((s) => s.trim()).filter(Boolean)
    // `reports` filtra le anteprime. Due sintassi:
    //   "key1,key2"                   → filtro globale (mono-bando, storico)
    //   "bando:key1+key2,bando2:key3" → filtro per bando (multi-bando). Serve
    //   perché le chiavi si RIPETONO tra bandi (diritto-amm esiste in 4): un
    //   filtro globale prenderebbe il report sbagliato.
    const perBando = new Map()
    let globale = null
    const rawReports = Array.isArray(reports) ? reports.join(',') : (reports || '')
    for (const voce of String(rawReports).split(',').map((s) => s.trim()).filter(Boolean)) {
      const i = voce.indexOf(':')
      if (i > 0) {
        perBando.set(voce.slice(0, i).trim(), voce.slice(i + 1).split('+').map((s) => s.trim()).filter(Boolean))
      } else {
        if (!globale) globale = []
        globale.push(voce)
      }
    }
    const gruppi = []
    for (const chiave of chiavi) {
      const b = getReportCustomBundle(chiave)
      if (!b) throw new Error(`RC: concorso sconosciuto "${chiave}"`)
      const wanted = perBando.get(chiave) || (chiavi.length === 1 ? globale : null)
      const rs = wanted && wanted.length ? b.reports.filter((r) => wanted.includes(r.key)) : b.reports
      if (!rs.length) {
        throw new Error(`RC: nessuna anteprima disponibile per "${chiave}"${wanted ? ' coi report richiesti ' + wanted.join(',') : ''} (fileId mancanti nel manifest)`)
      }
      gruppi.push({ ...b, reports: rs })
    }
    rcBundle = gruppi.length === 1
      ? gruppi[0]
      : {
          concorso: gruppi.map((g) => g.concorsoShort).join(' · '),
          concorsoShort: `${gruppi.length} concorsi`,
          reports: gruppi.flatMap((g) => g.reports),
          gruppi,
        }
  }

  // Subject: NL è una campagna a sé (fisso); M5/RC senza thread originale usano
  // un oggetto descrittivo; gli altri agganciano il thread con "Re: ...".
  let subject
  if (category === 'NL') {
    subject = 'Resta aggiornato sui nuovi materiali — Ripam Studio Craft'
  } else if (category === 'M5' && !originalSubject) {
    subject = `${materia || 'La materia che cerchi'}: posso crearla su misura — Ripam Studio Craft`
  } else if (category === 'RC' && !originalSubject) {
    const uno = rcBundle.reports.length === 1
    subject = `${uno ? "L'anteprima del report" : 'Le anteprime dei report'} — ${rcBundle.concorsoShort} — Ripam Studio Craft`
  } else if (category === 'CO' && !originalSubject) {
    subject = 'La tua coaching su NotebookLM — Ripam Studio Craft'
  } else if (category === 'TL' && !originalSubject) {
    subject = 'Il tuo tool su misura — Ripam Studio Craft'
  } else {
    subject = replySubject(originalSubject)
  }

  let built
  switch (category) {
    case 'M1':
      built = buildM1({ firstName, subscribed: subscribed === true || subscribed === 'true' })
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
      if (podcast) links.push({ kind: 'podcast', url: podcast })
      if (audio) links.push({ kind: 'audio', url: audio })
      if (video) links.push({ kind: 'video', url: video })
      if (manuale) links.push({ kind: 'manuale', url: manuale })
      if (report) links.push({ kind: 'report', url: report })
      if (!links.length && link) links.push({ kind: 'generic', url: link })
      if (!links.length) throw new Error('M3 richiede almeno un link anteprima (podcast/audio/video/manuale/report o link)')
      built = buildM3({ firstName, materiaLabel, links })
      break
    }
    case 'M4':
      if (!slug) throw new Error('M4 richiede slug materia')
      built = link
        ? buildM4({ firstName, materiaLabel, link })
        : buildM4Pending({ firstName, materiaLabel })
      break
    case 'M5': {
      if (!materia) throw new Error('M5 richiede materia (nome materia, testo libero)')
      const fmts = Array.isArray(formats)
        ? formats
        : (typeof formats === 'string' && formats.trim()
            ? formats.split(',').map((s) => s.trim().toLowerCase())
            : [])
      built = buildM5({ firstName, materia, formats: fmts })
      break
    }
    case 'RC':
      built = buildRC({ firstName, bundle: rcBundle, prezzo: prezzo || null })
      break
    case 'CO': {
      const liv = (livello || '').trim().toLowerCase()
      if (liv && !COACHING_LIVELLI.some((l) => l.k === liv)) {
        throw new Error(`CO: livello sconosciuto "${liv}" (attesi base|avanzata|pro)`)
      }
      built = buildCO({ firstName, livelli: livelli === true || livelli === 'true', livello: liv || null })
      break
    }
    case 'TL':
      built = buildTL({ firstName, tool: tool || null, range: range || null, tempi: tempi || null })
      break
    default:
      throw new Error(`Categoria sconosciuta: ${category} (attese M1|M2|M3|M4|M5|RC|CO|TL|NL)`)
  }

  // `inner`/`kicker` escono insieme all'html gia' incorniciato: servono a chi
  // invia con send_lead.mjs, che il guscio (dark) se lo mette da solo — passargli
  // l'html completo produrrebbe due gusci annidati.
  return { subject, text: built.text, html: emailShell(built.inner, built.kicker), inner: built.inner, kicker: built.kicker }
}
