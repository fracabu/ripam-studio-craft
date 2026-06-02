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
const SRC = join(ROOT, 'public', 'logo.png')
const OUT = join(ROOT, 'api', '_lib', 'logo-data.js')

const b64 = readFileSync(SRC).toString('base64')
const header = `// AUTO-GENERATO da public/logo.png — NON modificare a mano.
// Rigenera con: node scripts/gen-logo-data.mjs
// Single source dei byte del logo brand per le mail (incorporato inline, niente
// file locale né fetch remoto a runtime). Vedi email-shell.js / lead-draft.mjs.
`
writeFileSync(OUT, `${header}export const LOGO_B64 =\n  '${b64}'\n`)
console.error(`logo-data.js scritto (${b64.length} char base64 da ${SRC})`)
