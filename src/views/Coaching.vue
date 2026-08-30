<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ContactForm from '../components/ContactForm.vue'

const contactRef = ref(null)
const onPrefill = () => {
  contactRef.value?.prefill({ prodotto: 'Coaching NotebookLM 1:1' })
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}

const ricevi = [
  { ico: '💬', t: 'Una chiacchierata in videochiamata, focalizzata sulla tua materia.' },
  { ico: '🧰', t: 'I prompt che uso io quando lavoro su NotebookLM.' },
  { ico: '📋', t: '50 prompt pronti per generare flashcard, report, tabelle, infografiche.' },
  { ico: '📬', t: 'Follow-up scritto entro 48h con tutto quello che ci siamo detti.' }
]

const cosaImpari = [
  'Come alimentare NotebookLM per la materia che devi studiare',
  'Come scrivere prompt che tirano fuori il massimo',
  'Come generare podcast, flashcard, riassunti, quiz personalizzati',
  'Come iterare e raffinare fino al risultato che ti serve'
]

const flusso = [
  { n: '01', t: 'Brief', d: 'Mi scrivi cosa stai preparando e cosa vorresti tirare fuori da NotebookLM.', when: '~ 5 min' },
  { n: '02', t: 'Concordiamo lo slot', d: 'Trovi un orario che ti torna comodo, ti mando link Meet e una piccola scaletta.', when: 'entro 24h' },
  { n: '03', t: 'Lavoriamo insieme', d: 'In videochiamata: setup NotebookLM, prompt, generazione contenuti reali sui tuoi materiali.', when: 'una sessione' },
  { n: '04', t: 'Follow-up', d: 'Ti mando per scritto i prompt che abbiamo usato + altri 50 pronti, da rileggere quando vuoi.', when: 'entro 48h' }
]
</script>

