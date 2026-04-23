<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getMateriaBySlug } from '../data/materie.js'
import { FORMATI } from '../data/formati.js'
import { getContenuti } from '../data/contenuti.js'
import ContactForm from '../components/ContactForm.vue'

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
</script>

<template>
  <main v-if="materia" class="materia-page">
    <!-- HERO MATERIA -->
    <section class="detail-hero">
      <div class="wrap">
        <RouterLink to="/#materie" class="detail-back">← Torna alle materie</RouterLink>
        <div class="badges" style="margin-bottom:20px">
          <span v-for="c in materia.c" :key="c" class="badge" :data-c="c">{{ c }}</span>
        </div>
        <h1 class="detail-title">{{ materia.t }}</h1>
        <div class="detail-norm">{{ materia.norm }}</div>
        <p class="detail-intro">{{ materia.intro }}</p>

        <!-- TEASER: primo episodio gratis -->
        <div v-if="freeEpisode" class="teaser">
          <div class="teaser-ico">{{ tabIcon[freeEpisode.formato] || '🎙️' }}</div>
          <div class="teaser-txt">
            <strong>Prova gratis il primo episodio</strong>
            <span>"{{ freeEpisode.title }}" ({{ freeEpisode.duration }}) — te lo mandiamo senza impegno. Se ti piace, procediamo con il resto.</span>
          </div>
          <button class="btn" type="button" @click="requestSample">Richiedi anteprima →</button>
        </div>
      </div>
    </section>

    <!-- I FORMATI (tab con struttura espansa + CTA) -->
    <section v-if="contenuti" class="mat-section">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">I FORMATI</span>
          <h2>Scegli come studiare.</h2>
          <p>Sei formati diversi, stesso contenuto. Clicca su un formato per vedere cosa c'è dentro.</p>
        </div>

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
            <div v-for="ep in contenuti[activeTab].episodes" :key="ep.n" class="ep" :class="{'ep-free': ep.free}">
              <span class="ep-num">{{ String(ep.n).padStart(2,'0') }}</span>
              <span class="ep-title">
                {{ ep.title }}
                <span v-if="ep.free" class="ep-badge-free">GRATIS</span>
              </span>
              <span class="ep-meta">{{ ep.duration }}</span>
            </div>
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
              <div class="struct-stat-num">{{ activeTab==='man' ? 'PDF+HTML' : 'PDF' }}</div>
              <div class="struct-stat-lbl">FORMATO</div>
            </div>
            <div class="struct-stat">
              <div class="struct-stat-num">2026</div>
              <div class="struct-stat-lbl">AGGIORNATO</div>
            </div>
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
              <div class="struct-stat-num">500</div>
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
      </div>
    </section>

    <!-- FORM -->
    <ContactForm ref="contactRef" />
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
