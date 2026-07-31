<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { MATERIE } from '../data/materie.js'
import { CONCORSI } from '../data/formati.js'
import { CONTENUTI } from '../data/contenuti.js'

const router = useRouter()
const filtro = ref('ALL')
const query = ref('')

// --- typeahead state ---------------------------------------------------------
const focused = ref(false)
const activeIndex = ref(-1)
const searchEl = ref(null)
let blurTimer = null

// Filtri per concorso: nascosti di default per non affollare la vista.
// Si aprono on-demand col toggle "Sfoglia per concorso".
const showConcorsi = ref(false)

// Slug dei chip-suggerimento mostrati nello stato iniziale (materie più
// richieste, con materiale già pronto). Il label si risolve a runtime da
// MATERIE così non si duplica il testo. Francesco può ritoccare questa lista.
const CHIP_SLUGS = [
  'diritto-amministrativo', 'contabilita-pubblica', 'contratti-pubblici',
  'diritto-ue', 'gdpr', 'logica',
]
const chips = computed(() =>
  CHIP_SLUGS
    .map(slug => MATERIE.find(m => m.slug === slug))
    .filter(Boolean)
    .map(m => ({ slug: m.slug, t: m.t }))
)

// Mappa stato avail → etichetta + classe styling
const STATO = {
  ready:  { l: 'READY', cls: 'st-ready' },
  soon:   { l: 'SOON',  cls: 'st-soon' },
  custom: { l: 'CSTM',  cls: 'st-cstm' }
}

// Icona per chiave formato
const ICO = { pod:'🎙️', vid:'🎥', rep:'📄', man:'📚', sim:'🎯' }
const LBL = { pod:'PODCAST', vid:'AUDIO+VISIVO', rep:'REPORT', man:'MANUALE', sim:'SIM' }

// 'aul' (audio lezioni monovoce) è fuori catalogo dal 31/07/2026: niente badge.
const formatPills = (m) => {
  const out = []
  for (const k of ['pod','vid','rep','man','sim']) {
    const stato = m.avail?.[k]
    if (!stato || !STATO[stato]) continue
    out.push({ k, ico: ICO[k], lbl: LBL[k], stato: STATO[stato].l, cls: STATO[stato].cls })
  }
  return out
}

// Numero episodi reali se esistono nei CONTENUTI; fallback "topics" come argomenti
const epCount = (m) => {
  const c = CONTENUTI?.[m.slug]
  for (const k of ['pod','aul','vid']) {
    if (c?.[k]?.episodes?.length) return { n: c[k].episodes.length, l: 'EPISODI' }
  }
  if (m.topics?.length) return { n: m.topics.length, l: 'ARGOMENTI' }
  return null
}

// --- ricerca -----------------------------------------------------------------
// Suggerimenti typeahead: materie che matchano la query, in ORDINE ALFABETICO,
// massimo 8. La query matcha nome, normativa, concorsi e argomenti.
const MAX_SUGGEST = 8
const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return MATERIE
    .filter(m => {
      const hay = [m.t, m.norm, ...(m.c || []), ...(m.topics || [])].join(' ').toLowerCase()
      return hay.includes(q)
    })
    .sort((a, b) => a.t.localeCompare(b.t, 'it'))
    .slice(0, MAX_SUGGEST)
})
const totalMatches = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return 0
  return MATERIE.filter(m => {
    const hay = [m.t, m.norm, ...(m.c || []), ...(m.topics || [])].join(' ').toLowerCase()
    return hay.includes(q)
  }).length
})

const showDropdown = computed(() => focused.value && query.value.trim().length > 0)

// Spezza il nome materia in [prima, match, dopo] per evidenziare la parte digitata
const highlight = (name) => {
  const q = query.value.trim()
  if (!q) return [{ t: name, hit: false }]
  const idx = name.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return [{ t: name, hit: false }]
  return [
    { t: name.slice(0, idx), hit: false },
    { t: name.slice(idx, idx + q.length), hit: true },
    { t: name.slice(idx + q.length), hit: false },
  ].filter(p => p.t.length)
}

