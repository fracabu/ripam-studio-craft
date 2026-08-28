#!/usr/bin/env node
// ============================================================================
// Carica su Google Drive le lezioni di una materia, nella cartella di consegna
// giusta, e — se lo chiedi — la apre in sola lettura a chi ha il link.
//
// Nasce il 24/08/2026: su Drive c'erano solo gli AUDIO, i video erano rimasti
// sul disco D: dove li aveva lasciati la produzione. Caricarli a mano dal
// browser e' un'ora di trascinamenti a ogni consegna, e le sottocartelle
// finiscono con nomi diversi ogni volta.
//
//   node scripts/drive_upload.mjs --materia ORGANIZZAZIONE_MIC --tipo video
//   node scripts/drive_upload.mjs --materia ORGANIZZAZIONE_MIC --tipo video --carica
//   node scripts/drive_upload.mjs --materia A,B --tipo video --carica --condividi
//   node scripts/drive_upload.mjs --materia ORGANIZZAZIONE_MIC --tipo audio --carica
//
// Flag:
//   --materia    cartella su D: senza _NB (a virgole per piu' serie)
//   --tipo       video | audio            (default: video)
//   --carica     esegue davvero (senza, mostra e basta)
//   --condividi  dopo il caricamento apre la cartella a "chiunque abbia il link"
//   --radice     cartella madre su D: (default: D:\BACKUP-DOWNLOAD-FOLDER-30-4-26)
//   --consegne   id della cartella Drive che contiene le cartelle materia
//
// IDEMPOTENTE: un file gia' presente su Drive con lo stesso nome e la stessa
// dimensione viene saltato. Rilanciare dopo un'interruzione riprende da dove
// era arrivato invece di duplicare.
//
// ⚠️ Le cartelle materia su Drive stanno dentro una cartella che contiene anche
// le consegne di ALTRI clienti: qui si condivide sempre e solo la sottocartella
// della singola materia, MAI la cartella madre.
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

const RADICE = arg('radice', 'D:\\BACKUP-DOWNLOAD-FOLDER-30-4-26')
const CONSEGNE = arg('consegne', '1s0MbbuV-uQTsCAU8OT2BxpJ4h-n5tdql')  // "materie" su Drive craft
const TIPO = (arg('tipo', 'video') || '').toLowerCase()
const CARICA = flag('carica')
const CONDIVIDI = flag('condividi')

if (!['video', 'audio'].includes(TIPO)) { console.error('[FAIL] --tipo dev\'essere video o audio'); process.exit(1) }

const MATERIE = (arg('materia') || '').split(',').map(s => s.trim()).filter(Boolean)
if (!MATERIE.length) {
  console.error('Uso: node scripts/drive_upload.mjs --materia ORGANIZZAZIONE_MIC --tipo video [--carica] [--condividi]')
  process.exit(1)
}

// Il nome della cartella su Drive non e' quello su disco: li' si usa il
// trattino e niente suffisso (ORGANIZZAZIONE-MIC), qui l'underscore.
const nomeDrive = (m) => m.replace(/_/g, '-')
const SOTTOCARTELLA = TIPO === 'video' ? 'VIDEO-LEZIONI' : 'AUDIO-LEZIONI'

// I sorgenti non stanno tutti nello stesso posto: la produzione ha usato tre
// convenzioni diverse (video/, video_lezioni/, audio_lezioni/video/). Si
// cercano in ordine e si prende la prima che contiene file del tipo giusto.
const CANDIDATE = TIPO === 'video'
  ? ['video', 'video_lezioni', 'audio_lezioni/video']
  : ['audio_lezioni/audio', 'audio']
const EXT = TIPO === 'video' ? '.mp4' : '.mp3'

const sorgente = (m) => {
  for (const c of CANDIDATE) {
    const dir = join(RADICE, `${m}_NB`, ...c.split('/'))
    if (!existsSync(dir)) continue
    const f = readdirSync(dir).filter(x => x.toLowerCase().endsWith(EXT))
    if (f.length) return { dir, file: f.sort() }
  }
  return null
}

// --- Drive API ---------------------------------------------------------------
const api = async (path, opts = {}) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...opts,
    headers: { authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = j?.error?.message || r.statusText
    if (/API .* disabled|SERVICE_DISABLED/i.test(msg)) {
      console.error(`\n[FAIL] l'API Drive non e' abilitata sul progetto Google Cloud del client OAuth.`)
      console.error(`       Abilitala qui, poi rilancia:`)
      console.error(`       https://console.cloud.google.com/apis/library/drive.googleapis.com\n`)
      process.exit(1)
    }
    throw new Error(`${path}: ${msg}`)
  }
  return j
}

const cerca = async (q) => (await api(`files?q=${encodeURIComponent(q)}&fields=files(id,name,size)&pageSize=200`)).files || []

