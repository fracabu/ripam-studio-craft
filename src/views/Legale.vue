<script setup>
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getLegalPage, LEGAL_HOLDER } from '../data/legale.js'

const route = useRoute()
// route.name = 'privacy' | 'cookie-policy' | 'termini' (stabilito in router/index.js)
const page = computed(() => getLegalPage(route.name))

watch(page, (p) => { if (p) document.title = `${p.title} — Ripam Studio Craft` }, { immediate: true })
</script>

<template>
  <main v-if="page" class="legal-page">
    <section class="legal-hero">
      <div class="wrap">
        <RouterLink to="/" class="detail-back">← Torna alla home</RouterLink>
        <h1 class="legal-title">{{ page.title }}</h1>
        <p class="legal-sub">{{ page.subtitle }}</p>
        <div class="legal-meta">
          Ultimo aggiornamento: {{ LEGAL_HOLDER.ultimoAggiornamento }}
        </div>
      </div>
    </section>

    <section class="legal-body">
      <div class="wrap legal-wrap">
        <article v-for="(s, i) in page.sections" :key="i" class="legal-section">
          <h2>{{ s.t }}</h2>
          <p>{{ s.p }}</p>
        </article>

        <div class="legal-footer-links">
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/cookie-policy">Cookie Policy</RouterLink>
          <RouterLink to="/termini">Termini di utilizzo</RouterLink>
        </div>
      </div>
    </section>
  </main>

  <main v-else>
    <section class="mat-section">
      <div class="wrap">
        <h1 style="font-size:42px;margin-bottom:20px">Pagina non trovata</h1>
        <p style="margin-bottom:30px">La pagina legale richiesta non esiste.</p>
        <RouterLink to="/" class="btn btn-primary">← Torna alla home</RouterLink>
      </div>
    </section>
  </main>
</template>
