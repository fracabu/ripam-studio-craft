<script setup>
const faqs = [
  {q:'Perché non posso comprare direttamente dal sito?', a:'Gestiamo ogni ordine personalmente per garantire la qualità e il giusto materiale per il tuo concorso. Ti rispondiamo entro poche ore con istruzioni di pagamento.'},
  {q:'Come ricevo i materiali?', a:'Ogni materiale è prodotto su misura dopo la tua richiesta. Consegna via Telegram (file piccoli) o link Google Drive (file pesanti come video) entro 48 ore dalla conferma. Podcast in MP3 (con trascrizioni), video in MP4 (con sottotitoli), report in PDF, simulatore in HTML offline.'},
  {q:'I contenuti sono aggiornati?', a:'Sì. Generati da normativa ufficiale aggiornata al 2026 (autonomia differenziata, D.Lgs. 36/2023, riforme più recenti).'},
  {q:'Sono generati con AI?', a:'Sì, con AI addestrata sui testi normativi ufficiali (RAG) e poi revisionati manualmente. È un punto di forza: aggiornamenti rapidi, distrattori calibrati, zero copia-incolla da vecchi manuali. Se trovi imprecisioni, le correggiamo gratis.'},
  {q:'Posso comprare solo una materia?', a:'Certo. Ogni materia e ogni formato è acquistabile singolarmente. I bundle servono solo a risparmiare se ti serve tutto.'},
  {q:'Il simulatore funziona senza internet?', a:'Sì, completamente offline. È un file HTML che apri nel browser: funziona su PC, tablet, smartphone. Nessun account, nessuna installazione.'}
]
</script>

<template>
  <section id="faq">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">07 · FAQ</span>
        <h2>Risposte rapide.</h2>
      </div>
      <div v-reveal class="faq-list stagger">
        <details v-for="(f, i) in faqs" :key="i" class="faq-item">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
