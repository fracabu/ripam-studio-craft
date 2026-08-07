// ============================================================================
// BOT TELEGRAM — @ripam3997studio (gruppo "RIPAM 3997 Studio", ~1.800 membri)
//
// Vive come WEBHOOK su Vercel, non come processo in polling: il gruppo ha
// bisogno di risposte anche di notte e a PC spento.
//
// COSA FA
//   /bandi            elenco dei concorsi per cui esistono materiali
//   /report [bando]   link alle ANTEPRIME dei report (PDF su Drive)
//   /bando <testo>    scheda informativa del concorso, dal wiki interno
//   /anteprime        come si chiede un'anteprima
//   /help  /start     istruzioni
//   + antispam base sui messaggi di chi non e' amministratore
//
// TRE REGOLE NON NEGOZIABILI
//  1. SOLO ANTEPRIME. Il bot non pubblica mai link ai report completi: i
//     fileId che usa sono quelli delle anteprime su Drive (le stesse della
//     vetrina). I materiali completi si vendono, non si linkano in chat.
//  2. NIENTE INVENZIONI SUI BANDI. Le informazioni vengono da
//     src/data/bandi-index.json, estratto dal wiki. Se un dato non c'e', il
//     bot dice che non ce l'ha e rimanda a inPA. Mai colmare i buchi a
//     intuito: e' la regola d'oro del wiki.
//  3. SOLO SU COMANDO. In un gruppo da 1.800 persone un bot che interviene
//     sulle parole chiave e' rumore. Risponde ai comandi e basta.
//
// SETUP (una volta):
//   1. @BotFather -> /newbot -> token
//   2. su Vercel: TELEGRAM_BOT_TOKEN e TELEGRAM_WEBHOOK_SECRET
//   3. registrare il webhook:
//      curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<dominio>/api/telegram/webhook&secret_token=<SECRET>"
//   4. aggiungere il bot al gruppo come AMMINISTRATORE (serve per cancellare
//      lo spam) e, in @BotFather, /setprivacy -> Disable solo se si vuole che
//      legga tutti i messaggi per l'antispam.
// ============================================================================
import { REPORT_CUSTOM_MANIFEST } from '../_lib/report-custom-manifest.js'
import { BANDI_INDEX as INDICE } from '../../src/data/bandi-index.js'
import { salvaMessaggio } from '../_lib/telegram-log.js'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET
const SITO = 'https://ripam-studio-craft.vercel.app'
const BANDO_DEFAULT = 'ripam-3997-amm'   // il gruppo e' dedicato al 3997

// ⚠️ BOT PRIVATO (scelta del 06/08/2026).
// Un bot Telegram e' pubblico per natura: chiunque conosca lo username puo'
// scrivergli, e tutti i 1.814 membri del gruppo potrebbero usarne i comandi.
// Se il bot consegnasse le anteprime a chiunque, spariRebbe il passaggio dal
// form /scrivimi — che e' il punto in cui una persona diventa un contatto con
// nome, email e concorso. Il blast del 06/08 ha prodotto 12 richieste proprio
// per quello.
// Quindi: risponde SOLO agli id autorizzati. A tutti gli altri non replica —
// il silenzio e' preferibile a un "non sei autorizzato" letto da mille persone.
// Per aprirlo in futuro basta togliere il controllo o allargare la lista.
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || '6932784097')
  .split(',').map(s => s.trim()).filter(Boolean)
const autorizzato = (userId) => ADMIN_IDS.includes(String(userId))

const api = (metodo, body) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json()).catch(() => null)

const rispondi = (chatId, testo, replyTo) =>
  api('sendMessage', {
    chat_id: chatId, text: testo, parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(replyTo ? { reply_to_message_id: replyTo } : {}),
  })

