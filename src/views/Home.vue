<script setup>
import { ref } from 'vue'
import Hero from '../components/Hero.vue'
import Pilastri from '../components/Pilastri.vue'
import Steps from '../components/Steps.vue'
import Catalogo from '../components/Catalogo.vue'
import Coaching from '../components/Coaching.vue'
import ContactForm from '../components/ContactForm.vue'
import Faq from '../components/Faq.vue'
// TAGLIO A (prova): sezioni nascoste dalla Home per ridurre sovraccarico.
// Riabilita gli import + i tag nel template se vuoi rimetterle.
// import Tools from '../components/Tools.vue'
// import Bundles from '../components/Bundles.vue'
// import Features from '../components/Features.vue'

const contactRef = ref(null)

const scrollToContact = () => {
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}

const onPrefillSelect = (data) => {
  contactRef.value?.prefill(data || {})
  scrollToContact()
}
</script>

<template>
  <main class="home-page">
    <Hero />
    <Pilastri />
    <Coaching @select="onPrefillSelect" />
    <Steps />
    <Catalogo />
    <ContactForm ref="contactRef" />
    <Faq />
    <!-- TAGLIO A (prova): sezioni nascoste
    <Tools @select="onPrefillSelect" />
    <Bundles @select="onBundleSelect" />
    <Features />
    -->
  </main>
</template>
