<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section id="contatti" class="cc-section">
    <div class="wrap cc-grid">
      <div class="cc-text">
        <span class="cc-kicker">PARLIAMOCI</span>
        <h2 class="cc-h2">Raccontami <span class="cc-hl">cosa ti serve.</span></h2>
        <p class="cc-lead">
          Bastano 4 campi. Ti rispondo entro 24h via email — o via Telegram, se preferisci.
          Nessun pagamento anticipato, nessun carrello.
        </p>
        <div class="cc-ctas">
          <RouterLink to="/scrivimi" class="btn btn-primary">Apri il form &rarr;</RouterLink>
          <a href="https://t.me/fcapurso" target="_blank" rel="noopener" class="btn btn-secondary">
            Telegram &nearr;
          </a>
        </div>
        <div class="cc-pay">
          <span class="cc-pay-l">Pagamenti accettati &middot;</span>
          <span class="cc-pay-v">Satispay &middot; PayPal &middot; Bonifico</span>
        </div>
      </div>

      <aside class="cc-card" aria-label="Cosa succede dopo">
        <div class="cc-card-pill">COSA SUCCEDE DOPO</div>
        <ol class="cc-steps">
          <li><span class="n">01</span> Mi scrivi via form o Telegram</li>
          <li><span class="n">02</span> Ti rispondo io con domande &amp; idee</li>
          <li><span class="n">03</span> Concordiamo prezzo &amp; tempi per scritto</li>
          <li><span class="n">04</span> Solo allora paghi e iniziamo</li>
        </ol>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.cc-section{
  padding:80px 0;
  border-top:2px solid var(--ink);
  border-bottom:2px solid var(--ink);
  background:var(--bg-alt,#ede6d8);
  position:relative;z-index:1;
}

.cc-grid{
  display:grid;grid-template-columns:1.4fr 1fr;gap:50px;align-items:center;
}
@media(max-width:880px){.cc-grid{grid-template-columns:1fr;gap:32px}}

.cc-kicker{
  display:inline-block;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:700;letter-spacing:.08em;
  background:var(--ink);color:var(--bg);
  padding:5px 12px;margin-bottom:18px;
}
.cc-h2{
  font-size:clamp(32px,4.2vw,52px);font-weight:700;
  letter-spacing:-.035em;line-height:1.05;
  margin:0 0 16px;text-wrap:balance;
}
.cc-hl{background:var(--acid);color:var(--ink);padding:0 .15em;box-decoration-break:clone}
.cc-lead{
  font-size:18px;line-height:1.55;color:var(--ink-soft,#2a2a2a);
  max-width:62ch;margin:0 0 24px;
}
.cc-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px}

.cc-pay{
  display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.05em;color:var(--muted,#6b6458);
}
.cc-pay-l{font-weight:700}
.cc-pay-v{color:var(--ink);opacity:.85}

.cc-card{
  background:var(--bg);border:2px solid var(--ink);
  box-shadow:6px 6px 0 var(--ink);
  padding:24px 26px;
  display:flex;flex-direction:column;gap:14px;
  transform:rotate(-1deg);
}
.cc-card-pill{
  align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  background:var(--acid);color:var(--ink);
  padding:5px 9px;border:2px solid var(--ink);
}
.cc-steps{
  list-style:none;padding:0;margin:0;
  display:flex;flex-direction:column;gap:10px;
}
.cc-steps li{
  display:flex;gap:12px;align-items:baseline;
  font-size:15px;line-height:1.4;color:var(--ink);
  padding:8px 10px;
  border:2px solid var(--ink);background:var(--bg);
}
.cc-steps li .n{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.08em;
  color:var(--muted,#6b6458);flex:0 0 24px;
}
</style>
