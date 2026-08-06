#!/usr/bin/env node
// ============================================================================
// Inventario delle RISORSE GRATUITE, in un file che il bot possa leggere.
//
// PERCHE' ESISTE. Il 06/08/2026 una cliente ha chiesto «i decaloghi ci sono
// anche per l'INPS PECS?» e la risposta onesta richiedeva di sapere quali
// decaloghi esistono davvero — informazione che stava solo dentro il codice di
// un altro progetto. Senza inventario si risponde a memoria, cioe' si sbaglia.
//
// ⚠️ Nel portale i "Decaloghi" (etichetta pubblica) sono i `riassunti` (nome
// tecnico di file e rotte). Qui si usa il nome pubblico.
//
// Fonti:
//   ripam-studio-ai      → decaloghi, flashcard, quiz, report di studio
//   ripam-studio-quiz-pro→ simulatore sugli articoli di legge
//   ripam-studio-logica  → allenamento logica
//
// Uso:  node scripts/build_risorse_free_index.mjs [--dry-run]
// ============================================================================
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const AI  = 'C:\\Users\\utente\\ripam-studio-ai\\src\\data'
const OUT = new URL('../src/data/risorse-free-index.js', import.meta.url)
const DRY = process.argv.includes('--dry-run')

// Le cartelle non sono uniformi: i decaloghi sono moduli .js, le flashcard
// file .json in camelCase. Si accettano entrambi e si scarta l'index.
const elenco = (p) => {
  if (!existsSync(p)) return []
  return readdirSync(p)
    .filter(f => (f.endsWith('.js') || f.endsWith('.json')) && !f.startsWith('index.'))
    .map(f => f.replace(/\.(js|json)$/, ''))
    .sort()
}

// I decaloghi generici stanno in riassunti/; alcuni concorsi hanno la propria
// cartella con le materie specifiche.
const decaloghi = {
  generali: elenco(join(AI, 'riassunti')),
  mic: elenco(join(AI, 'mic', 'riassunti')),
  isac: elenco(join(AI, 'isac', 'riassunti')),
  mimit: elenco(join(AI, 'mimit', 'riassunti')),
}
const flashcard = elenco(join(AI, 'flashcard'))
const reportStudio = elenco(join(AI, 'report-studio'))

const conta = (o) => Object.values(o).reduce((n, v) => n + v.length, 0)

const indice = {
  generato_il: new Date().toISOString().slice(0, 10),
  nota: 'Risorse GRATUITE. I "decaloghi" nel portale sono i file riassunti/.',
  portali: {
    'ripam-studio': { url: 'https://www.ripamstudio.it', cosa: 'decaloghi, flashcard, quiz, report di studio, tecniche di studio' },
    'quiz-pro': { url: 'https://ripam-studio-quiz-pro.vercel.app', cosa: 'quiz generati dagli articoli di legge; credenziali gratuite su richiesta' },
    'logica': { url: 'https://ripam-studio-logica.vercel.app', cosa: 'allenamento su logica e ragionamento' },
  },
  decaloghi,
  flashcard,
  report_studio: reportStudio,
  totali: {
    decaloghi: conta(decaloghi),
    flashcard: flashcard.length,
    report_studio: reportStudio.length,
  },
}

if (DRY) {
  console.log(`decaloghi     : ${indice.totali.decaloghi}`)
  for (const [k, v] of Object.entries(decaloghi)) if (v.length) console.log(`  ${k}: ${v.length} — ${v.slice(0, 6).join(', ')}${v.length > 6 ? '…' : ''}`)
  console.log(`flashcard     : ${indice.totali.flashcard}`)
  console.log(`report studio : ${indice.totali.report_studio}`)
} else {
  const testa =
    '// GENERATO DA scripts/build_risorse_free_index.mjs — non modificare a mano.\n' +
    '// Inventario delle risorse GRATUITE (ripam-studio-ai, quiz-pro, logica).\n' +
    '// Serve a rispondere "questo c\'è / questo non c\'è" senza andare a memoria.\n\n'
  writeFileSync(OUT, testa + 'export const RISORSE_FREE = ' + JSON.stringify(indice, null, 1) + '\n', 'utf8')
  console.log(`[OK] decaloghi ${indice.totali.decaloghi} · flashcard ${indice.totali.flashcard} · report ${indice.totali.report_studio} -> src/data/risorse-free-index.js`)
}
