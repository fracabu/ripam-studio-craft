#!/usr/bin/env node
// ============================================================================
// INGEST di una serie didattica nella coda del palinsesto Telegram.
//
// Gemello di ingest_series.py di fb-pagina, ma per il gruppo: legge le schede
// di <materia>-didattica, le appaia con l'infografica brandizzata e il video
// in Downloads\_organized\<materia>-brain\, e scrive in social/telegram/coda/
// una cartella per POST (non per scheda): ogni scheda produce due post,
// "a-video" e "b-img", esattamente come sulla pagina Facebook.
//
//   node scripts/telegram_ingest.mjs --materia contratti-pubblici
//   node scripts/telegram_ingest.mjs --materia contratti-pubblici --scrivi
//
// Flag:
//   --materia   nome della serie (cartella <materia>-didattica e <materia>-brain)
//   --da / --a  limita all'intervallo di schede (es. --da 2 --a 9)
//   --scrivi    crea davvero le cartelle (senza, elenca e basta)
//
// DUE COSE CHE QUESTO SCRIPT NON FA, DI PROPOSITO
//
//  1. Non copia i media. Un video sta sui 35 MB: la coda ne conterrebbe
//     gigabyte inutili, visto che i file non si muovono mai dal disco. In
//     _meta.json va il PERCORSO, e chi pubblica lo legge da lì.
//
//  2. Non decide da solo il testo. Le caption che genera sono BOZZE ricavate
//     dalla scheda — titolo, apertura di "COS'E'", punti di "COSA RICORDARE" —
//     e vanno rilette prima di finire in un gruppo da 1.814 persone. Nessuna
//     frase viene inventata: se una sezione manca, il campo resta vuoto e il
//     post e' marcato DA SCRIVERE.
//
// ⚠️ SOLO INFOGRAFICHE BRANDIZZATE (_craft o _footer). Le PNG "base" sono il
// grezzo NotebookLM senza brand: se per una scheda manca la brandizzata, la
// scheda viene SALTATA e segnalata, mai sostituita in silenzio col grezzo —
// e' la trappola che su fb-pagina ha gia' mandato online post non brandizzati.
// ============================================================================
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const HOME = 'C:\\Users\\utente'
const ORGANIZED = join(HOME, 'Downloads', '_organized')
const CODA = join(HOME, 'ripam-studio-craft', 'social', 'telegram', 'coda')

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const MATERIA = arg('materia')
if (!MATERIA) { console.error('Manca --materia (es. contratti-pubblici)'); process.exit(1) }

// Nome leggibile della serie, per le caption. Se manca si usa lo slug.
const TITOLI = {
  'cad': 'CAD',
  'contratti-pubblici': 'Contratti Pubblici',
  'diritto-amministrativo': 'Diritto Amministrativo',
  'diritto-costituzionale': 'Diritto Costituzionale',
  'diritto-civile': 'Diritto Civile',
  'diritto-ue': 'Diritto UE',
  'economia-finanza-pubblica': 'Economia e Finanza Pubblica',
  'comunicazione-pubblica': 'Comunicazione Pubblica',
  'gdpr': 'GDPR',
}
const NOME_SERIE = TITOLI[MATERIA] || MATERIA

const DIDATTICA = join(HOME, `${MATERIA}-didattica`)
const IMG = join(ORGANIZED, `${MATERIA}-brain`, 'immagini-grezze')
const VID = join(ORGANIZED, `${MATERIA}-brain`, 'video-grezzo')
for (const [nome, p] of [['didattica', DIDATTICA], ['immagini', IMG], ['video', VID]]) {
  if (!existsSync(p)) { console.error(`Cartella ${nome} inesistente: ${p}`); process.exit(1) }
}

const DA = Number(arg('da', 0))
const A = Number(arg('a', 999))

// ── Estrazione dal markdown della scheda ───────────────────────────────────
// Il markdown dei manuali usa **grassetto** e link wiki [[slug|testo]]; su
// Telegram servono <b> e testo semplice. Le note tra parentesi quadre e i
// riferimenti incrociati si perdono: in una caption non servono.
const mdToHtml = (t) => t
  .replace(/\[\[[^\]|]*\|([^\]]+)\]\]/g, '$1')   // [[slug|testo]] -> testo
  .replace(/\[\[([^\]]+)\]\]/g, '$1')            // [[slug]] -> slug
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()

