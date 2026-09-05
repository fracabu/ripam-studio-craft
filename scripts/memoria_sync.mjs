#!/usr/bin/env node
// ============================================================================
// Riversa la cartella `memory/` dell'harness nella tabella `memorie` su Neon.
//
//   node scripts/memoria_sync.mjs               # dry-run: dice cosa farebbe
//   node scripts/memoria_sync.mjs --apply       # scrive
//   node scripts/memoria_sync.mjs --apply --pota  # + cancella da DB le memorie
//                                                 #   il cui file non esiste piu'
//
// ⚠️ SENSO UNICO. I file sono la fonte, questo DB e' lo specchio: qui si legge
//    la cartella e si scrive il DB, mai il contrario. Se un giorno qualcosa
//    scrivesse nei file partendo dal DB, avremmo due verita' — lo stesso errore
//    del proxy di `invii_email`, che diceva "0 gia' invitati" mentre la Posta
//    inviata ne conteneva 38.
//
// ⚠️ La chiave e' il NOME DEL FILE, non il campo `name:` del frontmatter:
//    62 file su 274 hanno un `name:` diverso dal basename. `name:` finisce in
//    `titolo`, che e' un'etichetta, non un identificatore.
//
// Oltre ai file legge MEMORY.md, per catturare la curatela che vive SOLO li':
// sezione, marker (⭐/🔥/⚠️), hook. Senza, la rigenerazione dell'indice la
// perderebbe per sempre.
//
// Richiede .env.local (DATABASE_URL/POSTGRES_URL) → gira a PC acceso.
// ============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const MEM_DIR = process.env.MEMORY_DIR ||
  'C:\\Users\\utente\\.claude\\projects\\C--Users-utente-ripam-studio-craft\\memory'

