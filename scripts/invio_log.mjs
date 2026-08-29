#!/usr/bin/env node
// ============================================================================
// Registra a mano una comunicazione in `invii_email` — il caso è sempre lo
// stesso: è partita da un canale che il sistema non vede (Telegram, WhatsApp,
// l'altra casella), quindi nessuno script l'ha loggata.
//
// Gemello di anteprima_log.mjs, ma per le COMUNICAZIONI invece che per i
// materiali. Nasce il 29/08/2026 dopo l'ennesimo `_tmp_log_<nome>_telegram.mjs`
// scritto usa-e-getta: la stessa cosa, fatta la terza volta, merita un comando.
//
//   node scripts/invio_log.mjs --email x@y.it --campagna piano-mic-tizio-2026-08-29 \
//     --oggetto "Piano di studio MIC Cod. 01" --tipo lead --canale telegram
//
// Flag:
//   --email     (obbligatorio)
//   --campagna  (obbligatorio) slug parlante e stabile; per invii ricorrenti
//               METTICI LA DATA, altrimenti l'unique (email, campagna) collassa
//   --oggetto   di cosa si trattava, in chiaro
//   --nome      nome della persona
//   --tipo      invito | campagna | lead | newsletter | credenziali | anteprima
//               | fattura | altro   (default: lead)
//   --canale    blast | lead | auto | manuale | telegram   (default: telegram)
//   --data      quando è partita davvero (YYYY-MM-DD), default adesso
//   --dry-run   stampa e basta
//
// ⚠️ Si logga SOLO ciò che è partito davvero. Scrivere una consegna mai avvenuta
// è peggio che non scriverla: da quel momento nessuno gliela manda più.
// ============================================================================
import { logInvio } from '../api/_lib/invii-log.js'
import { readFileSync } from 'node:fs'

try {
  for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* env già presenti */ }

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`)
  if (i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const email = arg('email')
const campagna = arg('campagna')
if (!email || !campagna) {
  console.error('Uso: node scripts/invio_log.mjs --email <email> --campagna <slug> [--oggetto "..." --nome N --tipo lead --canale telegram --data YYYY-MM-DD]')
  process.exit(1)
}
const data = arg('data')
const riga = {
  email,
  nome: arg('nome') || null,
  campagna,
  oggetto: arg('oggetto') || null,
  tipo: arg('tipo', 'lead'),
  canale: arg('canale', 'telegram'),
  inviataAt: data ? new Date(`${data}T12:00:00Z`).toISOString() : null,
}

if (flag('dry-run')) {
  console.log('[dry-run] registrerei:'); console.log(JSON.stringify(riga, null, 2)); process.exit(0)
}
const esito = await logInvio(riga)
console.log(`[${esito === 'inserita' ? 'OK' : '=='}] ${esito}: ${email} — ${campagna}`)