// ── Catalogo materiali: nomi leggibili per le chiavi del manifest ───────────
const NOMI = {
  'ripam-3997-amm': 'RIPAM 3.997 Assistenti — profilo AMM',
  'ripam-1340-amm': 'RIPAM 1.340 Funzionari — profilo AMM',
  'ripam-1340-com': 'RIPAM 1.340 Funzionari — profilo Comunicazione',
  'inps-1695-pecs': 'INPS 1.695 Funzionari PECS',
  'inps-499-assist-inf': 'INPS 499 Assistenti informatici',
  'ade-622-gest': 'Agenzia Entrate 622 Assistenti gestionali',
  'cpi-sicilia-sac': 'CPI Regione Sicilia — profilo SAC',
  'cerveteri-istruttore-amm': 'Comune di Cerveteri — Istruttore amministrativo',
}
const SINONIMI = {
  '3997': 'ripam-3997-amm', 'ripam': 'ripam-3997-amm', 'assistenti': 'ripam-3997-amm',
  '1340': 'ripam-1340-amm', 'funzionari': 'ripam-1340-amm',
  'com': 'ripam-1340-com', 'comunicazione': 'ripam-1340-com',
  'pecs': 'inps-1695-pecs', '1695': 'inps-1695-pecs',
  '499': 'inps-499-assist-inf', 'informatici': 'inps-499-assist-inf', 'informatico': 'inps-499-assist-inf',
  '622': 'ade-622-gest', 'entrate': 'ade-622-gest', 'ade': 'ade-622-gest',
  'cpi': 'cpi-sicilia-sac', 'sicilia': 'cpi-sicilia-sac',
  'cerveteri': 'cerveteri-istruttore-amm',
}

const chiaveDa = (testo) => {
  const t = (testo || '').toLowerCase()
  if (!t.trim()) return null
  for (const k of Object.keys(REPORT_CUSTOM_MANIFEST)) if (t.includes(k)) return k
  for (const [s, k] of Object.entries(SINONIMI)) if (new RegExp(`\\b${s}\\b`).test(t)) return k
  return null
}

// ── Stato del bando: la scadenza a wiki puo' essere gia' passata ────────────
// Dire "aperto" per un bando scaduto e' un danno per chi legge: si ricalcola.
const statoReale = (b) => {
  if (b.scadenza && !b.scadenza_da_verificare) {
    const d = new Date(b.scadenza)
    if (!isNaN(d) && d < new Date()) return `domande chiuse (scadenza ${b.scadenza})`
  }
  return b.stato || 'da verificare'
}

const cercaBando = (testo) => {
  const t = (testo || '').toLowerCase().trim()
  if (!t) return null
  const parole = t.split(/\s+/).filter(p => p.length > 2)
  let migliore = null, punti = 0
  for (const b of INDICE.bandi) {
    const fieno = `${b.slug} ${b.titolo || ''} ${b.ente || ''} ${b.profilo || ''}`.toLowerCase()
    let p = 0
    for (const w of parole) if (fieno.includes(w)) p += w.length
    const num = t.match(/\b(\d{2,4})\b/)
    if (num && String(b.posti) === num[1]) p += 30
    if (p > punti) { punti = p; migliore = b }
  }
  return punti >= 5 ? migliore : null
}

// ── Testi ──────────────────────────────────────────────────────────────────
const HELP = `<b>Cosa posso fare</b>

/bandi — i concorsi per cui esistono materiali
/report [concorso] — le <b>anteprime</b> dei report (PDF)
/bando [nome o numero] — scheda del concorso: posti, titolo di studio, prove, scadenza
/anteprime — come funzionano

Esempi:
<code>/report 3997</code>  ·  <code>/report 499</code>  ·  <code>/bando mic 1800</code>

Le anteprime sono gratuite. Per tutto il resto scrivi a Francesco: ${SITO}/scrivimi`

