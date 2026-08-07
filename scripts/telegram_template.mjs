#!/usr/bin/env node
// ============================================================================
// TEMPLATE del bot Telegram — le risposte che @ripamstudio_bot puo' dare.
//
// Un template e' un testo APPROVATO da Francesco piu' gli inneschi che lo
// fanno scattare. Il bot non improvvisa su punteggi, riserve e scadenze: nel
// gruppo la correzione arriva sempre dopo lo screenshot.
//
//   node scripts/telegram_template.mjs --lista
//   node scripts/telegram_template.mjs --prova "ma chi passa prima a parità di punteggio?"
//   node scripts/telegram_template.mjs --aggiungi --slug preferenze --titolo "A parità di punteggio" \
//        --categoria punteggio --inneschi "chi passa prima|a parità di punteggio" --testo scheda.txt
//   node scripts/telegram_template.mjs --seed schede.json
//   node scripts/telegram_template.mjs --attiva <slug> | --disattiva <slug>
//   node scripts/telegram_template.mjs --auto <slug> | --bozza <slug>
//
// LA PARTE DIFFICILE SONO GLI INNESCHI, non il testo. Dall'analisi dei 22.338
// messaggi del gruppo: "titoli di preferenza" compare 2 volte in tutto, perche'
// la gente scrive "chi passa prima", "a parita' di punteggio", "le riserve
// passano con punteggio piu' basso?". Un innesco in burocratese non si attiva
// mai, e la scheda sembra rotta quando invece e' muta. Per questo esiste
// --prova: si scrivono gli inneschi e si verifica con le frasi VERE del gruppo.
//
// Un template nasce in BOZZA (auto = false): il bot lo prepara e Francesco
// decide. Si promuove ad --auto quando ha retto qualche giro.
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
  const eq = process.argv.find(x => x.startsWith(`--${k}=`))
  return eq ? eq.split('=').slice(1).join('=') : d
}
const flag = (k) => process.argv.includes(`--${k}`)

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) { console.error('[FAIL] manca DATABASE_URL in .env.local'); process.exit(1) }
const sql = neon(url)

const leggibile = (t) => t
  .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '$2 → $1')
  .replace(/<\/?[bi]>/g, '')

// ── --lista ────────────────────────────────────────────────────────────────
if (flag('lista') || process.argv.length === 2) {
  const righe = await sql`
    SELECT t.slug, t.titolo, t.categoria, t.attivo, t.auto, t.usi, t.bando,
           array_length(t.inneschi, 1) AS n_inneschi
    FROM telegram_template t ORDER BY t.categoria, t.slug`
  if (!righe.length) {
    console.log('Nessun template. Il bot non ha ancora niente da rispondere.')
    console.log('Aggiungine uno con --aggiungi, o caricane un gruppo con --seed schede.json')
    process.exit(0)
  }
  console.log(`${righe.length} template:\n`)
  let cat = null
  for (const r of righe) {
    if (r.categoria !== cat) { cat = r.categoria; console.log(`■ ${cat}`) }
    const stato = !r.attivo ? '⏸ spento ' : r.auto ? '🤖 auto  ' : '📝 bozza '
    console.log(`  ${stato} ${r.slug.padEnd(28)} ${String(r.n_inneschi || 0).padStart(2)} inneschi · ${r.usi} usi` +
      `${r.bando ? ` · ${r.bando}` : ''}`)
    console.log(`     ${r.titolo}`)
  }
  console.log('\n🤖 = il bot risponde da solo · 📝 = prepara e aspetta l\'ok di Francesco')
  process.exit(0)
}

// ── --prova "<testo>" ──────────────────────────────────────────────────────
// Si scrive l'innesco e si verifica con le frasi vere del gruppo, PRIMA di
// scoprire dal silenzio che non scattava.
const PROVA = arg('prova')
if (PROVA) {
  const { trovaTemplate } = await import('../api/_lib/telegram-log.js')
  const t = await trovaTemplate(PROVA)
  console.log(`domanda: «${PROVA}»\n`)
  if (!t) {
    console.log('Nessun template scatta. Se e\' una domanda che il gruppo fa davvero,')
    console.log('o manca la scheda o gli inneschi sono scritti con le parole sbagliate.')
    process.exit(0)
  }
  const quale = (t.inneschi || []).filter(i => PROVA.toLowerCase().includes(i.toLowerCase()))
  console.log(`scatta: ${t.slug} — ${t.titolo}`)
  console.log(`modo:   ${t.auto ? 'risponde da solo' : 'prepara la bozza'}`)
  console.log(`per:    ${quale.map(i => `«${i}»`).join(', ')}`)
  console.log('-'.repeat(70))
  console.log(leggibile(t.testo))
  process.exit(0)
}

