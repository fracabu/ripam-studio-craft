#!/usr/bin/env node
// ============================================================================
// INVENTARIO — dove si ferma la catena, materiale per materiale.
//
// Un materiale diventa richiedibile da un candidato solo se attraversa QUATTRO
// stadi. Basta che si fermi a uno e per il mondo non esiste:
//
//   1. LOCALE    il file è stato prodotto        (Downloads/report-rsc, disco D:)
//   2. DRIVE     è caricato in ANTEPRIME/ ed è aperto a "chiunque col link"
//   3. MANIFEST  il suo fileId è censito          (report-custom-manifest.js,
//                                                  anteprime-manifest.js)
//   4. VETRINA   il sito lo mostra e permette di chiederlo
//                                                 (report-concorsi.js, materie.js)
//
// PERCHÉ ESISTE (28/08/2026). La produzione vive in tre posti che non si parlano
// — repo, `Downloads/report-rsc`, disco `D:` — e Drive ne ha altri tre (cartella
// per materia, cartella per bando, VIDEO-LEZIONI). Nessuno da solo dice cosa
// esiste davvero: il 06/08 è stato detto a una candidata che le audiolezioni MIC
// «erano da fare» mentre c'erano 8 MP3 per materia, e l'inventario del 10/08
// dava per scoperti bandi che oggi sono completi. Questo script guarda tutte le
// fonti insieme e dice, per ogni riga, fin dove è arrivata.
//
// Uso:
//   node scripts/drive_inventario.mjs                # tutto (bandi + materie)
//   node scripts/drive_inventario.mjs --bandi        # solo i report per bando
//   node scripts/drive_inventario.mjs --materie      # solo le materie a catalogo
//   node scripts/drive_inventario.mjs --permessi     # + verifica condivisione
//                                                    #   (115 chiamate, ~1 min)
//   node scripts/drive_inventario.mjs --json         # output JSON
//
// SOLO LETTURA: non carica, non condivide, non modifica nulla — né su Drive né
// nei manifest. Le correzioni si fanno a mano (o con drive_carica.mjs).
//
// Richiede .drive-token.json (vedi scripts/drive_auth.mjs). Gira a PC acceso.
// ============================================================================
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { accessToken } from './drive_token.mjs'
import { REPORT_CUSTOM_MANIFEST } from '../api/_lib/report-custom-manifest.js'
import { ANTEPRIME_MANIFEST } from '../api/_lib/anteprime-manifest.js'
import { REPORT_CONCORSI } from '../src/data/report-concorsi.js'
import { MATERIE } from '../src/data/materie.js'

const flag = (k) => process.argv.includes(`--${k}`)
const SOLO_BANDI = flag('bandi')
const SOLO_MATERIE = flag('materie')
const PERMESSI = flag('permessi')
const JSON_OUT = flag('json')

// Radice della cartella ANTEPRIME sul Drive di ripamstudiocraft.
const ANTEPRIME_ID = '1zT1_HvruW2b7JL8TUwtqIVEIPCS4SI6N'
// Dove sta la produzione, fuori dal repo (vedi le memorie di riferimento).
const LOCALE_REPORT = 'C:/Users/utente/Downloads/report-rsc'
const LOCALE_AV = 'D:/BACKUP-DOWNLOAD-FOLDER-30-4-26'

