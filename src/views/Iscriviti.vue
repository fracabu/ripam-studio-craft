<script setup>
// Landing condivisibile per gli inviti all'iscrizione (post Telegram/FB):
// URL pulito /newsletter, 1 sola azione. Riusa il componente Newsletter (stesso
// form doppio opt-in della Home) così non si duplica la logica di iscrizione.
import Newsletter from '../components/Newsletter.vue'
</script>

<template>
  <main class="iscriviti-page">
    <Newsletter />
  </main>
</template>

<style scoped>
.iscriviti-page{
  position:relative;z-index:1;
  min-height:calc(100dvh - var(--nav-h, 76px));
  display:flex;flex-direction:column;justify-content:center;
}
</style>
