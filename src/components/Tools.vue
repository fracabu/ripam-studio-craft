<script setup>
import { TOOLS } from '../data/formati.js'
const emit = defineEmits(['select'])
const ask = (t) => emit('select', { prodotto: `Tool custom: ${t.t}` })
</script>

<template>
  <section id="tools">
    <div class="wrap">
      <div v-reveal class="sec-head sec-head-compact">
        <span class="sec-kicker">SVILUPPO</span>
        <h2>Dalla tua idea allo strumento adatto.</h2>
        <p>Web app, simulatori, strumenti di conversione. Ogni progetto parte da una chiacchierata.</p>
      </div>

      <div v-reveal class="tools stagger">
        <div v-for="t in TOOLS" :key="t.k" class="tool-card">
          <div class="tool-ico">{{ t.ico }}</div>
          <h3 class="tool-title">{{ t.t }}</h3>
          <p class="tool-desc">{{ t.desc }}</p>
          <div class="tool-examples">
            <div class="tool-ex-label">ESEMPI</div>
            <ul>
              <li v-for="(e, i) in t.examples" :key="i">— {{ e }}</li>
            </ul>
          </div>
          <button class="btn btn-primary" type="button" @click="ask(t)">Raccontami il progetto →</button>
        </div>
      </div>
    </div>
  </section>
</template>
