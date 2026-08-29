#!/usr/bin/env node
// ============================================================================
// Una cartella Drive per il cliente che ha pagato: copie sue, condivise solo
// con lui.
//
// Nasce il 29/08/2026 su una consegna a pagamento. Fino a qui il
// materiale comprato si consegnava dando accesso alle cartelle MATERIA, che
// pero' sono le stesse per tutti: su DIRITTO-UE/AUDIO-LEZIONI c'era gia' come
// lettore un altro cliente, e su Drive un viewer che apre "Condividi" vede
// l'elenco delle persone con accesso — cioe' l'email di un altro candidato.
// La regola della casa (never.md, "sealed box") dice che i dati di un
// candidato non arrivano a un altro: da qui la cartella per cliente.
//
// Le copie sono lato server (files/copy): niente ri-caricamento, un video da
// 90 MB si duplica in un secondo. Occupano quota, e va bene: e' il prezzo di
// non far incrociare due clienti.
//
//   node scripts/drive_consegna.mjs --cliente COGNOME-DIFESA-1100 \
//     --da 1Yqd...,1hyg... --a tizia@gmail.com
//   ... --carica          per farlo davvero
//
// Flag:
//   --cliente   nome della cartella di consegna (mettici cognome + bando)
//   --da        id delle cartelle Drive da copiare, a virgole
//   --a         email a cui dare accesso in sola lettura (opzionale)
//   --salta     sottostringhe: i file che le contengono NON vengono copiati
//               (per lasciare fuori dalla consegna cio' che non e' stato pagato)
//   --solo      nomi di sottocartelle da prendere (es. VIDEO-LEZIONI): le altre
//               si ignorano, e i file di quelle scelte finiscono APPIATTITI
//               nella cartella della materia — un livello in meno da aprire
//   --dentro    id della cartella madre delle consegne (default: CONSEGNE CLIENTI)
//   --carica    esegue davvero (senza, mostra e basta)
//
// IDEMPOTENTE: un file gia' presente nella destinazione con lo stesso nome
// viene saltato. Rilanciare dopo un'interruzione riprende, non duplica.
// ============================================================================
import { accessToken } from './drive_token.mjs'

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const CLIENTE = arg('cliente')
const DA = (arg('da') || '').split(',').map(s => s.trim()).filter(Boolean)
const A = arg('a')
const SALTA = (arg('salta') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
const SOLO = (arg('solo') || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
// "CONSEGNE CLIENTI" nel Drive di craft: una cartella per persona, niente altro.
const DENTRO = arg('dentro', 'root')
const CARICA = flag('carica')

if (!CLIENTE || !DA.length) {
  console.error('Uso: node scripts/drive_consegna.mjs --cliente <NOME> --da <id,id> [--a email] [--salta testo] [--carica]')
  process.exit(1)
}

const api = async (path, opts = {}) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...opts, headers: { authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) },
  })
  if (r.status === 204) return {}
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path}: ${j?.error?.message || r.statusText}`)
  return j
}

const figli = async (id) => {
  const q = encodeURIComponent(`'${id}' in parents and trashed=false`)
  return (await api(`files?q=${q}&fields=files(id,name,mimeType,size)&pageSize=500`)).files || []
}

const cartella = async (nome, parent) => {
  const q = encodeURIComponent(
    `name='${nome.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  const t = (await api(`files?q=${q}&fields=files(id,name)`)).files || []
  if (t.length) return t[0].id
  if (!CARICA) return null
  const n = await api('files?fields=id', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: nome, parents: [parent], mimeType: 'application/vnd.google-apps.folder' }),
  })
  return n.id
}

let copiati = 0, saltati = 0, esclusi = 0

// Ricorsiva: rifa' l'albero della sorgente dentro la destinazione. Le cartelle
// vuote non si creano finche' non c'e' qualcosa da metterci dentro (in
// anteprima la destinazione non esiste ancora: si stampa e basta).
const copiaCartella = async (idSorgente, idDest, prefisso = '') => {
  for (const f of (await figli(idSorgente)).sort((a, b) => a.name.localeCompare(b.name))) {
    const etichetta = `${prefisso}${f.name}`
    if (f.mimeType.includes('folder')) {
      // Con --solo si tiene solo cio' che serve, e senza il livello in mezzo:
      // i file della sottocartella scelta finiscono nella cartella materia.
      if (SOLO.length) {
        if (SOLO.includes(f.name.toUpperCase())) await copiaCartella(f.id, idDest, `${etichetta}/`)
        continue
      }
      const sub = idDest ? await cartella(f.name, idDest) : null
      await copiaCartella(f.id, sub, `${etichetta}/`)
      continue
    }
    if (SALTA.some(s => f.name.toLowerCase().includes(s))) {
      console.log(`[x]  ${etichetta}  ESCLUSO dalla consegna`)
      esclusi++
      continue
    }
    const gia = idDest ? (await figli(idDest)).find(x => x.name === f.name) : null
    if (gia) { console.log(`[=]  ${etichetta}  gia' nella cartella del cliente`); saltati++; continue }
    if (!CARICA) { console.log(`[ ]  ${etichetta}`); copiati++; continue }
    await api(`files/${f.id}/copy?fields=id`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: f.name, parents: [idDest] }),
    })
    console.log(`[OK] ${etichetta}`)
    copiati++
  }
}

const radice = await cartella(CLIENTE, DENTRO)
console.log(`\nconsegna: ${CLIENTE}${radice ? ` (${radice})` : ' (da creare)'}\n`)

for (const src of DA) {
  const meta = await api(`files/${src}?fields=id,name`)
  console.log(`── da ${meta.name}`)
  const dest = radice ? await cartella(meta.name, radice) : null
  await copiaCartella(src, dest, `${meta.name}/`)
}

if (A && radice && CARICA) {
  await api(`files/${radice}/permissions?sendNotificationEmail=false`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'user', emailAddress: A }),
  }).catch(e => { if (!/already|duplicate/i.test(e.message)) throw e })
  console.log(`\naccesso in sola lettura dato a ${A}`)
} else if (A) {
  console.log(`\n(con --carica darei accesso in sola lettura a ${A})`)
}

console.log(`\n${CARICA ? 'Fatto' : '[anteprima] niente copiato'}: ${copiati} file, ${saltati} gia' presenti, ${esclusi} esclusi.`)
if (radice) console.log(`https://drive.google.com/drive/folders/${radice}`)
