<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getMateriaBySlug, MATERIE } from '../data/materie.js'
import { FORMATI } from '../data/formati.js'
import { getContenuti } from '../data/contenuti.js'
import ContactForm from '../components/ContactForm.vue'
import EpisodePlayer from '../components/EpisodePlayer.vue'
import RichiediAnteprimaModale from '../components/RichiediAnteprimaModale.vue'

// Slug delle 17 materie con anteprima manuale 15 pp disponibile (in sync
// con api/_lib/anteprime-manifest.js). Aggiornare entrambi insieme.
const ANTEPRIME_SLUGS = new Set([
  'anticorruzione-trasparenza','cad','contabilita-pubblica','contratti-pubblici',
  'diritto-amministrativo','diritto-civile','diritto-costituzionale',
  'diritto-penale-pa','diritto-processuale-civile','diritto-ue','gdpr',
  'informatica','logica','ordinamento-pa','patrimonio-culturale',
  'pubblico-impiego','sicurezza-lavoro',
])

const router = useRouter()

const route = useRoute()
const slug = computed(() => route.params.slug)
const materia = computed(() => getMateriaBySlug(slug.value))
const contenuti = computed(() => getContenuti(slug.value))

const contactRef = ref(null)
const activeTab = ref('pod')

const scrollToContact = () => {
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}

const requestFormat = (f) => {
  contactRef.value?.prefill({
    materia: materia.value.t,
    prodotto: f.label,
    concorso: materia.value.c[0]
  })
  scrollToContact()
}

const requestSample = () => {
  const contRef = contenuti.value
  const tab = activeTab.value
  const episodio = contRef?.[tab]?.episodes?.find(e => e.free)
  const fmt = FORMATI.find(f => f.k === tab)
  contactRef.value?.prefill({
    materia: materia.value.t,
    prodotto: `Anteprima gratis — ${fmt?.label || 'episodio'}`,
    concorso: materia.value.c[0],
    note: `Vorrei provare gratis l'episodio: "${episodio?.title || 'primo episodio'}" di ${materia.value.t}.`
  })
  scrollToContact()
}

const tabIcon = { pod:'🎙️', aul:'🎧', vid:'🎥', rep:'📄', man:'📚', sim:'🎯' }
const tabLabel = { pod:'Podcast', aul:'Audio Lezioni', vid:'Video', rep:'Report', man:'Manuale', sim:'Simulatore' }

const activeFormato = computed(() => FORMATI.find(f => f.k === activeTab.value))

const freeEpisode = computed(() => {
  const c = contenuti.value
  if (!c) return null
  for (const k of ['pod','aul','vid']) {
    const ep = c[k]?.episodes?.find(e => e.free)
    if (ep) return { ...ep, formato: k }
  }
  return null
})

watch(materia, (m) => {
  if (m) document.title = `${m.t} — Ripam Studio Craft`
  activeTab.value = 'pod'
}, { immediate: true })

// Altre materie della stessa famiglia (massimo 3, escluse quella corrente)
const familySiblings = computed(() => {
  const m = materia.value
  if (!m) return []
  const fam = m.c?.[0]
  if (!fam) return []
  return MATERIE
    .filter(x => x.slug !== m.slug && x.c?.includes(fam))
    .slice(0, 3)
})

const familyName = computed(() => materia.value?.c?.[0] || '')