// --- Corrispondenza fra i quattro mondi -------------------------------------
// Gli stessi bandi hanno nomi diversi in ogni stadio: la cartella locale è in
// MAIUSCOLO, quella su Drive in kebab-case e con abbreviazioni proprie, la
// chiave del manifest segue un terzo criterio. Questa tabella è l'unico posto
// dove le tre convenzioni si toccano: se aggiungi un bando, aggiungilo qui.
//   manifest → { locale: cartella in report-rsc, drive: cartella in report-custom }
const BANDI = {
  'ripam-3997-amm':          { locale: 'RIPAM-3997-ASSISTENTI-AMM',        drive: 'ripam-ass-amm' },
  'ripam-1340-amm':          { locale: 'RIPAM-1340-FUNZIONARI-AMM',        drive: 'funz-1340-amm' },
  'ripam-1340-com':          { locale: 'RIPAM-1340-FUNZIONARI-COM',        drive: 'funz-1340-com' },
  'inps-499-assist-inf':     { locale: 'INPS-499-ASSISTENTI-INFORMATICI',  drive: 'inps-499-ass-inf' },
  'inps-1695-pecs':          { locale: 'INPS-1695-PECS',                   drive: 'inps-pecs-1695' },
  'ade-622-gest':            { locale: 'ADE-622-ASSISTENTI-GESTIONALI',    drive: 'ade-622-ass-gest' },
  'cpi-sicilia-sac':         { locale: 'CPI-SICILIA-SAC-200',              drive: 'cpi-sicilia-sac' },
  'cerveteri-istruttore-amm':{ locale: 'CERVETERI-ISTRUTTORE-AMM',         drive: 'cerveteri-istruttore-amm' },
  'mic-1800-cod01':          { locale: 'MIC-1800-VIGILANZA',               drive: 'mic-1800-vigilanza' },
  'mic-1800-cod02':          { locale: 'MIC-1800-TECNICI',                 drive: 'mic-1800-tecnici' },
  'difesa-1100-amm':         { locale: 'RIPAM-1100-DIFESA-AMM',            drive: 'difesa-1100-amm' },
}
// Cartelle `_NB` sul disco D: il nome si ricava dallo slug in maiuscolo, ma
// alcune serie sono state battezzate diversamente. Senza questi alias lo script
// direbbe "nessuna produzione" su materie che hanno 8 episodi pronti.
const ALIAS_NB = {
  'diritto-penale-pa': 'DIR_PENALE_PA',
  'scavo-archeologico': 'SCAVO_RICERCA',
  'economia-amministrazioni-pubbliche': 'ECONOMIA_PUBBLICA',
}

// Bandi prodotti in locale ma senza manifest: esistono i file, non la consegna.
const SENZA_MANIFEST = [
  'UNISS-15-COLLABORATORI', 'MEF-548-GIUR', 'MEF-548-TRIB', 'PCM-130-DTD',
  'COMUNE-TRIESTE-6-ISTR-AMM-CONTABILI', 'RIPAM-1340-FUNZIONARI-ECO',
  'RIPAM-1340-FUNZIONARI-INF', 'RIPAM-3997-ORDINAMENTI',
]

