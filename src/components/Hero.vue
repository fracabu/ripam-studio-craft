<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const goMateria = () => router.push({ name: 'materia', params: { slug: 'contratti-pubblici' } })

// Anteprima audio in evidenza nell'hero. Episodio reale del podcast Contratti Pubblici.
const HERO_PREVIEW = {
  src: '/preview/contratti-pubblici/pod-ep7.mp3',
  ep: 'EP. 07 · TRABOCCHETTI',
  title: 'I 20 trabocchetti del codice appalti',
  meta: 'MP3 + TXT · D.Lgs. 36/2023',
  durationFallback: '1:15',
  materiaSlug: 'contratti-pubblici'
}

const audioEl = ref(null)
const isReady = ref(false)
const isPlaying = ref(false)
const hasError = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const timeLabel = computed(() => {
  if (!isReady.value) return `0:00 / ${HERO_PREVIEW.durationFallback}`
  return `${fmt(currentTime.value)} / ${fmt(duration.value)}`
})

const progressPct = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

const togglePlay = () => {
  const el = audioEl.value
  if (!el || hasError.value) return
  if (el.paused) el.play().catch(() => { hasError.value = true })
  else el.pause()
}

const onLoaded = () => {
  if (!audioEl.value) return
  duration.value = audioEl.value.duration || 0
  isReady.value = true
}
const onTime = () => {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime
}
const onPlay = () => { isPlaying.value = true }
const onPause = () => { isPlaying.value = false }
const onError = () => { hasError.value = true; isReady.value = false }

const seek = (e) => {
  const el = audioEl.value
  if (!el || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  el.currentTime = Math.max(0, Math.min(1, x)) * duration.value
}

onMounted(() => {
  // L'audio parte solo on-demand: niente preload pesante.
})
onUnmounted(() => {
  if (audioEl.value && !audioEl.value.paused) audioEl.value.pause()
})

const formats = [
  { ico: '🎙️', label: 'PODCAST' },
  { ico: '🎧', label: 'AUDIO' },
  { ico: '🎥', label: 'VIDEO' },
  { ico: '📄', label: 'REPORT' },
  { ico: '📚', label: 'MANUALE' },
  { ico: '🎯', label: 'SIMULATORE' }
]
</script>

<template>
  <section class="hero hero-anim">
    <div class="wrap">
      <div class="hero-grid hero-grid-v2">
        <div>
          <h1>Studia solo quello che <span class="hl">serve.</span></h1>
          <p class="hero-sub">Per il tuo concorso pubblico, solo l'essenziale di ogni materia: preso dalla normativa ufficiale e revisionato a mano. Niente sbobine infinite, niente pagine che non leggerai.</p>
          <div class="hero-ctas">
            <RouterLink to="/scrivimi" class="btn btn-primary">Scrivimi &rarr;</RouterLink>
          </div>
          <div class="hero-mono">
            &#9201; Rispondo entro 24h &middot; nessun pagamento anticipato richiesto
          </div>
        </div>

        <aside class="demo-card" aria-label="Anteprima episodio podcast">
          <audio
            ref="audioEl"
            :src="HERO_PREVIEW.src"
            preload="metadata"
            @loadedmetadata="onLoaded"
            @timeupdate="onTime"
            @play="onPlay"
            @pause="onPause"
            @ended="onPause"
            @error="onError"
          ></audio>
          <div class="demo-head">
            <span class="demo-stamp">{{ HERO_PREVIEW.ep }}</span>
            <span class="demo-now">ANTEPRIMA</span>
          </div>
          <h4 class="demo-title">{{ HERO_PREVIEW.title }}</h4>
          <div class="demo-meta">{{ HERO_PREVIEW.meta }}</div>
          <div class="demo-player">
            <button
              type="button"
              class="demo-play"
              :class="{'is-playing': isPlaying}"
              :disabled="hasError"
              :aria-label="isPlaying ? 'Pausa anteprima' : 'Riproduci anteprima'"
              @click="togglePlay"
            >
              <span v-if="isPlaying" aria-hidden="true">&#9612;&#9612;</span>
              <span v-else aria-hidden="true">&#9658;</span>
            </button>
            <button
              type="button"
              class="demo-bar"
              :aria-label="'Posizione anteprima ' + Math.round(progressPct) + '%'"
              @click="seek"
            >
              <div class="demo-bar-in" :style="{ width: progressPct + '%' }"></div>
            </button>
            <div class="demo-time">{{ timeLabel }}</div>
          </div>
          <div v-if="hasError" class="demo-fallback" role="status">
            Anteprima in arrivo &middot; <a @click.prevent="goMateria" href="#">vedi la materia &rarr;</a>
          </div>
          <div class="demo-pills">
            <span v-for="f in formats" :key="f.label">{{ f.ico }} {{ f.label }}</span>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-grid-v2{
  display:grid;
  grid-template-columns:1.4fr 1fr;
  gap:60px;
  align-items:center;
}

/* Un solo CTA dominante: "Scrivimi" primario, più grande (la prova è il player). */
.hero-ctas .btn-primary{padding:18px 36px;font-size:18px}
@media(max-width:880px){
  .hero-grid-v2{grid-template-columns:1fr;gap:32px}
}

.hero-mono{
  margin-top:18px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;color:var(--muted,#6b6458);
  letter-spacing:.05em;
}

.demo-card{
  padding:22px 22px 18px;
  border:2px solid var(--ink);
  background:var(--bg);
  box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:14px;
}
.demo-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.demo-stamp{
  padding:4px 9px;background:var(--acid);border:2px solid var(--ink);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
}
.demo-now{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  color:var(--ink);opacity:.55;
}
.demo-title{
  font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1.15;
  margin:0;
}
.demo-meta{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.05em;color:var(--ink);opacity:.7;
}
.demo-player{
  display:flex;align-items:center;gap:12px;
  padding:10px 12px;
  background:var(--ink);color:var(--bg);
  border:2px solid var(--ink);
  box-shadow:3px 3px 0 var(--ink);
}
.demo-play{
  width:38px;height:38px;flex:0 0 auto;
  background:var(--acid);color:var(--ink);
  display:grid;place-items:center;
  font-size:14px;line-height:1;
  border:2px solid var(--bg);
  cursor:pointer;padding:0;
  transition:transform .12s, background .12s;
}
.demo-play:hover:not(:disabled){transform:translate(-1px,-1px)}
.demo-play:disabled{opacity:.4;cursor:not-allowed}
.demo-bar{
  flex:1 1 auto;height:6px;
  background:rgba(245,240,232,.2);
  position:relative;overflow:hidden;cursor:pointer;
  padding:0;border:0;
}
.demo-bar-in{
  position:absolute;top:0;bottom:0;left:0;
  background:var(--acid);
  transition:width .12s linear;
}
.demo-time{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.05em;
  color:var(--bg);flex:0 0 auto;
}
.demo-fallback{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;letter-spacing:.05em;
  background:var(--bg-alt,#ede6d8);
  padding:8px 10px;border:2px solid var(--ink);
}
.demo-fallback a{color:var(--ink);text-decoration:underline;font-weight:700}
.demo-pills{
  display:flex;flex-wrap:wrap;gap:6px;
}
.demo-pills span{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  padding:5px 8px;border:2px solid var(--ink);
  background:var(--bg);color:var(--ink);
}
</style>
