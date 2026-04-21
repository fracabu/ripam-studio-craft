<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MATERIE } from '../data/materie.js'
import { CONCORSI } from '../data/formati.js'

const router = useRouter()
const filtro = ref('ALL')

const materieFiltered = computed(() => {
  if (filtro.value === 'ALL') return MATERIE
  return MATERIE.filter(m => m.c.includes(filtro.value))
})

const openMateria = (slug) => router.push({ name: 'materia', params: { slug } })
</script>

<template>
  <section id="catalogo">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">MATERIE</span>
        <h2>Le materie su cui posso lavorare con te.</h2>
        <p>Per ciascuna posso produrre podcast, video, report e simulatori, oppure combinare i formati. Apri la scheda per vedere argomenti, episodi e stato di lavorazione.</p>
      </div>

      <div v-reveal="'up'" class="filters" role="tablist">
        <button class="filter" :class="{active: filtro==='ALL'}" @click="filtro='ALL'">Tutti</button>
        <button v-for="c in CONCORSI" :key="c" class="filter" :class="{active: filtro===c}" @click="filtro=c">{{ c }}</button>
      </div>

      <div v-reveal class="legend" aria-label="nota consegna">
        <span class="legend-item" style="color:var(--ink)">★ Se è nel mio archivio ti arriva in 48h — altrimenti concordiamo tempi insieme</span>
      </div>

      <div v-reveal class="grid stagger">
        <article v-for="m in materieFiltered" :key="m.slug" class="card" @click="openMateria(m.slug)">
          <div class="card-num">#{{ String(m.n).padStart(2,'0') }}</div>
          <div class="card-title">{{ m.t }}</div>
          <div class="card-norm">{{ m.norm }}</div>
          <div class="badges">
            <span v-for="c in m.c" :key="c" class="badge" :data-c="c">{{ c }}</span>
          </div>
          <div class="formats">
            <span class="fmt" title="Podcast">🎙️</span>
            <span class="fmt" title="Video">🎥</span>
            <span class="fmt" title="Report">📄</span>
            <span class="fmt" title="Simulatore">🎯</span>
          </div>
          <div class="card-foot">
            <div class="card-hint">{{ m.topics.length }} argomenti</div>
            <button class="card-cta" type="button">Scopri →</button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
