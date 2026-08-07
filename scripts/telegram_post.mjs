#!/usr/bin/env node
// ============================================================================
// Pubblica un messaggio nel gruppo Telegram (RIPAM 3997 Studio, ~1.800 membri)
// con i link alle ANTEPRIME dei report di un concorso.
//
// Semiautomatico per scelta: compone e MOSTRA, invia solo con --invia. Stessa
// disciplina delle mail (vedi scripts/send_lead.mjs): in un gruppo da 1.800
// persone un messaggio sbagliato non si richiama indietro.
//
// DUE MODI D'USO
//
//  A) ANTEPRIME DI UN CONCORSO — "manda a tutti i report dell'INPS PECS"
//     node scripts/telegram_post.mjs --bando inps-1695-pecs                 # mostra
//     node scripts/telegram_post.mjs --bando inps-1695-pecs --intro FILE.txt
//     node scripts/telegram_post.mjs --bando inps-1695-pecs --invia
//
//  B) RISPOSTA LIBERA — "qualcuno ha chiesto del MIC 1800: rispondi tu"
//     La risposta si scrive in un file dopo aver letto il wiki dei bandi,
//     cosi' non si va a memoria (regola d'oro: mai colmare i buchi a intuito).
//     node scripts/telegram_post.mjs --testo risposta.txt
//     node scripts/telegram_post.mjs --testo risposta.txt --reply 4821 --invia
//
//  B-bis) POST CON MEDIA — la stessa scheda che va sulla pagina Facebook,
//     riadattata per il gruppo (infografica o video + caption).
//     node scripts/telegram_post.mjs --testo post.txt --foto grafica.png
//     node scripts/telegram_post.mjs --testo post.txt --video clip.mp4 --invia
//
//   node scripts/telegram_post.mjs --lista        # concorsi con anteprime pronte
//
// Flag:
//   --bando   chiave di report-custom-manifest.js (modo A)
//   --intro   file .txt col messaggio di presentazione (modo A, opzionale)
//   --testo   file .txt col messaggio gia' pronto (modo B)
//   --foto    immagine da allegare al testo (modo B) — diventa la caption
//   --video   video da allegare al testo (modo B) — diventa la caption
//   --reply   message_id del messaggio del gruppo a cui rispondere (modo B)
//   --chat    @username o chat_id (default: @ripam3997studio)
//   --topic   message_thread_id del topic in cui pubblicare (gruppi con Argomenti)
//   --muto    pubblica senza notifica (per il palinsesto ricorrente)
//   --pin     fissa il messaggio in alto nel gruppo dopo l'invio
//   --invia   invia davvero (senza, mostra e basta)
//
// ⚠️ SOLO ANTEPRIME: usa i fileId delle anteprime su Drive, gli stessi della
// vetrina. I report completi non si linkano mai in chat.
// ============================================================================
import { readFileSync, statSync } from 'node:fs'
import { basename } from 'node:path'
import { REPORT_CUSTOM_MANIFEST } from '../api/_lib/report-custom-manifest.js'

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const SITO = 'https://ripam-studio-craft.vercel.app'
const CHAT = arg('chat', '@ripam3997studio')
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
// Topic ("Argomenti") e notifica silenziosa: servono al palinsesto ricorrente.
// Un post di palinsesto sta nel suo topic e non fa squillare 1.814 telefoni;
// un annuncio vero va nel gruppo principale e suona.
const TOPIC = arg('topic')
const MUTO = flag('muto')
const instradamento = () => ({
  ...(TOPIC ? { message_thread_id: Number(TOPIC) } : {}),
  ...(MUTO ? { disable_notification: true } : {}),
})

const NOMI = {
  'ripam-3997-amm': 'RIPAM 3.997 Assistenti — profilo amministrativo',
  'ripam-1340-amm': 'RIPAM 1.340 Funzionari — profilo AMM',
  'ripam-1340-com': 'RIPAM 1.340 Funzionari — profilo Comunicazione',
  'inps-1695-pecs': 'INPS 1.695 Funzionari PECS',
  'inps-499-assist-inf': 'INPS 499 Assistenti informatici',
  'ade-622-gest': 'Agenzia delle Entrate — 622 Assistenti gestionali',
  'cpi-sicilia-sac': 'CPI Regione Sicilia — profilo SAC',
  'cerveteri-istruttore-amm': 'Comune di Cerveteri — Istruttore amministrativo',
}

