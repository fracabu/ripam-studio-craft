<script setup>
import { BUNDLES } from '../data/formati.js'
import Counter from './Counter.vue'
</script>

<template>
  <section id="bundle">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">PERCORSI</span>
        <h2>Percorsi-tipo, se preferisci un punto di partenza.</h2>
        <p>Combinazioni già pensate: per una materia, per un concorso intero, o per preparazione totale. Indicazioni di prezzo, ma ogni percorso resta modulabile sulle tue esigenze.</p>
      </div>
      <div class="bundles">
        <div v-for="b in BUNDLES" :key="b.slug" v-reveal class="bundle" :class="`bundle-${b.accent}`">
          <div class="bundle-tag">{{ b.tag }}</div>
          <div class="bundle-title">{{ b.title }}</div>
          <p class="bundle-desc">{{ b.desc }}</p>
          <div class="bundle-price"><Counter :to="b.price" suffix="€" /><small>{{ b.note }}</small></div>
          <a :href="`#contatti?bundle=${b.slug}`" class="btn btn-primary" @click.prevent="$emit('select', b)">Richiedi informazioni →</a>
        </div>
      </div>
    </div>
  </section>
</template>
