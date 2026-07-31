#!/usr/bin/env node
// ============================================================================
// Backfill del registro `invii_email` dalla Posta inviata di Gmail (IMAP).
//
// Perché: fino al 2026-07-16 la verità su "a chi ho mandato cosa" viveva SOLO
// nella Posta inviata. Questo script la trasferisce a DB una volta per tutte,
// così le campagne successive possono chiedere "gliel'ho già mandata?" in SQL
// invece che con una ricerca IMAP per destinatario.
//
// Idempotente: UNIQUE(LOWER(email), campagna) + ON CONFLICT DO NOTHING →
// rilanciarlo non duplica.
//
// Uso:
//   node scripts/backfill_invii.mjs --dry-run     # analizza e stampa, non scrive
//   node scripts/backfill_invii.mjs --apply       # scrive su DB
//   node scripts/backfill_invii.mjs --apply --since 2026-01-01
//
// NB: gli oggetti Gmail sono MIME encoded-word (=?UTF-8?Q?...?=) e "folded" su
// più righe. Vanno unfoldati e decodificati PRIMA di classificarli: senza questo
// ogni match sull'oggetto è cieco (è l'errore che ha quasi prodotto 38 doppioni).
// ============================================================================
import { readFileSync } from 'node:fs'
import Imap from 'imap'
import { neon } from '@neondatabase/serverless'

const ROOT = 'C:/Users/utente/ripam-studio-craft'
const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const since = args.includes('--since') ? args[args.indexOf('--since') + 1] : null

