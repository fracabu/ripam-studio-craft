#!/usr/bin/env node
// ============================================================================
// CHI SI E' ISCRITTO DI RECENTE — e chi sta ancora aspettando qualcosa.
//
//   node scripts/iscritti_nuovi.mjs                  # ultimi 2 giorni
//   node scripts/iscritti_nuovi.mjs --giorni 7
//   node scripts/iscritti_nuovi.mjs --da-onorare     # solo chi non ha ricevuto niente
//
// PERCHE' ESISTE (08/08/2026). I post social promettono "iscriviti e ricevi le
// anteprime gratuite", ma l'iscrizione NON consegna da sola le anteprime dei
// report custom per bando (INPS 499 & co.): quelle stanno su Drive e le manda
// una persona. Quindi ogni iscritto arrivato da un post e' una promessa aperta.
// Senza questa lista la promessa si perde, e chi si e' iscritto resta con la
// welcome del catalogo in mano, che non e' quello che gli era stato detto.
//
// COSA MOSTRA, per ciascuno:
//   - stato: CONFERMATO / in attesa di conferma / disiscritto
//   - source: da dove e' arrivato (anteprima, scrivimi, sito...)
//   - se ha gia' ricevuto anteprime (registro `anteprime_inviate`) e quante
//
// La colonna che conta e' l'ultima: "DA ONORARE" = confermato, nessuna
// anteprima a registro. Sono le persone a cui manca ancora quello che gli e'
// stato promesso.
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

const giorni = Number(arg('giorni', 2))
const soloDaOnorare = flag('da-onorare')

const righe = await sql`
  SELECT s.email, s.nome, s.source, s.requested_materia,
         s.created_at, s.confirmed_at, s.unsubscribed_at,
         (SELECT COUNT(*) FROM anteprime_inviate a WHERE LOWER(a.email) = LOWER(s.email)) AS n_anteprime,
         (SELECT COUNT(*) FROM invii_email i WHERE LOWER(i.email) = LOWER(s.email)) AS n_invii
    FROM newsletter_subscribers s
   WHERE s.created_at >= NOW() - (${giorni} || ' days')::interval
   ORDER BY s.created_at DESC
`

const quando = (d) => d ? new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

const daOnorare = righe.filter(r => r.confirmed_at && !r.unsubscribed_at && Number(r.n_anteprime) === 0)
const lista = soloDaOnorare ? daOnorare : righe

console.log('='.repeat(72))
console.log(`ISCRITTI degli ultimi ${giorni} giorni — ${righe.length} in tutto`)
console.log('='.repeat(72))

if (!lista.length) {
  console.log(soloDaOnorare ? '\nNessuno in attesa: tutti hanno gia\' ricevuto qualcosa.\n' : '\nNessun nuovo iscritto in questa finestra.\n')
} else {
  for (const r of lista) {
    const stato = r.unsubscribed_at ? '❌ DISISCRITTO'
      : r.confirmed_at ? '✅ confermato'
      : '⏳ non ha ancora cliccato la conferma'
    const onora = (r.confirmed_at && !r.unsubscribed_at && Number(r.n_anteprime) === 0) ? '  ← DA ONORARE' : ''
    console.log(`\n${r.nome || '(senza nome)'} <${r.email}>${onora}`)
    console.log(`   iscritto ${quando(r.created_at)} · ${stato}`)
    console.log(`   source: ${r.source || '—'}${r.requested_materia ? ` · ha chiesto: ${r.requested_materia}` : ''}`)
    console.log(`   a registro: ${r.n_anteprime} anteprime, ${r.n_invii} invii`)
  }
  console.log()
}

if (!soloDaOnorare && daOnorare.length) {
  console.log('-'.repeat(72))
  console.log(`⚠️  ${daOnorare.length} confermati SENZA nessuna anteprima a registro.`)
  console.log('   Se sono arrivati da un post che prometteva le anteprime, la promessa')
  console.log('   e\' ancora aperta: gliele deve mandare una persona.')
  console.log('   Elenco secco:  node scripts/iscritti_nuovi.mjs --da-onorare')
  console.log('-'.repeat(72))
}