const goSibling = (slug) => {
  router.push({ name: 'materia', params: { slug } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Stato dei formati per la materia corrente (per il rail laterale dell'hero)
const STATO_LBL = { ready: 'READY', soon: 'SOON', custom: 'CSTM' }
const formatStati = computed(() => {
  const m = materia.value
  if (!m) return []
  const order = ['pod', 'aul', 'vid', 'rep', 'man', 'sim']
  return order.map(k => {
    const stato = m.avail?.[k]
    return {
      k,
      ico: tabIcon[k],
      label: tabLabel[k],
      stato: stato ? STATO_LBL[stato] : null,
      cls: stato || 'na'
    }
  }).filter(f => f.stato || f.k === 'sim') // sim è sempre custom anche senza avail
})

// Click sul formato nel rail: imposta tab attivo + scroll alla sezione formati
const goFormat = (k) => {
  if (!contenuti.value?.[k] && k !== 'sim') return
  activeTab.value = k
  document.getElementById('formati-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Conteggio totale episodi (qualsiasi formato audio/video) per la materia
const epTotal = computed(() => {
  const c = contenuti.value
  if (!c) return null
  for (const k of ['pod', 'aul', 'vid']) {
    if (c[k]?.episodes?.length) return c[k].episodes.length
  }
  return null
})

const askMateria = () => {
  contactRef.value?.prefill({
    materia: materia.value.t,
    concorso: materia.value.c[0],
    prodotto: 'Da concordare insieme'
  })
  scrollToContact()
}

// Modale anteprima manuale (lead-magnet: 15 pp via email, doppio opt-in).
const anteprimaOpen = ref(false)
const hasAnteprima = computed(() => materia.value && ANTEPRIME_SLUGS.has(materia.value.slug))
const openAnteprima = () => { anteprimaOpen.value = true }
const closeAnteprima = () => { anteprimaOpen.value = false }
</script>

<template>
  <main v-if="materia" class="materia-page">
    <!-- HERO MATERIA — 2 colonne: editorial sx + rail formati acid dx -->
    <section class="detail-hero">
      <div class="wrap">
        <div class="mat-breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span>&middot;</span>
          <RouterLink to="/#materie">Materie</RouterLink>
          <span>&middot;</span>
          <span class="bc-now">{{ materia.t }}</span>
        </div>

        <div class="mat-hero-grid">
          <div class="mat-hero-main">
            <div class="badges" style="margin-bottom:18px">
              <span v-for="c in materia.c" :key="c" class="badge" :data-c="c">{{ c }}</span>
              <span v-if="epTotal" class="mat-ep-tag">{{ epTotal }} EPISODI</span>
            </div>
            <h1 class="detail-title">{{ materia.t }}</h1>
            <div class="mat-norm-box" aria-label="Riferimento normativo">
              <span class="mat-norm-l">RIFERIMENTO</span>
              <span class="mat-norm-v">{{ materia.norm }}</span>
            </div>
            <p class="detail-intro">{{ materia.intro }}</p>

            <!-- TEASER: primo episodio gratis -->
            <div v-if="freeEpisode" class="teaser">
              <div class="teaser-ico">{{ tabIcon[freeEpisode.formato] || '🎙️' }}</div>
              <div class="teaser-txt">
                <strong>Prova gratis il primo episodio</strong>
                <span>"{{ freeEpisode.title }}" ({{ freeEpisode.duration }}) — te lo mando senza impegno. Se ti piace, procediamo con il resto.</span>
              </div>
              <button class="btn" type="button" @click="requestSample">Richiedi anteprima →</button>
            </div>
          </div>

          <aside class="mat-rail" aria-label="Formati disponibili">
            <div class="mat-rail-pill">FORMATI DISPONIBILI</div>
            <ul class="mat-rail-list">
              <li
                v-for="f in formatStati"
                :key="f.k"
                class="mat-rail-item"
                :class="`st-${f.cls}`"
                tabindex="0"
                role="button"
                :aria-label="`Apri formato ${f.label}`"
                @click="goFormat(f.k)"
                @keydown.enter="goFormat(f.k)"
                @keydown.space.prevent="goFormat(f.k)"
              >
                <span class="rail-ico" aria-hidden="true">{{ f.ico }}</span>
                <span class="rail-l">{{ f.label }}</span>
                <span v-if="f.stato" class="rail-st">{{ f.stato }}</span>
              </li>
            </ul>
            <button type="button" class="btn btn-primary mat-rail-cta" @click="askMateria">
              Scrivimi per questa materia &rarr;
            </button>
            <div class="mat-rail-foot">
              READY = nel mio archivio &middot; SOON = in produzione &middot; CSTM = su misura
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- I FORMATI (tab con struttura espansa + CTA) -->
    <section id="formati-section" class="mat-section" style="scroll-margin-top:90px">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">I FORMATI</span>
          <h2>Scegli come studiare.</h2>
          <p v-if="contenuti">Sei formati diversi, stesso contenuto. Clicca su un formato per vedere cosa c'è dentro.</p>
          <p v-else>Sei formati possibili sulla stessa materia. Quelli che vedi <strong>READY</strong> li ho già nell'archivio. Per gli altri concordiamo insieme contenuto e tempi.</p>
        </div>

        <!-- FALLBACK: materia senza contenuti dettagliati → griglia 6 formati con stato -->
        <div v-if="!contenuti" class="formats-fallback">
          <article
            v-for="f in FORMATI"
            :key="f.k"
            class="ff-card"
            :class="`ff-${materia.avail?.[f.k] || 'na'}`"
          >
            <div class="ff-head">
              <div class="ff-ico" aria-hidden="true">{{ f.ico }}</div>
              <div class="ff-meta">
                <h3>{{ f.t }}</h3>
                <span class="ff-fmt">{{ f.fmt }}</span>
              </div>
              <span v-if="materia.avail?.[f.k]" class="ff-stato">
                {{ STATO_LBL[materia.avail[f.k]] }}
              </span>
              <span v-else class="ff-stato ff-stato-na">SU RICHIESTA</span>
            </div>
            <p class="ff-desc">{{ f.desc }}</p>
            <button type="button" class="btn btn-primary ff-cta" @click="requestFormat(f)">
              Richiedi {{ f.label }} &rarr;
            </button>
          </article>
        </div>

        <template v-if="contenuti">
        <div class="struct-tabs">
          <button v-for="k in ['pod','aul','vid','rep','man','sim']" :key="k"
            class="struct-tab" :class="{active: activeTab===k}" @click="activeTab=k"
            :disabled="!contenuti[k]">
            <span class="struct-tab-ico">{{ tabIcon[k] }}</span>
            {{ tabLabel[k] }}
          </button>
        </div>

        <!-- descrizione breve del formato attivo -->
        <div v-if="activeFormato" class="struct-intro">
          <p>{{ activeFormato.desc }}</p>
        </div>

        <!-- PODCAST / AUDIO LEZIONI / VIDEO -->
        <div v-if="(activeTab==='pod' || activeTab==='aul' || activeTab==='vid') && contenuti[activeTab]" class="struct-panel">
          <div class="struct-summary">
            <div class="struct-stat">
              <div class="struct-stat-num">{{ contenuti[activeTab].episodes.length }}</div>
              <div class="struct-stat-lbl">EPISODI</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">{{ contenuti[activeTab].total.split('·').pop().trim() }}</div>
              <div class="struct-stat-lbl">DURATA TOT</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">{{ activeTab==='vid' ? 'MP4+SRT' : 'MP3+TXT' }}</div>
              <div class="struct-stat-lbl">FORMATO</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">1</div>
              <div class="struct-stat-lbl">GRATIS</div>
            </div>
          </div>
          <div class="episodes">
            <EpisodePlayer
              v-for="(ep, i) in contenuti[activeTab].episodes"
              :key="`${activeTab}-${ep.n}`"
              :ep="ep"
              :format-label="tabLabel[activeTab].toUpperCase()"
              :format-ext="activeTab === 'vid' ? 'MP4 + SRT' : 'MP3 + TXT'"
              :is-first="i === 0 || ep.free"
              @request="requestFormat(activeFormato)"
            />
          </div>
        </div>

        <!-- REPORT / MANUALE -->
        <div v-else-if="(activeTab==='rep' || activeTab==='man') && contenuti[activeTab]" class="struct-panel">
          <div class="struct-summary">
            <div class="struct-stat">
              <div class="struct-stat-num">{{ contenuti[activeTab].chapters.length }}</div>
              <div class="struct-stat-lbl">{{ activeTab==='man' ? 'CAPITOLI' : 'SEZIONI' }}</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">{{ contenuti[activeTab].total }}</div>
              <div class="struct-stat-lbl">PAGINE</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">PDF</div>
              <div class="struct-stat-lbl">FORMATO</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">2026</div>
              <div class="struct-stat-lbl">AGGIORNATO</div>
            </div>
          </div>

          <!-- Lead-magnet: anteprima 15 pp via email (solo tab MAN) -->
          <div v-if="activeTab==='man' && hasAnteprima" class="mat-anteprima-box">
            <div class="mat-anteprima-meta">
              <span class="mat-anteprima-pill">ANTEPRIMA · 15 PP</span>
              <span class="mat-anteprima-info">
                Indice completo + introduzione + primi 2 capitoli. Te li mando via email gratis.
              </span>
            </div>
            <button type="button" class="btn btn-primary mat-anteprima-cta" @click="openAnteprima">
              Ricevi l'anteprima via email &rarr;
            </button>
          </div>

          <div class="chapters">
            <div v-for="(c, i) in contenuti[activeTab].chapters" :key="i" class="chap">
              <span class="chap-num">{{ String(i+1).padStart(2,'0') }}</span>
              <span>{{ c }}</span>
            </div>
          </div>
        </div>

        <!-- SIMULATORE -->
        <div v-else-if="activeTab==='sim' && contenuti.sim" class="struct-panel">
          <div class="struct-summary">
            <div class="struct-stat">
              <div class="struct-stat-num">1.000</div>
              <div class="struct-stat-lbl">DOMANDE</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">HTML</div>
              <div class="struct-stat-lbl">OFFLINE</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">CSTM</div>
              <div class="struct-stat-lbl">SU MISURA</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">3</div>
              <div class="struct-stat-lbl">MODALITÀ</div>
            </div>
          </div>
          <div class="breakdown">
            <div v-for="b in contenuti.sim.breakdown" :key="b.topic" class="br-row">
              <span class="br-title">{{ b.topic }}</span>
              <span class="br-count">{{ b.count }} q.</span>
              <span class="br-bar"><span class="br-fill" :style="{width: (b.count/80*100) + '%'}"></span></span>
            </div>
          </div>
        </div>

        <!-- CTA unico, dipendente dal formato selezionato -->
        <div v-if="activeFormato" class="struct-cta">
          <button class="btn btn-primary" type="button" @click="requestFormat(activeFormato)">
            Richiedi {{ activeFormato.t }} →
          </button>
        </div>
        </template>
      </div>
    </section>

    <!-- ALTRE MATERIE DELLA FAMIGLIA -->
    <section v-if="familySiblings.length" class="mat-related">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">CONTINUA CON</span>
          <h2>Altre materie famiglia <span class="mr-fam">{{ familyName }}</span>.</h2>
        </div>
        <div class="mr-grid">
          <article
            v-for="s in familySiblings"
            :key="s.slug"
            class="mr-card"
            tabindex="0"
            role="link"
            @click="goSibling(s.slug)"
            @keydown.enter="goSibling(s.slug)"
            @keydown.space.prevent="goSibling(s.slug)"
          >
            <div class="mr-meta">
              <span class="mr-badge" :data-c="s.c[0]">{{ s.c[0] }}</span>
              <span class="mr-norm">{{ s.norm }}</span>
            </div>
            <h3 class="mr-title">{{ s.t }}</h3>
            <p class="mr-intro">{{ s.intro }}</p>
            <span class="mr-arrow" aria-hidden="true">&rarr;</span>
          </article>
        </div>
      </div>
    </section>

    <!-- FORM -->
    <ContactForm ref="contactRef" />

    <!-- Modale richiesta anteprima manuale (15 pp via email) -->
    <RichiediAnteprimaModale
      :open="anteprimaOpen"
      :slug="materia?.slug || ''"
      :materia-label="materia?.t || ''"
      @close="closeAnteprima"
    />
  </main>


  <main v-else>
    <section>
      <div class="wrap" style="padding:80px 24px;text-align:center">
        <h2>Materia non trovata</h2>
        <RouterLink to="/#materie" class="btn">← Torna alle materie</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* HERO v2 */
.mat-breadcrumb{
  display:flex;flex-wrap:wrap;gap:8px;align-items:center;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.06em;
  margin-bottom:18px;color:var(--ink);opacity:.75;
}
.mat-breadcrumb a{color:var(--ink);text-decoration:none;border-bottom:1px solid transparent}
.mat-breadcrumb a:hover{border-bottom-color:var(--ink)}
.mat-breadcrumb .bc-now{opacity:.55;text-transform:uppercase}

.mat-hero-grid{
  display:grid;
  grid-template-columns:1.6fr 1fr;
  gap:40px;
  align-items:start;
}
@media(max-width:980px){.mat-hero-grid{grid-template-columns:1fr;gap:28px}}

.mat-ep-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:4px 8px;border:2px solid var(--ink);background:var(--bg);
  margin-left:6px;
}

.mat-norm-box{
  display:inline-flex;gap:10px;align-items:baseline;
  margin-top:12px;margin-bottom:18px;
  padding:8px 12px;
  border:2px solid var(--ink);
  background:var(--bg);
}
.mat-norm-l{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--ink);opacity:.55;
}
.mat-norm-v{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--ink);
}

/* RAIL ACID */
.mat-rail{
  background:var(--acid);color:var(--ink);
  border:2px solid var(--ink);
  box-shadow:6px 6px 0 var(--ink);
  padding:22px;
  display:flex;flex-direction:column;gap:14px;
  position:sticky;
  top:calc(var(--nav-h, 73px) + 16px);
}
@media(max-width:980px){.mat-rail{position:static}}

.mat-rail-pill{
  align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  background:var(--ink);color:var(--bg);
  padding:5px 9px;
}

.mat-rail-list{list-style:none;padding:0;margin:4px 0 0;display:flex;flex-direction:column;gap:8px}
.mat-rail-item{
  display:grid;grid-template-columns:24px 1fr auto;gap:10px;align-items:center;
  padding:10px 12px;
  background:var(--bg);border:2px solid var(--ink);
  cursor:pointer;
  transition:transform .12s, background .12s;
}
.mat-rail-item:hover, .mat-rail-item:focus-visible{
  transform:translate(-2px,-2px);outline:none;
  background:var(--bg-alt,#ede6d8);
}
.rail-ico{font-size:18px;line-height:1;text-align:center}
.rail-l{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.06em;
}
.rail-st{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  padding:3px 6px;border:2px solid var(--ink);
}
.mat-rail-item.st-ready .rail-st{background:var(--mic,#1aa06b);color:#fff}
.mat-rail-item.st-soon .rail-st{background:var(--orange,#ff6b1a);color:#fff}
.mat-rail-item.st-custom .rail-st{background:var(--blue,#3d5aff);color:#fff}
.mat-rail-item.st-na{opacity:.4;cursor:default}
.mat-rail-item.st-na:hover{transform:none;background:var(--bg)}

.mat-rail-cta{
  margin-top:6px;align-self:stretch;text-align:center;
  text-decoration:none;
}
.mat-rail-foot{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:9.5px;font-weight:600;letter-spacing:.06em;
  line-height:1.4;color:var(--ink);opacity:.7;
  border-top:2px dashed var(--ink);padding-top:10px;
}

@media (prefers-reduced-motion:reduce){
  .mat-rail-item{transition:none}
  .mat-rail-item:hover, .mat-rail-item:focus-visible{transform:none}
}

/* FALLBACK FORMATI per materie senza contenuti dettagliati */
.formats-fallback{
  display:grid;grid-template-columns:repeat(2,1fr);gap:18px;
  margin-top:24px;
}
@media(max-width:720px){.formats-fallback{grid-template-columns:1fr}}
.ff-card{
  background:var(--bg);border:2px solid var(--ink);
  padding:22px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:12px;
  transition:transform .15s, box-shadow .15s;
}
.ff-card:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--ink)}
.ff-head{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start}
.ff-ico{
  width:42px;height:42px;flex:0 0 auto;
  background:var(--bg-alt,#ede6d8);border:2px solid var(--ink);
  display:grid;place-items:center;font-size:22px;line-height:1;
}
.ff-meta{display:flex;flex-direction:column;gap:4px;min-width:0}
.ff-meta h3{font-size:18px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0}
.ff-fmt{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--ink);opacity:.6;
}
.ff-stato{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:4px 8px;border:2px solid var(--ink);align-self:start;flex:0 0 auto;
}
.ff-card.ff-ready .ff-stato{background:var(--acid);color:var(--ink)}
.ff-card.ff-soon  .ff-stato{background:var(--bg);color:var(--ink);opacity:.65}
.ff-card.ff-custom .ff-stato{background:var(--ink);color:var(--bg)}
.ff-stato-na{background:var(--bg);color:var(--ink);opacity:.55}
.ff-desc{font-size:14px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.ff-cta{align-self:flex-start;margin-top:auto;text-decoration:none}

/* LEAD-MAGNET: box anteprima manuale */
.mat-anteprima-box{
  display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;
  margin:18px 0 22px;
  padding:18px 20px;
  background:var(--acid,#c6f432);
  border:2px solid var(--ink,#0a0a0a);
  box-shadow:6px 6px 0 var(--ink,#0a0a0a);
}
.mat-anteprima-meta{display:flex;flex-direction:column;gap:6px;min-width:0}
.mat-anteprima-pill{
  align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10.5px;font-weight:700;letter-spacing:.12em;
  background:var(--ink,#0a0a0a);color:var(--acid,#c6f432);
  padding:4px 8px;border:2px solid var(--ink,#0a0a0a);
}
.mat-anteprima-info{
  font-size:14px;line-height:1.5;color:var(--ink,#0a0a0a);font-weight:500;
}
.mat-anteprima-cta{
  align-self:center;text-decoration:none;
  white-space:nowrap;min-width:0;box-sizing:border-box;
}

@media(max-width:680px){
  .mat-anteprima-box{
    grid-template-columns:1fr;align-items:stretch;gap:14px;
    padding:16px;
    box-shadow:4px 4px 0 var(--ink,#0a0a0a);
  }
  .mat-anteprima-cta{
    align-self:stretch;text-align:center;
    width:100%;max-width:100%;
    white-space:normal;
    padding:12px 14px;font-size:14px;
  }
}

/* SEZIONE ALTRE MATERIE */
.mat-related{
  padding:60px 0;
  border-top:2px solid var(--ink);
  background:var(--bg-alt,#ede6d8);
  position:relative;z-index:1;
}
.mr-fam{color:var(--blue,#3d5aff)}

.mr-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;
  margin-top:24px;
}
@media(max-width:880px){.mr-grid{grid-template-columns:1fr}}

.mr-card{
  background:var(--bg);border:2px solid var(--ink);
  box-shadow:6px 6px 0 var(--ink);
  padding:22px;cursor:pointer;
  display:flex;flex-direction:column;gap:12px;
  transition:transform .15s, box-shadow .15s;
}
.mr-card:hover, .mr-card:focus-visible{
  transform:translate(-3px,-3px);
  box-shadow:9px 9px 0 var(--ink);
  outline:none;
}

.mr-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.mr-badge{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:4px 8px;border:2px solid var(--ink);background:var(--bg);color:var(--ink);
}
.mr-badge[data-c="RIPAM"]{background:var(--ripam,#3d5aff);color:var(--bg)}
.mr-badge[data-c="MIC"]  {background:var(--mic,#1aa06b);color:var(--bg)}
.mr-badge[data-c="FUNZ"] {background:var(--funz,#9b4dff);color:var(--bg)}
.mr-badge[data-c="MIMIT"]{background:var(--mimit,#ff6b1a);color:var(--bg)}
.mr-badge[data-c="ISAC"] {background:var(--isac,#ff3d52);color:var(--bg)}
.mr-badge[data-c="CPI"]  {background:var(--cpi,#14b8b8);color:var(--bg)}
.mr-badge[data-c="REG"]  {background:var(--ink);color:var(--bg)}

.mr-norm{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.05em;color:var(--ink);opacity:.7;
}

.mr-title{font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.15;margin:0}
.mr-intro{font-size:14px;line-height:1.5;margin:0;color:var(--ink-soft,#2a2a2a);
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.mr-arrow{
  align-self:flex-start;margin-top:auto;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:18px;font-weight:700;
  transition:transform .15s;
}
.mr-card:hover .mr-arrow{transform:translateX(4px)}

@media (prefers-reduced-motion:reduce){
  .mr-card,.mr-arrow{transition:none}
  .mr-card:hover, .mr-card:focus-visible{transform:none}
}
</style>

