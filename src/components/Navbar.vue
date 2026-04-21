<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-mark">R</span>
        <span>Ripam Studio <em style="font-style:normal;color:var(--blue)">Craft</em></span>
      </RouterLink>
      <div class="nav-links">
        <RouterLink to="/#catalogo">Catalogo</RouterLink>
        <RouterLink to="/#come-funziona">Come funziona</RouterLink>
        <RouterLink to="/#contatti" class="nav-cta">Contattaci →</RouterLink>
      </div>
    </div>
  </nav>
</template>
