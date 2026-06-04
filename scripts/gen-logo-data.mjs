#!/usr/bin/env node
// Rigenera api/_lib/logo-data.js a partire da public/logo.png.
// logo-data.js è la SINGLE SOURCE dei byte del logo per le mail: lo importano
// sia email-shell.js (allegato inline per nodemailer, su Vercel) sia
// scripts/lead-draft.mjs (bozze della skill auto-risposte-lead, in locale).
// Così le mail NON dipendono né da un file locale a runtime né da un fetch
// remoto: i byte viaggiano dentro al codice deployato.
//
// Quando cambi il logo: sostituisci public/logo.png e rilancia
//   node scripts/gen-logo-data.mjs
// poi committa il logo-data.js aggiornato.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Due loghi gemelli: scuro (su fondo crema) e chiaro (su fondo nero, stile
// newsletter). Entrambi incorporati inline nelle mail/bozze → niente file
// locale né fetch remoto a runtime (le immagini remote vengono bloccate da
// Libero/Outlook → header senza logo). Vedi email-shell.js / lead-draft.mjs.
const TARGETS = [
  {
    src: join(ROOT, 'public', 'logo.png'),
    out: join(ROOT, 'api', '_lib', 'logo-data.js'),
    name: 'LOGO_B64',
    note: 'logo SCURO (per header su fondo crema)',
  },
  {
    src: join(ROOT, 'public', 'logo-dark.png'),
    out: join(ROOT, 'api', '_lib', 'logo-dark-data.js'),
    name: 'LOGO_DARK_B64',
    note: 'logo CHIARO (per header su fondo nero, stile newsletter)',
  },
]

for (const { src, out, name, note } of TARGETS) {
  const b64 = readFileSync(src).toString('base64')
  const header = `// AUTO-GENERATO da ${src.replace(ROOT, '').replace(/\\/g, '/')} — NON modificare a mano.
// Rigenera con: node scripts/gen-logo-data.mjs
// ${note}. Single source dei byte: incorporato inline nelle mail (niente file
// locale né fetch remoto a runtime). Vedi email-shell.js / lead-draft.mjs.
`
  writeFileSync(out, `${header}export const ${name} =\n  '${b64}'\n`)
  console.error(`${out.split(/[\\/]/).pop()} scritto (${b64.length} char base64)`)
}