if (flag('lista')) {
  console.log('Bandi disponibili:\n')
  for (const [k, v] of Object.entries(REPORT_CUSTOM_MANIFEST)) {
    const n = v.reports.filter(r => r.fileId).length
    console.log(`  ${k.padEnd(26)} ${String(n).padStart(2)} anteprime  ${NOMI[k] || ''}`)
  }
  process.exit(0)
}

// ── Media: due limiti diversi da quelli del messaggio di testo ─────────────
// Un messaggio arriva a 4096 caratteri, ma la CAPTION di una foto o di un
// video si ferma a 1024. Telegram conta il testo al netto dei tag HTML (sono
// entita', non caratteri), quindi si misura quello — ma se il grezzo e' molto
// piu' lungo conviene saperlo lo stesso.
// I tetti di upload della Bot API sono 10 MB per le foto e 50 MB per i video:
// oltre, l'invio fallisce e da bot non c'e' modo di aggirarli (serve un
// client utente). Meglio scoprirlo qui che a meta' pubblicazione.
const MEDIA = {
  foto:  { metodo: 'sendPhoto', campo: 'photo', maxMB: 10 },
  video: { metodo: 'sendVideo', campo: 'video', maxMB: 50 },
}
const CAP_TESTO = 4096
const CAP_CAPTION = 1024
const senzaTag = (t) => t.replace(/<[^>]+>/g, '')
const leggibile = (t) => t
  .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 → $1')
  .replace(/<\/?[bi]>/g, '')

// ── MODO B: messaggio libero (risposta a una domanda del gruppo) ───────────
const TESTO_FILE = arg('testo')
if (TESTO_FILE) {
  const testo = readFileSync(TESTO_FILE, 'utf8').trim()
  const reply = arg('reply')
  const tipo = arg('foto') ? 'foto' : arg('video') ? 'video' : null
  const file = tipo ? arg(tipo) : null
  const limite = tipo ? CAP_CAPTION : CAP_TESTO
  const utili = senzaTag(testo).length
  const mb = file ? statSync(file).size / (1024 * 1024) : 0

  console.log('='.repeat(70))
  console.log(`chat: ${CHAT}${TOPIC ? `  ·  topic ${TOPIC}` : ''}${MUTO ? '  ·  senza notifica' : ''}` +
    `${reply ? `  ·  in risposta al messaggio ${reply}` : ''}`)
  if (tipo) console.log(`${tipo}: ${basename(file)} — ${mb.toFixed(2)} MB (max ${MEDIA[tipo].maxMB})`)
  console.log(`caratteri: ${utili}/${limite}${utili > limite ? '  ⚠️ OLTRE IL LIMITE' : ''}` +
    (testo.length !== utili ? `  (${testo.length} col markup)` : ''))
  console.log('='.repeat(70))
  console.log(leggibile(testo))
  console.log('='.repeat(70))

  if (!flag('invia')) { console.log('\n[anteprima] NON inviato. Aggiungi --invia per pubblicare.'); process.exit(0) }
  if (!TOKEN) { console.error('\n[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }
  if (utili > limite) { console.error(`\n[FAIL] ${tipo ? 'caption' : 'messaggio'} troppo lungo (${utili} > ${limite})`); process.exit(1) }
  if (tipo && mb > MEDIA[tipo].maxMB) { console.error(`\n[FAIL] ${tipo} di ${mb.toFixed(2)} MB: la Bot API si ferma a ${MEDIA[tipo].maxMB} MB`); process.exit(1) }

  let rr
  if (tipo) {
    const { metodo, campo } = MEDIA[tipo]
    const fd = new FormData()
    fd.append('chat_id', CHAT)
    fd.append('caption', testo)
    fd.append('parse_mode', 'HTML')
    if (reply) fd.append('reply_to_message_id', String(reply))
    for (const [k, v] of Object.entries(instradamento())) fd.append(k, String(v))
    // Senza supports_streaming Telegram tratta il file come un allegato da
    // scaricare per intero prima di vederlo: su 37 MB e rete mobile significa
    // che quasi nessuno lo guarda.
    if (tipo === 'video') fd.append('supports_streaming', 'true')
    fd.append(campo, new Blob([readFileSync(file)]), basename(file))
    rr = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, { method: 'POST', body: fd }).then(r => r.json())
  } else {
    rr = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT, text: testo, parse_mode: 'HTML', disable_web_page_preview: true,
        ...(reply ? { reply_to_message_id: Number(reply) } : {}),
        ...instradamento(),
      }),
    }).then(r => r.json())
  }
  if (!rr?.ok) { console.error('\n[FAIL]', rr?.description || 'errore sconosciuto'); process.exit(1) }
  console.log(`\n[OK] pubblicato — message_id ${rr.result.message_id}`)
  process.exit(0)
}

