// ============================================================================
// Backfill del registro `invii_email` a partire da `newsletter_send_events`.
//
// PERCHÉ: send.js logga in invii_email solo dal 16/07/2026. Le newsletter
// spedite prima esistono solo in newsletter_send_events (idempotenza interna
// dell'endpoint), quindi per giaRicevuto() non sono mai partite → il prossimo
// blast ricontatta chi le ha già ricevute. Questo script riversa quello storico.
//
// Gemello di backfill_invii.mjs (che ricostruisce da IMAP): qui la fonte è il DB,
// quindi (email, data, esito) sono esatti, non dedotti. L'oggetto viene dal
// meta.json della newsletter se il file esiste ancora; altrimenti resta null.
//
// Idempotente: ON CONFLICT DO NOTHING sull'unique (LOWER(email), campagna) dentro
// logInvio → rilanciarlo non duplica. Slug campagna IDENTICO a quello di send.js
// (`newsletter-<basename>`), altrimenti il filtro anti-doppione non li accoppia.
//
// Uso:
//   node scripts/backfill_invii_newsletter.mjs --dry-run            # tutte le newsletter
//   node scripts/backfill_invii_newsletter.mjs --apply
//   node scripts/backfill_invii_newsletter.mjs 2026-07-16 --apply   # solo un numero
// ============================================================================
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'

// Env loading a mano (stesso pattern del resto del repo: niente dotenv).
const envPath = new URL('../.env.local', import.meta.url)
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const { logInvio } = await import('../api/_lib/invii-log.js')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const soloNewsletter = args.find(a => !a.startsWith('--')) || null

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const nlDir = join(process.cwd(), 'messaggi-clienti', 'newsletter')

// Oggetto reale della newsletter, se la bozza è ancora sul disco.
function oggettoDi(newsletterId) {
  const p = join(nlDir, `${newsletterId}.meta.json`)
  if (!existsSync(p)) return null
  try {
    const meta = JSON.parse(readFileSync(p, 'utf8'))
    return (typeof meta.campagna === 'string' && meta.campagna.trim())
      ? { subject: meta.subject || null, campagna: meta.campagna.trim() }
      : { subject: meta.subject || null, campagna: null }
  } catch { return null }
}

const rows = soloNewsletter
  ? await sql`
      SELECT e.newsletter_id, e.sent_at, e.status, s.email, s.nome
      FROM newsletter_send_events e JOIN newsletter_subscribers s ON s.id = e.subscriber_id
      WHERE e.newsletter_id = ${soloNewsletter}
      ORDER BY e.newsletter_id, e.sent_at`
  : await sql`
      SELECT e.newsletter_id, e.sent_at, e.status, s.email, s.nome
      FROM newsletter_send_events e JOIN newsletter_subscribers s ON s.id = e.subscriber_id
      ORDER BY e.newsletter_id, e.sent_at`

console.log(`=== BACKFILL invii_email da newsletter_send_events ===`)
console.log(`Modo:        ${apply ? 'APPLY (scrive a DB)' : 'DRY RUN (non scrive)'}`)
console.log(`Newsletter:  ${soloNewsletter || 'tutte'}`)
console.log(`Righe fonte: ${rows.length}\n`)

const perNewsletter = new Map()
for (const r of rows) {
  if (!perNewsletter.has(r.newsletter_id)) perNewsletter.set(r.newsletter_id, [])
  perNewsletter.get(r.newsletter_id).push(r)
}

const totali = { inserite: 0, giaPresenti: 0, errori: 0, skip: 0 }
for (const [newsletterId, righe] of perNewsletter) {
  const meta = oggettoDi(newsletterId)
  // Stesso slug di send.js, altrimenti i due registri non si parlano.
  const campagna = meta?.campagna || `newsletter-${newsletterId}`
  const oggetto = meta?.subject || null
  const esiti = { inserite: 0, giaPresenti: 0, errori: 0, skip: 0 }

  for (const r of righe) {
    if (!apply) { esiti.skip++; continue }
    const esito = await logInvio({
      email: r.email,
      nome: r.nome,
      campagna,
      oggetto,
      tipo: 'newsletter',
      canale: 'blast',
      esito: r.status === 'sent' ? 'sent' : 'failed',
      errore: r.status === 'sent' ? null : 'ricostruito da newsletter_send_events',
      inviataAt: new Date(r.sent_at).toISOString(),   // data reale, non now()
    })
    if (esito === 'inserita') esiti.inserite++
    else if (esito === 'gia-presente') esiti.giaPresenti++
    else esiti.errori++
  }

  console.log(`${newsletterId}  →  campagna "${campagna}"`)
  console.log(`   fonte: ${righe.length} righe${oggetto ? ` · oggetto: "${oggetto.slice(0, 60)}"` : ' · oggetto: (bozza non più su disco)'}`)
  if (apply) console.log(`   inserite: ${esiti.inserite} · già presenti: ${esiti.giaPresenti} · errori: ${esiti.errori}`)
  console.log()
  for (const k of Object.keys(totali)) totali[k] += esiti[k]
}

console.log('=== TOTALE ===')
if (apply) console.log(`inserite: ${totali.inserite} · già presenti: ${totali.giaPresenti} · errori: ${totali.errori}`)
else console.log(`${totali.skip} righe verrebbero scritte. Rilancia con --apply.`)
