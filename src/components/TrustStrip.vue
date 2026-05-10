<script setup>
</script>

<template>
  <div class="trust-strip" role="note" aria-label="Cosa garantisco">
    <span><span class="check">&check;</span> Made in Roma</span>
    <span><span class="check">&check;</span> Revisione manuale dopo l'AI</span>
    <span><span class="check">&check;</span> Pago dopo, non prima</span>
    <span><span class="check">&check;</span> Telegram diretto col fondatore</span>
  </div>
</template>

<style scoped>
.trust-strip{
  position:relative;z-index:1;
  background:var(--ink);color:var(--bg);
  border-top:2px solid var(--ink);
  border-bottom:2px solid var(--ink);
  padding:14px 24px;
  display:flex;justify-content:center;gap:36px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;letter-spacing:.06em;
  flex-wrap:wrap;
}
.trust-strip span{display:inline-flex;align-items:center;gap:8px}
.trust-strip .check{color:var(--acid);font-weight:700}
@media (max-width:640px){
  .trust-strip{gap:18px;font-size:11px;padding:12px 18px}
}
</style>
