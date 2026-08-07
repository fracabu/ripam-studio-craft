#!/usr/bin/env node
// ============================================================================
// BUFFER dei messaggi del gruppo — stato e manutenzione.
//
//   node scripts/telegram_buffer.mjs               # quanti messaggi, quante persone
//   node scripts/telegram_buffer.mjs --persone     # chi ha scritto, dal piu' recente
//   node scripts/telegram_buffer.mjs --cerca anna  # candidati per "rispondi ad Anna"
//   node scripts/telegram_buffer.mjs --purga       # cancella oltre i 7 giorni
//
// LA PURGA VA ESEGUITA. La finestra di 7 giorni e' dichiarata nello schema, ma
// una retention che nessuno esegue e' solo un commento in un file: qui dentro
// ci sono i messaggi di 1.814 persone. Finche' non gira da sola (scheduler),
// va lanciata a mano ogni tanto.
//
// ⚠️ --persone e --cerca mostrano NOMI di membri del gruppo: restano su questa
// macchina (.claude/rules/never.md). Il comando senza argomenti mostra solo
// numeri, ed e' quello da usare per il controllo di routine.
// ============================================================================
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  return d
}
const flag = (k) => process.argv.includes(`--${k}`)

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) { console.error('[FAIL] manca DATABASE_URL in .env.local'); process.exit(1) }
const sql = neon(url)

if (flag('purga')) {
  const giorni = Number(arg('giorni', 7))
  const { purga } = await import('../api/_lib/telegram-log.js')
  console.log(`[OK] ${await purga({ giorni })} messaggi oltre i ${giorni} giorni cancellati.`)
  process.exit(0)
}

const CERCA = arg('cerca')
if (CERCA) {
  const { cercaPersona } = await import('../api/_lib/telegram-log.js')
  const trovati = await cercaPersona(CERCA)
  if (!trovati.length) { console.log(`Nessuno che somigli a "${CERCA}" ha scritto negli ultimi 7 giorni.`); process.exit(0) }
  console.log(`${trovati.length} possibili "${CERCA}":\n`)
  for (const p of trovati) {
    console.log(`  ${String(p.user_id).padEnd(12)} ${(p.nome || '?').padEnd(28)} ` +
      `${p.n_messaggi} msg · ultimo ${new Date(p.ultimo_messaggio_at).toLocaleString('it-IT')}`)
  }
  if (trovati.length > 1) console.log('\n⚠️ Piu\' di uno: nel gruppo gli omonimi sono la norma, va chiesto quale.')
  process.exit(0)
}

if (flag('persone')) {
  const p = await sql`SELECT * FROM telegram_persone LIMIT 40`
  if (!p.length) { console.log('Nessuno nel buffer.'); process.exit(0) }
  for (const x of p) {
    console.log(`  ${(x.nome || '?').padEnd(30)} ${String(x.n_messaggi).padStart(4)} msg · ` +
      `ultimo ${new Date(x.ultimo_messaggio_at).toLocaleString('it-IT')}`)
  }
  process.exit(0)
}

// Default: solo numeri, nessun dato personale a schermo.
const [s] = await sql`
  SELECT COUNT(*)::int AS messaggi,
         COUNT(DISTINCT user_id)::int AS persone,
         MIN(inviato_at) AS dal,
         MAX(inviato_at) AS fino_a
  FROM telegram_messaggi WHERE e_bot = false`
const [vecchi] = await sql`SELECT COUNT(*)::int AS n FROM telegram_da_purgare`

console.log(`messaggi in buffer : ${s.messaggi}`)
console.log(`persone            : ${s.persone}`)
console.log(`finestra           : ${s.dal ? `${new Date(s.dal).toLocaleString('it-IT')} → ${new Date(s.fino_a).toLocaleString('it-IT')}` : '—'}`)
console.log(`da purgare (>7gg)  : ${vecchi.n}${vecchi.n ? '   → node scripts/telegram_buffer.mjs --purga' : ''}`)
if (!s.messaggi) {
  console.log('\nBuffer vuoto. Se e\' cosi\' anche dopo qualche ora di gruppo attivo, il bot')
  console.log('non sta ricevendo i messaggi normali: in @BotFather → /setprivacy → Disable.')
}