// ── --attiva / --disattiva / --auto / --bozza ──────────────────────────────
for (const [azione, campo, valore] of [
  ['attiva', 'attivo', true], ['disattiva', 'attivo', false],
  ['auto', 'auto', true], ['bozza', 'auto', false],
]) {
  const slug = arg(azione)
  if (!slug) continue
  const r = campo === 'attivo'
    ? await sql`UPDATE telegram_template SET attivo = ${valore}, aggiornato_at = now() WHERE slug = ${slug} RETURNING slug`
    : await sql`UPDATE telegram_template SET auto = ${valore}, aggiornato_at = now() WHERE slug = ${slug} RETURNING slug`
  if (!r.length) { console.error(`Nessun template con slug "${slug}".`); process.exit(1) }
  console.log(`[OK] ${slug}: ${campo} = ${valore}`)
  process.exit(0)
}

// ── --cancella <slug> ──────────────────────────────────────────────────────
// Le risposte gia' date restano nel registro (telegram_risposte ha ON DELETE
// SET NULL): si cancella la scheda, non la storia di cosa il bot ha detto.
const CANCELLA = arg('cancella')
if (CANCELLA) {
  const r = await sql`DELETE FROM telegram_template WHERE slug = ${CANCELLA} RETURNING slug, usi`
  if (!r.length) { console.error(`Nessun template con slug "${CANCELLA}".`); process.exit(1) }
  console.log(`[OK] cancellato ${r[0].slug} (era stato usato ${r[0].usi} volte)`)
  process.exit(0)
}

// ── Scrittura ──────────────────────────────────────────────────────────────
// L'upsert tiene gli usi e la data di creazione: correggere il testo di una
// scheda non deve azzerarne la storia.
const salva = async (t) => {
  if (!t.slug || !t.titolo || !t.testo) throw new Error('slug, titolo e testo sono obbligatori')
  if (!t.inneschi?.length) throw new Error(`"${t.slug}": senza inneschi la scheda non scattera' mai`)
  const r = await sql`
    INSERT INTO telegram_template (slug, titolo, categoria, inneschi, testo, auto, bando, note)
    VALUES (${t.slug}, ${t.titolo}, ${t.categoria || 'altro'}, ${t.inneschi}, ${t.testo},
            ${t.auto ?? false}, ${t.bando || null}, ${t.note || null})
    ON CONFLICT (slug) DO UPDATE SET
      titolo = EXCLUDED.titolo, categoria = EXCLUDED.categoria, inneschi = EXCLUDED.inneschi,
      testo = EXCLUDED.testo, auto = EXCLUDED.auto, bando = EXCLUDED.bando,
      note = EXCLUDED.note, aggiornato_at = now()
    RETURNING (xmax = 0) AS nuovo`
  return r[0].nuovo ? 'creato' : 'aggiornato'
}

const SEED = arg('seed')
if (SEED) {
  const schede = JSON.parse(readFileSync(SEED, 'utf8'))
  if (!Array.isArray(schede)) { console.error('Il file deve contenere un array di schede.'); process.exit(1) }
  let n = 0
  for (const s of schede) {
    try { console.log(`  ${await salva(s)}: ${s.slug}`); n++ }
    catch (e) { console.error(`  [FAIL] ${s.slug || '(senza slug)'}: ${e.message}`) }
  }
  console.log(`\n[OK] ${n}/${schede.length} schede in DB. Provale con --prova "<domanda vera>".`)
  process.exit(0)
}

if (flag('aggiungi')) {
  const fileTesto = arg('testo')
  if (!fileTesto) { console.error('Manca --testo <file.txt> col corpo della risposta.'); process.exit(1) }
  const esito = await salva({
    slug: arg('slug'), titolo: arg('titolo'), categoria: arg('categoria'),
    inneschi: (arg('inneschi') || '').split('|').map(s => s.trim()).filter(Boolean),
    testo: readFileSync(fileTesto, 'utf8').trim(),
    auto: flag('auto-si'), bando: arg('bando'), note: arg('note'),
  }).catch(e => { console.error(`[FAIL] ${e.message}`); process.exit(1) })
  console.log(`[OK] ${esito}: ${arg('slug')}`)
  console.log(`Verifica che scatti:  node scripts/telegram_template.mjs --prova "<una domanda vera del gruppo>"`)
  process.exit(0)
}

console.log('Comandi: --lista | --prova "<testo>" | --aggiungi | --seed <file.json> | --attiva/--disattiva/--auto/--bozza <slug>')
