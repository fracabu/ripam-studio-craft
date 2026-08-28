#!/usr/bin/env node
// ============================================================================
// Consegna una serie di AUDIO LEZIONI via Telegram: un messaggio di intro e poi
// gli episodi, in ordine, come file audio ascoltabili in chat.
//
// Nasce il 24/08/2026 per la consegna a un cliente pagante. Il bot NON puo'
// scrivere per primo a una persona (Telegram lo vieta): quindi il pacchetto si
// manda alla chat privata di Francesco col bot, e Francesco lo INOLTRA al
// cliente quando la chat con lui e' aperta. Il default e' proprio quello.
//
// Semiautomatico come telegram_post.mjs / send_lead.mjs: MOSTRA e basta, invia
// solo con --invia. Qui in piu' c'e' un motivo pratico: sono ~1,2 GB di upload.
//
//   node scripts/telegram_consegna.mjs --materia ORGANIZZAZIONE_MIC            # mostra
//   node scripts/telegram_consegna.mjs --materia ORGANIZZAZIONE_MIC --invia
//   node scripts/telegram_consegna.mjs --materia A,B,C,D --invia               # in fila
//
// Flag:
//   --materia   nome cartella senza _NB (es. ORGANIZZAZIONE_MIC), anche a virgole
//   --ep        SOLO questi episodi (es. --ep 1) invece della serie intera: e' il
//               caso dell'anteprima gratuita a un lead. Usare anche --intro.
//   --titolo    etichetta leggibile della serie (default: dedotta dal nome)
//   --intro     file .txt col messaggio di presentazione (default: generato)
//   --chat      chat_id destinatario (default: privato di Francesco col bot)
//   --radice    cartella madre delle materie (default: D:\BACKUP-DOWNLOAD-FOLDER-30-4-26)
//   --invia     invia davvero
//
// ⚠️ Bot API: massimo 50 MB per file in upload. Gli episodi stanno sui 32-45 MB,
// ma se una serie sfora lo script lo dice PRIMA di iniziare, non a meta' strada.
// ============================================================================
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'

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

const PRIVATO = '6932784097'                 // la chat di Francesco col bot
const CHAT = arg('chat', PRIVATO)
const RADICE = arg('radice', 'D:\\BACKUP-DOWNLOAD-FOLDER-30-4-26')
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const INVIA = flag('invia')
const MAX_MB = 50

