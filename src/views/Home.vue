<script setup>
import { ref } from 'vue'
import Ticker from '../components/Ticker.vue'
import Hero from '../components/Hero.vue'
import Pilastri from '../components/Pilastri.vue'
import Steps from '../components/Steps.vue'
import Tempi from '../components/Tempi.vue'
import Catalogo from '../components/Catalogo.vue'
import Bundles from '../components/Bundles.vue'
import Coaching from '../components/Coaching.vue'
import Tools from '../components/Tools.vue'
import Features from '../components/Features.vue'
import Servizio from '../components/Servizio.vue'
import ContactForm from '../components/ContactForm.vue'
import Faq from '../components/Faq.vue'

const contactRef = ref(null)

const scrollToContact = () => {
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}

const onBundleSelect = (b) => {
  const map = {
    'materia-completa':'Bundle materia',
    'ripam':'Bundle concorso',
    'omnia':'Bundle Omnia'
  }
  const data = { prodotto: map[b.slug] }
  if (b.slug === 'ripam') data.concorso = 'RIPAM'
  contactRef.value?.prefill(data)
  scrollToContact()
}

const onServiceSelect = (s) => {
  contactRef.value?.prefill({ prodotto: s.label })
  scrollToContact()
}

const onPrefillSelect = (data) => {
  contactRef.value?.prefill(data || {})
  scrollToContact()
}
</script>

<template>
  <main class="home-page">
    <Hero />
    <Ticker />
    <Pilastri />
    <Coaching @select="onPrefillSelect" />
    <Tools @select="onPrefillSelect" />
    <Steps />
    <Tempi />
    <Catalogo />
    <Bundles @select="onBundleSelect" />
    <Servizio @select="onServiceSelect" />
    <Features />
    <ContactForm ref="contactRef" />
    <Faq />
  </main>
</template>
