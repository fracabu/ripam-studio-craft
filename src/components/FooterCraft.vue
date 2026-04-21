<script setup>
import { RouterLink } from 'vue-router'
import { LEGAL_HOLDER } from '../data/legale.js'
</script>

<template>
  <footer>
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-about">
          <div class="logo" style="color:var(--bg)">
            <span class="logo-mark">R</span>
            <span>Ripam Studio <em style="font-style:normal;color:var(--acid)">Craft</em><sup class="tm">™</sup></span>
          </div>
          <p>Materiali didattici generati con AI su normativa ufficiale. Podcast, video, report e simulatori cuciti su misura.</p>
        </div>
        <div class="foot-col">
          <h4>NAVIGA</h4>
          <a href="/#materie">Materie</a>
          <a href="/#come-funziona">Come lavoro</a>
          <a href="/#contatti">Contatti</a>
          <a href="/#faq">FAQ</a>
        </div>
        <div class="foot-col">
          <h4>CONTATTI</h4>
          <a href="https://t.me/[USERNAME]" target="_blank" rel="noopener">Telegram</a>
          <a :href="`mailto:${LEGAL_HOLDER.email}`">{{ LEGAL_HOLDER.email }}</a>
        </div>
        <div class="foot-col">
          <h4>LEGALE</h4>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/cookie-policy">Cookie Policy</RouterLink>
          <RouterLink to="/termini">Termini di utilizzo</RouterLink>
        </div>
      </div>
      <div class="foot-bot">
        <span>© 2026 {{ LEGAL_HOLDER.brand }} — {{ LEGAL_HOLDER.nome }} · Roma · P.IVA {{ LEGAL_HOLDER.piva }}</span>
        <span>Contenuti per uso personale di studio</span>
      </div>
    </div>
  </footer>
</template>