for (const line of readFileSync(`${ROOT}/.env.local`, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// --- header MIME: unfold + decode encoded-word --------------------------------
const unfold = (raw) => raw.replace(/\r?\n[ \t]+/g, ' ')
function decodeMime(s) {
  if (!s) return ''
  let out = s.replace(/\?=[ \t]*=\?/g, '?==?')
  return out.replace(/=\?([^?]+)\?([QqBb])\?([^?]*)\?=/g, (_, cs, enc, text) => {
    try {
      if (enc.toUpperCase() === 'B') return Buffer.from(text, 'base64').toString('utf8')
      const bytes = text.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (__, h) => String.fromCharCode(parseInt(h, 16)))
      return Buffer.from(bytes.split('').map(c => c.charCodeAt(0)), 'latin1').toString('utf8')
    } catch { return text }
  })
}

// --- classificazione: oggetto reale → (campagna, tipo) ------------------------
// Le campagne storiche sono riconosciute per oggetto. Ordine = priorità.
// Chi non matcha finisce in 'altro-<data>' con tipo 'altro': meglio una riga
// grezza ma vera che una classificazione inventata.
// La campagna può essere una stringa fissa o una funzione (data) => string:
// per drip e newsletter la data DEVE entrare nel nome, altrimenti l'unique
// (email, campagna) collassa in una riga sola i 4 drip ricevuti da una persona
// e il registro mentirebbe dicendo "gliene ho mandato uno".
const REGOLE = [
  // --- inviti / campagne di acquisizione ---
  [/due strumenti gratis/i,                         'invito-newsletter-2026-07-04', 'invito'],
  [/resta aggiornato sui nuovi materiali/i,         'invito-newsletter-2026-06-10', 'invito'],
  [/anteprima completa \(ep1\), in regalo|in regalo/i, 'blast-anteprima-diritto-amm-2026-06-28', 'invito'],
  [/come ti trovi con quiz pro/i,                   'nurture-cold-2026-06-11',      'campagna'],
  // --- newsletter vere e proprie (una campagna per uscita) ---
  [/nuovi report su misura/i,                       'newsletter-2026-07-06',        'newsletter'],
  [/concorso cpi sicilia.*report|3 report, prime pagine/i, 'newsletter-2026-06-22',  'newsletter'],
  // --- drip anteprime: una campagna per invio (la data la mette il drip stesso) ---
  [/materie da scaricare|le ultime \d+ materie|le \d+ materie che mancavano/i,
                                                    (d) => `drip-anteprime-${d}`,   'anteprima'],
  // --- transazionali / sistema ---
  [/le tue credenziali per ripam studio quiz pro/i, 'quizpro-credenziali',          'credenziali'],
  [/account riattivato/i,                           'quizpro-rinnovo',              'credenziali'],
  [/accesso a ripam studio quiz pro.*attivo|credenziali invariate/i, 'quizpro-reinvio', 'credenziali'],
  [/^ho ricevuto la tua richiesta/i,                'ack-form-contatti',            'altro'],
  [/conferma la tua iscrizione/i,                   'newsletter-conferma-optin',    'newsletter'],
  [/manca solo un click/i,                          'newsletter-reminder-optin',    'newsletter'],
  [/benvenut[oa]\.? la tua prima anteprima|benvenut/i, 'newsletter-welcome',        'anteprima'],
  // --- lead / consegne su misura ---
  [/piano di studio/i,                              'piano-studio',                 'lead'],
  // Risposta a una richiesta dal form: l'oggetto è il "Re:" della notifica
  // (api/contact.js → "Nuova richiesta — <Concorso> — <Nome>"). Prima finiva in
  // 'altro-<data>' e il check anti-doppione non la vedeva come lead gestito.
  // La data DEVE stare nella campagna: la stessa persona può ricevere più
  // risposte in giorni diversi e l'unique (email, campagna) le collasserebbe.
  [/^re:\s*nuova richiesta/i,                       (d) => `risposta-lead-${d}`,    'lead'],
  [/anteprim/i,                                     'anteprime-varie',              'anteprima'],
  [/fattura/i,                                      'fattura',                      'fattura'],
  [/newsletter/i,                                   'newsletter-varie',             'newsletter'],
]
function classifica(subj, date) {
  const d = date ? new Date(date) : null
  const stamp = d && !isNaN(d) ? d.toISOString().slice(0, 10) : 'senza-data'
  for (const [re, campagna, tipo] of REGOLE) {
    if (!re.test(subj)) continue
    return { campagna: typeof campagna === 'function' ? campagna(stamp) : campagna, tipo }
  }
  return { campagna: `altro-${stamp}`, tipo: 'altro' }
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

const imap = new Imap({
  user: process.env.GMAIL_USER, password: process.env.GMAIL_APP_PASSWORD,
  host: 'imap.gmail.com', port: 993, tls: true,
  tlsOptions: { rejectUnauthorized: false, servername: 'imap.gmail.com' }, authTimeout: 30000,
})
const p = (fn) => new Promise((res, rej) => fn((e, r) => e ? rej(e) : res(r)))

const righe = []
const MIO = (process.env.GMAIL_USER || '').toLowerCase()

imap.once('error', (e) => { console.error('[FAIL]', e.message); process.exit(1) })

imap.once('ready', async () => {
  try {
    const boxes = await p(cb => imap.getBoxes(cb))
    const sent = findBox(boxes, '\\Sent')
    const box = await p(cb => imap.openBox(sent, true, cb))
    console.log(`[i] ${sent} — ${box.messages.total} messaggi`)

    const crit = since ? [['SINCE', since]] : ['ALL']
    const uids = await p(cb => imap.search(crit, cb))
    console.log(`[i] da processare: ${uids.length}${since ? ` (dal ${since})` : ''}\n`)
    if (!uids.length) { imap.end(); return }

    await new Promise((res, rej) => {
      const f = imap.fetch(uids, { bodies: 'HEADER.FIELDS (TO SUBJECT DATE MESSAGE-ID)' })
      let done = 0
      f.on('message', (msg) => {
        let buf = ''
        msg.on('body', (s) => s.on('data', (c) => buf += c.toString('utf8')))
        msg.once('end', () => {
          const raw = unfold(buf)
          const to = (raw.match(/^To:\s*(.+)$/im) || [])[1] || ''
          const subj = decodeMime(((raw.match(/^Subject:\s*(.+)$/im) || [])[1] || '').trim())
          const date = ((raw.match(/^Date:\s*(.+)$/im) || [])[1] || '').trim()
          const mid = ((raw.match(/^Message-ID:\s*(.+)$/im) || [])[1] || '').trim()
          const nomeMatch = to.match(/^\s*"?([^"<@]+?)"?\s*</)
          const nome = nomeMatch ? nomeMatch[1].trim() : null
          for (const m of to.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)) {
            const email = m[0].toLowerCase()
            if (email === MIO) continue           // mail a me stesso: non è un destinatario
            const { campagna, tipo } = classifica(subj, date)
            const d = date ? new Date(date) : null
            righe.push({ email, nome, campagna, tipo, oggetto: subj, message_id: mid,
                         inviata_at: d && !isNaN(d) ? d.toISOString() : null })
          }
          if (++done % 500 === 0) console.log(`  … ${done}/${uids.length} letti`)
        })
      })
      f.once('error', rej)
      f.once('end', () => setTimeout(res, 400))
    })
    await elabora()
  } catch (e) {
    console.error('[FAIL]', e.message)
  } finally {
    imap.end()
  }
})

