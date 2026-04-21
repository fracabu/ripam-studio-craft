<script setup>
import { BUNDLES } from '../data/formati.js'
</script>

<template>
  <section id="bundle">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">PERCORSI</span>
        <h2>Percorsi-tipo, se preferisci un punto di partenza.</h2>
        <p>Combinazioni già pensate. Ogni percorso resta modulabile sulle tue esigenze, costi e tempi concordati insieme.</p>
      </div>
      <div class="bundles bundles-2col">
        <div v-for="b in BUNDLES" :key="b.slug" v-reveal class="bundle" :class="`bundle-${b.accent}`">
          <div class="bundle-tag">{{ b.tag }}</div>
          <div class="bundle-title">{{ b.title }}</div>
          <p class="bundle-desc">{{ b.desc }}</p>
          <div class="bundle-note-inline">{{ b.note }}</div>
          <a :href="`#contatti?bundle=${b.slug}`" class="btn btn-primary" @click.prevent="$emit('select', b)">Richiedi informazioni →</a>
        </div>
      </div>
    </div>
  </section>
</template>
