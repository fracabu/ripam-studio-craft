<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

// Misura dinamicamente l'altezza del nav e la espone come CSS var globale
// `--nav-h`. Usata da scroll-padding-top e dal min-height delle sezioni.
const navEl = ref(null)
let ro = null

const update = () => {
  if (!navEl.value) return
  document.documentElement.style.setProperty('--nav-h', navEl.value.offsetHeight + 'px')
}

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
})
</script>

<template>
  <nav ref="navEl" class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-mark">R</span>
        <span>Ripam Studio <em style="font-style:normal;color:var(--blue)">Craft</em><sup class="tm">™</sup></span>
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/#pilastri">Cosa faccio</RouterLink>
        <RouterLink to="/#materie">Materie</RouterLink>
        <RouterLink to="/#come-funziona">Come lavoro</RouterLink>
        <RouterLink to="/#contatti" class="nav-cta">Scrivimi →</RouterLink>
      </div>
    </div>
  </nav>
</template>