// --- Drive ------------------------------------------------------------------
const api = async (path) => {
  const r = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    headers: { authorization: `Bearer ${await accessToken()}` },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path}: ${j?.error?.message || r.statusText}`)
  return j
}
const figli = async (parent) => {
  const out = []
  let token = ''
  do {
    const q = `'${parent}' in parents and trashed=false`
    const j = await api(
      `files?q=${encodeURIComponent(q)}&fields=nextPageToken,files(id,name,mimeType,size)` +
      `&pageSize=200${token ? `&pageToken=${token}` : ''}`
    )
    out.push(...(j.files || []))
    token = j.nextPageToken || ''
  } while (token)
  return out.sort((a, b) => a.name.localeCompare(b.name))
}
const isDir = (f) => f.mimeType === 'application/vnd.google-apps.folder'

// Albero completo di ANTEPRIME: mappa nome-cartella → { id, files[] }, a
// qualunque profondità (le cartelle bando sono annidate in modo irregolare).
async function alberoAnteprime() {
  const cartelle = new Map()
  const tuttiId = new Map()
  async function giu(id, nome, percorso) {
    const els = await figli(id)
    const files = els.filter((f) => !isDir(f))
    cartelle.set(nome, { id, percorso, files })
    for (const f of files) tuttiId.set(f.id, { nome: f.name, percorso: `${percorso}/${f.name}` })
    for (const d of els.filter(isDir)) await giu(d.id, d.name, `${percorso}/${d.name}`)
  }
  await giu(ANTEPRIME_ID, 'ANTEPRIME', 'ANTEPRIME')
  return { cartelle, tuttiId }
}

// --- Locale -----------------------------------------------------------------
const conta = (dir, ext) => {
  if (!existsSync(dir)) return null
  try {
    return readdirSync(dir).filter((f) => f.toLowerCase().endsWith(ext)).length
  } catch { return null }
}
// Cerca ricorsivamente file con una certa estensione (i video stanno in
// video/, video_lezioni/ o audio_lezioni/video/ a seconda della serie).
function contaRic(dir, ext, minMB = 0, profondita = 4) {
  if (!existsSync(dir) || profondita < 0) return 0
  let n = 0
  let els
  try { els = readdirSync(dir, { withFileTypes: true }) } catch { return 0 }
  for (const e of els) {
    const p = join(dir, e.name)
    if (e.isDirectory()) n += contaRic(p, ext, minMB, profondita - 1)
    else if (e.name.toLowerCase().endsWith(ext)) {
      if (!minMB) n++
      else { try { if (statSync(p).size >= minMB * 1048576) n++ } catch {} }
    }
  }
  return n
}

// ============================================================================
const { cartelle, tuttiId } = await alberoAnteprime()
const inVetrina = new Set(REPORT_CONCORSI.map((c) => c.key))
const risultato = { bandi: [], materie: [], anomalie: [] }

// --- STADIO per i REPORT PER BANDO ------------------------------------------
if (!SOLO_MATERIE) {
  for (const [key, m] of Object.entries(REPORT_CUSTOM_MANIFEST)) {
    const map = BANDI[key] || {}
    const dirLoc = map.locale ? join(LOCALE_REPORT, map.locale) : null
    const cart = map.drive ? cartelle.get(map.drive) : null
    const reports = m.reports || []
    risultato.bandi.push({
      key,
      locale: dirLoc && existsSync(dirLoc)
        ? { pdf: conta(dirLoc, '.pdf') || 0, md: conta(dirLoc, '.md') || 0 }
        : null,
      drive: cart ? cart.files.filter((f) => f.name.toLowerCase().endsWith('.pdf')).length : null,
      drivePercorso: cart ? cart.percorso : null,
      manifest: { tot: reports.length, conId: reports.filter((r) => r.fileId).length },
      vetrina: inVetrina.has(key),
    })
  }
  for (const l of SENZA_MANIFEST) {
    const d = join(LOCALE_REPORT, l)
    if (!existsSync(d)) continue
    risultato.bandi.push({
      key: null, localeNome: l,
      locale: { pdf: conta(d, '.pdf') || 0, md: conta(d, '.md') || 0 },
      drive: null, manifest: null, vetrina: false,
    })
  }
}

// --- STADIO per le MATERIE ---------------------------------------------------
if (!SOLO_BANDI) {
  for (const mat of MATERIE) {
    const av = mat.avail || {}
    const ready = Object.entries(av).filter(([, v]) => v === 'ready').map(([k]) => k)
    const nbNome = ALIAS_NB[mat.slug] || mat.slug.toUpperCase().replace(/-/g, '_')
    const nbDir = join(LOCALE_AV, `${nbNome}_NB`)
    const cart = cartelle.get(mat.slug)
    const files = cart ? cart.files : []
    // la sottocartella podcast/ ha lo stesso nome per tutte: la ritrovo per percorso
    const podCart = [...cartelle.values()].find((c) => c.percorso === `ANTEPRIME/${mat.slug}/podcast`)
    risultato.materie.push({
      slug: mat.slug,
      ready,
      locale: existsSync(nbDir)
        ? { mp3: contaRic(nbDir, '.mp3'), mp4: contaRic(nbDir, '.mp4', 5) }
        : null,
      drive: cart ? {
        tot: files.length,
        mp4: files.filter((f) => /\.mp4$/i.test(f.name)).length,
        mp3: files.filter((f) => /\.mp3$/i.test(f.name)).length,
        pdf: files.filter((f) => /\.pdf$/i.test(f.name)).length,
        podcast: podCart ? podCart.files.length : null,
      } : null,
      manifestManuale: mat.slug in ANTEPRIME_MANIFEST
        ? (ANTEPRIME_MANIFEST[mat.slug] ? 'sì' : 'null')
        : '—',
    })
  }
}

// --- ANOMALIE ----------------------------------------------------------------
// 1) file su Drive che nessun manifest consegna
const censiti = new Set()
for (const v of Object.values(REPORT_CUSTOM_MANIFEST))
  for (const r of v.reports || []) if (r.fileId) censiti.add(r.fileId)
for (const id of Object.values(ANTEPRIME_MANIFEST)) if (id) censiti.add(id)
for (const [id, f] of tuttiId) {
  if (censiti.has(id)) continue
  if (!/\.(pdf|mp4|mp3)$/i.test(f.nome)) continue
  if (f.percorso.includes('/report-custom/')) risultato.anomalie.push({ tipo: 'non-censito', percorso: f.percorso })
}
// 2) fileId nel manifest che non stanno dentro ANTEPRIME/
for (const [key, v] of Object.entries(REPORT_CUSTOM_MANIFEST))
  for (const r of v.reports || [])
    if (r.fileId && !tuttiId.has(r.fileId))
      risultato.anomalie.push({ tipo: 'fuori-anteprime', dove: `${key}/${r.key}`, id: r.fileId })

// 3) condivisione (solo con --permessi: una chiamata per file)
if (PERMESSI) {
  const target = []
  for (const [key, v] of Object.entries(REPORT_CUSTOM_MANIFEST))
    for (const r of v.reports || []) if (r.fileId) target.push({ dove: `${key}/${r.key}`, id: r.fileId })
  for (const [slug, id] of Object.entries(ANTEPRIME_MANIFEST))
    if (id) target.push({ dove: `manuale/${slug}`, id })
  for (const t of target) {
    try {
      const f = await api(`files/${t.id}?fields=permissions(type)`)
      if (!(f.permissions || []).some((p) => p.type === 'anyone'))
        risultato.anomalie.push({ tipo: 'non-condiviso', dove: t.dove, id: t.id })
    } catch (e) {
      risultato.anomalie.push({ tipo: 'illeggibile', dove: t.dove, errore: e.message.slice(0, 60) })
    }
  }
}

// ============================================================================
if (JSON_OUT) {
  console.log(JSON.stringify(risultato, null, 2))
  process.exit(0)
}

const si = (b) => (b ? '✅' : '❌')
const num = (n, w = 3) => String(n ?? '—').padStart(w)

if (!SOLO_MATERIE) {
  console.log('='.repeat(92))
  console.log('REPORT PER BANDO — locale → Drive → manifest → vetrina')
  console.log('='.repeat(92))
  console.log('BANDO'.padEnd(28) + 'LOCALE'.padEnd(16) + 'DRIVE'.padEnd(10) + 'MANIFEST'.padEnd(12) + 'VETRINA')
  console.log('-'.repeat(92))
  for (const b of risultato.bandi) {
    const nome = b.key || `${b.localeNome} ⚠`.slice(0, 27)
    const loc = b.locale ? `${num(b.locale.pdf)} pdf ${num(b.locale.md)} md` : '   nessuna    '
    const drv = b.drive === null ? '    —' : `${num(b.drive)} pdf`
    const man = b.manifest ? `${num(b.manifest.conId, 2)}/${b.manifest.tot}` : '   —'
    console.log(nome.padEnd(28) + loc.padEnd(16) + drv.padEnd(10) + man.padEnd(12) + si(b.vetrina))
  }
}

if (!SOLO_BANDI) {
  console.log('\n' + '='.repeat(92))
  console.log('MATERIE — quello che il sito promette vs quello che esiste')
  console.log('='.repeat(92))
  console.log('MATERIA'.padEnd(30) + 'SITO'.padEnd(18) + 'LOCALE (_NB)'.padEnd(18) + 'DRIVE'.padEnd(20) + 'MAN.')
  console.log('-'.repeat(92))
  for (const m of risultato.materie) {
    if (!m.ready.length && !m.locale && !m.drive) continue // mai promessa, mai prodotta
    const loc = m.locale ? `${num(m.locale.mp3)} mp3 ${num(m.locale.mp4)} mp4` : '   nessuna     '
    const d = m.drive
    const drv = d ? `${num(d.mp4)}v ${num(d.mp3)}a ${num(d.pdf)}p pod:${d.podcast ?? '—'}` : '  nessuna cartella'
    console.log(
      m.slug.padEnd(30) + (m.ready.join(',') || '—').padEnd(18) + loc.padEnd(18) + drv.padEnd(24) + m.manifestManuale
    )
  }
  // Serie prodotte sul disco D: che il catalogo del sito non conosce affatto.
  const attesi = new Set(MATERIE.map((m) => `${(ALIAS_NB[m.slug] || m.slug.toUpperCase().replace(/-/g, '_'))}_NB`))
  if (existsSync(LOCALE_AV)) {
    const orfane = readdirSync(LOCALE_AV, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.endsWith('_NB') && !attesi.has(e.name))
      .map((e) => ({ nome: e.name, mp3: contaRic(join(LOCALE_AV, e.name), '.mp3'), mp4: contaRic(join(LOCALE_AV, e.name), '.mp4', 5) }))
      .filter((o) => o.mp3 || o.mp4)
    if (orfane.length) {
      console.log('\n--- PRODOTTO SUL DISCO MA FUORI DAL CATALOGO materie.js ---')
      for (const o of orfane) console.log(`   ${o.nome.padEnd(44)} ${num(o.mp3)} mp3  ${num(o.mp4)} mp4`)
    }
  }
  // Promesse scoperte: il sito dichiara un formato che su Drive non c'è
  console.log('\n--- PROMESSE DA VERIFICARE (il sito dichiara, Drive non conferma) ---')
  let n = 0
  for (const m of risultato.materie) {
    if (!m.ready.length) continue
    const d = m.drive
    const buchi = []
    if (m.ready.includes('pod') && !(d && d.podcast)) buchi.push('podcast')
    if (m.ready.includes('vid') && !(d && d.mp4)) buchi.push('video')
    if (m.ready.includes('man') && m.manifestManuale !== 'sì') buchi.push('manuale')
    if (buchi.length) { console.log(`   ${m.slug.padEnd(30)} manca: ${buchi.join(', ')}`); n++ }
  }
  if (!n) console.log('   nessuna: tutto ciò che il sito promette esiste su Drive.')
  console.log('   ⚠️  "manca" = non è nella cartella attesa. Video e report possono stare')
  console.log('      in VIDEO-LEZIONI/ o nella cartella del bando: controllare prima di produrre.')
}

if (risultato.anomalie.length) {
  console.log('\n' + '='.repeat(92))
  console.log('ANOMALIE')
  console.log('='.repeat(92))
  const per = {}
  for (const a of risultato.anomalie) (per[a.tipo] ||= []).push(a)
  const spiega = {
    'non-censito': 'su Drive ma in nessun manifest → nessuno può riceverlo',
    'fuori-anteprime': 'consegnabile ma fuori dalla cartella ANTEPRIME',
    'non-condiviso': 'NON pubblico → chi riceve il link vede "Accesso negato"',
    illeggibile: 'permessi non leggibili',
  }
  for (const [tipo, arr] of Object.entries(per)) {
    console.log(`\n${tipo} (${arr.length}) — ${spiega[tipo] || ''}`)
    for (const a of arr.slice(0, 20)) console.log(`   · ${a.percorso || a.dove}`)
    if (arr.length > 20) console.log(`   … e altri ${arr.length - 20}`)
  }
}
if (!PERMESSI) console.log('\n(la condivisione dei file non è stata verificata: rilancia con --permessi)')
