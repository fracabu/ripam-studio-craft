#!/usr/bin/env node
// ============================================================================
// Scansione dei bounce: legge i messaggi del mailer-daemon dalla casella Gmail
// via IMAP, li registra in `bounce_events` e RICALCOLA
// `newsletter_subscribers.bounce_count`.
//
// PERCHÉ (2026-08-29): `bounce_count` era una colonna morta. `api/newsletter/send.js`
// la usa in tre punti per escludere chi sta a `bounce_count >= 3`, e la view
// `newsletter_active` fa lo stesso — ma nessuno l'ha mai incrementata, perché i
// mailer-daemon arrivavano in inbox e non li leggeva nessuno. Il filtro era
// quindi sempre falso: un indirizzo morto restava in lista per sempre.
// Caso scatenante: un typo nel dominio (`tiscai.it` per `tiscali.it`) che ha
// generato bounce per tre giorni senza che nessun sistema se ne accorgesse.
//
// ⚠️ PERMANENTE vs TEMPORANEO — la distinzione che rende utile lo script.
// Un "Delivery Status Notification (Delay)" NON è un indirizzo morto: Gmail sta
// ritentando e la mail può ancora arrivare. Contarlo come bounce escluderebbe
// dalla newsletter gente raggiungibilissima, che è un danno peggiore del problema
// che stiamo risolvendo. Solo 5.x.x / "Action: failed" è definitivo.
//
// Uso:
//   node scripts/bounce_scan.mjs                    # dry-run, ultimi 90 giorni
//   node scripts/bounce_scan.mjs --since 2026-01-01 # dry-run su una finestra
//   node scripts/bounce_scan.mjs --apply            # scrive su DB e ricalcola
//   node scripts/bounce_scan.mjs --lista            # solo il report da DB, niente IMAP
//
// Idempotente due volte: UNIQUE(dsn_message_id, LOWER(email)) + ON CONFLICT DO
// NOTHING sull'inserimento, e `bounce_count` viene RICALCOLATO contando le righe
// permanenti, non incrementato. Rilanciarlo non gonfia niente.
//
// Richiede .env.local (GMAIL_USER, GMAIL_APP_PASSWORD, DATABASE_URL) → gira a PC acceso.
// Schema: db/schema_bounce.sql
// ============================================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Imap from 'imap'
import { neon } from '@neondatabase/serverless'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const SOLO_LISTA = args.includes('--lista')
const since = args.includes('--since')
  ? args[args.indexOf('--since') + 1]
  : new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10)

// --- header MIME: unfold + decode encoded-word (stesso trattamento di
// backfill_invii.mjs: senza, ogni match sull'oggetto è cieco) -----------------
const unfold = (raw) => raw.replace(/\r?\n[ \t]+/g, ' ')
function decodeMime(s) {
  if (!s) return ''
  return s.replace(/\?=[ \t]*=\?/g, '?==?')
    .replace(/=\?([^?]+)\?([QqBb])\?([^?]*)\?=/g, (_, cs, enc, text) => {
      try {
        if (enc.toUpperCase() === 'B') return Buffer.from(text, 'base64').toString('utf8')
        const bytes = text.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (__, h) => String.fromCharCode(parseInt(h, 16)))
        return Buffer.from(bytes.split('').map(c => c.charCodeAt(0)), 'latin1').toString('utf8')
      } catch { return text }
    })
}

