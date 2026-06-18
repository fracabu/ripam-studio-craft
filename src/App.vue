<script setup>
import Navbar from './components/Navbar.vue'
import FooterCraft from './components/FooterCraft.vue'
import CookieBanner from './components/CookieBanner.vue'
</script>

<template>
  <a class="skip-link" href="#main">Salta al contenuto</a>
  <Navbar />
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <FooterCraft />
  <CookieBanner />
</template>
