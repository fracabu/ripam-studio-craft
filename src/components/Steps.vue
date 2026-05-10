<template>
  <section id="come-funziona" class="come-lavoro">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">COME LAVORIAMO</span>
        <h2>Quattro step. Nessuna sorpresa.</h2>
        <p>Trasparenza sul flusso e sui tempi. Niente carrello, niente file già pronto per chiunque.</p>
      </div>

      <div v-reveal class="steps stagger">
        <div class="step">
          <div class="step-num">01</div>
          <h3>Mi scrivi</h3>
          <p>Mi dici concorso, materia, formato preferito. Email o Telegram, scegli tu.</p>
          <span class="step-when">~ 2 minuti</span>
        </div>
        <div class="step">
          <div class="step-num">02</div>
          <h3>Ragioniamo insieme</h3>
          <p>Capiamo se ti serve formazione, consulenza o un tool su misura.</p>
          <span class="step-when">15-20 min &middot; gratis</span>
        </div>
        <div class="step">
          <div class="step-num">03</div>
          <h3>Ti mando il preventivo</h3>
          <p>Brief scritto, prezzo finale, tempi di consegna. Solo allora paghi.</p>
          <span class="step-when">entro 24h</span>
        </div>
        <div class="step">
          <div class="step-num">04</div>
          <h3>Ricevi e studi</h3>
          <p>Materiali via Telegram o Drive. Posso restare a disposizione per dubbi.</p>
          <span class="step-when">24h - 4 sett.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.step{position:relative}
.step-when{
  display:inline-block;
  margin-top:14px;
  padding:5px 10px;
  background:var(--ink);color:var(--bg);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
}
</style>
