<script setup>
import { SERVIZI, TOOLS } from '../data/formati.js'
const emit = defineEmits(['select'])
const askTool = (t) => emit('select', { prodotto: `Tool custom: ${t.t}` })
const askServizio = (s) => emit('select', s)
</script>

<template>
  <section id="personalizzazioni">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">PERSONALIZZAZIONI</span>
        <h2>Hai già materiale? Lo trasformo. Parti da zero? Lo costruiamo insieme.</h2>
        <p>Due strade a seconda di quello che ti serve: conversione di materiali che hai già, oppure sviluppo di tool su misura.</p>
      </div>

      <!-- gruppo 1: trasformo il tuo materiale -->
      <div v-reveal class="sec-head sec-head-compact" style="margin-top:40px;margin-bottom:20px">
        <span class="sec-kicker">TRASFORMO IL TUO MATERIALE</span>
        <h3 class="tempi-subtitle">Mi mandi appunti, capitoli, PDF o audio — te li restituisco nel formato che preferisci.</h3>
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
          <a href="#contatti" class="btn" @click.prevent="askServizio(s)">Richiedi informazioni →</a>
        </div>
      </div>

      <!-- gruppo 2: costruisco da zero -->
      <div v-reveal class="sec-head sec-head-compact" style="margin-top:56px;margin-bottom:20px">
        <span class="sec-kicker">COSTRUISCO DA ZERO</span>
        <h3 class="tempi-subtitle">Web app, simulatori, strumenti di studio su misura. Ogni progetto parte da una chiacchierata.</h3>
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
          <button class="btn btn-primary" type="button" @click="askTool(t)">Raccontami il progetto →</button>
        </div>
      </div>
    </div>
  </section>
</template>
