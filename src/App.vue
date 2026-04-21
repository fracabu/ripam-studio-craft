<script setup>
import Navbar from './components/Navbar.vue'
import FooterCraft from './components/FooterCraft.vue'
import CookieBanner from './components/CookieBanner.vue'
</script>

<template>
  <Navbar />
  <router-view />
  <FooterCraft />
  <CookieBanner />
</template>
