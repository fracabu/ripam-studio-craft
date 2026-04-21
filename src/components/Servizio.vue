<script setup>
import { SERVIZI } from '../data/formati.js'
</script>

<template>
  <section id="servizio">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">CONVERSIONI</span>
        <h2>Hai già il tuo materiale? Lo trasformo io.</h2>
        <p>Mi mandi appunti, capitoli, PDF o audio — te li restituisco nel formato che preferisci. Prezzi indicativi, preventivo finale concordato insieme.</p>
      </div>
      <div class="service">
        <div v-for="(s, i) in SERVIZI" :key="s.k" v-reveal class="service-card" :class="i===0 ? 'reveal-left' : 'reveal-right'">
          <div class="service-ico">{{ s.ico }}</div>
          <h3>{{ s.t }}</h3>
          <p>{{ s.desc }}</p>
          <div class="service-meta">
            <span>{{ s.fmt }}</span>
            <span>{{ s.price }}</span>
          </div>
          <a href="#contatti" class="btn" @click.prevent="$emit('select', s)">Richiedi informazioni →</a>
        </div>
      </div>
    </div>
  </section>
</template>