// ── MODO A: anteprime di un concorso ───────────────────────────────────────
const BANDO = arg('bando')
if (!BANDO) { console.error('Manca --bando (vedi --lista) oppure --testo FILE.txt'); process.exit(1) }
const conc = REPORT_CUSTOM_MANIFEST[BANDO]
if (!conc) { console.error(`Concorso sconosciuto: ${BANDO} (vedi --lista)`); process.exit(1) }

const reports = conc.reports.filter(r => r.fileId)
if (!reports.length) { console.error(`Nessuna anteprima su Drive per ${BANDO}`); process.exit(1) }

const nomeBando = NOMI[BANDO] || conc.concorsoShort || BANDO

// L'intro si passa da file per poterla curare e rileggere prima di pubblicare.
// Il fallback e' volutamente sobrio: se serve persuasione, si scrive a mano.
const introDefault =
  `📚 <b>${nomeBando}</b>\n\n` +
  `Ho preparato ${reports.length} report di studio, uno per blocco di programma. ` +
  `Qui sotto trovate le <b>anteprime gratuite</b>: le prime pagine di ciascuno, ` +
  `per vedere com'è fatto il materiale prima di decidere qualsiasi cosa.`

const introFile = arg('intro')
const intro = introFile ? readFileSync(introFile, 'utf8').trim() : introDefault

const righe = reports.map(r => {
  const t = r.label.split('(')[0].split('—')[0].trim()
  return `📄 <a href="https://drive.google.com/file/d/${r.fileId}/view">${t}</a>`
})

const messaggio =
  `${intro}\n\n${righe.join('\n')}\n\n` +
  `Tutti i concorsi coperti: ${SITO}/report-custom\n` +
  `Per un piano di studio su misura (gratuito): ${SITO}/scrivimi`

const api = (metodo, body) =>
  fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then(r => r.json())

console.log('='.repeat(70))
console.log(`chat:    ${CHAT}`)
console.log(`bando:   ${BANDO} — ${reports.length} anteprime`)
console.log(`caratteri: ${messaggio.length}${messaggio.length > 4096 ? '  ⚠️ OLTRE IL LIMITE TELEGRAM (4096)' : ''}`)
console.log('='.repeat(70))
console.log(messaggio.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 → $1').replace(/<\/?b>/g, ''))
console.log('='.repeat(70))

if (!flag('invia')) {
  console.log('\n[anteprima] NON inviato. Aggiungi --invia per pubblicare.')
  process.exit(0)
}
if (!TOKEN) { console.error('\n[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }
if (messaggio.length > 4096) { console.error('\n[FAIL] messaggio troppo lungo per Telegram'); process.exit(1) }

const r = await api('sendMessage', {
  chat_id: CHAT, text: messaggio, parse_mode: 'HTML', disable_web_page_preview: true,
  ...instradamento(),
})
if (!r?.ok) { console.error('\n[FAIL]', r?.description || 'errore sconosciuto'); process.exit(1) }
console.log(`\n[OK] pubblicato — message_id ${r.result.message_id}`)

if (flag('pin')) {
  const p = await api('pinChatMessage', { chat_id: CHAT, message_id: r.result.message_id, disable_notification: true })
  console.log(p?.ok ? '[OK] messaggio fissato in alto' : `[warn] pin non riuscito: ${p?.description}`)
}