if (!TOKEN) { console.error('[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }

const MATERIE = (arg('materia') || '').split(',').map(s => s.trim()).filter(Boolean)
if (!MATERIE.length) {
  console.error('Uso: node scripts/telegram_consegna.mjs --materia ORGANIZZAZIONE_MIC [--invia]')
  process.exit(1)
}

// --ep 1  oppure  --ep 1,2 : manda SOLO quegli episodi invece della serie intera.
// Serve per l'anteprima gratuita a un lead ("senti com'e' fatta, questa e' la
// prima lezione") senza consegnare il prodotto pagato. Con un solo episodio
// l'intro di default ("serie completa") non ha senso: passa anche --intro FILE.
const SOLO_EP = (arg('ep') || '').split(',').map(s => s.trim()).filter(Boolean)

// Il titolo leggibile. Dedurlo dal nome cartella da' risultati meccanici
// ("Sicurezza Lavoro"): per le serie che consegniamo davvero il nome giusto sta
// qui. Il fallback resta per le materie non ancora censite.
const ETICHETTE = {
  ORGANIZZAZIONE_MIC: 'Organizzazione del MIC',
  PATRIMONIO_CULTURALE: 'Patrimonio culturale',
  SICUREZZA_LAVORO: 'Sicurezza sul lavoro',
  MARKETING_COMUNICAZIONE: 'Marketing e comunicazione',
}
const titoloDi = (m) => arg('titolo') || ETICHETTE[m] || m.replace(/_/g, ' ').toLowerCase()
  .replace(/\b\w/g, c => c.toUpperCase()).replace(/Mic\b/, 'MIC')

// Dal nome file "EP03_Dal centro al territorio, Soprintendenze.mp3" al titolo
// che si legge in chat: "EP03 — Dal centro al territorio, Soprintendenze".
const titoloEpisodio = (f) => basename(f, '.mp3')
  .replace(/^EP(\d+)[_ ]*/, 'EP$1 — ')
  .replace(/_/g, ' ')
  .trim()

const cartellaAudio = (m) => join(RADICE, `${m}_NB`, 'audio_lezioni', 'audio')

const episodiDi = (m) => {
  const dir = cartellaAudio(m)
  if (!existsSync(dir)) return null
  return readdirSync(dir).filter(f => f.toLowerCase().endsWith('.mp3')).sort()
    .map(f => ({ file: join(dir, f), nome: f, mb: statSync(join(dir, f)).size / 1048576 }))
}

const introDi = (m, eps) => {
  const f = arg('intro')
  if (f) return readFileSync(f, 'utf8').trim()
  const ultimo = eps[eps.length - 1]?.nome || ''
  const chiusura = /trabocchetti|ripasso|simulazione/i.test(ultimo)
    ? `\n\nL'ultima puntata è quella dei trabocchetti e della simulazione finale: tienila per ultima davvero, è quella che ti dice cosa hai fissato e cosa no.`
    : ''
  return `🎧 <b>${titoloDi(m)}</b> — ${eps.length} lezioni\n\n` +
    `Ecco la serie completa. Gli episodi sono in ordine: ascoltali dal primo all'ultimo, ` +
    `si scaricano sul telefono e restano tuoi anche senza connessione.${chiusura}\n\n` +
    `<i>Materiale realizzato con l'ausilio dell'AI e verificato sulle fonti: se senti un errore scrivimelo, ` +
    `lo correggo e ti rimando la lezione sistemata.</i>`
}

const api = async (metodo, body) => {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  const j = await r.json()
  if (!j.ok) throw new Error(`${metodo}: ${j.description}`)
  return j.result
}

const inviaAudio = async (ep, serie) => {
  const fd = new FormData()
  fd.append('chat_id', CHAT)
  fd.append('audio', new Blob([readFileSync(ep.file)]), ep.nome)
  fd.append('title', titoloEpisodio(ep.nome))
  fd.append('performer', `Ripam Studio Craft · ${serie}`)
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendAudio`, { method: 'POST', body: fd })
  const j = await r.json()
  if (!j.ok) throw new Error(`sendAudio ${ep.nome}: ${j.description}`)
  return j.result
}

// --- ricognizione PRIMA di toccare la rete -----------------------------------
const piano = []
for (const m of MATERIE) {
  let eps = episodiDi(m)
  if (!eps) { console.error(`[FAIL] cartella non trovata: ${cartellaAudio(m)}`); process.exit(1) }
  if (!eps.length) { console.error(`[FAIL] nessun mp3 in ${cartellaAudio(m)}`); process.exit(1) }
  if (SOLO_EP.length) {
    // niente \b in coda: il nome file e' "EP01_La Patria…" e l'underscore e' un
    // carattere di parola, quindi tra "1" e "_" un confine non c'e'.
    const scelti = eps.filter(e => SOLO_EP.some(n => new RegExp(`^EP0*${n}(?![0-9])`, 'i').test(e.nome)))
    if (!scelti.length) {
      console.error(`[FAIL] ${m}: nessun episodio ${SOLO_EP.join(',')} tra i ${eps.length} disponibili:`)
      for (const e of eps) console.error(`       ${e.nome}`)
      process.exit(1)
    }
    eps = scelti
  }
  const sfora = eps.filter(e => e.mb > MAX_MB)
  if (sfora.length) {
    console.error(`[FAIL] ${m}: ${sfora.length} file oltre i ${MAX_MB} MB del limite Bot API:`)
    for (const s of sfora) console.error(`       ${s.nome} — ${s.mb.toFixed(1)} MB`)
    process.exit(1)
  }
  piano.push({ materia: m, titolo: titoloDi(m), eps, intro: introDi(m, eps) })
}

const totMB = piano.reduce((s, p) => s + p.eps.reduce((a, e) => a + e.mb, 0), 0)
console.log(`destinazione: ${CHAT}${CHAT === PRIVATO ? '  (privato di Francesco col bot)' : ''}`)
console.log(`serie: ${piano.length}  ·  episodi: ${piano.reduce((s, p) => s + p.eps.length, 0)}  ·  ${totMB.toFixed(0)} MB in upload`)
console.log(`modo: ${INVIA ? 'INVIO REALE' : 'anteprima (aggiungi --invia per inviare)'}\n`)

for (const p of piano) {
  console.log('─'.repeat(64))
  console.log(p.intro.replace(/<\/?[bi]>/g, '').trim())
  console.log('')
  for (const e of p.eps) console.log(`   ♪ ${titoloEpisodio(e.nome)}   (${e.mb.toFixed(0)} MB)`)
  console.log('')
}

if (!INVIA) { console.log('[anteprima] niente inviato.'); process.exit(0) }

for (const p of piano) {
  console.log(`\n▶ ${p.titolo}`)
  await api('sendMessage', { chat_id: CHAT, text: p.intro, parse_mode: 'HTML', disable_web_page_preview: true })
  let i = 0
  for (const e of p.eps) {
    i++
    process.stdout.write(`   [${i}/${p.eps.length}] ${e.nome.slice(0, 48)}… `)
    await inviaAudio(e, p.titolo)
    console.log('ok')
    await new Promise(s => setTimeout(s, 1500))   // respiro: niente raffiche sulla Bot API
  }
}
console.log(`\n[fatto] ${piano.length} serie consegnate a ${CHAT}.`)
console.log('Ricorda: la consegna via Telegram non si logga da sola — usa scripts/anteprima_log.mjs.')
