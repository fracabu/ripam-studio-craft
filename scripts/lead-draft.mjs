#!/usr/bin/env node
// ============================================================================
// CLI usato dalla skill `auto-risposte-lead`: compone una bozza di risposta a
// un lead (M1–M4) col guscio brand e stampa { subject, text, html } in JSON su
// stdout. NON invia e NON tocca Gmail/DB — la skill prende l'output e crea la
// BOZZA via MCP create_draft.
//
// Uso:
//   node scripts/lead-draft.mjs --category=M1 --nome="Laura" --subject="Nuova richiesta — MIC — Laura"
//   node scripts/lead-draft.mjs --category=M2 --nome="Laura" --slug=diritto-amministrativo --subject="..."
//   node scripts/lead-draft.mjs --category=M3 --nome="Laura" --slug=diritto-amministrativo --audio="https://drive.google.com/..." --subject="..."
//   node scripts/lead-draft.mjs --category=M3 --nome="Bea" --slug=contratti-pubblici --audio="..." --video="..." --manuale="..." --subject="..."
//   node scripts/lead-draft.mjs --category=M4 --nome="Laura" --slug=diritto-amministrativo --link="https://drive.google.com/file/d/<id>/view" --subject="..."
//   node scripts/lead-draft.mjs --category=M5 --nome="Petronella" --materia="SIAE" --subject="..."
//   node scripts/lead-draft.mjs --category=M5 --nome="Petronella" --materia="SIAE" --formats=manuale,audio,video --subject="..."
//
// Argomenti:
//   --category  M1 | M2 | M3 | M4 | M5       (obbligatorio)
//   --nome      nome del lead                (consigliato; default "ciao")
//   --slug      slug materia                 (obbligatorio per M2/M3/M4)
//   --audio     URL anteprima audio EP1      (M3; uno o più tra audio/video/manuale)
//   --video     URL anteprima video EP1      (M3)
//   --manuale   URL anteprima manuale 15pp   (M3)
//   --report    URL anteprima report PDF     (M3; da ANTEPRIME/<slug>/report/)
//   --link      URL anteprima singola Drive  (M4; o M3 come anteprima generica)
//   --materia   nome materia testo libero    (obbligatorio per M5, NON a catalogo)
//   --formats   manuale,audio,video          (M5; default: solo manuale se omesso)
//   --subscribed  true                       (M1; il lead è già iscritto alla newsletter)
//   --subject   oggetto originale del thread (per generare "Re: ...")
// ============================================================================

import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Parse --k=v / --k v
function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const eq = a.indexOf('=')
    if (eq !== -1) {
      out[a.slice(2, eq)] = a.slice(eq + 1)
    } else {
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) { out[a.slice(2)] = next; i++ }
      else out[a.slice(2)] = 'true'
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))

if (!args.category) {
  console.error('Errore: --category obbligatorio (M1|M2|M3|M4|M5)')
  process.exit(1)
}

const modUrl = pathToFileURL(join(ROOT, 'api', '_lib', 'lead-mail.js')).href
const { buildLeadEmail } = await import(modUrl)

try {
  const out = buildLeadEmail({
    category: args.category,
    nome: args.nome,
    slug: args.slug,
    link: args.link,
    audio: args.audio,
    video: args.video,
    manuale: args.manuale,
    report: args.report,
    materia: args.materia,
    formats: args.formats,
    subscribed: args.subscribed,
    originalSubject: args.subject,
  })
  process.stdout.write(JSON.stringify(out))
} catch (err) {
  console.error('Errore:', err.message || err)
  process.exit(1)
}
