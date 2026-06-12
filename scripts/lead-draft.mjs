#!/usr/bin/env node
// ============================================================================
// CLI usato dalla skill `auto-risposte-lead`: compone una bozza di risposta a
// un lead (M1–M4) col guscio brand e stampa { subject, text, html, attachments }
// in JSON su stdout. NON invia e NON tocca Gmail/DB — la skill prende l'output e
// crea la BOZZA via MCP create_draft, passando `attachments` così com'è (porta
// il logo brand inline → header sempre visibile anche con immagini bloccate).
//
// Uso:
//   node scripts/lead-draft.mjs --category=M1 --nome="Laura" --subject="Nuova richiesta — MIC — Laura"
//   node scripts/lead-draft.mjs --category=M2 --nome="Laura" --slug=diritto-amministrativo --subject="..."
//   node scripts/lead-draft.mjs --category=M3 --nome="Laura" --slug=diritto-amministrativo --audio="https://drive.google.com/..." --subject="..."
//   node scripts/lead-draft.mjs --category=M3 --nome="Bea" --slug=contratti-pubblici --audio="..." --video="..." --manuale="..." --subject="..."
//   node scripts/lead-draft.mjs --category=M4 --nome="Laura" --slug=diritto-amministrativo --link="https://drive.google.com/file/d/<id>/view" --subject="..."
//   node scripts/lead-draft.mjs --category=M5 --nome="Petronella" --materia="SIAE" --subject="..."
//   node scripts/lead-draft.mjs --category=M5 --nome="Petronella" --materia="SIAE" --formats=manuale,audio,video --subject="..."
//   node scripts/lead-draft.mjs --category=RC --nome="Stefania" --concorso=cpi-sicilia-sac --subject="..."
//   node scripts/lead-draft.mjs --category=RC --nome="Stefania" --concorso=cpi-sicilia-sac --reports=contabilita-regionale,lr-10-2000 --prezzo="19,99 € a report" --subject="..."
//
// Argomenti:
//   --category  M1 | M2 | M3 | M4 | M5 | RC  (obbligatorio)
//   --nome      nome del lead                (consigliato; default "ciao")
//   --slug      slug materia                 (obbligatorio per M2/M3/M4)
//   --podcast   URL anteprima podcast EP1    (M3; podcast dialogato ≠ audio lezione)
//   --audio     URL anteprima audio EP1      (M3; uno o più tra podcast/audio/video/manuale)
//   --video     URL anteprima video EP1      (M3)
//   --manuale   URL anteprima manuale 15pp   (M3)
//   --report    URL anteprima report PDF     (M3; da ANTEPRIME/<slug>/report/)
//   --link      URL anteprima singola Drive  (M4; o M3 come anteprima generica)
//   --materia   nome materia testo libero    (obbligatorio per M5, NON a catalogo)
//   --formats   manuale,audio,video          (M5; default: solo manuale se omesso)
//   --concorso  chiave report-custom-manifest (obbligatorio per RC: es. cpi-sicilia-sac)
//   --reports   sottoinsieme chiavi report   (RC opz.; default: tutte le disponibili)
//   --prezzo    testo prezzo report completo (RC opz.; es. "25 €" o "19,99 € a report")
//   --subscribed  true                       (M1; il lead è già iscritto alla newsletter)
//   --subject   oggetto originale del thread (per generare "Re: ...")
// ============================================================================

import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { LOGO_B64 } from '../api/_lib/logo-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Logo brand come allegato INLINE per la bozza Gmail: il guscio email-shell.js
// referenzia l'<img> con `cid:logo.png`, quindi la mail deve PORTARE con sé il
// file (altrimenti header con immagine rotta). I byte arrivano da logo-data.js
// (stessa sorgente delle mail di sistema), già base64 → li mettiamo nel JSON: la
// skill li passa a create_draft come attachment { inline:true, filename:'logo.png' }
// → Gmail genera il Content-ID dal filename, combaciando col `cid:logo.png`.
function logoAttachmentForDraft() {
  return { filename: 'logo.png', mimeType: 'image/png', inline: true, content: LOGO_B64 }
}

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
    podcast: args.podcast,
    audio: args.audio,
    video: args.video,
    manuale: args.manuale,
    report: args.report,
    materia: args.materia,
    formats: args.formats,
    concorso: args.concorso,
    reports: args.reports,
    prezzo: args.prezzo,
    subscribed: args.subscribed,
    originalSubject: args.subject,
  })
  const logo = logoAttachmentForDraft()
  if (logo) out.attachments = [logo]
  process.stdout.write(JSON.stringify(out))
} catch (err) {
  console.error('Errore:', err.message || err)
  process.exit(1)
}
