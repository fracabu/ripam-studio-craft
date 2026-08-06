#!/usr/bin/env node
// ============================================================================
// Sentinella della casella: controlla la INBOX via IMAP a intervalli e si ferma
// appena arriva qualcosa che RICHIEDE UNA RISPOSTA UMANA, stampandolo in chiaro.
//
// Nasce il 06/08/2026, dopo il blast della vetrina report: le richieste
// arrivano a raffica nell'ora successiva a una newsletter, e stare a guardare
// la casella a mano e' lavoro sprecato.
//
// COSA SEGNALA
//   - richieste dal form /scrivimi su MATERIALI: materia di studio, anteprime,
//     report custom, piano di studio, coaching, tool su misura, prezzi;
//   - RISPOSTE vere di persone (chi replica a una nostra mail).
//
// COSA IGNORA (di proposito)
//   - credenziali e rinnovo credenziali Quiz Pro: le gestisce in autonomia la
//     skill `quiz-pro-onboard`. Segnalarle qui sarebbe solo rumore;
//   - le nostre stesse mail in uscita e i mittenti automatici (noreply & co.).
//
// ⚠️ Il TIPO di richiesta sta nel CORPO ("Cosa serve: ..."), non nell'oggetto:
// l'oggetto e' sempre "Nuova richiesta — <Concorso> — <Nome>". Per questo il
// filtro scarica anche il testo e non si limita agli header.
//
// Uso:
//   node scripts/watch_richieste.mjs                       # 3 min, 40 giri
//   node scripts/watch_richieste.mjs --ogni=120 --giri=20 --da="2026-08-06T13:15:00Z"
//   node scripts/watch_richieste.mjs --tutto               # non filtra: mostra tutto
//
// Solo lettura: non risponde, non etichetta, non tocca il DB.
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs'
import Imap from 'imap'

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const arg = (k, d) => {
  const a = process.argv.find(x => x.startsWith(`--${k}=`))
  return a ? a.split('=').slice(1).join('=') : d
}
const OGNI  = parseInt(arg('ogni', '180'), 10) * 1000
const GIRI  = parseInt(arg('giri', '40'), 10)

// ⚠️ La finestra riparte dall'ULTIMO MESSAGGIO VISTO, non da "adesso".
// Il 06/08/2026 rilanciare con --da=ora-corrente ha aperto un buco fra
// l'ultimo ritrovamento e il rilancio: 5 richieste di una stessa persona,
// arrivate in quei minuti, non sono mai state segnalate. Lo stato si salva
// su file e --da serve solo a forzare una finestra diversa.
const STATO = new URL('../.watch-richieste-state', import.meta.url)
const leggiStato = () => {
  try { return new Date(JSON.parse(readFileSync(STATO, 'utf8')).ultimo) } catch { return null }
}
const salvaStato = (d) => {
  try { writeFileSync(STATO, JSON.stringify({ ultimo: new Date(d).toISOString() }), 'utf8') } catch { /* non bloccante */ }
}
const DA = new Date(arg('da', (leggiStato() || new Date(Date.now() - 15 * 60_000)).toISOString()))
const TUTTO = process.argv.includes('--tutto')
const MIO   = (process.env.GMAIL_USER || '').toLowerCase()

// Gli header IMAP arrivano MIME encoded-word e "folded" su piu' righe: vanno
// unfoldati e decodificati PRIMA di qualunque match, altrimenti il filtro e'
// cieco (e' l'errore che una volta produsse un falso "0 gia' invitati").
const decodeHeader = (s) => {
  if (!s) return ''
  return s.replace(/\r?\n\s+/g, ' ')
    .replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, cs, enc, txt) => {
      try {
        if (enc.toUpperCase() === 'B') return Buffer.from(txt, 'base64').toString('utf8')
        return Buffer.from(txt.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi,
          (_, h) => String.fromCharCode(parseInt(h, 16))), 'binary').toString('utf8')
      } catch { return txt }
    })
}

// Il ramo credenziali e' autonomo: qui non ci interessa.
const E_CREDENZIALI = (t) => /Cosa serve:\s*(Rinnovo )?[Cc]redenziali|credenziali (per accedere a )?RIPAM Studio Quiz Pro/i.test(t)
const E_AUTOMATICA  = (from) => /noreply|no-reply|donotreply|mailer-daemon|notifications?@/i.test(from)

