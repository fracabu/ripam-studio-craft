<script setup>
import Counter from './Counter.vue'
</script>

<template>
  <section class="hero hero-anim">
    <div class="wrap">
      <div class="hero-grid">
        <div>
          <h1>Formazione, consulenza e tool di studio fatti con l'AI. <span class="hl">Su misura per te.</span></h1>
          <p class="hero-sub">Aiuto chi si prepara ai concorsi pubblici a studiare meglio: con materiali su misura, coaching 1:1 su NotebookLM e strumenti di studio pensati insieme.</p>
          <div class="hero-ctas">
            <a href="#pilastri" class="btn btn-primary">Come lavoriamo insieme →</a>
            <a href="#contatti" class="btn btn-secondary">Raccontami cosa ti serve</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="stat"><div class="stat-num"><Counter :to="20" /></div><div class="stat-lbl">materie disponibili</div></div>
          <div class="stat"><div class="stat-num"><Counter :to="4" /></div><div class="stat-lbl">formati per materia</div></div>
          <div class="stat"><div class="stat-num"><Counter :to="500" /></div><div class="stat-lbl">domande per simulatore</div></div>
          <div class="stat"><div class="stat-num"><Counter to="48h" /></div><div class="stat-lbl">consegna su misura</div></div>
        </div>
      </div>
    </div>
  </section>
</template>
