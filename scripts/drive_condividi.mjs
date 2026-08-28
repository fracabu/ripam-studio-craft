#!/usr/bin/env node
// ============================================================================
// Chi può vedere una cartella di consegna su Drive: dare accesso a UNA persona,
// togliere il link pubblico, controllare com'e' messa adesso.
//
// Nasce il 24/08/2026 su una consegna a pagamento: "chiunque abbia il link" va
// bene per un'anteprima, non per un materiale comprato. Con l'accesso nominale
// il file resta legato alla persona, e si revoca senza spostare niente.
//
//   node scripts/drive_condividi.mjs --materia ORGANIZZAZIONE_MIC --lista
//   node scripts/drive_condividi.mjs --materia A,B --a tizia@gmail.com --togli-pubblico
//   node scripts/drive_condividi.mjs --materia A,B --a tizia@gmail.com --togli-pubblico --applica
//   node scripts/drive_condividi.mjs --materia A --revoca tizia@gmail.com --applica
//
// Flag:
//   --materia         nome cartella su Drive (accetta ORGANIZZAZIONE_MIC o -MIC)
//   --cartella        id Drive espliciti, a virgole (alternativa a --materia)
//   --a               email a cui dare accesso in sola lettura
//   --revoca          email a cui TOGLIERE l'accesso
//   --togli-pubblico  rimuove i permessi "chiunque abbia il link"
//   --lista           mostra i permessi e basta
//   --applica         esegue davvero (senza, mostra soltanto)
//   --consegne        id della cartella che contiene le cartelle materia
//
// Agisce sulla cartella materia E sulle sue sottocartelle (AUDIO-LEZIONI,
// VIDEO-LEZIONI): i permessi si ereditano, ma un "anyone" messo direttamente
// su una sottocartella sopravvive alla pulizia del padre — e nessuno lo vede.
// ============================================================================
import { accessToken } from './drive_token.mjs'

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const CONSEGNE = arg('consegne', '1s0MbbuV-uQTsCAU8OT2BxpJ4h-n5tdql')
const A = arg('a')
const REVOCA = arg('revoca')
const TOGLI_PUBBLICO = flag('togli-pubblico')
const SOLO_LISTA = flag('lista')
const APPLICA = flag('applica')

const api = async (path, opts = {}) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...opts, headers: { authorization: `Bearer ${await accessToken()}`, ...(opts.headers || {}) },
  })
  if (r.status === 204) return {}
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path}: ${j?.error?.message || r.statusText}`)
  return j
}
const cerca = async (q, fields = 'files(id,name,mimeType)') =>
  (await api(`files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=200`)).files || []

// --- quali cartelle -----------------------------------------------------------
let bersagli = []
const idsEspliciti = (arg('cartella') || '').split(',').map(s => s.trim()).filter(Boolean)
if (idsEspliciti.length) {
  for (const id of idsEspliciti) {
    const f = await api(`files/${id}?fields=id,name`)
    bersagli.push({ id: f.id, nome: f.name })
  }
} else {
  const materie = (arg('materia') || '').split(',').map(s => s.trim()).filter(Boolean)
  if (!materie.length) {
    console.error('Uso: node scripts/drive_condividi.mjs --materia <NOME> [--a email] [--togli-pubblico] [--applica]')
    process.exit(1)
  }
  for (const m of materie) {
    const nome = m.replace(/_/g, '-').toUpperCase()
    const t = await cerca(`name='${nome}' and '${CONSEGNE}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
    if (!t.length) { console.error(`[FAIL] cartella non trovata su Drive: ${nome}`); process.exit(1) }
    bersagli.push({ id: t[0].id, nome: t[0].name })
  }
}

// Le sottocartelle vanno incluse: un "anyone" messo li' dentro non si vede
// guardando solo il padre, ma continua a rendere pubblico il materiale.
const conFigli = []
for (const b of bersagli) {
  conFigli.push(b)
  const figli = await cerca(`'${b.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  for (const f of figli) conFigli.push({ id: f.id, nome: `${b.nome}/${f.name}`, figlio: true })
}

console.log(`\nmodo: ${APPLICA ? 'APPLICA' : 'anteprima (aggiungi --applica)'}\n`)

for (const b of conFigli) {
  const perms = (await api(`files/${b.id}/permissions?fields=permissions(id,type,role,emailAddress)`)).permissions || []
  const descrivi = (p) => p.type === 'anyone'
    ? `chiunque abbia il link (${p.role})`
    : `${p.emailAddress || p.type} (${p.role})`
  console.log(`── ${b.nome}`)
  for (const p of perms) console.log(`     · ${descrivi(p)}`)

  if (SOLO_LISTA) { console.log(''); continue }

  const azioni = []
  if (TOGLI_PUBBLICO) for (const p of perms.filter(x => x.type === 'anyone')) azioni.push({ tipo: 'togli', p })
  if (REVOCA) for (const p of perms.filter(x => (x.emailAddress || '').toLowerCase() === REVOCA.toLowerCase())) azioni.push({ tipo: 'togli', p })
  if (A && !perms.some(p => (p.emailAddress || '').toLowerCase() === A.toLowerCase())) azioni.push({ tipo: 'aggiungi' })

  if (!azioni.length) { console.log('     (niente da cambiare)\n'); continue }

  for (const a of azioni) {
    // Un permesso EREDITATO dal padre non si cancella sul figlio: Drive
    // risponde "cannot delete the permission". Non e' un guaio — sparisce da
    // solo quando lo si toglie al padre — ma non deve fermare tutto il resto.
    try {
      if (a.tipo === 'togli') {
        console.log(`     ✂ togli: ${descrivi(a.p)}`)
        if (APPLICA) await api(`files/${b.id}/permissions/${a.p.id}`, { method: 'DELETE' })
      } else {
        console.log(`     + aggiungi: ${A} (reader)`)
        if (APPLICA) {
          await api(`files/${b.id}/permissions?sendNotificationEmail=false`, {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ role: 'reader', type: 'user', emailAddress: A }),
          })
        }
      }
    } catch (e) {
      const ereditato = /cannot delete the permission|inherited/i.test(e.message)
      console.log(`     ⚠ ${ereditato ? 'permesso ereditato dal padre: si toglie di lì' : e.message.slice(0, 120)}`)
      if (!ereditato) process.exitCode = 1
    }
  }
  console.log('')
}

if (APPLICA && A) {
  console.log('link da mandare (funzionano solo se apre Drive con quell\'account):')
  for (const b of bersagli) console.log(`   ${b.nome} → https://drive.google.com/drive/folders/${b.id}`)
}
if (!APPLICA) console.log('[anteprima] niente modificato.')