// Griglia mostrata SOLO quando si naviga per famiglia di concorso (sottoinsieme
// gestibile). Nello stato iniziale (ALL, nessuna query) si mostrano i chip,
// niente muro di 47 card da scrollare.
const showGrid = computed(() => filtro.value !== 'ALL')
const materieByConcorso = computed(() =>
  MATERIE.filter(m => filtro.value === 'ALL' || m.c.includes(filtro.value))
)

const openMateria = (slug) => router.push({ name: 'materia', params: { slug } })

// --- handlers typeahead ------------------------------------------------------
const onFocus = () => { if (blurTimer) clearTimeout(blurTimer); focused.value = true }
const onBlur = () => { blurTimer = setTimeout(() => { focused.value = false; activeIndex.value = -1 }, 120) }

const onKeydown = (e) => {
  if (!showDropdown.value) return
  const n = suggestions.value.length
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex.value = (activeIndex.value + 1) % n }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex.value = (activeIndex.value - 1 + n) % n }
  else if (e.key === 'Enter') {
    const pick = activeIndex.value >= 0 ? suggestions.value[activeIndex.value] : suggestions.value[0]
    if (pick) { e.preventDefault(); openMateria(pick.slug) }
  }
  else if (e.key === 'Escape') { query.value = ''; activeIndex.value = -1; searchEl.value?.blur() }
}

const pickChip = (slug) => openMateria(slug)
</script>

