#!/usr/bin/env node
// ============================================================================
// Estrae da `bandi-llm-wiki` un INDICE COMPATTO dei bandi e lo scrive in
// src/data/bandi-index.json, che viene committato e finisce nel deploy.
//
// PERCHE' ESISTE. Il bot Telegram gira come webhook su Vercel e NON vede il
// disco dove sta il wiki. Senza indice, per rispondere a "quanti posti ha
// l'INPS 499?" il bot dovrebbe inventare: esattamente cio' che la regola d'oro
// del wiki vieta ("un claim non coperto e' NON COPERTO, mai confermato").
// Con l'indice il bot risponde solo con dati estratti dal wiki, o tace.
//
// Uso:
//   node scripts/build_bandi_index.mjs            # scrive l'indice
//   node scripts/build_bandi_index.mjs --dry-run  # stampa e basta
//
// Da rilanciare quando il wiki cambia. L'indice NON e' una copia del wiki:
// tiene solo i campi che servono a rispondere in chat.
// ============================================================================
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const WIKI = 'C:\\Users\\utente\\bandi-llm-wiki\\wiki\\bandi'
// Modulo .js e non .json: l'import di JSON richiede una import-assertion, la cui
// sintassi è cambiata fra le versioni di Node (assert → with) e romperebbe il
// deploy serverless. Un modulo ES si importa e basta, ovunque.
const OUT  = new URL('../src/data/bandi-index.js', import.meta.url)
const DRY  = process.argv.includes('--dry-run')

// Le date nel wiki possono essere parziali ("2026-07-XX"): vanno tenute come
// stringa e marcate da verificare, mai normalizzate a una data inventata.
const pulisci = (v) => {
  if (v == null) return null
  let s = String(v).split('#')[0].trim().replace(/^["']|["']$/g, '').trim()
  return s === '' ? null : s
}
const incompleta = (d) => !!d && /X/i.test(d)

const frontmatter = (txt) => {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const out = {}
  for (const riga of m[1].split(/\r?\n/)) {
    const kv = riga.match(/^([a-z_]+):(.*)$/i)
    if (!kv) continue
    const k = kv[1].trim()
    let v = pulisci(kv[2])
    if (v && v.startsWith('[')) {
      try { v = JSON.parse(v.replace(/'/g, '"')) } catch { /* lascia stringa */ }
    }
    out[k] = v
  }
  return out
}

// Prima riga di prosa dopo il titolo: serve come descrizione breve in chat.
const sintesi = (txt) => {
  const corpo = txt.replace(/^---[\s\S]*?---/, '')
  for (const riga of corpo.split(/\r?\n/)) {
    const r = riga.trim()
    if (!r || r.startsWith('#') || r.startsWith('>') || r.startsWith('|') || r.startsWith('-')) continue
    return r.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
            .replace(/\*\*/g, '').replace(/\s+/g, ' ').trim().slice(0, 300)
  }
  return null
}

// Titolo di studio richiesto: e' la domanda piu' frequente in assoluto.
const titoloStudio = (txt) => {
  const norm = (s) => s.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
                       .replace(/\*\*/g, '').replace(/^[-*\s]+/, '')
                       .replace(/\s+/g, ' ').trim().slice(0, 300)
  // 1) forma inline: "**Titolo di studio**: ..."
  let m = txt.match(/\*\*Titolo di studio\*\*:?\s*([^\n]+)/i)
       || txt.match(/[Tt]itolo di studio[^\n]{0,40}:\s*([^\n]+)/)
  if (m && m[1].trim()) return norm(m[1])
  // 2) forma a sezione: "### Titolo di studio ...\n\n<prima riga di prosa>"
  const sez = txt.match(/#{2,4}\s*[^\n]*[Tt]itolo di studio[^\n]*\n([\s\S]{0,600})/)
  if (sez) {
    for (const riga of sez[1].split(/\r?\n/)) {
      const r = riga.trim()
      if (!r || r.startsWith('#') || r.startsWith('|')) continue
      return norm(r)
    }
  }
  // 3) ultima spiaggia: la prima riga che nomina diploma/laurea come requisito
  const req = txt.match(/^[-*\s]*\*{0,2}(?:diploma|laurea)[^\n]{10,200}$/im)
  return req ? norm(req[0]) : null
}

const files = readdirSync(WIKI).filter(f => f.endsWith('.md'))
const bandi = []

for (const f of files) {
  const txt = readFileSync(join(WIKI, f), 'utf8')
  const fm = frontmatter(txt)
  if (fm.type && fm.type !== 'bando') continue

  const scad = pulisci(fm.scadenza_domande)
  bandi.push({
    slug: f.replace(/\.md$/, ''),
    titolo: pulisci(fm.title),
    ente: pulisci(fm.ente_banditore),
    profilo: pulisci(fm.profilo),
    posti: fm.posti ? Number(String(fm.posti).replace(/\D/g, '')) || null : null,
    area: pulisci(fm.area_inquadramento),
    titolo_studio: titoloStudio(txt),
    scadenza: scad,
    scadenza_da_verificare: incompleta(scad),
    stato: pulisci(fm.stato_bando),
    prove: Array.isArray(fm.prove) ? fm.prove : (fm.prove ? [fm.prove] : []),
    sintesi: sintesi(txt),
    aggiornato: pulisci(fm.updated) || pulisci(fm.created),
  })
}

bandi.sort((a, b) => (b.posti || 0) - (a.posti || 0))

const indice = {
  generato_il: new Date().toISOString().slice(0, 10),
  fonte: 'bandi-llm-wiki/wiki/bandi',
  avvertenza: 'Dati estratti dal wiki interno. Fa fede sempre il bando ufficiale su inPA.',
  bandi,
}

if (DRY) {
  console.log(`${bandi.length} bandi`)
  for (const b of bandi.slice(0, 8)) {
    console.log(` · ${b.titolo || b.slug}\n   posti ${b.posti} · ${b.stato} · scad. ${b.scadenza || 'n.d.'}${b.scadenza_da_verificare ? ' (da verificare)' : ''}`)
  }
} else {
  const intestazione =
    '// GENERATO DA scripts/build_bandi_index.mjs — non modificare a mano.\n' +
    '// Estratto dal frontmatter di bandi-llm-wiki/wiki/bandi: serve al bot\n' +
    '// Telegram, che gira su Vercel e non vede il disco dove sta il wiki.\n' +
    '// Rigenerare quando il wiki cambia.\n\n'
  writeFileSync(OUT, intestazione + 'export const BANDI_INDEX = ' + JSON.stringify(indice, null, 1) + '\n', 'utf8')
  console.log(`[OK] ${bandi.length} bandi -> src/data/bandi-index.js`)
  const senzaTitolo = bandi.filter(b => !b.titolo_studio).length
  const senzaScad = bandi.filter(b => !b.scadenza).length
  console.log(`     campi mancanti: titolo di studio ${senzaTitolo}/${bandi.length} · scadenza ${senzaScad}/${bandi.length}`)
}
