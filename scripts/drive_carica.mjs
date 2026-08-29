#!/usr/bin/env node
// ============================================================================
// Carica file qualsiasi su Drive, in una sottocartella, e li apre a chi ha il
// link. Fratello minore di drive_upload.mjs, che invece sa solo di serie
// audio/video sul disco D:.
//
// Nasce il 25/08/2026 per le anteprime dei report: PDF che stanno in
// Downloads/report-rsc/<BANDO>/anteprime/ e devono finire su Drive ANTEPRIME,
// uno per uno condivisi, per poterne mandare il link a un candidato.
//
//   node scripts/drive_carica.mjs --da <cartella> --in <nomeSottocartella>
//   node scripts/drive_carica.mjs --da <cartella> --in mic-1800-vigilanza --carica
//   node scripts/drive_carica.mjs --da <cartella> --in x --carica --json
//
// Flag:
//   --da        cartella locale con i file da caricare (obbligatorio)
//   --in        nome della sottocartella su Drive (creata se non c'e')
//   --dentro    id della cartella madre (default: ANTEPRIME/report-custom)
//   --ext       estensione da caricare (default .pdf)
//   --carica    esegue davvero (senza, mostra e basta)
//   --privato   NON apre a "chiunque abbia il link" (materiale a pagamento:
//               l'accesso si da' poi per nome con drive_condividi.mjs)
//   --json      stampa alla fine la mappa file -> fileId (per i manifest)
//
// IDEMPOTENTE: se un file con lo stesso nome e la stessa dimensione c'e' gia',
// viene saltato. Se c'e' con dimensione diversa, viene SOSTITUITO in-place
// (stesso fileId, cosi' i link gia' mandati restano validi — vedi
// drive_sostituisci.mjs).
// ============================================================================
import { readFileSync, statSync, readdirSync, existsSync, createReadStream } from 'node:fs'
import { basename, join } from 'node:path'
import { accessToken } from './drive_token.mjs'

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const DA = arg('da')
const IN = arg('in')
// ANTEPRIME/report-custom: la cartella pubblica da cui si pescano i link.
const DENTRO = arg('dentro', '1ry6xwRZk6MdTbN3fCWkXIsUF5PbWxJHY')
const EXT = (arg('ext', '.pdf') || '').toLowerCase()
const CARICA = flag('carica')
const JSON_OUT = flag('json')
const PRIVATO = flag('privato')

if (!DA || !existsSync(DA)) { console.error(`[FAIL] --da <cartella> mancante o inesistente: ${DA}`); process.exit(1) }
if (!IN) { console.error('[FAIL] --in <nome sottocartella su Drive> e\' obbligatorio'); process.exit(1) }

const api = async (path, opts = {}) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...opts,
    headers: { authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path}: ${j?.error?.message || r.statusText}`)
  return j
}

const cerca = async (q) =>
  (await api(`files?q=${encodeURIComponent(q)}&fields=files(id,name,size)&pageSize=200`)).files || []

const cartella = async (nome, parent) => {
  const t = await cerca(
    `name='${nome.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  if (t.length) return t[0].id
  if (!CARICA) return null
  const n = await api('files?fields=id', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: nome, parents: [parent], mimeType: 'application/vnd.google-apps.folder' }),
  })
  return n.id
}

const upload = async (file, nome, parent, fileIdEsistente = null) => {
  const size = statSync(file).size
  const url = fileIdEsistente
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileIdEsistente}?uploadType=resumable`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable'
  const r = await fetch(url, {
    method: fileIdEsistente ? 'PATCH' : 'POST',
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(fileIdEsistente ? {} : { name: nome, parents: [parent] }),
  })
  if (!r.ok) throw new Error(`avvio ${nome}: ${r.status} ${await r.text()}`)
  const put = await fetch(r.headers.get('location'), {
    method: 'PUT', headers: { 'content-length': String(size) },
    body: createReadStream(file), duplex: 'half',
  })
  if (!put.ok) throw new Error(`upload ${nome}: ${put.status} ${await put.text()}`)
  return put.json()
}

const condividi = async (id) => {
  // Sul materiale comprato il link pubblico non deve esistere nemmeno per un
  // minuto: si carica privato e si da' accesso nominale a chi ha pagato.
  if (PRIVATO) return
  try {
    await api(`files/${id}/permissions`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    })
  } catch (e) {
    if (!/already|duplicate/i.test(e.message)) throw e
  }
}

const files = readdirSync(DA).filter(f => f.toLowerCase().endsWith(EXT)).sort()
if (!files.length) { console.error(`[FAIL] nessun file ${EXT} in ${DA}`); process.exit(1) }

console.log(`\n${files.length} file da ${DA}`)
console.log(`destinazione Drive: <madre ${DENTRO}> / ${IN}\n`)

const dest = await cartella(IN, DENTRO)
if (!dest && !CARICA) {
  console.log(`[anteprima] la sottocartella "${IN}" NON esiste ancora: verrebbe creata.`)
}

const gia = dest ? await cerca(`'${dest}' in parents and trashed=false`) : []
const mappa = {}

for (const f of files) {
  const percorso = join(DA, f)
  const size = statSync(percorso).size
  const esistente = gia.find(x => x.name === f)

  if (esistente && String(esistente.size) === String(size)) {
    console.log(`[=]  ${f}  gia' su Drive, identico`)
    mappa[f] = esistente.id
    if (CARICA) await condividi(esistente.id)
    continue
  }
  if (!CARICA) {
    console.log(`[ ]  ${f}  ${(size / 1024).toFixed(0)} KB  ${esistente ? '(SOSTITUIREBBE la versione su Drive)' : '(nuovo)'}`)
    continue
  }
  const res = await upload(percorso, f, dest, esistente ? esistente.id : null)
  await condividi(res.id)
  mappa[f] = res.id
  console.log(`[OK] ${f}  ->  https://drive.google.com/file/d/${res.id}/view${esistente ? '  (sostituito)' : ''}`)
}

if (!CARICA) {
  console.log('\n[anteprima] NIENTE caricato. Aggiungi --carica per farlo davvero.')
} else {
  console.log(`\nFatto: ${Object.keys(mappa).length} file su Drive, ${PRIVATO ? 'PRIVATI (nessun link pubblico)' : 'condivisi con "chiunque abbia il link"'}.`)
  if (JSON_OUT) console.log('\n' + JSON.stringify(mappa, null, 2))
}
