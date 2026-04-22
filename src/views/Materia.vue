<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getMateriaBySlug, STATUS_LABELS } from '../data/materie.js'
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

const formatStatus = (k) => materia.value?.avail?.[k] || 'ready'

const formatIsActionable = (k) => {
  const s = formatStatus(k)
  return s === 'ready' || s === 'custom'
}

const requestFormat = (f) => {
  contactRef.value?.prefill({
    materia: materia.value.t,
    prodotto: f.label,
    concorso: materia.value.c[0]
  })
  scrollToContact()
}

const notifyFormat = (f) => {
  contactRef.value?.prefill({
    materia: materia.value.t,
    prodotto: f.label,
    concorso: materia.value.c[0],
    note: `Vorrei essere avvisato quando ${f.t} per ${materia.value.t} è disponibile.`
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

const requestBundle = () => {
  contactRef.value?.prefill({
    materia: materia.value.t,
    prodotto: 'Bundle materia',
    concorso: materia.value.c[0]
  })
  scrollToContact()
}

const ctaLabel = () => 'Richiedi informazioni →'
const ctaHandler = (f) => requestFormat(f)

const tabIcon = { pod:'🎙️', vid:'🎥', rep:'📄', man:'📚', sim:'🎯' }
const tabLabel = { pod:'Podcast', vid:'Video', rep:'Report', man:'Manuale', sim:'Simulatore' }

const freeEpisode = computed(() => {
  const c = contenuti.value
  if (!c) return null
  for (const k of ['pod','vid']) {
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
          <div class="teaser-ico">{{ freeEpisode.formato === 'vid' ? '🎥' : '🎙️' }}</div>
          <div class="teaser-txt">
            <strong>Prova gratis il primo episodio</strong>
            <span>"{{ freeEpisode.title }}" ({{ freeEpisode.duration }}) — te lo mandiamo senza impegno. Se ti piace, procediamo con il resto.</span>
          </div>
          <button class="btn" type="button" @click="requestSample">Richiedi anteprima →</button>
        </div>
      </div>
    </section>

    <!-- 4 FORMATI -->
    <section class="mat-section">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">I FORMATI</span>
          <h2>Scegli come studiare.</h2>
          <p>Stesso contenuto, cinque formati diversi. Prendili singolarmente o combinati nel percorso completo.</p>
        </div>
        <div class="detail-formats-grid">
          <div v-for="f in FORMATI" :key="f.k" class="detail-fmt" :data-k="f.k">
            <div class="detail-fmt-ico">{{ f.ico }}</div>
            <h3>{{ f.t }}</h3>
            <p>{{ f.desc }}</p>
            <div class="meta">
              <span>{{ f.fmt }}</span>
              <span>SU MISURA</span>
            </div>
            <button class="cta" type="button" @click="ctaHandler(f)">{{ ctaLabel(f) }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- STRUTTURA CONTENUTI -->
    <section v-if="contenuti" class="mat-section">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">STRUTTURA</span>
          <h2>Cosa c'è dentro, episodio per episodio.</h2>
          <p>Ogni formato ha una sua struttura. Esplora gli episodi, i capitoli e la distribuzione delle domande.</p>
        </div>

        <div class="struct-tabs">
          <button v-for="k in ['pod','vid','rep','man','sim']" :key="k"
            class="struct-tab" :class="{active: activeTab===k}" @click="activeTab=k"
            :disabled="!contenuti[k]">
            <span class="struct-tab-ico">{{ tabIcon[k] }}</span>
            {{ tabLabel[k] }}
          </button>
        </div>

        <!-- PODCAST / VIDEO -->
        <div v-if="(activeTab==='pod' || activeTab==='vid') && contenuti[activeTab]" class="struct-panel">
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
              <div class="struct-stat-num">{{ activeTab==='pod' ? 'MP3+TXT' : 'MP4+SRT' }}</div>
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
          <div class="struct-note">
            <strong>Come funziona il gratis:</strong> ti mando il primo episodio senza impegno. Se ti piace, mi scrivi e ne parliamo.
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
          <div v-if="activeTab==='man'" class="struct-note">
            <strong>Livello editoriale:</strong> generato con pipeline AI multi-agente (TopicArchitect, LegalScholar, VeritasBot, EditorChief, DidacticPro) a partire dal testo normativo ufficiale, con revisione manuale. Ogni capitolo include tabelle, callout sulle domande ricorrenti, FAQ e quiz di autovalutazione.
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
          <div class="struct-note">
            <strong>Su misura significa su misura:</strong> concordiamo insieme quali argomenti pesare di più, quali trabocchetti includere, che stile grafico (chiaro/scuro, font, logo). Consegna in 48-72 ore.
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENUTI (argomenti) -->
    <section class="mat-section">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">ARGOMENTI</span>
          <h2>Cosa tratta la materia.</h2>
          <p>I {{ materia.topics.length }} argomenti principali coperti da ogni formato (podcast, video, report e simulatore). Se ti serve focus su alcuni in particolare, lo concordiamo insieme prima di produrre.</p>
        </div>
        <div class="topics">
          <div v-for="(t, i) in materia.topics" :key="i" class="topic">
            <span class="topic-num">{{ String(i+1).padStart(2,'0') }}</span>
            <span>{{ t }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- BUNDLE MATERIA -->
    <section class="mat-section">
      <div class="wrap">
        <div class="sec-head">
          <span class="sec-kicker">PERCORSO COMPLETO</span>
          <h2>Vuoi il percorso intero su {{ materia.t }}?</h2>
          <p>Quattro formati combinati in un unico percorso-tipo. Modulabile su argomenti, formato preferito, livello di approfondimento.</p>
        </div>
        <div class="perc-grid">
          <div class="perc-items">
            <div class="perc-item"><span class="perc-ico">🎙️</span><div><strong>Podcast</strong><span>8 episodi audio · trascrizioni incluse · ascolto in mobilità</span></div></div>
            <div class="perc-item"><span class="perc-ico">🎥</span><div><strong>Video</strong><span>Lezioni visuali · sottotitoli SRT · ripasso rapido</span></div></div>
            <div class="perc-item"><span class="perc-ico">📄</span><div><strong>Report</strong><span>Dispensa PDF strutturata · tavole · trabocchetti frequenti</span></div></div>
            <div class="perc-item"><span class="perc-ico">🎯</span><div><strong>Simulatore</strong><span>500 domande su misura · HTML offline · spiegazioni + errore comune</span></div></div>
          </div>
          <div class="perc-cta-box">
            <div class="perc-cta-tag">COME PROCEDERE</div>
            <p class="perc-cta-desc">Scrivimi dicendo quali formati ti servono davvero. Ragioniamo sul taglio giusto per te, ti mando preventivo concordato e tempistiche reali.</p>
            <button class="btn btn-primary" type="button" @click="requestBundle">Richiedi informazioni →</button>
          </div>
        </div>
      </div>
    </section>

    <!-- FORM -->
    <ContactForm ref="contactRef" />
  </main>

  <main v-else>
    <section>
      <div class="wrap">
        <h1 style="font-size:42px;margin-bottom:20px">Materia non trovata</h1>
        <p style="margin-bottom:30px">La materia che stai cercando non esiste.</p>
        <RouterLink to="/" class="btn btn-primary">← Torna alla home</RouterLink>
      </div>
    </section>
  </main>
</template>
