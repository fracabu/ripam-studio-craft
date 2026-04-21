<template>
  <section class="ticker" aria-label="valori Craft">
    <div class="ticker-track">
      <span class="ticker-item" v-for="item in items.concat(items)" :key="item + Math.random()">{{ item }}</span>
    </div>
  </section>
</template>

<script setup>
const items = [
  'AI + NORMATIVA UFFICIALE',
  'CUCITI SU MISURA',
  'SOTTOTITOLI & TRASCRIZIONI INCLUSE',
  'CONSEGNA IN 48H'
]
</script>