// Il corpo grezzo e' pieno di boundary MIME, header Content-*, tag HTML e della
// citazione del messaggio precedente: qui resta solo il testo che serve a capire
// cosa vuole la persona.
const pulisci = (raw) => {
  let t = raw.replace(/=\r?\n/g, '')                          // soft break quoted-printable
  // I byte quoted-printable vanno raccolti come latin1 e RIletti come utf8,
  // altrimenti gli accenti escono come "Ã¨" invece di "è".
  t = Buffer.from(t.replace(/=([0-9A-F]{2})/gi,
    (_, h) => String.fromCharCode(parseInt(h, 16))), 'latin1').toString('utf8')
  t = t
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')                                 // tag HTML
    .split('\n')
    .filter(r => !/^--/.test(r.trim()) && !/^Content-(Type|Transfer|Disposition)/i.test(r.trim()))
    .join('\n')
  // taglia la citazione della mail precedente
  t = t.split(/Il giorno .{0,40}ha scritto:|Il .{0,30}20\d\d,? alle ore|^>/m)[0]
  const i = t.search(/Nuova richiesta dal sito/i)
  if (i > -1) t = t.slice(i)
  return t.replace(/\s+/g, ' ').trim().slice(0, 260)
}

const cercaUnaVolta = () => new Promise((resolve) => {
  const imap = new Imap({
    user: process.env.GMAIL_USER, password: process.env.GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com', port: 993, tls: true,
    tlsOptions: { rejectUnauthorized: false, servername: 'imap.gmail.com' }, authTimeout: 30000,
  })
  const trovate = []
  imap.once('error', () => resolve(null))       // rete ballerina: si riprova al giro dopo
  imap.once('ready', () => {
    imap.openBox('INBOX', true, (err) => {
      if (err) { imap.end(); return resolve(null) }
      imap.search([['SINCE', DA]], (e, uids) => {
        if (e || !uids || !uids.length) { imap.end(); return resolve([]) }
        const f = imap.fetch(uids, { bodies: ['HEADER.FIELDS (SUBJECT DATE FROM)', 'TEXT'], struct: false })
        f.on('message', (msg) => {
          let head = '', body = ''
          msg.on('body', (stream, info) => {
            stream.on('data', (c) => {
              if (info.which === 'TEXT') { if (body.length < 4000) body += c.toString('utf8') }
              else head += c.toString('utf8')
            })
          })
          msg.once('end', () => {
            const sub  = decodeHeader((head.match(/Subject:([\s\S]*?)(?:\r?\n[A-Za-z-]+:|$)/i) || [])[1] || '').trim()
            const from = decodeHeader((head.match(/From:([\s\S]*?)(?:\r?\n[A-Za-z-]+:|$)/i) || [])[1] || '').trim()
            const dat  = ((head.match(/^Date:(.*)$/mi) || [])[1] || '').trim()
            if (new Date(dat) <= DA) return
            if (E_AUTOMATICA(from)) return

            const daModulo = /Nuova richiesta/i.test(sub)
            const daPersona = !from.toLowerCase().includes(MIO)

            if (!TUTTO) {
              if (daModulo && E_CREDENZIALI(body)) return          // Quiz Pro: altra skill
              if (!daModulo && !daPersona) return                  // roba nostra in uscita
            }
            const cosa = (body.match(/Cosa serve:\s*(.+)/i) || [])[1]
            trovate.push({
              tipo: daModulo ? 'MODULO' : 'RISPOSTA',
              sub, from, dat,
              cosa: cosa ? cosa.trim().replace(/^Cosa serve:\s*/i, '').slice(0, 120) : null,
              estratto: pulisci(body),
            })
          })
        })
        f.once('end', () => { imap.end(); resolve(trovate) })
      })
    })
  })
  imap.connect()
})

const ts = () => new Date().toLocaleTimeString('it-IT')
console.log(`[watch] dopo ${DA.toISOString()} — ogni ${OGNI / 1000}s, max ${GIRI} giri`)
console.log(`[watch] segnalo: materiali, anteprime, prezzi, piani, risposte di persone`)
console.log(`[watch] ignoro:  credenziali/rinnovo Quiz Pro (skill dedicata), automatiche\n`)

for (let i = 1; i <= GIRI; i++) {
  const r = await cercaUnaVolta()
  if (r === null) console.log(`[${ts()}] giro ${i}: connessione fallita, riprovo`)
  else if (r.length) {
    // Si segna l'istante del messaggio piu' recente: il prossimo avvio
    // riparte esattamente da li' e non salta nulla nel frattempo.
    const piuRecente = r.reduce((m, x) => { const d = new Date(x.dat); return (!m || d > m) ? d : m }, null)
    if (piuRecente) salvaStato(piuRecente)
    console.log(`\n🔔 [${ts()}] ${r.length} DA GESTIRE   ·   prossima finestra da ${piuRecente?.toISOString()}\n`)
    for (const x of r) {
      console.log(`  [${x.tipo}] ${x.sub}`)
      console.log(`     da: ${x.from}`)
      console.log(`     il: ${x.dat}`)
      if (x.cosa) console.log(`     cosa serve: ${x.cosa}`)
      console.log(`     ${x.estratto}\n`)
    }
    process.exit(0)
  } else console.log(`[${ts()}] giro ${i}: niente da gestire`)
  if (i < GIRI) await new Promise(s => setTimeout(s, OGNI))
}
console.log(`[watch] nulla da gestire dopo ${GIRI} giri. Rilanciare per continuare.`)
