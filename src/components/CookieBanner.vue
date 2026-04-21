<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'rsc-cookie-ack-v1'
const show = ref(false)

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) show.value = true
  } catch (_) {
    // localStorage bloccato (modalità incognito estrema): mostra comunque
    show.value = true
  }
})

const accept = () => {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch (_) {}
  show.value = false
}
</script>

<template>
  <transition name="cookie">
    <div v-if="show" class="cookie-banner" role="region" aria-label="Informativa cookie">
      <div class="cookie-inner">
        <div class="cookie-text">
          <strong>Solo cookie tecnici.</strong>
          Questo sito usa esclusivamente cookie necessari al funzionamento. Nessun tracciamento, nessuna profilazione, nessuna terza parte.
          <RouterLink to="/cookie-policy" class="cookie-link">Dettagli →</RouterLink>
        </div>
        <button type="button" class="cookie-btn" @click="accept">Ho capito</button>
      </div>
    </div>
  </transition>
</template>

<script>
import { RouterLink } from 'vue-router'
export default { components: { RouterLink } }
</script>