const testoReport = (chiave) => {
  const c = REPORT_CUSTOM_MANIFEST[chiave]
  if (!c) return null
  const righe = c.reports
    .filter(r => r.fileId)
    .map(r => `📄 <a href="https://drive.google.com/file/d/${r.fileId}/view">${r.label.split('(')[0].split('—')[0].trim()}</a>`)
  if (!righe.length) return `Per <b>${NOMI[chiave] || chiave}</b> le anteprime non sono ancora online. Scrivi a Francesco e te le manda: ${SITO}/scrivimi`
  return `<b>${NOMI[chiave] || chiave}</b>\nAnteprime gratuite — le prime pagine di ogni report:\n\n${righe.join('\n')}\n\n` +
    `Vetrina completa: ${SITO}/report-custom`
}

const testoBando = (b) => {
  const r = [`<b>${b.titolo || b.slug}</b>`]
  if (b.ente) r.push(`Ente: ${b.ente}`)
  if (b.posti) r.push(`Posti: <b>${b.posti}</b>`)
  if (b.profilo) r.push(`Profilo: ${b.profilo}`)
  if (b.titolo_studio) r.push(`\n🎓 <b>Titolo di studio</b>: ${b.titolo_studio}`)
  if (b.prove?.length) r.push(`📝 Prove: ${b.prove.join(', ')}`)
  r.push(`📌 Stato: ${statoReale(b)}`)
  if (b.scadenza_da_verificare) r.push(`⚠️ La data a nostra disposizione è incompleta: verifica su inPA.`)
  r.push(`\n<i>Dati dal nostro archivio, aggiornati al ${b.aggiornato || INDICE.generato_il}. Fa fede sempre il bando ufficiale su inPA.</i>`)
  return r.join('\n')
}

