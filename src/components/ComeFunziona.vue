<script setup>
import { RouterLink } from 'vue-router'

// Versione minimal della vecchia Steps.vue: una sola riga, non il blocco grande.
// Riassume il flusso in 4 step + la promessa chiave "paghi solo dopo".
const STEP = [
  { n: '01', t: 'Mi scrivi' },
  { n: '02', t: 'Ne parliamo, gratis' },
  { n: '03', t: 'Preventivo scritto' },
  { n: '04', t: 'Ricevi e studi' },
]
</script>

<template>
  <section id="come-funziona" class="cf">
    <div class="wrap cf-in" v-reveal>
      <span class="cf-kicker">COME FUNZIONA</span>
      <ol class="cf-steps">
        <li v-for="s in STEP" :key="s.n">
          <span class="cf-num">{{ s.n }}</span>{{ s.t }}
        </li>
      </ol>
      <RouterLink to="/scrivimi" class="cf-pay">Paghi solo dopo il preventivo &rarr;</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.cf{
  padding:22px 0;
  background:var(--ink);color:var(--bg);
  border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);
}
.cf-in{
  display:flex;align-items:center;flex-wrap:wrap;gap:14px 24px;
  justify-content:space-between;
}
.cf-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.14em;
  color:var(--acid);flex:0 0 auto;
}
.cf-steps{
  list-style:none;margin:0;padding:0;
  display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px;
}
.cf-steps li{
  display:flex;align-items:baseline;gap:8px;
  font-size:15.5px;font-weight:600;line-height:1.2;
}
.cf-steps li + li{position:relative}
.cf-steps li + li::before{
  content:"→";color:var(--acid);opacity:.7;
  margin-right:14px;font-weight:700;
}
.cf-num{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;color:var(--acid);
}
.cf-pay{
  flex:0 0 auto;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13.5px;font-weight:700;letter-spacing:.04em;
  color:var(--ink);background:var(--acid);
  padding:8px 12px;border:2px solid var(--acid);
  text-decoration:none;transition:transform .12s;
}
.cf-pay:hover{transform:translate(-2px,-2px)}

@media(max-width:760px){
  .cf-in{justify-content:flex-start}
  .cf-steps li + li::before{margin-right:10px}
}
</style>
