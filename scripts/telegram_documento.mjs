#!/usr/bin/env node
// ============================================================================
// Manda via bot Telegram un messaggio di testo e (se serve) un documento — il
// caso tipico: un piano di studio in PDF da girare a un candidato.
//
// ⚠️ Il bot NON può scrivere per primo a una persona: Telegram lo vieta finché
// quella persona non ha avviato il bot. Quindi il default è la chat privata di
// Francesco col bot, e da lì si INOLTRA al destinatario. Stessa scelta di
// telegram_consegna.mjs, che fa la stessa cosa per gli audio.
//
// Semiautomatico: MOSTRA e basta, invia solo con --invia.
//
//   node scripts/telegram_documento.mjs --testo msg.txt --file piano.pdf
//   node scripts/telegram_documento.mjs --testo msg.txt --file piano.pdf --invia
//
// Flag:
//   --testo    file .txt col messaggio (obbligatorio)
//   --file     documento da allegare (opzionale, max 50 MB per la Bot API)
//   --nome     nome visibile del file (default: il nome sul disco)
//   --chat     chat_id destinatario (default: privato di Francesco)
//   --invia    invia davvero
// ============================================================================
import { readFileSync, statSync, existsSync } from 'node:fs'
import { basename } from 'node:path'
import { setDefaultResultOrder } from 'node:dns'

// Windows risolve api.telegram.org prima in IPv6 e il fetch di Node ci si pianta
// sopra (ConnectTimeoutError a 10s) invece di ripiegare su IPv4. Vedi telegram_post.mjs.
setDefaultResultOrder('ipv4first')

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const PRIVATO = '6932784097'          // la chat di Francesco col bot
const CHAT = arg('chat', PRIVATO)
const TESTO = arg('testo')
const FILE = arg('file')
const NOME = arg('nome')
const INVIA = flag('invia')
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const MAX_MB = 50

if (!TOKEN) { console.error('[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }
if (!TESTO || !existsSync(TESTO)) { console.error(`[FAIL] --testo mancante o inesistente: ${TESTO}`); process.exit(1) }
if (FILE && !existsSync(FILE)) { console.error(`[FAIL] --file inesistente: ${FILE}`); process.exit(1) }

const messaggio = readFileSync(TESTO, 'utf8').trim()
const mb = FILE ? statSync(FILE).size / 1048576 : 0
if (mb > MAX_MB) { console.error(`[FAIL] ${mb.toFixed(1)} MB: la Bot API si ferma a ${MAX_MB}`); process.exit(1) }

console.log(`\ndestinatario: chat ${CHAT}${CHAT === PRIVATO ? '  (privato di Francesco → poi inoltra)' : ''}`)
console.log(`testo: ${messaggio.length} caratteri`)
if (FILE) console.log(`documento: ${NOME || basename(FILE)}  (${mb.toFixed(1)} MB)`)
console.log('\n' + '─'.repeat(64) + '\n' + messaggio + '\n' + '─'.repeat(64))

if (!INVIA) { console.log('\n[anteprima] NIENTE inviato. Aggiungi --invia per farlo davvero.\n'); process.exit(0) }

const api = async (metodo, body, isForm = false) => {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: 'POST',
    ...(isForm ? { body } : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
  const j = await r.json()
  if (!j.ok) throw new Error(`${metodo}: ${j.description}`)
  return j.result
}

// Telegram taglia i messaggi oltre i 4096 caratteri: si spezza sui paragrafi,
// non a metà frase.
const pezzi = []
let buf = ''
for (const par of messaggio.split('\n\n')) {
  if ((buf + '\n\n' + par).length > 3900) { pezzi.push(buf); buf = par }
  else buf = buf ? `${buf}\n\n${par}` : par
}
if (buf) pezzi.push(buf)

for (const [i, p] of pezzi.entries()) {
  const m = await api('sendMessage', { chat_id: CHAT, text: p, disable_web_page_preview: true })
  console.log(`[OK] messaggio ${i + 1}/${pezzi.length} — id ${m.message_id}`)
}

if (FILE) {
  const fd = new FormData()
  fd.append('chat_id', CHAT)
  fd.append('document', new Blob([readFileSync(FILE)]), NOME || basename(FILE))
  const d = await api('sendDocument', fd, true)
  console.log(`[OK] documento inviato — id ${d.message_id}`)
}
console.log('\nFatto. Ora inoltra i messaggi al destinatario dalla tua chat.\n')
