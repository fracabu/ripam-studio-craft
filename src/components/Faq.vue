<script setup>
const faqs = [
  {q:'Perché non posso comprare direttamente dal sito?', a:'Gestisco ogni richiesta personalmente per garantire qualità e il giusto materiale per te. Ti rispondo entro poche ore con istruzioni di pagamento.'},
  {q:'Come si paga?', a:'Accetto Satispay, PayPal e bonifico bancario. Le istruzioni precise di pagamento le invio via email solo dopo che abbiamo concordato il lavoro. Nessun pagamento anticipato richiesto in fase di contatto.'},
  {q:'Come ricevo i materiali?', a:'Ogni materiale è prodotto su misura dopo la tua richiesta. Consegna via Telegram (file piccoli) o link Google Drive (file pesanti come video) entro 48 ore dalla conferma. Podcast in MP3 (con trascrizioni), video in MP4 (con sottotitoli), report in PDF, simulatore in HTML offline.'},
  {q:'Garantite il superamento del concorso?', a:'No — nessuno serio lo può garantire. Garantisco la qualità, l\'accuratezza e l\'aggiornamento dei contenuti prodotti. Il superamento dell\'esame dipende dalle tue conoscenze di partenza, dall\'impegno nello studio, dal tempo dedicato e da fattori esterni (modalità della prova, criteri della commissione). I miei materiali sono un supporto alla preparazione, non un sostituto dello studio individuale. Leggi il disclaimer completo nei Termini di utilizzo.'},
  {q:'I contenuti sono aggiornati?', a:'Sì. Generati da normativa ufficiale aggiornata al 2026 (autonomia differenziata, D.Lgs. 36/2023, riforme più recenti).'},
  {q:'Sono generati con AI?', a:'Sì, con AI addestrata sui testi normativi ufficiali (RAG) e poi revisionati manualmente. È un punto di forza: aggiornamenti rapidi, distrattori calibrati, zero copia-incolla da vecchi manuali. Se trovi imprecisioni, le correggo gratis.'},
  {q:'Posso richiedere solo una materia?', a:'Certo. Ogni materia e ogni formato è richiedibile singolarmente. I percorsi completi servono solo a combinare più cose se ti serve tutto.'},
  {q:'Il simulatore funziona senza internet?', a:'Sì, completamente offline. È un file HTML che apri nel browser: funziona su PC, tablet, smartphone. Nessun account, nessuna installazione.'},
  {q:'Come trattate i miei dati?', a:'I dati del form (nome, email, preferenze) li uso solo per risponderti. Non vendo né condivido con terze parti. Vedi Privacy Policy completa per dettagli su conservazione, diritti GDPR e base giuridica.'}
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
