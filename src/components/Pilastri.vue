<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PILASTRI } from '../data/formati.js'

const router = useRouter()

// Mappa pillar → destinazione (nuove route create per i pilastri 02 e 03)
const ROUTE_MAP = {
  formazione: { hash: '#materie' },
  consulenza: { name: 'coaching' },
  sviluppo: { name: 'tool' }
}

const dest = (k) => ROUTE_MAP[k] || { hash: '#contatti' }

const goPillar = (p) => {
  const d = dest(p.k)
  if (d.name) router.push({ name: d.name })
  else if (d.hash) document.querySelector(d.hash)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="pilastri">
    <div class="wrap">
      <div v-reveal class="sec-head sec-head-compact">
        <span class="sec-kicker">COSA FACCIO</span>
        <h2>Tre modi di lavorare insieme.</h2>
        <p>Ogni progetto nasce da una chiacchierata, mai da un carrello. Scegli da dove partire.</p>
      </div>
      <div class="pilastri">
        <button
          v-for="p in PILASTRI"
          :key="p.k"
          type="button"
          v-reveal
          class="pilastro"
          :class="`bundle-${p.accent}`"
          @click="goPillar(p)"
        >
          <div class="pil-ico">{{ p.ico }}</div>
          <div class="pil-tag">{{ p.lead }}</div>
          <h3 class="pil-title">{{ p.t }}</h3>
          <p class="pil-desc">{{ p.desc }}</p>
          <span class="pil-cta">{{ p.cta }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
