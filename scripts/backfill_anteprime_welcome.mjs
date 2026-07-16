#!/usr/bin/env node
// ============================================================================
// Backfill `anteprime_inviate` per le welcome già spedite ma mai registrate.
//
// Perché: la welcome consegna una materia (meta.materia_di_oggi: audio+video+
// manuale da Drive) ma fino al 2026-07-16 non scriveva nel registro anteprime:
// 14 righe 'welcome' contro 219 welcome realmente spedite. Il drip quindi non
// sapeva che quelle persone avevano già la materia e poteva rimandargliela.
//
// La verità recuperabile: `newsletter_send_events` (status='sent') è SEMPRE
// stato scritto → sappiamo chi ha ricevuto quale newsletter_id, e il meta.json
// di quell'id dice quale materia conteneva. Da lì ricostruiamo il registro.
//
// Idempotente: UNIQUE(LOWER(email), materia, formato) + DO NOTHING.
//
// Uso:  node scripts/backfill_anteprime_welcome.mjs --dry-run
//       node scripts/backfill_anteprime_welcome.mjs --apply
// ============================================================================
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const ROOT = 'C:/Users/utente/ripam-studio-craft'
const APPLY = process.argv.includes('--apply')

for (const line of readFileSync(`${ROOT}/.env.local`, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// 1) Quali newsletter consegnano una materia? Lo dice il loro meta.json.
const nlDir = join(ROOT, 'messaggi-clienti', 'newsletter')
const materiaPerNewsletter = new Map()
for (const f of readdirSync(nlDir).filter(f => f.endsWith('.meta.json'))) {
  const id = f.replace('.meta.json', '')
  try {
    const meta = JSON.parse(readFileSync(join(nlDir, f), 'utf8'))
    if (meta.materia_di_oggi) materiaPerNewsletter.set(id, meta.materia_di_oggi)
  } catch { /* meta illeggibile: si salta, non si inventa */ }
}
console.log('--- newsletter che consegnano una materia ---')
for (const [id, mat] of materiaPerNewsletter) console.log(`  ${id} → ${mat}`)
if (!materiaPerNewsletter.size) { console.log('  (nessuna) — niente da backfillare'); process.exit(0) }

// 2) Chi le ha ricevute davvero (send_events è la traccia affidabile).
const ids = [...materiaPerNewsletter.keys()]
const eventi = await sql`
  SELECT e.newsletter_id, s.email, s.nome, e.sent_at
  FROM newsletter_send_events e
  JOIN newsletter_subscribers s ON s.id = e.subscriber_id
  WHERE e.status = 'sent' AND e.newsletter_id = ANY(${ids})
  ORDER BY e.sent_at`
console.log(`\n[i] consegne trovate in newsletter_send_events: ${eventi.length}`)

const righe = eventi.map(e => ({
  email: String(e.email).toLowerCase(),
  nome: e.nome,
  materia: materiaPerNewsletter.get(e.newsletter_id),
  invioId: e.newsletter_id,
  at: e.sent_at,
}))

const perMateria = new Map()
for (const r of righe) perMateria.set(r.materia, (perMateria.get(r.materia) || 0) + 1)
console.log('\n--- da registrare, per materia ---')
for (const [m, n] of perMateria) console.log(`  ${String(n).padStart(4)}x  ${m}`)

// Quante di queste sono GIÀ nel registro?
const gia = await sql`
  SELECT COUNT(*)::int AS n FROM anteprime_inviate
  WHERE canale = 'welcome' AND formato = 'completa-avm'`
console.log(`\n[i] righe 'welcome/completa-avm' già nel registro: ${gia[0].n}`)

if (!APPLY) {
  console.log('\n--- dry-run: niente scritto. Rilancia con --apply. ---')
  process.exit(0)
}

let ok = 0, skip = 0
for (const r of righe) {
  try {
    const res = await sql`
      INSERT INTO anteprime_inviate (email, nome, materia, formato, canale, invio_id, note, inviata_at)
      VALUES (${r.email}, ${r.nome}, ${r.materia}, 'completa-avm', 'welcome', ${r.invioId},
              'backfill da newsletter_send_events', ${r.at})
      ON CONFLICT DO NOTHING
      RETURNING id`
    if (res.length) ok++; else skip++
  } catch (e) {
    console.log(`  [WARN] ${r.email}/${r.materia}: ${e.message}`)
  }
}
console.log(`\n=== FATTO: ${ok} inserite, ${skip} già presenti ===`)
