<template>
  <section id="come-funziona" class="come-lavoro">
    <div class="wrap">
      <div class="come-lavoro-grid">

        <!-- colonna sinistra: testo + box pagamenti -->
        <div class="come-lavoro-left">
          <div v-reveal class="sec-head" style="margin-bottom:28px">
            <span class="sec-kicker">COME LAVORO</span>
            <h2>Fatti consigliare o costruire lo strumento adatto al tuo apprendimento.</h2>
            <p>Quattro passi: mi scrivi, ragioniamo insieme, concordiamo costi e tempi, ti consegno. Nessun carrello, nessun file già pronto per chiunque.</p>
          </div>

          <div v-reveal class="pay-box">
            <div class="pay-label">PAGAMENTI ACCETTATI</div>
            <div class="pay-list">
              <div class="pay-item"><span class="pay-ico">💳</span><span>Satispay</span></div>
              <div class="pay-item"><span class="pay-ico">🅿️</span><span>PayPal</span></div>
              <div class="pay-item"><span class="pay-ico">🏦</span><span>Bonifico</span></div>
            </div>
            <div class="pay-note">Nessun pagamento anticipato in fase di contatto — le istruzioni le mando solo dopo aver concordato il lavoro.</div>
          </div>
        </div>

        <!-- colonna destra: 4 step in griglia 2x2 -->
        <div v-reveal class="steps steps-2x2 stagger">
          <div class="step">
            <div class="step-num">01</div>
            <h3>Mi scrivi</h3>
            <p>Form o email. Mi dici chi sei, cosa stai preparando, cosa ti serve.</p>
          </div>
          <div class="step">
            <div class="step-num">02</div>
            <h3>Ragioniamo insieme</h3>
            <p>Capiamo se ti serve formazione, consulenza o un tool su misura.</p>
          </div>
          <div class="step">
            <div class="step-num">03</div>
            <h3>Confermi e paghi</h3>
            <p>Ti mando riepilogo scritto e istruzioni di pagamento concordate.</p>
          </div>
          <div class="step">
            <div class="step-num">04</div>
            <h3>Ricevi in 48h</h3>
            <p>Materiali, coaching o web app: consegna su misura entro 48 ore.</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