const cartella = async (nome, parent) => {
  const t = await cerca(`name='${nome.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  if (t.length) return { id: t[0].id, creata: false }
  if (!CARICA) return { id: null, creata: true }
  const n = await api('files?fields=id', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: nome, parents: [parent], mimeType: 'application/vnd.google-apps.folder' }),
  })
  return { id: n.id, creata: true }
}

// Upload resumable: i video stanno sui 70-110 MB, il multipart semplice non e'
// pensato per quella taglia (e un errore a meta' costringerebbe a ripartire).
const carica = async (file, nome, parent) => {
  const size = statSync(file).size
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
    method: 'POST',
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ name: nome, parents: [parent] }),
  })
  if (!r.ok) throw new Error(`avvio upload ${nome}: ${r.status} ${await r.text()}`)
  const loc = r.headers.get('location')
  const put = await fetch(loc, {
    method: 'PUT',
    headers: { 'content-length': String(size) },
    body: createReadStream(file),
    duplex: 'half',
  })
  if (!put.ok) throw new Error(`upload ${nome}: ${put.status} ${await put.text()}`)
  return put.json()
}

const condividi = async (id) => api(`files/${id}/permissions`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ role: 'reader', type: 'anyone' }),
})

// --- ricognizione ------------------------------------------------------------
const piano = []
for (const m of MATERIE) {
  const src = sorgente(m)
  if (!src) {
    console.error(`[FAIL] nessun ${EXT} per ${m}: cercato in ${CANDIDATE.map(c => `${m}_NB/${c}`).join(', ')}`)
    process.exit(1)
  }
  const materiaDrive = await cartella(nomeDrive(m), CONSEGNE)
  if (!materiaDrive.id && !CARICA) {
    console.log(`(la cartella ${nomeDrive(m)} non esiste ancora su Drive: verrebbe creata)`)
  }
  const dest = materiaDrive.id ? await cartella(SOTTOCARTELLA, materiaDrive.id) : { id: null, creata: true }
  const gia = dest.id ? await cerca(`'${dest.id}' in parents and trashed=false`) : []
  const files = src.file.map(f => {
    const full = join(src.dir, f)
    const size = statSync(full).size
    const doppione = gia.find(g => g.name === f && Number(g.size) === size)
    return { full, nome: f, mb: size / 1048576, salta: !!doppione }
  })
  piano.push({ materia: m, src: src.dir, materiaDriveId: materiaDrive.id, destId: dest.id, files })
}

const daFare = piano.flatMap(p => p.files.filter(f => !f.salta))
const totMB = daFare.reduce((s, f) => s + f.mb, 0)

console.log(`\ndestinazione: Drive craft · cartella consegne ${CONSEGNE}`)
console.log(`tipo: ${TIPO}  →  sottocartella ${SOTTOCARTELLA}`)
console.log(`da caricare: ${daFare.length} file · ${totMB.toFixed(0)} MB` +
  (piano.flatMap(p => p.files).length - daFare.length ? `  (${piano.flatMap(p => p.files).length - daFare.length} gia' su Drive, saltati)` : ''))
console.log(`modo: ${CARICA ? 'CARICAMENTO REALE' : 'anteprima (aggiungi --carica)'}` +
  `${CONDIVIDI ? ' · poi condivide con "chiunque abbia il link"' : ''}\n`)

for (const p of piano) {
  console.log(`── ${nomeDrive(p.materia)}/${SOTTOCARTELLA}   ← ${p.src}`)
  for (const f of p.files) console.log(`   ${f.salta ? '·' : '↑'} ${f.nome.slice(0, 62)}  (${f.mb.toFixed(0)} MB)${f.salta ? '  gia\' presente' : ''}`)
  console.log('')
}

if (!CARICA) { console.log('[anteprima] niente caricato.'); process.exit(0) }

for (const p of piano) {
  console.log(`\n▶ ${nomeDrive(p.materia)}`)
  let i = 0
  for (const f of p.files) {
    i++
    if (f.salta) { console.log(`   [${i}/${p.files.length}] ${f.nome.slice(0, 48)}… gia' presente`); continue }
    process.stdout.write(`   [${i}/${p.files.length}] ${f.nome.slice(0, 48)}… (${f.mb.toFixed(0)} MB) `)
    await carica(f.full, f.nome, p.destId)
    console.log('ok')
  }
  if (CONDIVIDI) {
    await condividi(p.destId)
    console.log(`   condivisa: https://drive.google.com/drive/folders/${p.destId}`)
  }
}

console.log('\n[fatto] link delle cartelle:')
for (const p of piano) console.log(`   ${nomeDrive(p.materia)} → https://drive.google.com/drive/folders/${p.destId}`)
if (!CONDIVIDI) console.log('\n(senza --condividi le cartelle restano private: chi apre il link vede "richiedi accesso")')