// ── Antispam: solo lo spam evidente, per non colpire i candidati ───────────
const SPAM = [
  /\b(?:crypto|bitcoin|forex|trading|investiment[oi])\b.{0,60}\b(?:guadagn|profitt|rendite?)\b/i,
  /\bguadagn\w+\s+\d+\s*(?:€|euro|\$)/i,
  /\b(?:vendo|cerco)\s+(?:account|iscritt|follower)/i,
  /https?:\/\/t\.me\/\+/i,                 // inviti a gruppi esterni
  /\b(?:onlyfans|casin[oò]|scommess)\b/i,
]
const eSpam = (t) => !!t && SPAM.some(re => re.test(t))

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' })
  // Confronto con trim: un valore incollato nella dashboard di Vercel si porta
  // dietro con facilita' spazi o un ritorno a capo, e il segreto non
  // combacerebbe piu' — sintomo: Telegram riceve 401 e riprova all'infinito.
  const segretoAtteso = (SECRET || '').trim()
  const segretoRicevuto = (req.headers['x-telegram-bot-api-secret-token'] || '').trim()
  if (segretoAtteso && segretoRicevuto !== segretoAtteso) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  if (!TOKEN) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN mancante' })

  const msg = req.body?.message || req.body?.edited_message
  if (!msg) return res.status(200).json({ ok: true })

  const chatId = msg.chat?.id
  const testo = (msg.text || msg.caption || '').trim()
  const inGruppo = msg.chat?.type === 'group' || msg.chat?.type === 'supergroup'

  // 0) MEMORIA, prima di ogni filtro. Il bot deve ricordare cosa dice il
  // GRUPPO, non cosa dice Francesco: se il salvataggio stesse dopo il gate
  // degli autorizzati, il buffer conterrebbe solo i comandi di chi lo comanda,
  // e "rispondi ad Anna" resterebbe impossibile. Best-effort per costruzione:
  // un errore qui accorcia la memoria, un'eccezione ucciderebbe il webhook e
  // Telegram ritenterebbe l'update all'infinito.
  if (inGruppo) await salvaMessaggio(msg)

  // 0-bis) BOT PRIVATO: a chi non e' autorizzato non si risponde e basta.
  // Nessun messaggio di rifiuto: nel gruppo verrebbe letto da tutti e farebbe
  // una figura peggiore del silenzio. Si risponde 200 perche' l'update e'
  // stato ricevuto correttamente: e' la risposta che manca, non la consegna.
  if (!autorizzato(msg.from?.id)) {
    return res.status(200).json({ ok: true, azione: 'ignorato (bot privato)' })
  }

  // 1) antispam nei gruppi (oggi inattivo di fatto: con il bot privato gli
  //    altri messaggi non arrivano nemmeno fin qui. Resta pronto per quando
  //    il bot verra' aperto e promosso ad amministratore).
  if (inGruppo && eSpam(testo)) {
    const m = await api('getChatMember', { chat_id: chatId, user_id: msg.from?.id })
    const ruolo = m?.result?.status
    if (ruolo !== 'creator' && ruolo !== 'administrator') {
      await api('deleteMessage', { chat_id: chatId, message_id: msg.message_id })
      return res.status(200).json({ ok: true, azione: 'spam rimosso' })
    }
  }

  // 2) solo comandi espliciti
  const cmd = testo.match(/^\/([a-z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/i)
  if (!cmd) return res.status(200).json({ ok: true })

  const nome = cmd[1].toLowerCase()
  const arg = (cmd[2] || '').trim()

  if (nome === 'start' || nome === 'help' || nome === 'aiuto') {
    await rispondi(chatId, HELP, msg.message_id)
  } else if (nome === 'bandi') {
    // La scorciatoia va scelta a mano: dedurla dalla chiave dava lo STESSO
    // comando ai due profili del 1340 (AMM e COM), rendendo il secondo
    // irraggiungibile.
    const SCORCIATOIE = {
      'ripam-3997-amm': '3997', 'ripam-1340-amm': '1340', 'ripam-1340-com': 'com',
      'inps-1695-pecs': 'pecs', 'inps-499-assist-inf': '499', 'ade-622-gest': '622',
      'cpi-sicilia-sac': 'sicilia', 'cerveteri-istruttore-amm': 'cerveteri',
    }
    const righe = Object.keys(REPORT_CUSTOM_MANIFEST)
      .map(k => `• <b>${NOMI[k] || k}</b> — <code>/report ${SCORCIATOIE[k] || k}</code>`)
    await rispondi(chatId, `<b>Concorsi con materiali pronti</b>\n\n${righe.join('\n')}\n\nVetrina: ${SITO}/report-custom`, msg.message_id)
  } else if (nome === 'report' || nome === 'anteprima') {
    const k = chiaveDa(arg) || (arg ? null : BANDO_DEFAULT)
    if (!k) {
      await rispondi(chatId, `Non ho capito quale concorso. Prova <code>/bandi</code> per l'elenco, oppure <code>/report 3997</code>.`, msg.message_id)
    } else {
      await rispondi(chatId, testoReport(k), msg.message_id)
    }
  } else if (nome === 'bando') {
    const b = cercaBando(arg)
    if (!arg) await rispondi(chatId, `Scrivi anche quale: <code>/bando mic 1800</code>, <code>/bando inps 499</code>.`, msg.message_id)
    else if (!b) await rispondi(chatId, `Non ho una scheda per «${arg}». Verifica su inPA, oppure scrivi a Francesco: ${SITO}/scrivimi`, msg.message_id)
    else await rispondi(chatId, testoBando(b), msg.message_id)
  } else if (nome === 'anteprime') {
    await rispondi(chatId,
      `Le <b>anteprime</b> sono le prime pagine dei report, in chiaro e gratuite: servono a farti vedere com'è fatto il materiale prima di decidere qualsiasi cosa.\n\n` +
      `Qui in chat: <code>/report 3997</code> (o il tuo concorso).\nSul sito: ${SITO}/report-custom\n\n` +
      `Per i materiali completi, un piano di studio su misura o un preventivo: ${SITO}/scrivimi`, msg.message_id)
  }

  return res.status(200).json({ ok: true })
}