// --- il cuore: da un DSN grezzo alla coppia (destinatario, permanente?) ------
//
// La parte `message/delivery-status` di un DSN RFC 3464 contiene, per ogni
// destinatario fallito:
//   Final-Recipient: rfc822; tizio@example.com
//   Action: failed | delayed | delivered
//   Status: 5.1.1
//   Diagnostic-Code: smtp; 550 5.1.1 ...
//
// Gmail però manda anche DSN "umani" senza quella parte. Per questo il
// riconoscimento è a due stadi: prima si prova lo standard, poi si ripiega
// sull'oggetto e sul testo. Se non si riesce a stabilire con certezza che è
// PERMANENTE, si classifica TEMPORANEO: nel dubbio non si esclude nessuno.
function analizzaDsn(raw) {
  const testo = unfold(raw)
  const out = []

  const finali = [...testo.matchAll(/^Final-Recipient:\s*(?:rfc822;)?\s*([^\s>]+)/gim)]
  const originali = [...testo.matchAll(/^Original-Recipient:\s*(?:rfc822;)?\s*([^\s>]+)/gim)]
  const actions = [...testo.matchAll(/^Action:\s*(\w+)/gim)].map(m => m[1].toLowerCase())
  const stati = [...testo.matchAll(/^Status:\s*(\d\.\d+\.\d+)/gim)].map(m => m[1])
  const diag = (testo.match(/^Diagnostic-Code:\s*(.+)$/im) || [])[1] || null

  // L'oggetto Gmail dice già molto: "(Delay)" è temporaneo, "(Failure)" è definitivo.
  const oggetto = decodeMime(((testo.match(/^Subject:\s*(.+)$/im) || [])[1] || '').trim())
  const oggettoDice = /delay|ritard/i.test(oggetto) ? 'temporaneo'
    : /failure|failed|non\s+riuscit|not\s+delivered|undeliverable/i.test(oggetto) ? 'permanente'
    : null

  const destinatari = (finali.length ? finali : originali).map(m => m[1].toLowerCase().replace(/^<|>$/g, ''))
  if (!destinatari.length) return out

  destinatari.forEach((email, i) => {
    if (!/^[^@\s]+@[^@\s]+\.\w+$/.test(email)) return
    const action = actions[i] ?? actions[0] ?? null
    const status = stati[i] ?? stati[0] ?? null

    // Ordine di fiducia: Action e Status sono dati strutturati e vincono
    // sull'oggetto, che è testo di cortesia e cambia con la lingua del mittente.
    let tipo = 'temporaneo'
    if (action === 'failed') tipo = 'permanente'
    else if (action === 'delayed') tipo = 'temporaneo'
    else if (status?.startsWith('5')) tipo = 'permanente'
    else if (status?.startsWith('4')) tipo = 'temporaneo'
    else if (oggettoDice) tipo = oggettoDice

    // Un 5.x.x batte comunque l'Action: capita che Gmail scriva "failed" su
    // problemi transitori, ma un 5 nello Status è definitivo per RFC.
    if (status?.startsWith('5')) tipo = 'permanente'

    out.push({ email, tipo, status, diagnostic: diag ? diag.slice(0, 500) : null, oggetto })
  })
  return out
}

function findBox(boxes, attr, prefix = '') {
  for (const name of Object.keys(boxes)) {
    const b = boxes[name]
    const full = prefix + name
    if (b.attribs && b.attribs.includes(attr)) return full
    if (b.children) { const s = findBox(b.children, attr, full + (b.delimiter || '/')); if (s) return s }
  }
  return null
}

// --- report finale: si legge sempre da DB, mai dalla memoria dello script,
// così `--lista` e la coda di `--apply` dicono esattamente la stessa cosa ------
async function report() {
  const morti = await sql`SELECT * FROM indirizzi_morti`
  if (!morti.length) {
    console.log('\n[i] Nessun indirizzo con bounce permanenti a registro. Buon segno.')
    return
  }
  console.log(`\n--- INDIRIZZI CON BOUNCE PERMANENTI (${morti.length}) ---`)
  for (const m of morti) {
    const inLista = m.ancora_in_lista ? '  ⚠️ ANCORA IN LISTA NEWSLETTER' : ''
    const ultimo = m.ultimo_bounce ? new Date(m.ultimo_bounce).toISOString().slice(0, 10) : '—'
    console.log(`  ${String(m.bounce_permanenti).padStart(2)}x  ${m.email.padEnd(38)} ultimo ${ultimo}${inLista}`)
  }
  const daEscludere = morti.filter(m => m.bounce_permanenti >= 3 && m.ancora_in_lista)
  if (daEscludere.length) {
    console.log(`\n[!] ${daEscludere.length} indirizzi hanno raggiunto 3 bounce: da ora send.js li salta da solo.`)
  }
  const quasi = morti.filter(m => m.bounce_permanenti > 0 && m.bounce_permanenti < 3 && m.ancora_in_lista)
  if (quasi.length) {
    console.log(`[i] ${quasi.length} indirizzi hanno bounce ma sono sotto la soglia di 3: continuano a ricevere.`)
    console.log('    Se uno di questi è un typo evidente nel dominio, si corregge a mano — vale più di tre tentativi.')
  }
}

