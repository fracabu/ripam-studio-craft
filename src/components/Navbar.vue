<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

// Misura dinamicamente l'altezza del nav e la espone come CSS var globale
// `--nav-h`. Usata da scroll-padding-top e dal min-height delle sezioni.
const navEl = ref(null)
let ro = null

const update = () => {
  if (!navEl.value) return
  document.documentElement.style.setProperty('--nav-h', navEl.value.offsetHeight + 'px')
  if (window.innerWidth > 720 && open.value) open.value = false
}

const open = ref(false)
const route = useRoute()

const close = () => { open.value = false }
const toggle = () => { open.value = !open.value }

watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

watch(() => route.fullPath, close)

onMounted(() => {
  update()
  if (window.ResizeObserver) {
    ro = new ResizeObserver(update)
    ro.observe(navEl.value)
  }
  window.addEventListener('resize', update)
})
onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('resize', update)
  document.body.style.overflow = ''
})
</script>

<template>
  <nav ref="navEl" class="nav" :class="{ 'is-open': open }">
    <div class="nav-inner">
      <RouterLink to="/" class="logo" @click="close">
        <span class="logo-mark">R</span>
        <span>Ripam Studio <em style="font-style:normal;color:var(--blue)">Craft</em><sup class="tm">™</sup></span>
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/#pilastri">Cosa faccio</RouterLink>
        <RouterLink to="/#materie">Materie</RouterLink>
        <RouterLink to="/#come-funziona">Come lavoro</RouterLink>
        <RouterLink to="/#contatti" class="nav-cta">Scrivimi →</RouterLink>
      </div>
      <button
        type="button"
        class="nav-burger"
        :aria-expanded="open"
        aria-controls="nav-drawer"
        :aria-label="open ? 'Chiudi menu' : 'Apri menu'"
        @click="toggle"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div
      id="nav-drawer"
      class="nav-drawer"
      :hidden="!open"
    >
      <RouterLink to="/#pilastri" @click="close">Cosa faccio</RouterLink>
      <RouterLink to="/#materie" @click="close">Materie</RouterLink>
      <RouterLink to="/#come-funziona" @click="close">Come lavoro</RouterLink>
      <RouterLink to="/#contatti" class="nav-cta" @click="close">Scrivimi →</RouterLink>
    </div>
  </nav>
  <div v-if="open" class="nav-overlay" @click="close"></div>
</template>
