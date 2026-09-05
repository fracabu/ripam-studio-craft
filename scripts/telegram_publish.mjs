#!/usr/bin/env node
// ============================================================================
// PUBLISHER del palinsesto Telegram — pesca dalla coda e pubblica nel gruppo.
//
// Gemello di publish_post.py di fb-pagina, con UNA differenza che cambia tutto:
// la Bot API di Telegram NON schedula. Facebook accetta un post con
// scheduled_publish_time e lo pubblica lui agli orari previsti anche a PC
// spento; qui l'unico momento in cui un messaggio puo' partire e' adesso.
// Quindi questo script pubblica SUBITO, e gli slot (07:45 · 11:00 · 14:00 ·
// 19:00) sono responsabilita' di chi lo lancia: a mano, o da un runner.
//
//   node scripts/telegram_publish.mjs                    # mostra il prossimo, NON invia
//   node scripts/telegram_publish.mjs --coda             # elenca tutta la coda
//   node scripts/telegram_publish.mjs --prova            # anteprima del prossimo
//   node scripts/telegram_publish.mjs --prova --invia    # lo manda in privato a Francesco
//   node scripts/telegram_publish.mjs --invia            # lo pubblica NEL GRUPPO
//   node scripts/telegram_publish.mjs --quanti 4 --invia # i prossimi 4 (una giornata)
//   node scripts/telegram_publish.mjs --post 02-...-a-video --invia
//   node scripts/telegram_publish.mjs --letto 02-...-a-video   # marca "riletto"
//
// Flag:
//   --serie   quale materia pubblicare (obbligatorio se in coda ce n'e' piu' di una)
//   --post    pubblica quella cartella invece della prima della coda
//   --quanti  quanti post consecutivi (default 1), con pausa tra uno e l'altro
//   --prova   manda alla chat privata di Francesco e NON consuma la coda
//   --suona   con notifica (il palinsesto di default e' silenzioso)
//   --topic   message_thread_id (default 26542, "📚 Studio quotidiano")
//   --chat    override della chat
//   --letto   marca una cartella come riletta e basta (non pubblica)
//   --anche-bozze  pubblica anche cio' che nessuno ha ancora riletto
//   --invia   pubblica davvero (senza, mostra e basta)
//
// TRE GUARDRAIL, e il perche' di ognuno
//
//  1. NIENTE BOZZE NON RILETTE. L'ingest scrive `da_rileggere: true` in ogni
//     _meta.json: le caption sono ricavate dal manuale, non scritte. Davanti a
//     1.814 persone un messaggio sbagliato non si richiama indietro, quindi il
//     default e' rifiutare. Si sblocca con --letto (una cartella per volta,
//     che e' il punto: obbliga ad aprirla) o, in blocco, con --anche-bozze.
//
//  2. SILENZIOSO DI DEFAULT. Quattro post al giorno che fanno squillare 1.814
//     telefoni non sono un palinsesto, sono un motivo per uscire dal gruppo.
//     Il palinsesto sta nel suo topic e non notifica; --suona resta per gli
//     annunci veri, che pero' si fanno con telegram_post.mjs.
//
//  3. IL file_id SI SALVA SEMPRE. Al primo upload Telegram restituisce un
//     identificativo del file sui suoi server, riutilizzabile per sempre e da
//     qualunque macchina. E' l'unica strada per far girare un giorno il
//     palinsesto da cloud (i media stanno su un disco locale da 35 MB l'uno,
//     Vercel non li vedra' mai). Costa una riga di JSON: si salva da subito.
//
// UNA MATERIA PER VOLTA. Le serie escono in fila, come sulla pagina Facebook:
// il manuale si segue dall'inizio alla fine. Con due materie in coda l'ordine
// alfabetico le intreccerebbe (la scheda 02 della seconda viene prima della 03
// della prima), quindi in quel caso lo script si ferma e chiede --serie.
//
// L'archivio e' l'anti-doppione: una cartella pubblicata esce da coda/ ed
// entra in pubblicati/, quindi non puo' ricapitare in testa alla coda.
// ============================================================================
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setDefaultResultOrder } from 'node:dns'

