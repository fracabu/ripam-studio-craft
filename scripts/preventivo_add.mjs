#!/usr/bin/env node
// ============================================================================
// Registra un preventivo sulla tabella `preventivi` (Neon).
// Da lanciare OGNI VOLTA che in una mail esce un prezzo: è il denominatore che
// manca per sapere se un prezzo converte (vedi db/schema_preventivi.sql).
//
// Uso:
//   node scripts/preventivo_add.mjs --email x@y.it --offerta "kit 16 report MIC" --importo 99
//   ... --nome Roberta --bando mic-1800-cod01 --alternative "29 il singolo" \
//       --campagna costi-e-piano-cod01-2026-08-29 --data 2026-08-29
//
// Flag:
//   --email        (obbligatorio)
//   --offerta      (obbligatorio) cosa gli è stato proposto, in chiaro
//   --importo      (obbligatorio) prezzo dell'opzione PRINCIPALE, in euro
//   --nome         nome della persona
//   --bando        slug del bando (per confrontare lo stesso prodotto fra persone)
//   --alternative  le altre opzioni della stessa mail, come testo
//   --campagna     slug della campagna in `invii_email`
//   --esito        aperto (default) | perso | ritirato   ← 'chiuso' lo deduce
//                  conversioni.mjs dagli ordini: non si scrive a mano
//   --note         nota libera
//   --data         data del preventivo (YYYY-MM-DD), default oggi
//   --dry-run      stampa e basta
//
// Idempotente su (email, offerta, giorno): rilanciarlo non duplica.
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
  for (const riga of env.split('\n')) {
    const m = riga.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* su Vercel le env ci sono già */ }

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const EMAIL = (arg('email') || '').trim().toLowerCase()
const OFFERTA = arg('offerta')
const IMPORTO = arg('importo')
const ESITO = arg('esito', 'aperto')

if (!EMAIL || !OFFERTA || IMPORTO === undefined) {
  console.error('Uso: node scripts/preventivo_add.mjs --email <email> --offerta "<cosa>" --importo <eur> [--nome N --bando B --alternative "..." --campagna C --data YYYY-MM-DD]')
  process.exit(1)
}
if (!['aperto', 'perso', 'ritirato'].includes(ESITO)) {
  console.error(`[FAIL] --esito dev'essere aperto | perso | ritirato ("chiuso" lo deduce conversioni.mjs dagli ordini)`)
  process.exit(1)
}
const importo = Number(String(IMPORTO).replace(',', '.'))
if (!Number.isFinite(importo) || importo <= 0) { console.error(`[FAIL] --importo non valido: ${IMPORTO}`); process.exit(1) }

const DATA = arg('data')
const quotatoAt = DATA ? new Date(`${DATA}T12:00:00Z`) : new Date()
if (Number.isNaN(quotatoAt.getTime())) { console.error(`[FAIL] --data non valida: ${DATA}`); process.exit(1) }

const riga = {
  email: EMAIL,
  nome: arg('nome') || null,
  bando: arg('bando') || null,
  offerta: OFFERTA,
  importo_eur: importo,
  alternative: arg('alternative') || null,
  campagna: arg('campagna') || null,
  esito: ESITO,
  note: arg('note') || null,
  quotato_at: quotatoAt.toISOString(),
}

if (flag('dry-run')) {
  console.log('[dry-run] registrerei:')
  console.log(JSON.stringify(riga, null, 2))
  process.exit(0)
}

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
const r = await sql`
  INSERT INTO preventivi (email, nome, bando, offerta, importo_eur, alternative, campagna, esito, note, quotato_at)
  VALUES (${riga.email}, ${riga.nome}, ${riga.bando}, ${riga.offerta}, ${riga.importo_eur},
          ${riga.alternative}, ${riga.campagna}, ${riga.esito}, ${riga.note}, ${riga.quotato_at})
  ON CONFLICT DO NOTHING
  RETURNING id`
if (!r.length) {
  console.log(`[=]  gia' a registro: ${riga.email} — "${riga.offerta}" del ${riga.quotato_at.slice(0, 10)}`)
} else {
  console.log(`[OK] #${r[0].id} preventivo registrato: ${riga.email} — ${importo.toFixed(2)}€ — "${riga.offerta}"`)
}
