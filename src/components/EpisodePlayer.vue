<script setup>
import { computed, onUnmounted, ref } from 'vue'

const props = defineProps({
  ep: { type: Object, required: true },
  formatLabel: { type: String, default: 'PODCAST' }, // PODCAST / AUDIO / VIDEO
  formatExt: { type: String, default: 'MP3 + TXT' },
  isFirst: { type: Boolean, default: false }
})

const emit = defineEmits(['request'])

const audioEl = ref(null)
const isReady = ref(false)
const isPlaying = ref(false)
const hasError = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const expanded = ref(false) // mostra la bar progresso una volta cliccato play

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const timeLabel = computed(() => {
  if (!isReady.value) return `0:00 / ${props.ep.duration || '0:00'}`
  return `${fmt(currentTime.value)} / ${fmt(duration.value)}`
})

const progressPct = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})

const hasPreview = computed(() => Boolean(props.ep.preview))

// Pause all other audios in the page so only one plays at a time.
const pauseOthers = () => {
  document.querySelectorAll('audio').forEach(a => {
    if (a !== audioEl.value && !a.paused) a.pause()
  })
}

const togglePlay = () => {
  if (!hasPreview.value) {
    // No preview: emit request so parent can prefill contact form.
    emit('request')
    return
  }
  expanded.value = true
  const el = audioEl.value
  if (!el || hasError.value) return
  if (el.paused) {
    pauseOthers()
    el.play().catch(() => { hasError.value = true })
  } else {
    el.pause()
  }
}

const onLoaded = () => {
  if (!audioEl.value) return
  duration.value = audioEl.value.duration || 0
  isReady.value = true
}
const onTime = () => { if (audioEl.value) currentTime.value = audioEl.value.currentTime }
const onPlay = () => { isPlaying.value = true }
const onPause = () => { isPlaying.value = false }
// L'anteprima dura ~80 secondi contro i 30-40 minuti dell'episodio: quando
// finisce, chi ascolta è nel punto in cui VORREBBE il seguito. È lì che si
// chiede il contatto, non prima — il file intero non si pubblica.
const finito = ref(false)
const onEnded = () => { isPlaying.value = false; currentTime.value = 0; finito.value = true }
const onError = () => { hasError.value = true; isReady.value = false }

const seek = (e) => {
  const el = audioEl.value
  if (!el || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  el.currentTime = Math.max(0, Math.min(1, x)) * duration.value
}

onUnmounted(() => {
  if (audioEl.value && !audioEl.value.paused) audioEl.value.pause()
})
</script>

<template>
  <div class="ep" :class="{'ep-first': isFirst, 'is-playing': isPlaying, 'is-expanded': expanded}">
    <audio
      v-if="hasPreview"
      ref="audioEl"
      :src="ep.preview"
      preload="metadata"
      @loadedmetadata="onLoaded"
      @timeupdate="onTime"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onError"
    ></audio>

    <span class="ep-num">EP {{ String(ep.n).padStart(2,'0') }}</span>
    <div class="ep-info">
      <div class="ep-title">
        {{ ep.title }}
        <span v-if="ep.free" class="ep-badge-free">GRATIS</span>
      </div>
      <div class="ep-meta">
        {{ ep.duration }} &middot; {{ formatExt }}
        <span v-if="hasPreview" class="ep-meta-prev">&middot; anteprima 1:20</span>
      </div>
    </div>
    <span class="ep-tag">{{ formatLabel }}</span>
    <button
      type="button"
      class="ep-play"
      :class="{'is-playing': isPlaying, 'is-disabled': hasError}"
      :aria-label="hasPreview ? (isPlaying ? 'Pausa anteprima' : 'Riproduci anteprima') : 'Richiedi questo episodio'"
      :disabled="hasError"
      @click.stop="togglePlay"
    >
      <span v-if="isPlaying" aria-hidden="true">&#9612;&#9612;</span>
      <span v-else aria-hidden="true">&#9658;</span>
    </button>

    <!-- BAR + TIME (visibili dopo il primo click su play) -->
    <div v-if="expanded && hasPreview" class="ep-bar-wrap">
      <button
        type="button"
        class="ep-bar"
        :aria-label="'Posizione anteprima ' + Math.round(progressPct) + '%'"
        @click.stop="seek"
      >
        <div class="ep-bar-in" :style="{ width: progressPct + '%' }"></div>
      </button>
      <span class="ep-time">{{ timeLabel }}</span>
      <span v-if="hasError" class="ep-err">Anteprima non disponibile</span>
    </div>

    <!-- Finita l'anteprima: l'episodio intero si chiede, non si scarica. -->
    <button v-if="finito" type="button" class="ep-more" @click.stop="emit('request')">
      Finita l'anteprima — <strong>vuoi l'episodio intero?</strong> &rarr;
    </button>
  </div>
</template>

<style scoped>
/* Override locale del comportamento .ep:cliccando play, niente cursor pointer sul resto */
.ep{flex-wrap:wrap;cursor:default}
.ep > *:not(.ep-play):not(.ep-bar):not(.ep-bar-in){cursor:default}
.ep-play{
  cursor:pointer;
  width:40px;height:40px;flex:0 0 auto;
  border:2px solid var(--ink);background:var(--bg);
  display:grid;place-items:center;
  font-size:14px;line-height:1;color:var(--ink);
  transition:background .15s, transform .12s;
  padding:0;
}
.ep.ep-first .ep-play{background:var(--acid)}
.ep .ep-play.is-playing{background:var(--acid)}
.ep .ep-play:hover:not(:disabled){transform:translate(-1px,-1px)}
.ep .ep-play.is-disabled{opacity:.4;cursor:not-allowed}

/* PROGRESS BAR (espansa) */
.ep-bar-wrap{
  flex:1 1 100%;
  display:flex;align-items:center;gap:12px;
  margin-top:10px;padding-top:10px;
  border-top:2px dashed var(--ink);
}
.ep-bar{
  flex:1 1 auto;height:6px;
  background:rgba(10,10,10,.12);
  border:0;padding:0;cursor:pointer;
  position:relative;overflow:hidden;
}
.ep-bar-in{
  position:absolute;top:0;bottom:0;left:0;
  background:var(--ink);
  transition:width .12s linear;
}
.ep.is-playing .ep-bar-in{background:var(--acid)}
.ep-time{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;font-weight:700;letter-spacing:.05em;
  color:var(--ink);opacity:.75;flex:0 0 auto;
}
.ep-err{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;letter-spacing:.05em;color:#c63d3d;flex:0 0 auto;
}
.ep-meta-prev{ opacity:.7; }
.ep-more{
  flex:1 0 100%;margin-top:8px;cursor:pointer;text-align:left;
  border:2px solid var(--ink);background:var(--acid);
  padding:8px 12px;font-family:inherit;font-size:14.5px;color:var(--ink);
  box-shadow:var(--shadow-sm);
}
.ep-more:hover{ background:var(--ink);color:var(--acid); }
</style>