// Windows risolve api.telegram.org prima in IPv6 e il fetch di Node ci si pianta
// sopra (ConnectTimeoutError a 10s) invece di ripiegare su IPv4. Conta doppio qui:
// questo script gira anche schedulato, dove il fallimento non lo vede nessuno.
setDefaultResultOrder('ipv4first')

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
// fileURLToPath e non .pathname: su Windows quest'ultimo restituisce "/C:/…"
// e ri-codifica gli spazi in %20, cioe' un percorso che fs non apre.
const RADICE = fileURLToPath(new URL('../social/telegram/', import.meta.url))
const CODA = join(RADICE, 'coda')
const PUBBLICATI = join(RADICE, 'pubblicati')

const GRUPPO = '@ripam3997studio'
const PRIVATO = '6932784097'          // la chat di Francesco col bot: la sala prove
const TOPIC_PALINSESTO = '26542'      // topic "📚 Studio quotidiano"

const PROVA = flag('prova')
// --prova ignora di proposito --chat: con il default a cascata, un
// "--prova --chat @ripam3997studio" sarebbe finito nel gruppo, per giunta nel
// General (la prova toglie il topic) e senza archiviare. La sala prove e' una
// sola, e non deve poter diventare il palcoscenico per un flag di troppo.
const CHAT = PROVA ? PRIVATO : arg('chat', GRUPPO)
// In una chat privata i topic non esistono: passarli fa fallire l'invio con
// "message thread not found", ed e' un errore che si scopre solo a upload
// finito, dopo aver caricato 35 MB.
const TOPIC = PROVA ? null : arg('topic', TOPIC_PALINSESTO)
const MUTO = !flag('suona')

const MEDIA = {
  video: { metodo: 'sendVideo', campo: 'video', maxMB: 50 },
  foto:  { metodo: 'sendPhoto', campo: 'photo', maxMB: 10 },
}
const CAP_CAPTION = 1024
const POST_AL_GIORNO = 4
const PAUSA_MS = 5000   // tra un post e l'altro: il gruppo accetta ~20 messaggi/minuto

const senzaTag = (t) => t.replace(/<[^>]+>/g, '')
const leggibile = (t) => t
  .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 → $1')
  .replace(/<\/?[bi]>/g, '')
const attendi = (ms) => new Promise(r => setTimeout(r, ms))

// ── Lettura della coda ─────────────────────────────────────────────────────
// Ordine alfabetico, come su fb-pagina (queue.order = name): i nomi sono
// NN-slug-a-video / NN-slug-b-img, quindi per ogni scheda esce prima il video
// e poi l'infografica, e le schede vanno in ordine di manuale.
const leggiCoda = () => {
  if (!existsSync(CODA)) return []
  return readdirSync(CODA, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name).sort()
    .map(nome => {
      const dir = join(CODA, nome)
      const fMeta = join(dir, '_meta.json')
      const fTesto = join(dir, 'post.txt')
      if (!existsSync(fMeta) || !existsSync(fTesto)) return { nome, dir, rotto: 'manca post.txt o _meta.json' }
      const meta = JSON.parse(readFileSync(fMeta, 'utf8'))
      const testo = readFileSync(fTesto, 'utf8').trim()
      const spec = MEDIA[meta.tipo]
      if (!spec) return { nome, dir, meta, testo, rotto: `tipo sconosciuto: ${meta.tipo}` }
      // Il media non viene copiato nella coda: in _meta.json c'e' il percorso
      // sul disco, e da li' puo' essere sparito o cambiato dopo l'ingest.
      if (!existsSync(meta.media)) return { nome, dir, meta, testo, rotto: `media mancante: ${meta.media}` }
      const mb = statSync(meta.media).size / (1024 * 1024)
      const car = senzaTag(testo).length
      let rotto = null
      if (car > CAP_CAPTION) rotto = `caption di ${car} caratteri (max ${CAP_CAPTION})`
      else if (mb > spec.maxMB) rotto = `${meta.tipo} di ${mb.toFixed(1)} MB (max ${spec.maxMB})`
      return { nome, dir, meta, testo, mb, car, spec, rotto }
    })
}

