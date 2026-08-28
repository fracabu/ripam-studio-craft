#!/usr/bin/env node
// ============================================================================
// Sostituisce il CONTENUTO di un file gia' su Drive con quello di un file
// locale, tenendo lo stesso fileId.
//
// Nasce il 24/08/2026: su Drive c'era la versione con errori dell'EP01 di
// Diritto Amministrativo, gia' linkata a mezza lista dal drip di giugno.
// Caricare il file corretto come file NUOVO avrebbe voluto dire un secondo
// link da rimandare a tutti; sostituendo il contenuto in-place, ogni link gia'
// distribuito punta da subito alla versione giusta.
//
//   node scripts/drive_sostituisci.mjs --id <fileId> --file <percorso locale>
//   node scripts/drive_sostituisci.mjs --id <fileId> --file <percorso> --sostituisci
//
// Flag:
//   --id            fileId Drive da aggiornare (obbligatorio)
//   --file          file locale corretto (obbligatorio)
//   --sostituisci   esegue davvero (senza, mostra il confronto e basta)
//   --nome          rinomina anche il file su Drive (default: lascia il nome)
//
// ⚠️ L'operazione NON e' reversibile dal codice: Drive tiene la vecchia
// versione nella cronologia del file, ma recuperarla e' un'azione manuale.
// Per questo il default e' la sola anteprima e serve --sostituisci esplicito.
// ============================================================================
import { statSync, existsSync, createReadStream } from 'node:fs'
import { basename } from 'node:path'
import { accessToken } from './drive_token.mjs'

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const ID = arg('id')
const FILE = arg('file')
const NOME = arg('nome')
const ESEGUI = flag('sostituisci')

if (!ID || !FILE) {
  console.error('Uso: node scripts/drive_sostituisci.mjs --id <fileId> --file <percorso> [--sostituisci]')
  process.exit(1)
}
if (!existsSync(FILE)) { console.error(`[FAIL] file locale non trovato: ${FILE}`); process.exit(1) }

const MB = (n) => `${(Number(n) / 1048576).toFixed(1)} MB`

const api = async (path, opts = {}) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...opts,
    headers: { authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path}: ${j?.error?.message || r.statusText}`)
  return j
}

// --- confronto: cosa c'e' adesso su Drive vs cosa ci mettiamo ----------------
const remoto = await api(`files/${ID}?fields=id,name,size,mimeType,modifiedTime`)
const locale = statSync(FILE)

console.log(`\nSU DRIVE  ${remoto.name}`)
console.log(`          ${MB(remoto.size)} · modificato ${new Date(remoto.modifiedTime).toLocaleString('it-IT')}`)
console.log(`\nLOCALE    ${basename(FILE)}`)
console.log(`          ${MB(locale.size)} · modificato ${locale.mtime.toLocaleString('it-IT')}`)

if (String(remoto.size) === String(locale.size)) {
  console.log(`\n[i] Stessa dimensione al byte: probabilmente e' gia' questo il file. Non faccio nulla.`)
  process.exit(0)
}
if (locale.mtime.getTime() < new Date(remoto.modifiedTime).getTime()) {
  console.log(`\n⚠️  Il file locale e' PIU' VECCHIO di quello su Drive. Controlla di non stare tornando indietro.`)
}

if (!ESEGUI) {
  console.log(`\n[anteprima] NON sostituisco. Rilancia con --sostituisci per farlo davvero.`)
  process.exit(0)
}

// --- upload resumable in PATCH: stesso fileId, contenuto nuovo ---------------
const meta = NOME ? { name: NOME } : {}
const avvio = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${ID}?uploadType=resumable`, {
  method: 'PATCH',
  headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(meta),
})
if (!avvio.ok) { console.error(`[FAIL] avvio: ${avvio.status} ${await avvio.text()}`); process.exit(1) }

const loc = avvio.headers.get('location')
const put = await fetch(loc, {
  method: 'PUT',
  headers: { 'content-length': String(locale.size) },
  body: createReadStream(FILE),
  duplex: 'half',
})
if (!put.ok) { console.error(`[FAIL] upload: ${put.status} ${await put.text()}`); process.exit(1) }

const dopo = await api(`files/${ID}?fields=id,name,size,modifiedTime`)
console.log(`\n[OK] sostituito — stesso link, contenuto nuovo`)
console.log(`     ${dopo.name}`)
console.log(`     ${MB(dopo.size)} · https://drive.google.com/file/d/${ID}/view`)