const sezione = (testo, titoloRegex) => {
  const righe = testo.split('\n')
  const i = righe.findIndex(r => titoloRegex.test(r))
  if (i === -1) return []
  const out = []
  for (let j = i + 1; j < righe.length; j++) {
    if (/^##\s/.test(righe[j])) break
    out.push(righe[j])
  }
  return out
}

// I punti di "COSA RICORDARE" sono una lista numerata: "1. **Definizione**: ..."
const puntiChiave = (testo) => sezione(testo, /^##\s*\d*\.?\s*✅?\s*COSA RICORDARE/i)
  .filter(r => /^\d+\.\s/.test(r.trim()))
  .map(r => mdToHtml(r.replace(/^\s*\d+\.\s*/, '')))
  .filter(Boolean)

// L'apertura di "COS'E'" e' il primo paragrafo pieno: serve come presentazione
// del video, dove la caption fa da locandina e non da lezione.
// La regex deve reggere sia "COS'È" con la E accentata sia l'apostrofo curvo:
// scritta stretta, saltava l'intera sezione di TUTTE le schede in silenzio.
const apertura = (testo) => {
  const p = sezione(testo, /^##.*COS['’]?\s*[EÈ]/i).join('\n')
    .split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)[0]
  if (!p) return ''
  // Spezzare le frasi su "punto + spazio" taglia dentro le abbreviazioni, e in
  // un testo giuridico sono ovunque: "dall'art. 15 del D.Lgs." diventava la
  // fine della presentazione. Si mascherano prima di dividere.
  const ABBR = /\b(D\.Lgs|D\.P\.R|D\.M|artt?|commi?|cc?|nn?|lett|es|ecc|pp|L|Reg|Cost|Dir|UE)\./gi
  const SEGNO = '@@P@@'
  const mascherato = mdToHtml(p).replace(ABBR, (m) => m.replace('.', SEGNO))
  const frasi = mascherato.split(/(?<=\.)\s+(?=[A-ZÈÉÀ«"])/)
  return frasi.slice(0, 2).join(' ').split(SEGNO).join('.')
}

// ── Testi fissi ────────────────────────────────────────────────────────────
// ⚠️ Il topic del palinsesto e' CHIUSO: ci scrive solo il bot. Quindi nessun
// testo puo' dire "rispondete qui sotto" — sarebbe un invito a fare una cosa
// che il gruppo non puo' fare. Le domande si mandano in General o in privato.
const DISCLAIMER = '<i>Materiale generato con AI: può contenere errori. Se ne trovi uno, segnalalo in General o a @fcapurso.</i>'
const RISORSE = 'Tutto il materiale gratuito: https://www.ripamstudio.it/'
// Le chiusure ruotano per indice (non a caso: due ingest della stessa serie
// devono produrre gli stessi file, altrimenti non si capisce cosa e' cambiato).
const CHIUSURE = [
  'Su quale punto vi sentite più scoperti? Scrivetelo in General.',
  'Se una parte non è chiara, chiedetela in General: rispondo.',
  'Domande su questo argomento? Scrivetele in General.',
  'Se volete che approfondisca un passaggio, ditelo in General.',
]

const CAP = 1024
const senzaTag = (t) => t.replace(/<[^>]+>/g, '')

// Riempie la caption coi punti finche' ci sta: meglio tre punti interi che
// cinque troncati a meta' parola.
// Tre punti al massimo, staccati da una riga vuota. I punti del manuale sono
// densi di sigle e rimandi: quattro di fila, attaccati, in chat diventano un
// muro che nessuno legge — e la caption e' una vetrina, non la scheda.
const MAX_PUNTI = 3
const componiImg = (titolo, punti, chiusura) => {
  const testa = `📌 <b>${titolo}</b>`
  const coda = `\n\n${chiusura}\n\n${DISCLAIMER}`
  let corpo = ''
  let usati = 0
  for (const p of punti.slice(0, MAX_PUNTI)) {
    const cand = `${corpo}\n\n• ${p}`
    if (senzaTag(testa + cand + coda).length > CAP) break
    corpo = cand
    usati++
  }
  return { testo: testa + corpo + coda, usati }
}

const componiVideo = (titolo, apre, n) => {
  const t = `🎬 <b>${titolo}</b>\n\n${apre}\n\n` +
    `Scheda ${n} del manuale ${NOME_SERIE} per il RIPAM 3997.\n\n${RISORSE}\n\n` +
    `Per domande scrivete in General.\n\n${DISCLAIMER}`
  return { testo: t }
}

// ── Appaiamento scheda / immagine / video ──────────────────────────────────
const schede = readdirSync(DIDATTICA).filter(f => /^\d{2}-.*\.md$/.test(f)).sort()
const immagini = readdirSync(IMG).filter(f => /_(craft|footer)\.png$/i.test(f))
const video = readdirSync(VID).filter(f => /^\d{2}[_-].*\.mp4$/i.test(f))

const numDi = (f) => f.match(/^(\d{2})/)?.[1]
const cerca = (lista, n) => lista.find(f => numDi(f) === n)

const fatti = []
const saltati = []

for (const s of schede) {
  const n = numDi(s)
  const num = Number(n)
  if (num < DA || num > A) continue
  // Il BOM UTF-8 in testa e i refusi tipo "111# Titolo" (scheda 28 di contratti
  // pubblici) rendono invisibile l'H1 a una regex ancorata: si tollerano qui,
  // ma il refuso nel sorgente va segnalato — non e' compito nostro nasconderlo.
  const testo = readFileSync(join(DIDATTICA, s), 'utf8').replace(/^﻿/, '')
  const rigaH1 = testo.split('\n').find(r => /^\s*\d*\s*#\s+\S/.test(r)) || ''
  if (/^\s*\d+\s*#/.test(rigaH1)) saltati.push(`${n} — nota: il sorgente ha "${rigaH1.match(/^\s*\d+/)[0].trim()}" incollato prima del titolo, da correggere nel .md`)
  const titolo = mdToHtml(rigaH1.replace(/^\s*\d*\s*#\s*/, ''))
  const slug = s.replace(/^\d{2}-/, '').replace(/\.md$/, '')

  const fImg = cerca(immagini, n)
  const fVid = cerca(video, n)
  if (!titolo) { saltati.push(`${n} — la scheda non ha un titolo H1`); continue }
  if (!fImg) { saltati.push(`${n} ${slug} — manca l'infografica brandizzata (_craft/_footer)`); continue }
  if (!fVid) { saltati.push(`${n} ${slug} — manca il video`); continue }

  const pathImg = join(IMG, fImg)
  const pathVid = join(VID, fVid)
  const mbVid = statSync(pathVid).size / (1024 * 1024)
  const mbImg = statSync(pathImg).size / (1024 * 1024)
  // Un video molto piu' leggero degli altri e' quasi sempre un export troncato:
  // meglio fermarsi qui che pubblicare mezzo minuto di nero.
  if (mbVid < 5) { saltati.push(`${n} ${slug} — video di soli ${mbVid.toFixed(2)} MB: export troncato?`); continue }
  if (mbVid > 50) { saltati.push(`${n} ${slug} — video di ${mbVid.toFixed(1)} MB: oltre il limite Bot API`); continue }
  if (mbImg > 10) { saltati.push(`${n} ${slug} — immagine di ${mbImg.toFixed(1)} MB: oltre il limite Bot API`); continue }

  const punti = puntiChiave(testo)
  const apre = apertura(testo)
  const img = componiImg(titolo, punti, CHIUSURE[num % CHIUSURE.length])
  const vid = componiVideo(titolo, apre, num)

  fatti.push({
    n, slug, titolo,
    video: { cartella: `${n}-${slug}-a-video`, testo: vid.testo, media: pathVid, tipo: 'video', mb: mbVid,
             daScrivere: !apre },
    img:   { cartella: `${n}-${slug}-b-img`, testo: img.testo, media: pathImg, tipo: 'foto', mb: mbImg,
             daScrivere: img.usati === 0, punti: img.usati, totPunti: punti.length },
  })
}

// ── Resoconto ──────────────────────────────────────────────────────────────
console.log('='.repeat(74))
console.log(`SERIE ${NOME_SERIE}  ·  ${fatti.length} schede pronte = ${fatti.length * 2} post = ${(fatti.length / 2).toFixed(1)} giorni`)
console.log('='.repeat(74))
for (const f of fatti) {
  const cap = senzaTag(f.img.testo).length
  console.log(`  ${f.n}  ${f.titolo.replace(/<[^>]+>/g, '').slice(0, 48).padEnd(50)} ` +
    `img ${String(cap).padStart(4)}/1024 (${f.img.punti}/${f.img.totPunti} punti)  video ${f.video.mb.toFixed(0)} MB` +
    `${f.video.daScrivere || f.img.daScrivere ? '  ⚠️ DA SCRIVERE' : ''}`)
}
if (saltati.length) {
  console.log('\nSALTATE:')
  for (const s of saltati) console.log(`  ⚠️ ${s}`)
}

if (!flag('scrivi')) {
  console.log(`\n[anteprima] niente scritto su disco. Aggiungi --scrivi per creare la coda in social/telegram/coda/.`)
  process.exit(0)
}

mkdirSync(CODA, { recursive: true })
let creati = 0
for (const f of fatti) {
  for (const p of [f.video, f.img]) {
    const dir = join(CODA, p.cartella)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'post.txt'), p.testo + '\n', 'utf8')
    writeFileSync(join(dir, '_meta.json'), JSON.stringify({
      serie: MATERIA, scheda: f.n, titolo: f.titolo.replace(/<[^>]+>/g, ''),
      tipo: p.tipo, media: p.media, mb: Number(p.mb.toFixed(2)),
      da_rileggere: true,
    }, null, 2) + '\n', 'utf8')
    creati++
  }
}
console.log(`\n[OK] ${creati} post in coda → social/telegram/coda/`)
console.log('Ogni post.txt e\' una BOZZA: rileggila prima di pubblicare.')
