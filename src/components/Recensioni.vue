<script setup>
// Recensioni reali dei membri del canale Telegram.
// Citazioni testuali, pubblicate con il consenso esplicito degli autori.
const RECENSIONI = [
  {
    nome: 'Rossella',
    contesto: 'Primo concorso',
    accent: 'acid',
    testo: 'Ho fatto l’orale oggi, ho preso 27,97 — allo scritto avevo fatto 28. È il mio primo concorso: senza i tuoi materiali non avrei mai raggiunto questo risultato in pochissimi mesi.'
  },
  {
    nome: 'Paolo',
    contesto: 'Video coaching NotebookLM',
    accent: 'blue',
    testo: 'Ho fatto una video coaching dove mi ha spiegato in modo chiaro e preciso ogni singolo passaggio per creare da zero riassunti e flashcard di una materia. Francesco è super bravo a usare la piattaforma, lo consiglio a tutti: con lui mi sono trovato benissimo.'
  },
  {
    nome: 'Elena',
    contesto: 'Manuali di studio',
    accent: 'bg',
    testo: 'Conosco questa piattaforma dal suo esordio. Non ci sono semplici simulatori: report, decaloghi, flashcard, la scelta è vasta. Ma ciò che mi ha sorpreso di più sono i manuali — schemi, quiz, formattati in maniera eccellente. Mi sono fidata di Ripam Studio e ho fatto bene.'
  }
]
</script>

<template>
  <section id="recensioni">
    <div class="wrap">
      <div v-reveal class="sec-head sec-head-compact">
        <span class="sec-kicker">DICONO DI ME</span>
        <h2>Le voci dal canale Telegram.</h2>
        <p>Messaggi reali dei concorsisti che hanno usato i materiali, riportati testualmente con il loro consenso.</p>
      </div>
      <div class="rec-grid">
        <figure
          v-for="r in RECENSIONI"
          :key="r.nome"
          v-reveal
          class="rec-card"
          :class="`rec-${r.accent}`"
        >
          <span class="rec-quote" aria-hidden="true">&ldquo;</span>
          <blockquote class="rec-text">{{ r.testo }}</blockquote>
          <figcaption class="rec-foot">
            <span class="rec-name">{{ r.nome }}</span>
            <span class="rec-source">
              <svg class="rec-tg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.94 4.3 18.6 20.1c-.25 1.1-.91 1.37-1.84.85l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.03.5l.37-5.2L18.4 6.5c.41-.37-.09-.57-.64-.2L5.05 14.2.7 12.84c-1.07-.34-1.1-1.08.23-1.6L20.5 3.05c.9-.34 1.68.2 1.44 1.25Z"/>
              </svg>
              Membro del canale Telegram
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rec-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
}
.rec-card{
  position:relative;
  display:flex;flex-direction:column;
  border:2px solid var(--ink);
  padding:30px 26px 24px;
  box-shadow:var(--shadow-sm);
  background:var(--bg);
  transition:transform .15s,box-shadow .15s;
}
.rec-card:hover{
  transform:translate(-4px,-4px);
  box-shadow:var(--shadow);
}
.rec-acid{background:var(--acid)}
.rec-blue{background:var(--blue);color:var(--bg)}
.rec-bg{background:var(--bg)}
.rec-quote{
  font-family:Georgia,"Times New Roman",serif;
  font-size:64px;line-height:.5;
  display:block;height:32px;
  opacity:.35;
}
.rec-blue .rec-quote{opacity:.55}
.rec-text{
  margin:0 0 22px;
  font-size:17px;line-height:1.62;
  font-weight:500;
}
.rec-foot{
  margin-top:auto;
  padding-top:16px;
  border-top:2px solid var(--ink);
  display:flex;flex-direction:column;gap:4px;
}
.rec-blue .rec-foot{border-top-color:var(--bg)}
.rec-name{
  font-size:17px;font-weight:700;letter-spacing:-.01em;
}
.rec-source{
  display:inline-flex;align-items:center;gap:6px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.04em;text-transform:uppercase;
  opacity:.7;
}
.rec-tg{
  width:14px;height:14px;flex:0 0 14px;
  fill:currentColor;
}
@media (max-width:880px){
  .rec-grid{grid-template-columns:1fr;gap:18px}
  .rec-card{padding:26px 22px 20px}
}
</style>