// Il riepilogo/scrittura sta nel flusso principale: l'evento 'end' di node-imap
// non è affidabile (a volte il processo esce prima che l'handler giri) —
// appenderci la logica significa perdere silenziosamente tutto il lavoro.
async function elabora() {
  console.log(`\n[i] righe estratte: ${righe.length}`)
  const perCamp = new Map()
  for (const r of righe) perCamp.set(r.campagna, (perCamp.get(r.campagna) || 0) + 1)
  console.log('\n--- per campagna ---')
  for (const [c, n] of [...perCamp].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}x  ${c}`)
  console.log(`\n  persone distinte: ${new Set(righe.map(r => r.email)).size}`)

  // Gli oggetti finiti in 'altro-*' sono quelli che nessuna regola ha riconosciuto:
  // vanno guardati, perché un gruppo grosso qui = una campagna che il registro
  // non saprebbe nominare (e quindi non saprebbe escludere in futuro).
  const nonClass = new Map()
  for (const r of righe) {
    if (!r.campagna.startsWith('altro-')) continue
    nonClass.set(r.oggetto, (nonClass.get(r.oggetto) || 0) + 1)
  }
  console.log('\n--- oggetti NON classificati (top 20) ---')
  for (const [o, n] of [...nonClass].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${String(n).padStart(4)}x  ${(o || '(vuoto)').slice(0, 82)}`)
  }

  if (!APPLY) { console.log('\n--- dry-run: niente scritto. Rilancia con --apply. ---'); return }

  // Dedup in memoria su (email, campagna): tengo l'invio PIÙ RECENTE.
  const uniq = new Map()
  for (const r of righe) {
    const k = `${r.email}|${r.campagna}`
    const prev = uniq.get(k)
    if (!prev || (r.inviata_at && prev.inviata_at && r.inviata_at > prev.inviata_at)) uniq.set(k, r)
  }
  const finali = [...uniq.values()]
  console.log(`\n[i] righe uniche (email+campagna): ${finali.length} — scrivo su DB…`)

  let ok = 0, skip = 0
  for (const r of finali) {
    try {
      const res = await sql`
        INSERT INTO invii_email (email, nome, campagna, oggetto, tipo, canale, message_id, esito, inviata_at)
        VALUES (${r.email}, ${r.nome}, ${r.campagna}, ${r.oggetto}, ${r.tipo}, 'backfill-imap',
                ${r.message_id || null}, 'sent', ${r.inviata_at || new Date().toISOString()})
        ON CONFLICT DO NOTHING
        RETURNING id`
      if (res.length) ok++; else skip++
    } catch (e) {
      console.log(`  [WARN] ${r.email} / ${r.campagna}: ${e.message}`)
    }
  }
  console.log(`\n=== BACKFILL FATTO: ${ok} inserite, ${skip} già presenti ===`)
}

imap.connect()