try {
  const raw = readFileSync(join(ROOT, '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  console.error('[FAIL] .env.local non trovato')
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!databaseUrl) {
  console.error('[FAIL] DATABASE_URL/POSTGRES_URL mancante in .env.local')
  process.exit(1)
}

const argv = new Set(process.argv.slice(2))
const APPLY = argv.has('--apply')
const POTA = argv.has('--pota')

// ---------------------------------------------------------------------------
// 1. I file
// ---------------------------------------------------------------------------

// Il frontmatter esiste in due formati che convivono: quello nuovo annida i
// campi sotto `metadata:` (263 file), quello vecchio li tiene al primo livello
// (11 file). Si leggono entrambi, nuovo prima.
function leggiFrontmatter(fm) {
  const uno = (re) => fm.match(re)?.[1]?.trim() ?? null
  const spoglia = (v) => v ? v.replace(/^["']|["']$/g, '').trim() : null

  return {
    name: spoglia(uno(/^name:\s*(.+)$/m)),
    description: spoglia(uno(/^description:\s*(.+)$/m)),
    // `  type:` indentato = dentro metadata (nuovo); `type:` a inizio riga = vecchio
    tipo: uno(/^\s+type:\s*(\S+)/m) ?? uno(/^type:\s*(\S+)/m),
    originSession: uno(/^\s*originSessionId:\s*(\S+)/m),
    modified: uno(/^\s*modified:\s*(\S+)/m),
  }
}

const files = readdirSync(MEM_DIR).filter(f => f.endsWith('.md') && f !== 'MEMORY.md')
const memorie = new Map()

for (const f of files) {
  const slug = f.replace(/\.md$/, '')
  const full = join(MEM_DIR, f)
  const raw = readFileSync(full, 'utf8')
  const st = statSync(full)

  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const fm = m ? leggiFrontmatter(m[1]) : {}
  const corpo = m ? raw.slice(m[0].length).trim() : raw.trim()

  // wikilink uscenti. Gestisce sia [[slug]] sia [[slug|etichetta]], e tollera
  // chi ha scritto [[slug.md]].
  const link = new Set()
  for (const w of corpo.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const t = w[1].split('|')[0].trim().replace(/\.md$/, '')
    if (t) link.add(t)
  }

  memorie.set(slug, {
    slug,
    tipo: fm.tipo || 'project',
    titolo: fm.name,
    descrizione: fm.description,
    corpo,
    bytes: st.size,
    hash: createHash('sha256').update(raw).digest('hex'),
    modificata_at: fm.modified || null,
    file_mtime: st.mtime.toISOString(),
    origin_session: fm.originSession,
    link: [...link],
    // riempiti dall'indice, se il link c'e'
    sezione: null, etichetta: null, hook: null, marker: null,
    priorita: 0, in_indice: false, indice_riga: null, indice_ordine: null,
  })
}

// ---------------------------------------------------------------------------
// 2. MEMORY.md — la curatela
// ---------------------------------------------------------------------------
// Una riga tipica porta piu' memorie, ognuna col suo marker e la sua coda:
//   - ⭐⭐ [Titolo](file.md) — hook · [Altro](altro.md) altro hook
// Per ogni link si prende: gli emoji che lo precedono (marker), il testo che lo
// segue fino al link successivo (hook), e la sezione ## in cui si trova.

const MARKER_RE = /[\u{2B50}\u{1F525}\u{26A0}\u{FE0F}\u{26D4}\u{2705}\u{1F195}\u{1F534}]/gu
const LINK_RE = /\[([^\]]*)\]\(([^)]+?\.md)\)/g

let indiceLink = 0
let indiceSconosciuti = []

try {
  const idx = readFileSync(join(MEM_DIR, 'MEMORY.md'), 'utf8')
  const righe = idx.split(/\r?\n/)
  let sezione = null

  righe.forEach((riga, i) => {
    const h = riga.match(/^##\s+(.+?)\s*$/)
    if (h) { sezione = h[1]; return }

    const match = [...riga.matchAll(LINK_RE)]
    if (!match.length) return

    match.forEach((mm, k) => {
      indiceLink++
      const slug = mm[2].replace(/\.md$/, '')
      const mem = memorie.get(slug)
      if (!mem) { indiceSconosciuti.push(slug); return }

      // testo fra la fine del link precedente e l'inizio di questo = i marker
      const daPrec = k === 0 ? 0 : match[k - 1].index + match[k - 1][0].length
      const prefix = riga.slice(daPrec, mm.index)
      const marker = (prefix.match(MARKER_RE) || []).join('')

      // testo dopo il link, fino al link successivo (o fine riga) = l'hook
      const aProx = k + 1 < match.length ? match[k + 1].index : riga.length
      let hook = riga.slice(mm.index + mm[0].length, aProx)
        .replace(MARKER_RE, '')
        .replace(/^[\s—·\-–,:]+/, '')
        .replace(/[\s·]+$/, '')
        .trim()

      // Una memoria puo' comparire piu' volte: vince la prima (la piu' in alto).
      if (mem.in_indice) return

      const stelle = (marker.match(/\u{2B50}/gu) || []).length
      const fuochi = (marker.match(/\u{1F525}/gu) || []).length

      mem.in_indice = true
      mem.sezione = sezione
      mem.etichetta = mm[1] || null
      mem.hook = hook || null
      mem.marker = marker || null
      mem.priorita = Math.min(4, stelle + fuochi)
      mem.indice_riga = i + 1
      mem.indice_ordine = k
    })
  })
} catch (e) {
  console.error(`[WARN] MEMORY.md non letto: ${e.message} — la curatela non verra' popolata`)
}

// ---------------------------------------------------------------------------
// 3. Report
// ---------------------------------------------------------------------------

const slugNoti = new Set(memorie.keys())
let linkTot = 0, linkRotti = 0
for (const m of memorie.values()) {
  for (const a of m.link) { linkTot++; if (!slugNoti.has(a)) linkRotti++ }
}

const inIndice = [...memorie.values()].filter(m => m.in_indice).length

console.log('='.repeat(72))
console.log(`  MEMORIA → DB   ${APPLY ? '(APPLY)' : '(DRY-RUN — nessuna scrittura)'}`)
console.log('='.repeat(72))
console.log(`  cartella          ${MEM_DIR}`)
console.log(`  file letti        ${memorie.size}`)
console.log(`  KB               ${([...memorie.values()].reduce((s, m) => s + m.bytes, 0) / 1024).toFixed(0)}`)
console.log(`  link nell'indice  ${indiceLink} → ${inIndice} memorie raggiunte, ${memorie.size - inIndice} FUORI indice`)
if (indiceSconosciuti.length)
  console.log(`  ⚠️  indice punta a ${indiceSconosciuti.length} file inesistenti: ${indiceSconosciuti.join(', ')}`)
console.log(`  wikilink          ${linkTot} (${linkRotti} rotti)`)

const perTipo = {}
for (const m of memorie.values()) perTipo[m.tipo] = (perTipo[m.tipo] ?? 0) + 1
console.log(`  per tipo          ${Object.entries(perTipo).map(([t, n]) => `${t}:${n}`).join('  ')}`)

// ---------------------------------------------------------------------------
// 4. Scrittura
// ---------------------------------------------------------------------------

const client = new Client(databaseUrl)
await client.connect()

const { rows: esistenti } = await client.query('SELECT slug, contenuto_hash FROM memorie')
const hashDb = new Map(esistenti.map(r => [r.slug, r.contenuto_hash]))

let nuove = 0, cambiate = 0, invariate = 0
for (const m of memorie.values()) {
  if (!hashDb.has(m.slug)) nuove++
  else if (hashDb.get(m.slug) !== m.hash) cambiate++
  else invariate++
}
const orfane = esistenti.map(r => r.slug).filter(s => !slugNoti.has(s))

console.log('-'.repeat(72))
console.log(`  nuove ${nuove}   modificate ${cambiate}   invariate ${invariate}   orfane a DB ${orfane.length}`)
if (orfane.length) console.log(`  orfane: ${orfane.join(', ')}`)

if (!APPLY) {
  console.log('\n  Niente scritto. Rilancia con --apply.')
  await client.end()
  process.exit(0)
}

await client.query('BEGIN')
try {
  for (const m of memorie.values()) {
    await client.query(
      `INSERT INTO memorie (slug, tipo, titolo, descrizione, corpo, sezione, etichetta, hook,
                            marker, priorita, in_indice, indice_riga, indice_ordine,
                            file_bytes, contenuto_hash, modificata_at, file_mtime, origin_session,
                            sincronizzata_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, now())
       ON CONFLICT (slug) DO UPDATE SET
         tipo = EXCLUDED.tipo, titolo = EXCLUDED.titolo, descrizione = EXCLUDED.descrizione,
         corpo = EXCLUDED.corpo, sezione = EXCLUDED.sezione, etichetta = EXCLUDED.etichetta,
         hook = EXCLUDED.hook, marker = EXCLUDED.marker, priorita = EXCLUDED.priorita,
         in_indice = EXCLUDED.in_indice, indice_riga = EXCLUDED.indice_riga,
         indice_ordine = EXCLUDED.indice_ordine, file_bytes = EXCLUDED.file_bytes,
         contenuto_hash = EXCLUDED.contenuto_hash, modificata_at = EXCLUDED.modificata_at,
         file_mtime = EXCLUDED.file_mtime, origin_session = EXCLUDED.origin_session,
         sincronizzata_at = now()`,
      [m.slug, m.tipo, m.titolo, m.descrizione, m.corpo, m.sezione, m.etichetta, m.hook,
       m.marker, m.priorita, m.in_indice, m.indice_riga, m.indice_ordine,
       m.bytes, m.hash, m.modificata_at, m.file_mtime, m.origin_session]
    )

    // i link si riscrivono per intero: e' l'unico modo di far sparire quelli
    // rimossi dal testo.
    await client.query('DELETE FROM memorie_link WHERE da_slug = $1', [m.slug])
    for (const a of m.link) {
      await client.query(
        `INSERT INTO memorie_link (da_slug, a_slug, rotto) VALUES ($1,$2,$3)
         ON CONFLICT (da_slug, a_slug) DO UPDATE SET rotto = EXCLUDED.rotto`,
        [m.slug, a, !slugNoti.has(a)]
      )
    }
  }

  if (POTA && orfane.length) {
    await client.query('DELETE FROM memorie WHERE slug = ANY($1::text[])', [orfane])
    console.log(`  potate ${orfane.length} memorie orfane`)
  }

  await client.query('COMMIT')
} catch (e) {
  await client.query('ROLLBACK')
  console.error(`\n[FAIL] rollback: ${e.message}`)
  await client.end()
  process.exit(1)
}

const { rows: [tot] } = await client.query('SELECT COUNT(*)::int n FROM memorie')
const { rows: [lk] } = await client.query('SELECT COUNT(*)::int n, COUNT(*) FILTER (WHERE rotto)::int r FROM memorie_link')
const { rows: [inv] } = await client.query('SELECT COUNT(*)::int n FROM memorie_invisibili')

console.log('-'.repeat(72))
console.log(`  ✅ a DB: ${tot.n} memorie, ${lk.n} link (${lk.r} rotti), ${inv.n} irraggiungibili`)
if (orfane.length && !POTA)
  console.log(`  ⚠️  ${orfane.length} orfane lasciate a DB (rilancia con --pota per rimuoverle)`)

await client.end()