// --- ricalcolo (non incremento) del contatore -------------------------------
async function ricalcola() {
  const r = await sql`
    UPDATE newsletter_subscribers s
       SET bounce_count = COALESCE(b.n, 0),
           updated_at   = NOW()
      FROM (
        SELECT LOWER(email) AS email, COUNT(*)::int AS n
          FROM bounce_events
         WHERE tipo = 'permanente'
         GROUP BY LOWER(email)
      ) b
     WHERE LOWER(s.email) = b.email
       AND s.bounce_count IS DISTINCT FROM COALESCE(b.n, 0)
    RETURNING s.email, s.bounce_count`
  return r
}

if (SOLO_LISTA) {
  await report()
  process.exit(0)
}

const trovati = []
const imap = new Imap({
  user: process.env.GMAIL_USER, password: process.env.GMAIL_APP_PASSWORD,
  host: 'imap.gmail.com', port: 993, tls: true,
  tlsOptions: { rejectUnauthorized: false, servername: 'imap.gmail.com' }, authTimeout: 30000,
})
const p = (fn) => new Promise((res, rej) => fn((e, r) => e ? rej(e) : res(r)))

imap.once('error', (e) => { console.error('[FAIL]', e.message); process.exit(1) })

imap.once('ready', async () => {
  try {
    // I DSN possono stare in inbox o essere già archiviati: si guarda "All Mail".
    const boxes = await p(cb => imap.getBoxes(cb))
    const box = findBox(boxes, '\\All') || 'INBOX'
    await p(cb => imap.openBox(box, true, cb))
    console.log(`[i] casella: ${box} — cerco mailer-daemon dal ${since}`)

    const uids = await p(cb => imap.search([['SINCE', since], ['FROM', 'mailer-daemon']], cb))
    console.log(`[i] DSN da leggere: ${uids.length}\n`)
    if (!uids.length) { imap.end(); await report(); return }

    await new Promise((res, rej) => {
      // Serve il corpo intero: Final-Recipient e Status stanno nella parte
      // message/delivery-status, non negli header.
      const f = imap.fetch(uids, { bodies: '' })
      let done = 0
      f.on('message', (msg) => {
        let buf = ''
        msg.on('body', (s) => s.on('data', (c) => buf += c.toString('utf8')))
        msg.once('end', () => {
          const mid = ((unfold(buf).match(/^Message-ID:\s*(.+)$/im) || [])[1] || '').trim()
          const date = ((unfold(buf).match(/^Date:\s*(.+)$/im) || [])[1] || '').trim()
          const d = date ? new Date(date) : null
          for (const b of analizzaDsn(buf)) {
            trovati.push({ ...b, dsn_message_id: mid || `no-id-${uids[done]}`,
                           ricevuto_at: d && !isNaN(d) ? d.toISOString() : null })
          }
          if (++done % 100 === 0) console.log(`  … ${done}/${uids.length} letti`)
        })
      })
      f.once('error', rej)
      f.once('end', () => setTimeout(res, 400))
    })

    const perm = trovati.filter(t => t.tipo === 'permanente')
    const temp = trovati.filter(t => t.tipo === 'temporaneo')
    console.log(`\n[i] estratti: ${trovati.length} record — ${perm.length} permanenti, ${temp.length} temporanei (ritentati, NON contati)`)

    const perEmail = new Map()
    for (const t of perm) perEmail.set(t.email, (perEmail.get(t.email) || 0) + 1)
    if (perEmail.size) {
      console.log('\n--- indirizzi con bounce PERMANENTE in questa finestra ---')
      for (const [e, n] of [...perEmail].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}x  ${e}`)
    }

    if (!APPLY) {
      console.log('\n[dry-run] NON scrivo. Rilancia con --apply per registrare e ricalcolare bounce_count.')
      imap.end()
      return
    }

    let scritte = 0
    for (const t of trovati) {
      const r = await sql`
        INSERT INTO bounce_events (email, tipo, status, diagnostic, oggetto, dsn_message_id, ricevuto_at)
        VALUES (${t.email}, ${t.tipo}, ${t.status}, ${t.diagnostic}, ${t.oggetto}, ${t.dsn_message_id}, ${t.ricevuto_at})
        ON CONFLICT DO NOTHING
        RETURNING id`
      if (r.length) scritte++
    }
    console.log(`\n[OK] bounce_events: ${scritte} righe nuove (${trovati.length - scritte} già presenti)`)

    const agg = await ricalcola()
    console.log(`[OK] bounce_count aggiornato su ${agg.length} iscritti`)
    for (const a of agg) console.log(`     ${a.email} → ${a.bounce_count}`)

    await report()
  } catch (e) {
    console.error('[FAIL]', e.message)
  } finally {
    imap.end()
  }
})

imap.connect()