// ── Comandi che non pubblicano ─────────────────────────────────────────────
const coda = leggiCoda()
// Le serie si pubblicano UNA PER VOLTA, come sulla pagina Facebook: una
// materia esce dall'inizio alla fine, poi comincia la successiva. Il rischio
// da evitare e' l'intreccio, ed e' concreto: le cartelle si chiamano
// NN-slug-a-video e l'ordine e' alfabetico, quindi con due materie in coda la
// scheda 02 della seconda si infila prima della 03 della prima. Chi legge il
// gruppo vedrebbe due manuali a giorni alterni.
const SERIE = arg('serie')
const serieInCoda = [...new Set(coda.map(p => p.meta?.serie).filter(Boolean))]
const serieAmbigua = !SERIE && serieInCoda.length > 1
const diSerie = (p) => !SERIE || p.meta?.serie === SERIE

if (SERIE && !serieInCoda.includes(SERIE)) {
  console.error(`In coda non c'e' la serie "${SERIE}". Ci sono: ${serieInCoda.join(', ') || '(nessuna)'}`)
  process.exit(1)
}

if (flag('coda')) {
  if (!coda.length) { console.log('Coda vuota: niente in social/telegram/coda/.'); process.exit(0) }
  for (const s of serieInCoda) {
    const posts = coda.filter(p => p.meta?.serie === s)
    const pronti = posts.filter(p => !p.rotto && !p.meta.da_rileggere).length
    console.log(`\n■ ${s} — ${posts.length} post = ${(posts.length / POST_AL_GIORNO).toFixed(1)} giorni  ·  ${pronti} gia' riletti`)
    for (const p of posts) {
      const stato = p.rotto ? '⚠️ ' : p.meta.da_rileggere ? '📝 ' : '✅ '
      const nota = p.rotto || (p.meta.da_rileggere ? 'da rileggere' : `${p.car}/1024 · ${p.mb.toFixed(0)} MB`)
      console.log(`  ${stato}${p.nome.padEnd(56)} ${nota}`)
    }
  }
  console.log('\n📝 = mai riletto: --letto <cartella> per sbloccarlo.')
  if (serieInCoda.length > 1) console.log('⚠️ Piu\' serie in coda: si pubblica una materia per volta, scegli con --serie <nome>.')
  process.exit(0)
}

