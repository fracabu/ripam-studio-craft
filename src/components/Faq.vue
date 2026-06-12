<script setup>
// FAQ ridotte all'essenziale: solo le obiezioni che bloccano la decisione
// (no-carrello, pagamento, tempi, AI, singola materia) + l'onestà sulla garanzia.
// Le risposte operative complete (consegna, correzione errori, offline, dati GDPR)
// vivono in Termini/Privacy e nelle mail post-contatto.
const faqs = [
  {q:'Perché non posso comprare direttamente dal sito?', a:'Gestisco ogni richiesta personalmente per garantire qualità e il giusto materiale per te. Ti rispondo entro poche ore con istruzioni di pagamento.'},
  {q:'Come si paga?', a:'Satispay, PayPal o bonifico. Le istruzioni le invio via email solo dopo che abbiamo concordato il lavoro: nessun pagamento anticipato in fase di contatto.'},
  {q:'Quanto ci vuole per ricevere il materiale?', a:'Materiali già in archivio: 48 ore dalla conferma. Coaching NotebookLM 1:1: slot di solito entro la settimana. Materie nuove o tagli molto personalizzati: 1-2 settimane. Tool/web app su misura: 2-4 settimane. Se hai urgenza, scrivi lo stesso: vediamo insieme.'},
  {q:'Posso richiedere solo una materia?', a:'Certo. Ogni materia e ogni formato è richiedibile singolarmente. I percorsi completi servono solo a combinare più cose se ti serve tutto.'},
  {q:'Sono generati con AI?', a:'Sì, con AI addestrata sui testi normativi ufficiali (RAG) e poi revisionati manualmente. È un punto di forza: aggiornamenti rapidi, distrattori calibrati, zero copia-incolla da vecchi manuali. Se trovi imprecisioni, le correggo gratis.'},
  {q:'Garantite il superamento del concorso?', a:'No — nessuno serio lo può garantire. Garantisco qualità, accuratezza e aggiornamento dei contenuti. Il resto dipende dalla tua preparazione e da fattori esterni. I materiali sono un supporto allo studio, non un sostituto. Disclaimer completo nei Termini.'},
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