<template>
  <section id="materie">
    <div class="wrap">
      <div v-reveal class="cat-hero">
        <div class="sec-head cat-head">
          <span class="sec-kicker">MATERIE</span>
          <h2>{{ MATERIE.length }} materie. <span class="sec-h2-muted">7 famiglie di concorsi.</span></h2>
          <p class="sec-lead">
            <strong>Scrivi la materia che ti serve</strong> — bastano due lettere — o scegli un suggerimento.
          </p>
        </div>

        <!-- SEARCH typeahead -->
        <div class="cat-combo">
          <div class="cat-combo-field">
            <span class="cat-combo-ico" aria-hidden="true">⌕</span>
            <input
              ref="searchEl"
              v-model="query"
              class="cat-search"
              type="search"
              role="combobox"
              :aria-expanded="showDropdown"
              aria-autocomplete="list"
              aria-controls="cat-suggest"
              placeholder="Es. diritto amministrativo, contabilità, GDPR…"
              aria-label="Cerca tra le materie"
              autocomplete="off"
              @focus="onFocus"
              @blur="onBlur"
              @keydown="onKeydown"
            />
          </div>

          <!-- dropdown suggerimenti -->
          <ul
            v-if="showDropdown"
            id="cat-suggest"
            class="cat-dropdown"
            role="listbox"
          >
            <li
              v-for="(m, i) in suggestions"
              :key="m.slug"
              class="cat-opt"
              :class="{ active: i === activeIndex }"
              role="option"
              :aria-selected="i === activeIndex"
              @mousedown.prevent="openMateria(m.slug)"
              @mouseenter="activeIndex = i"
            >
              <span class="cat-opt-name">
                <template v-for="(part, pi) in highlight(m.t)" :key="pi">
                  <mark v-if="part.hit">{{ part.t }}</mark><span v-else>{{ part.t }}</span>
                </template>
              </span>
              <span class="cat-opt-meta">{{ m.c.join(' · ') }}</span>
            </li>
            <li v-if="suggestions.length === 0" class="cat-opt cat-opt-empty">
              Nessuna materia per “{{ query }}”. <a href="#contatti" @mousedown.prevent="$router.push('/scrivimi')">La costruiamo insieme &rarr;</a>
            </li>
            <li v-else-if="totalMatches > suggestions.length" class="cat-opt cat-opt-more">
              …e altre {{ totalMatches - suggestions.length }}. Continua a scrivere per affinare.
            </li>
          </ul>
        </div>

        <!-- CHIP suggerimenti (stato iniziale) -->
        <div v-if="!query.trim()" class="cat-chips">
          <button
            v-for="(c, i) in chips"
            :key="c.slug"
            type="button"
            class="cat-chip"
            :class="`chip-c${i % 6}`"
            @click="pickChip(c.slug)"
          >{{ c.t }}</button>
        </div>

        <!-- toggle filtri concorso (nascosti di default) -->
        <button
          type="button"
          class="cat-concorsi-toggle"
          :class="{ open: showConcorsi }"
          :aria-expanded="showConcorsi"
          @click="showConcorsi = !showConcorsi"
        >Sfoglia per concorso <span class="cct-arrow" aria-hidden="true">▾</span></button>

        <!-- FILTRI per famiglia concorso (collassabili) -->
        <div v-if="showConcorsi" class="filters cat-filters" role="tablist" aria-label="Filtra per famiglia">
          <button class="filter f-all" :class="{active: filtro==='ALL'}" @click="filtro='ALL'">
            <span class="f-dot" aria-hidden="true"></span>Tutti
          </button>
          <button
            v-for="c in CONCORSI"
            :key="c"
            class="filter"
            :class="[{active: filtro===c}, `f-${c.toLowerCase()}`]"
            @click="filtro=c"
          >
            <span class="f-dot" aria-hidden="true"></span>{{ c }}
          </button>
        </div>
      </div>

      <!-- GRIGLIA (solo quando si sfoglia per concorso) -->
      <div v-if="showGrid" v-reveal class="cat-grid stagger">
        <article
          v-for="m in materieByConcorso"
          :key="m.slug"
          class="cat-card"
          tabindex="0"
          role="link"
          :aria-label="`Apri scheda materia ${m.t}`"
          @click="openMateria(m.slug)"
          @keydown.enter="openMateria(m.slug)"
          @keydown.space.prevent="openMateria(m.slug)"
        >
          <div class="cc-meta">
            <span
              v-for="cc in m.c"
              :key="cc"
              class="cc-badge"
              :data-c="cc"
            >{{ cc }}</span>
            <span v-if="epCount(m)" class="cc-ep">{{ epCount(m).n }} {{ epCount(m).l }}</span>
          </div>
          <h3 class="cc-title">{{ m.t }}</h3>
          <div class="cc-pills">
            <span
              v-for="p in formatPills(m)"
              :key="p.k"
              class="cc-pill"
              :class="p.cls"
              :title="`${p.lbl} · ${p.stato}`"
            >{{ p.ico }} {{ p.lbl }}</span>
          </div>
          <div class="cc-foot">
            <span class="cc-norm">{{ m.norm }}</span>
            <span class="cc-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </article>
      </div>
      <p class="cc-rc-link">
        Fai un concorso specifico? <RouterLink to="/report-custom">Guarda i report su misura, bando per bando &rarr;</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.sec-h2-muted{color:var(--muted,#6b6458);font-weight:700}

/* HERO ricerca centrata */
.cat-hero{max-width:840px;margin:0 auto}
.cat-head{text-align:center}
.cat-head h2{font-size:clamp(34px,4.8vw,60px)}
.cat-head .sec-lead{max-width:56ch;margin-left:auto;margin-right:auto;font-size:17px}

/* SEARCH / typeahead */
.cat-combo{position:relative;margin:28px auto 22px;max-width:720px;text-align:left}
.cat-combo-field{position:relative;display:flex;align-items:center}
.cat-combo-ico{
  position:absolute;left:20px;font-size:23px;color:var(--muted,#6b6458);
  pointer-events:none;line-height:1;
}
.cat-search{
  width:100%;
  padding:21px 20px 21px 54px;
  background:var(--bg);color:var(--ink);
  border:2px solid var(--ink);
  box-shadow:4px 4px 0 var(--ink);
  font-size:19px;line-height:1.2;
  font-family:inherit;
  transition:background .12s, box-shadow .12s;
}
.cat-search:focus{background:var(--acid);box-shadow:6px 6px 0 var(--ink)}
.cat-search:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.cat-search::placeholder{color:var(--muted,#6b6458);opacity:.85}

.cat-dropdown{
  position:absolute;z-index:30;left:0;right:0;top:calc(100% + 6px);
  margin:0;padding:0;list-style:none;
  background:var(--bg);border:2px solid var(--ink);
  box-shadow:6px 6px 0 var(--ink);
  max-height:340px;overflow-y:auto;
}
.cat-opt{
  display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding:12px 16px;cursor:pointer;
  border-bottom:1px solid var(--rule,#e6dfd2);
}
.cat-opt:last-child{border-bottom:0}
.cat-opt.active{background:var(--acid)}
.cat-opt-name{font-size:15px;font-weight:700;letter-spacing:-.01em;color:var(--ink)}
.cat-opt-name mark{background:var(--acid);color:var(--ink);padding:0 1px}
.cat-opt.active .cat-opt-name mark{background:var(--ink);color:var(--acid)}
.cat-opt-meta{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  color:var(--muted,#6b6458);white-space:nowrap;
}
.cat-opt-empty,.cat-opt-more{
  cursor:default;font-size:13px;color:var(--muted,#6b6458);
  font-family:"JetBrains Mono",ui-monospace,monospace;letter-spacing:.03em;
}
.cat-opt-empty a{color:var(--ink);font-weight:700;border-bottom:2px solid var(--acid)}

/* CHIP suggerimenti (centrati, colorati) */
.cat-chips{display:flex;gap:11px;flex-wrap:wrap;justify-content:center;margin:0 0 20px}
.cat-chip{
  padding:11px 18px;border:2px solid var(--ink);
  font-family:inherit;font-size:15px;font-weight:700;letter-spacing:-.01em;
  cursor:pointer;
  box-shadow:3px 3px 0 var(--ink);
  transition:transform .12s, box-shadow .12s, filter .12s;
}
.cat-chip:hover{transform:translate(-3px,-3px);box-shadow:5px 5px 0 var(--ink);filter:brightness(1.06)}
.cat-chip:active{transform:translate(0,0);box-shadow:2px 2px 0 var(--ink)}
.chip-c0{background:var(--acid,#c6f432);color:var(--ink,#0a0a0a)}
.chip-c1{background:var(--ripam,#3d5aff);color:#fff}
.chip-c2{background:var(--mic,#1aa06b);color:#fff}
.chip-c3{background:var(--funz,#9b4dff);color:#fff}
.chip-c4{background:var(--mimit,#ff6b1a);color:#fff}
.chip-c5{background:var(--isac,#ff3d52);color:#fff}

/* toggle "Sfoglia per concorso" */
.cat-concorsi-toggle{
  display:flex;align-items:center;gap:9px;width:fit-content;margin:4px auto 0;
  background:var(--bg);border:2px solid var(--ink);cursor:pointer;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--ink);
  padding:11px 20px;
  box-shadow:3px 3px 0 var(--ink);
  transition:transform .12s, box-shadow .12s, background .12s;
}
.cat-concorsi-toggle:hover{
  background:var(--acid);
  transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink);
}
.cct-arrow{
  display:inline-block;font-size:14px;line-height:1;
  animation:cctBounce 1.5s ease-in-out infinite;
  transition:transform .2s;
}
.cat-concorsi-toggle.open .cct-arrow{transform:rotate(180deg);animation:none}
@keyframes cctBounce{0%,100%{transform:translateY(-1px)}50%{transform:translateY(3px)}}

/* FILTRI (centrati, mostrati on-demand) */
.cat-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;background:transparent;border:0;padding:0;margin:14px 0 0}
.cat-filters .filter{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 14px;border:2px solid var(--ink);background:var(--bg);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:600;letter-spacing:.05em;
  cursor:pointer;color:var(--ink);
  transition:background .15s, transform .12s;
}
.cat-filters .filter:hover:not(.active){background:var(--bg-alt,#ede6d8)}
.cat-filters .filter.active{background:var(--ink);color:var(--bg)}
.cat-filters .filter.active .f-dot{border-color:var(--bg)}
.f-dot{
  width:10px;height:10px;border-radius:50%;
  background:var(--bg);border:2px solid var(--ink);
  flex:0 0 auto;
}
.cat-filters .f-all .f-dot{background:var(--bg)}
.cat-filters .f-all.active .f-dot{background:var(--bg)}
.cat-filters .f-ripam .f-dot{background:var(--ripam,#3d5aff)}
.cat-filters .f-mic   .f-dot{background:var(--mic,#1aa06b)}
.cat-filters .f-funz  .f-dot{background:var(--funz,#9b4dff)}
.cat-filters .f-mimit .f-dot{background:var(--mimit,#ff6b1a)}
.cat-filters .f-isac  .f-dot{background:var(--isac,#ff3d52)}
.cat-filters .f-cpi   .f-dot{background:var(--cpi,#14b8b8)}
.cat-filters .f-reg   .f-dot{background:var(--ink)}

.cat-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:18px;margin-top:8px;
}
@media(max-width:980px){.cat-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.cat-grid{grid-template-columns:1fr}}

.cat-card{
  display:flex;flex-direction:column;gap:14px;
  padding:20px;
  background:var(--bg);
  border:2px solid var(--ink);
  box-shadow:3px 3px 0 var(--ink);
  cursor:pointer;
  transition:transform .15s, box-shadow .15s, background .15s;
  text-decoration:none;color:var(--ink);
}
.cat-card:hover, .cat-card:focus-visible{
  transform:translate(-3px,-3px) rotate(-.4deg);
  box-shadow:6px 6px 0 var(--ink);
  outline:none;
}

.cc-meta{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.cc-badge{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:4px 8px;border:2px solid var(--ink);
  background:var(--bg);color:var(--ink);
}
.cc-badge[data-c="RIPAM"]{background:var(--ripam,#3d5aff);color:var(--bg)}
.cc-badge[data-c="MIC"]  {background:var(--mic,#1aa06b);color:var(--bg)}
.cc-badge[data-c="FUNZ"] {background:var(--funz,#9b4dff);color:var(--bg)}
.cc-badge[data-c="MIMIT"]{background:var(--mimit,#ff6b1a);color:var(--bg)}
.cc-badge[data-c="ISAC"] {background:var(--isac,#ff3d52);color:var(--bg)}
.cc-badge[data-c="CPI"]  {background:var(--cpi,#14b8b8);color:var(--bg)}
.cc-badge[data-c="REG"]  {background:var(--ink);color:var(--bg)}
.cc-badge-more{background:var(--bg);color:var(--ink);opacity:.65}

.cc-ep{
  margin-left:auto;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  color:var(--ink);opacity:.7;
}

.cc-title{
  font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1.15;
  margin:0;color:var(--ink);
}

.cc-pills{display:flex;flex-wrap:wrap;gap:6px}
.cc-pill{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  padding:4px 8px;border:2px solid var(--ink);
}
.cc-pill.st-ready{background:var(--mic,#1aa06b);color:#fff}
.cc-pill.st-soon{background:var(--orange,#ff6b1a);color:#fff}
.cc-pill.st-cstm{background:var(--blue,#3d5aff);color:#fff}

.cc-foot{
  margin-top:auto;
  display:flex;justify-content:space-between;align-items:center;
  padding-top:10px;
  border-top:2px dashed var(--ink);
}
.cc-norm{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.05em;
  color:var(--ink);opacity:.85;
}
.cc-arrow{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:18px;font-weight:700;line-height:1;
  transition:transform .15s;
}
.cat-card:hover .cc-arrow{transform:translateX(4px)}

.cc-rc-link{
  margin-top:22px;font-size:14px;color:var(--ink-soft);
}
.cc-rc-link a{ color:var(--ink);font-weight:700;text-decoration:underline; }

@media (prefers-reduced-motion:reduce){
  .cat-card, .cc-arrow, .cat-chip{transition:none}
  .cat-card:hover, .cat-card:focus-visible{transform:none}
  .cat-chip:hover{transform:none}
  .cct-arrow{animation:none}
}
</style>