const DA_LEGGERE = arg('letto')
if (DA_LEGGERE) {
  const p = coda.find(x => x.nome === DA_LEGGERE)
  if (!p) { console.error(`Non trovo "${DA_LEGGERE}" in coda.`); process.exit(1) }
  const meta = { ...p.meta, da_rileggere: false, riletto_il: new Date().toISOString() }
  writeFileSync(join(p.dir, '_meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8')
  console.log(`[OK] ${p.nome} marcato come riletto.`)
  process.exit(0)
}

// ── Selezione dei post da pubblicare ───────────────────────────────────────
const UNO = arg('post')
const QUANTI = Number(arg('quanti', 1))

let scelti
if (UNO) {
  const p = coda.find(x => x.nome === UNO)
  if (!p) { console.error(`Non trovo "${UNO}" in coda. Elenco: --coda`); process.exit(1) }
  scelti = [p]
} else {
  // Con piu' serie in coda non si sceglie a intuito: pescare "il primo in
  // ordine alfabetico" pubblicherebbe la materia sbagliata senza dirlo.
  if (serieAmbigua) {
    console.error('In coda ci sono piu' + '\' serie e si pubblica una materia per volta:')
    for (const s of serieInCoda) console.error(`  --serie ${s}  (${coda.filter(p => p.meta?.serie === s).length} post)`)
    process.exit(1)
  }
  scelti = coda.filter(p => diSerie(p) && !p.rotto).slice(0, QUANTI)
  if (!scelti.length) {
    console.log(coda.length ? 'Nessun post pubblicabile: la coda ha solo post con problemi (--coda).' : 'Coda vuota.')
    process.exit(0)
  }
}

// ── Anteprima ──────────────────────────────────────────────────────────────
console.log('='.repeat(74))
console.log(`destinazione: ${PROVA ? `PRIVATO di Francesco (${PRIVATO})` : `${CHAT} · topic ${TOPIC}`}` +
  `${MUTO ? ' · senza notifica' : ' · CON NOTIFICA'}`)
// Il conteggio segue la serie che si sta pubblicando: dire "57 post in coda"
// mentre ne escono 56 di una materia sola e' un numero che non aiuta.
const inSerie = coda.filter(p => p.meta?.serie === scelti[0]?.meta?.serie)
console.log(`serie ${scelti[0]?.meta?.serie}: ${inSerie.length} post = ${(inSerie.length / POST_AL_GIORNO).toFixed(1)} giorni` +
  (serieInCoda.length > 1 ? `  ·  in coda anche: ${serieInCoda.filter(s => s !== scelti[0]?.meta?.serie).join(', ')}` : ''))
console.log('='.repeat(74))
for (const p of scelti) {
  console.log(`\n▸ ${p.nome}`)
  if (p.rotto) { console.log(`  ⚠️ NON PUBBLICABILE: ${p.rotto}`); continue }
  console.log(`  ${p.meta.tipo} ${basename(p.meta.media)} — ${p.mb.toFixed(2)} MB · caption ${p.car}/${CAP_CAPTION}` +
    `${p.meta.da_rileggere ? '  📝 MAI RILETTO' : ''}`)
  console.log('  ' + '-'.repeat(70))
  console.log(leggibile(p.testo).split('\n').map(r => '  ' + r).join('\n'))
}
console.log('\n' + '='.repeat(74))

if (!flag('invia')) {
  console.log('[anteprima] NIENTE inviato. Aggiungi --invia per pubblicare.')
  console.log(PROVA ? 'Con --prova --invia lo vedi in privato prima del gruppo.'
                    : 'Consiglio: prima --prova --invia, poi senza --prova.')
  process.exit(0)
}

// ── Invio ──────────────────────────────────────────────────────────────────
if (!TOKEN) { console.error('\n[FAIL] manca TELEGRAM_BOT_TOKEN in .env.local'); process.exit(1) }
const bloccanti = scelti.filter(p => p.rotto)
if (bloccanti.length) {
  console.error(`\n[FAIL] ${bloccanti.length} post non pubblicabili: risolvi prima (--coda).`)
  process.exit(1)
}
// La prova NON e' soggetta al blocco: mandarsi il post in privato e' il modo
// in cui lo si rilegge, vedendolo come lo vedra' il gruppo. Bloccarla
// significherebbe chiedere di approvare un post prima di averlo visto.
const bozze = PROVA ? [] : scelti.filter(p => p.meta.da_rileggere)
if (bozze.length && !flag('anche-bozze')) {
  console.error(`\n[FAIL] ${bozze.length} post non sono mai stati riletti. Le caption le ha ricavate`)
  console.error('       l\'ingest dal manuale: davanti a 1.814 persone si rileggono prima.')
  for (const p of bozze) console.error(`         node scripts/telegram_publish.mjs --letto ${p.nome}`)
  console.error('       Oppure, se le hai gia' + '\' riviste tutte: --anche-bozze')
  process.exit(1)
}

const archivia = (p, esito) => {
  mkdirSync(PUBBLICATI, { recursive: true })
  const ora = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stampo = `${ora.getFullYear()}-${pad(ora.getMonth() + 1)}-${pad(ora.getDate())}-${pad(ora.getHours())}${pad(ora.getMinutes())}`
  let dest = join(PUBBLICATI, `${stampo}__${p.nome}`)
  if (existsSync(dest)) dest = `${dest}-${Date.now()}`
  // Il rename fallisce con EPERM se un antivirus o un Esplora risorse aperto
  // tiene la cartella: qui si riprova, non si perde il post.
  for (let t = 0; t < 5; t++) {
    try { renameSync(p.dir, dest); break }
    catch (e) { if (t === 4) throw e }
  }
  writeFileSync(join(dest, '_meta.json'), JSON.stringify({ ...p.meta, ...esito }, null, 2) + '\n', 'utf8')
  return dest
}

let ok = 0
for (const [i, p] of scelti.entries()) {
  if (i) await attendi(PAUSA_MS)
  const { metodo, campo } = p.spec
  const fd = new FormData()
  fd.append('chat_id', CHAT)
  fd.append('caption', p.testo)
  fd.append('parse_mode', 'HTML')
  if (TOPIC) fd.append('message_thread_id', String(TOPIC))
  if (MUTO) fd.append('disable_notification', 'true')
  // Senza supports_streaming il video e' un allegato da scaricare per intero
  // prima di vederlo: su 35 MB e rete mobile non lo guarda nessuno.
  if (p.meta.tipo === 'video') fd.append('supports_streaming', 'true')
  fd.append(campo, new Blob([readFileSync(p.meta.media)]), basename(p.meta.media))

  process.stdout.write(`\n▸ ${p.nome} — invio ${p.mb.toFixed(1)} MB… `)
  const rr = await fetch(`https://api.telegram.org/bot${TOKEN}/${metodo}`, { method: 'POST', body: fd })
    .then(r => r.json()).catch(e => ({ ok: false, description: e.message }))
  if (!rr?.ok) {
    console.error(`\n[FAIL] ${rr?.description || 'errore sconosciuto'}`)
    console.error(ok ? `       ${ok} post gia' pubblicati e archiviati: la coda riparte da qui.` : '       niente e\' stato pubblicato.')
    process.exit(1)
  }

  // Il file_id: per una foto Telegram restituisce piu' formati, l'ultimo e'
  // quello a risoluzione piena. Vale per sempre e da qualunque macchina.
  const r = rr.result
  const fileId = p.meta.tipo === 'video' ? r.video?.file_id : r.photo?.[r.photo.length - 1]?.file_id
  const link = PROVA ? null : `https://t.me/${CHAT.replace('@', '')}/${TOPIC}/${r.message_id}`
  console.log(`OK — message_id ${r.message_id}`)
  if (link) console.log(`  ${link}`)

  if (PROVA) {
    // Il file_id si stampa anche in prova: e' meta' del motivo per cui la
    // prova esiste. Vederlo qui e' l'unica conferma che l'upload ha davvero
    // depositato il file sui server di Telegram e non solo consegnato un
    // messaggio.
    console.log(`  file_id: ${fileId || '⚠️ NON restituito — da capire prima di contarci per il cloud'}`)
    console.log('  (prova: la coda non e\' stata toccata)')
  } else {
    const dest = archivia(p, {
      pubblicato_il: new Date().toISOString(),
      chat: CHAT, topic: TOPIC, message_id: r.message_id,
      file_id: fileId, link, silenzioso: MUTO,
    })
    console.log(`  archiviato in pubblicati/${basename(dest)}`)
  }
  ok++
}

// Il conteggio finale e' quello della SERIE appena pubblicata, non della coda
// intera: e' l'unico numero che dice quanto manca alla fine di questa materia,
// cioe' quando tocchera' preparare la prossima.
const serieViva = scelti[0].meta.serie
const rimasti = leggiCoda().filter(p => p.meta?.serie === serieViva).length
console.log(`\n[OK] ${ok} post pubblicati. Della serie ${serieViva} restano ${rimasti} post = ` +
  `${(rimasti / POST_AL_GIORNO).toFixed(1)} giorni.`)
if (!rimasti) console.log('Serie finita: il prossimo passo e\' l\'ingest della materia successiva.')
