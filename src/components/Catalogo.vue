<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MATERIE } from '../data/materie.js'
import { CONCORSI } from '../data/formati.js'
import { CONTENUTI } from '../data/contenuti.js'

const router = useRouter()
const filtro = ref('ALL')
const query = ref('')

// Mappa stato avail → etichetta + classe styling
const STATO = {
  ready:  { l: 'READY', cls: 'st-ready' },
  soon:   { l: 'SOON',  cls: 'st-soon' },
  custom: { l: 'CSTM',  cls: 'st-cstm' }
}

// Icona per chiave formato
const ICO = { pod:'🎙️', aul:'🎧', vid:'🎥', rep:'📄', man:'📚', sim:'🎯' }
const LBL = { pod:'PODCAST', aul:'AUDIO', vid:'VIDEO', rep:'REPORT', man:'MANUALE', sim:'SIM' }

const formatPills = (m) => {
  const out = []
  for (const k of ['pod','aul','vid','rep','man','sim']) {
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

const materieFiltered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return MATERIE.filter(m => {
    if (filtro.value !== 'ALL' && !m.c.includes(filtro.value)) return false
    if (!q) return true
    const hay = [m.t, m.norm, ...(m.c || []), ...(m.topics || [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

const openMateria = (slug) => router.push({ name: 'materia', params: { slug } })
</script>

<template>
  <section id="materie">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">MATERIE</span>
        <h2>{{ MATERIE.length }} materie. <span class="sec-h2-muted">7 famiglie di concorsi.</span></h2>
        <p class="sec-lead">
          Cerca la materia che ti serve, oppure filtra per famiglia di concorso.
          <strong>Non sei in un negozio</strong> — quando trovi quella giusta,
          scrivimi e ne parliamo.
        </p>
      </div>

      <div v-reveal="'up'" class="cat-toolbar">
        <input
          v-model="query"
          class="cat-search"
          type="search"
          placeholder="Cerca materia, normativa, concorso…"
          aria-label="Cerca tra le materie"
        />
        <div class="filters cat-filters" role="tablist" aria-label="Filtra per famiglia">
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

      <div v-if="materieFiltered.length === 0" class="cat-empty">
        Non trovo nessuna materia con questi criteri.
        <a href="#contatti" @click.prevent="openMateria">La costruiamo insieme — scrivimi &rarr;</a>
      </div>

      <div v-else v-reveal class="cat-grid stagger">
        <article
          v-for="m in materieFiltered"
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
    </div>
  </section>
</template>

<style scoped>
.sec-h2-muted{color:var(--muted,#6b6458);font-weight:700}
.sec-lead{max-width:62ch}

.cat-toolbar{
  display:flex;gap:14px;align-items:center;flex-wrap:wrap;
  margin:24px 0 18px;
}
.cat-search{
  flex:1 1 280px;min-width:240px;
  padding:12px 14px;
  background:var(--bg);color:var(--ink);
  border:2px solid var(--ink);
  font-size:14px;line-height:1.2;
  font-family:inherit;
  transition:background .12s;
}
.cat-search:focus{background:var(--acid);outline:none}
.cat-search::placeholder{color:var(--muted,#6b6458);opacity:.85}

.cat-filters{display:flex;gap:8px;flex-wrap:wrap;background:transparent;border:0;padding:0;margin:0}
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

.cat-empty{
  margin:30px 0;padding:24px;
  border:2px dashed var(--ink);background:var(--bg);
  text-align:center;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;letter-spacing:.04em;
}
.cat-empty a{display:inline-block;margin-left:8px;font-weight:700;color:var(--ink);border-bottom:2px solid var(--acid)}

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

@media (prefers-reduced-motion:reduce){
  .cat-card, .cc-arrow{transition:none}
  .cat-card:hover, .cat-card:focus-visible{transform:none}
}
</style>
