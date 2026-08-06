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
//   node scripts/telegram_post.mjs --lista        # concorsi con anteprime pronte
//
// Flag:
//   --bando   chiave di report-custom-manifest.js (modo A)
//   --intro   file .txt col messaggio di presentazione (modo A, opzionale)
//   --testo   file .txt col messaggio gia' pronto (modo B)
//   --reply   message_id del messaggio del gruppo a cui rispondere (modo B)
//   --chat    @username o chat_id (default: @ripam3997studio)
//   --pin     fissa il messaggio in alto nel gruppo dopo l'invio
//   --invia   invia davvero (senza, mostra e basta)
//
// ⚠️ SOLO ANTEPRIME: usa i fileId delle anteprime su Drive, gli stessi della
// vetrina. I report completi non si linkano mai in chat.
// ============================================================================
import { readFileSync } from 'node:fs'
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

// ── MODO B: messaggio libero (risposta a una domanda del gruppo) ───────────
const TESTO_FILE = arg('testo')
if (TESTO_FILE) {
  const testo = readFileSync(TESTO_FILE, 'utf8').trim()
  const reply = arg('reply')
  console.log('='.repeat(70))
  console.log(`chat: ${CHAT}${reply ? `  ·  in risposta al messaggio ${reply}` : ''}`)
  console.log(`caratteri: ${testo.length}${testo.length > 4096 ? '  ⚠️ OLTRE IL LIMITE TELEGRAM (4096)' : ''}`)
  console.log('='.repeat(70))
  console.log(testo.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 → $1').replace(/<\/?b>/g, ''))
  console.log('='.repeat(70))
  if (!flag('invia')) { console.log('\n[anteprima] NON inviato. Aggiungi --invia per pubblicare.'); process.exit(0) }
  if (!TOKEN) { console.error('\n[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }
  if (testo.length > 4096) { console.error('\n[FAIL] messaggio troppo lungo per Telegram'); process.exit(1) }
  const rr = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT, text: testo, parse_mode: 'HTML', disable_web_page_preview: true,
      ...(reply ? { reply_to_message_id: Number(reply) } : {}),
    }),
  }).then(r => r.json())
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
})
if (!r?.ok) { console.error('\n[FAIL]', r?.description || 'errore sconosciuto'); process.exit(1) }
console.log(`\n[OK] pubblicato — message_id ${r.result.message_id}`)

if (flag('pin')) {
  const p = await api('pinChatMessage', { chat_id: CHAT, message_id: r.result.message_id, disable_notification: true })
  console.log(p?.ok ? '[OK] messaggio fissato in alto' : `[warn] pin non riuscito: ${p?.description}`)
}
