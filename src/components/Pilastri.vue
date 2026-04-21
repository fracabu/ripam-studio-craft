<script setup>
import { PILASTRI } from '../data/formati.js'
</script>

<template>
  <section id="pilastri">
    <div class="wrap">
      <div v-reveal class="sec-head sec-head-compact">
        <span class="sec-kicker">COSA FACCIO</span>
        <h2>Tre anime, un obiettivo: farti arrivare preparato.</h2>
        <p>Formazione, consulenza e sviluppo di strumenti su misura. Scegli da dove partire.</p>
      </div>
      <div class="pilastri">
        <a v-for="p in PILASTRI" :key="p.k" :href="p.anchor" v-reveal class="pilastro" :class="`bundle-${p.accent}`">
          <div class="pil-ico">{{ p.ico }}</div>
          <div class="pil-tag">{{ p.lead }}</div>
          <h3 class="pil-title">{{ p.t }}</h3>
          <p class="pil-desc">{{ p.desc }}</p>
          <span class="pil-cta">{{ p.cta }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