<template>
  <main id="main" class="cg-page">
    <!-- HERO -->
    <section class="cg-hero">
      <div class="wrap cg-hero-grid">
        <div>
          <div class="cg-kicker">PILASTRO 02 &middot; CONSULENZA</div>
          <h1 class="cg-h1">
            Una chiacchierata con me. E sai come studiare con
            <span class="hl-pink">NotebookLM</span>.
          </h1>
          <p class="cg-sub">
            Se vuoi essere autonomo e non pagare materiali pronti, ti insegno
            a costruirteli da solo. Direttamente dentro NotebookLM, sulla materia
            che ti serve davvero.
          </p>
          <div class="cg-ctas">
            <button type="button" class="btn btn-primary" @click="onPrefill">Prenota uno slot &rarr;</button>
            <RouterLink to="/#pilastri" class="btn btn-secondary">Tutti i pilastri &rarr;</RouterLink>
          </div>
        </div>

        <aside class="cg-receive">
          <div class="cg-receive-pill">COSA RICEVI</div>
          <ul>
            <li v-for="(r, i) in ricevi" :key="i">
              <span class="r-ico" aria-hidden="true">{{ r.ico }}</span>
              <span>{{ r.t }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <!-- COSA IMPARI -->
    <section class="cg-learn">
      <div class="wrap">
        <div class="cg-kicker">COSA TI PORTI A CASA</div>
        <h2 class="cg-h2">Quattro cose concrete, non slide.</h2>
        <div class="cg-learn-grid">
          <div v-for="(b, i) in cosaImpari" :key="i" class="cg-learn-item">
            <span class="cg-chk" aria-hidden="true">&check;</span>
            <span>{{ b }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FLUSSO -->
    <section class="cg-flow">
      <div class="wrap">
        <div class="cg-kicker">COME SI SVOLGE</div>
        <h2 class="cg-h2">Quattro passi. Tu mi scrivi, da lì in poi mi muovo io.</h2>
        <div class="cg-flow-grid">
          <article v-for="s in flusso" :key="s.n" class="cg-step">
            <div class="cg-step-num">{{ s.n }}</div>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
            <span class="cg-step-when">{{ s.when }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cg-cta">
      <div class="wrap cg-cta-in">
        <h2>Vuoi prenotare il tuo slot?</h2>
        <button type="button" class="btn btn-primary" @click="onPrefill">Scrivimi &rarr;</button>
      </div>
    </section>

    <ContactForm ref="contactRef" />
  </main>
</template>

<style scoped>
.cg-page{padding-bottom:60px;position:relative;z-index:1}

.cg-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:14px;
}
.cg-h1{
  font-size:clamp(34px,4.8vw,58px);font-weight:700;letter-spacing:-.035em;
  line-height:1.02;margin:0 0 18px;text-wrap:balance;
}
.hl-pink{
  background:var(--pink,#ff7ac6);color:var(--ink);
  padding:0 .15em;box-decoration-break:clone;
}
.cg-h2{
  font-size:clamp(28px,3.8vw,46px);font-weight:700;letter-spacing:-.03em;
  line-height:1.05;margin:0 0 24px;text-wrap:balance;max-width:30ch;
}

/* HERO — full-viewport (riempie lo schermo sotto al nav) */
.cg-hero{
  min-height:calc(100vh - var(--nav-h, 76px));
  display:flex;align-items:center;
  padding:40px 0;border-bottom:2px solid var(--ink);
}
.cg-hero > .wrap{width:100%}
.cg-hero-grid{
  display:grid;grid-template-columns:1.4fr 1fr;gap:50px;align-items:center;
}
@media(max-width:880px){
  .cg-hero{min-height:auto;padding:48px 0}
  .cg-hero-grid{grid-template-columns:1fr;gap:32px}
}
.cg-sub{
  font-size:17px;line-height:1.55;color:var(--ink-soft,#2a2a2a);
  max-width:60ch;margin:0 0 22px;
}
.cg-ctas{display:flex;gap:14px;flex-wrap:wrap}

.cg-receive{
  background:var(--pink,#ff7ac6);color:var(--ink);
  border:2px solid var(--ink);
  padding:24px 26px;
  box-shadow:6px 6px 0 var(--ink);
  transform:rotate(1.4deg);
  display:flex;flex-direction:column;gap:14px;
}
.cg-receive-pill{
  display:inline-block;align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;font-weight:700;letter-spacing:.12em;
  background:var(--ink);color:var(--bg);
  padding:5px 9px;
}
.cg-receive ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
.cg-receive li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.45;font-weight:600}
.cg-receive .r-ico{font-size:20px;line-height:1;flex:0 0 auto;width:28px;text-align:center}

/* LEARN */
.cg-learn{padding:72px 0;border-bottom:2px solid var(--ink)}
.cg-learn-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
@media(max-width:720px){.cg-learn-grid{grid-template-columns:1fr}}
.cg-learn-item{
  display:flex;gap:14px;align-items:flex-start;
  padding:18px 20px;
  border:2px solid var(--ink);background:var(--bg);
  font-size:15px;line-height:1.45;
  transition:transform .15s, box-shadow .15s, background .15s;
}
.cg-learn-item:hover{transform:translate(-2px,-2px);box-shadow:3px 3px 0 var(--ink);background:var(--acid)}
.cg-chk{
  width:24px;height:24px;flex:0 0 auto;
  background:var(--ink);color:var(--acid);
  display:grid;place-items:center;font-weight:700;font-size:14px;
}

/* FLOW */
.cg-flow{padding:72px 0;border-bottom:2px solid var(--ink);background:var(--bg-alt,#ede6d8)}
.cg-flow-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:18px;
  margin-top:8px;
}
@media(max-width:880px){.cg-flow-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.cg-flow-grid{grid-template-columns:1fr}}
.cg-step{
  background:var(--bg);border:2px solid var(--ink);
  padding:22px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:10px;
}
.cg-step-num{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.1em;color:var(--ink);opacity:.55;
}
.cg-step h3{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0}
.cg-step p{font-size:14px;line-height:1.5;margin:0;color:var(--ink-soft,#2a2a2a)}
.cg-step-when{
  margin-top:auto;align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;font-weight:700;letter-spacing:.08em;
  background:var(--ink);color:var(--bg);
  padding:5px 9px;
}

/* CTA */
.cg-cta{padding:72px 0;background:var(--bg)}
.cg-cta-in{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.cg-cta-in h2{font-size:clamp(26px,3.5vw,42px);font-weight:700;letter-spacing:-.03em;margin:0;text-wrap:balance}
</style>
