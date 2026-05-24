<script setup>
import { useRouter } from 'vue-router'
import Hero from '../components/Hero.vue'
import TrustStrip from '../components/TrustStrip.vue'
import Pilastri from '../components/Pilastri.vue'
import Steps from '../components/Steps.vue'
import Catalogo from '../components/Catalogo.vue'
import Coaching from '../components/Coaching.vue'
import Recensioni from '../components/Recensioni.vue'
import Newsletter from '../components/Newsletter.vue'
import ContactCTA from '../components/ContactCTA.vue'
import Faq from '../components/Faq.vue'
import StickyCTA from '../components/StickyCTA.vue'

const router = useRouter()

// Quando l'utente clicca "Richiedi uno slot" sul componente Coaching della home
// reindirizziamo direttamente a /scrivimi pre-compilato (niente più form inline).
const onPrefillSelect = (data = {}) => {
  const query = {}
  if (data.prodotto?.toLowerCase().includes('coaching')) query.tipo = 'coaching'
  else if (data.prodotto?.toLowerCase().includes('tool')) query.tipo = 'tool'
  else query.tipo = 'materia'
  if (data.materia) query.note = `Materia: ${data.materia}`
  if (data.concorso) query.concorso = data.concorso
  router.push({ name: 'scrivimi', query })
}
</script>

<template>
  <main class="home-page">
    <Hero />
    <TrustStrip />
    <Pilastri />
    <Coaching @select="onPrefillSelect" />
    <Steps />
    <Catalogo />
    <Recensioni />
    <Newsletter />
    <ContactCTA />
    <Faq />
    <StickyCTA />
  </main>
</template>
