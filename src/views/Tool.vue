<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { TOOLS, SERVIZI } from '../data/formati.js'
import ContactForm from '../components/ContactForm.vue'

const contactRef = ref(null)
const askGenerico = () => {
  contactRef.value?.prefill({ prodotto: 'Tool/Web app su misura' })
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}
const askTool = (t) => {
  contactRef.value?.prefill({ prodotto: `Tool custom: ${t.t}` })
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}
const askServizio = (s) => {
  contactRef.value?.prefill({ prodotto: s.label })
  document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })
}

const ricevi = [
  { ico: '🧭', t: 'Una call iniziale per capire cosa ti serve davvero.' },
  { ico: '✏️', t: 'Un brief scritto con scope, tempi e prezzo finale prima di iniziare.' },
  { ico: '🚀', t: 'Il prodotto consegnato e funzionante, non slide o mockup.' },
  { ico: '🛠️', t: '30 giorni di assistenza post-lancio per aggiustare il tiro.' }
]

const flusso = [
  { n: '01', t: 'Discovery', d: 'Capiamo insieme cosa serve, su cosa ha senso investire e su cosa no.', when: '~ 1 settimana' },
  { n: '02', t: 'Prototipo', d: 'Ti mostro qualcosa di tangibile presto, per capire se la direzione torna.', when: '1-2 settimane' },
  { n: '03', t: 'Build', d: 'Sviluppo, iterazioni, test. Restiamo in contatto su Telegram per dubbi e modifiche.', when: '2-4 settimane' },
  { n: '04', t: 'Lancio + 30gg', d: 'Pubblichiamo, e per i 30 giorni successivi sono disponibile per fix e piccole evoluzioni.', when: 'incluso' }
]
</script>

<template>
  <main class="tl-page">
    <!-- HERO -->
    <section class="tl-hero">
      <div class="wrap tl-hero-grid">
        <div>
          <div class="tl-kicker">PILASTRO 03 &middot; SVILUPPO</div>
          <h1 class="tl-h1">
            Web app e tool di studio,
            <span class="hl-blue">su misura</span>.
          </h1>
          <p class="tl-sub">
            Quando un materiale didattico non basta e serve uno strumento vero —
            un simulatore, una web app, un convertitore — lo costruisco insieme a te.
            Nessun template, nessuna soluzione preconfezionata.
          </p>
          <div class="tl-ctas">
            <button type="button" class="btn btn-primary" @click="askGenerico">Raccontami il progetto &rarr;</button>
            <RouterLink to="/#pilastri" class="btn btn-secondary">Tutti i pilastri &rarr;</RouterLink>
          </div>
        </div>

        <aside class="tl-receive">
          <div class="tl-receive-pill">COSA RICEVI</div>
          <ul>
            <li v-for="(r, i) in ricevi" :key="i">
              <span class="r-ico" aria-hidden="true">{{ r.ico }}</span>
              <span>{{ r.t }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <!-- COSA COSTRUISCO -->
    <section class="tl-build">
      <div class="wrap">
        <div class="tl-kicker">COSA COSTRUISCO</div>
        <h2 class="tl-h2">Tre famiglie di tool. Tutti pensati per lo studio.</h2>
        <div class="tl-build-grid">
          <article v-for="t in TOOLS" :key="t.k" class="tl-card">
            <div class="tl-card-ico" aria-hidden="true">{{ t.ico }}</div>
            <h3>{{ t.t }}</h3>
            <p>{{ t.desc }}</p>
            <div class="tl-card-ex">
              <div class="tl-card-ex-l">ESEMPI</div>
              <ul>
                <li v-for="(e, i) in t.examples" :key="i">{{ e }}</li>
              </ul>
            </div>
            <button class="btn btn-primary" type="button" @click="askTool(t)">
              Parliamo di {{ t.t.toLowerCase() }} &rarr;
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- CONVERSIONE: Servizi rapidi -->
    <section class="tl-svc">
      <div class="wrap">
        <div class="tl-kicker">HAI GIÀ MATERIALE? LO TRASFORMO</div>
        <h2 class="tl-h2">Servizi più rapidi per chi ha già qualcosa in mano.</h2>
        <div class="tl-svc-grid">
          <article v-for="s in SERVIZI" :key="s.k" class="tl-svc-card">
            <div class="tl-svc-ico" aria-hidden="true">{{ s.ico }}</div>
            <h3>{{ s.t }}</h3>
            <p>{{ s.desc }}</p>
            <div class="tl-svc-meta">
              <span>{{ s.fmt }}</span>
              <span v-if="s.price">{{ s.price }}</span>
            </div>
            <button class="btn" type="button" @click="askServizio(s)">Richiedi informazioni &rarr;</button>
          </article>
        </div>
      </div>
    </section>

    <!-- FLUSSO -->
    <section class="tl-flow">
      <div class="wrap">
        <div class="tl-kicker">COME SI LAVORA</div>
        <h2 class="tl-h2">Quattro fasi. Tu vedi cosa succede a ogni passaggio.</h2>
        <div class="tl-flow-grid">
          <article v-for="s in flusso" :key="s.n" class="tl-step">
            <div class="tl-step-num">{{ s.n }}</div>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
            <span class="tl-step-when">{{ s.when }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="tl-cta">
      <div class="wrap tl-cta-in">
        <h2>Hai un'idea che non torna in nessuna casella standard?</h2>
        <button type="button" class="btn btn-primary" @click="askGenerico">Raccontamela &rarr;</button>
      </div>
    </section>

    <ContactForm ref="contactRef" />
  </main>
</template>

<style scoped>
.tl-page{padding-bottom:60px;position:relative;z-index:1}

.tl-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:14px;
}
.tl-h1{
  font-size:clamp(34px,4.8vw,58px);font-weight:700;letter-spacing:-.035em;
  line-height:1.02;margin:0 0 18px;text-wrap:balance;
}
.hl-blue{
  background:var(--blue,#3d5aff);color:var(--bg);
  padding:0 .15em;box-decoration-break:clone;
}
.tl-h2{
  font-size:clamp(28px,3.8vw,46px);font-weight:700;letter-spacing:-.03em;
  line-height:1.05;margin:0 0 24px;text-wrap:balance;max-width:30ch;
}

/* HERO */
.tl-hero{padding:72px 0 60px;border-bottom:2px solid var(--ink)}
.tl-hero-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:50px;align-items:center}
@media(max-width:880px){.tl-hero-grid{grid-template-columns:1fr;gap:32px}}
.tl-sub{font-size:17px;line-height:1.55;color:var(--ink-soft,#2a2a2a);max-width:60ch;margin:0 0 22px}
.tl-ctas{display:flex;gap:14px;flex-wrap:wrap}

.tl-receive{
  background:var(--blue,#3d5aff);color:var(--bg);
  border:2px solid var(--ink);
  padding:24px 26px;
  box-shadow:6px 6px 0 var(--ink);
  transform:rotate(-1.4deg);
  display:flex;flex-direction:column;gap:14px;
}
.tl-receive-pill{
  display:inline-block;align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.12em;
  background:var(--bg);color:var(--ink);
  padding:5px 9px;
}
.tl-receive ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
.tl-receive li{display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.45;font-weight:600}
.tl-receive .r-ico{font-size:20px;line-height:1;flex:0 0 auto;width:28px;text-align:center}

/* BUILD */
.tl-build{padding:72px 0;border-bottom:2px solid var(--ink)}
.tl-build-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:8px}
@media(max-width:880px){.tl-build-grid{grid-template-columns:1fr}}
.tl-card{
  background:var(--bg);border:2px solid var(--ink);
  padding:24px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:14px;
  transition:transform .15s, box-shadow .15s;
}
.tl-card:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--ink)}
.tl-card-ico{font-size:32px;line-height:1}
.tl-card h3{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0}
.tl-card p{font-size:14.5px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.tl-card-ex{
  border-top:2px dashed var(--ink);padding-top:12px;
}
.tl-card-ex-l{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.1em;color:var(--ink);opacity:.6;
  margin-bottom:6px;
}
.tl-card-ex ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.tl-card-ex ul li{font-size:13px;line-height:1.4}
.tl-card-ex ul li::before{content:"— ";opacity:.6}
.tl-card .btn{margin-top:auto;align-self:flex-start;text-decoration:none}

/* SERVIZI */
.tl-svc{padding:72px 0;border-bottom:2px solid var(--ink);background:var(--bg-alt,#ede6d8)}
.tl-svc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:8px}
@media(max-width:720px){.tl-svc-grid{grid-template-columns:1fr}}
.tl-svc-card{
  background:var(--bg);border:2px solid var(--ink);
  padding:22px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:12px;
}
.tl-svc-ico{font-size:28px;line-height:1}
.tl-svc-card h3{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0}
.tl-svc-card p{font-size:14.5px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.tl-svc-meta{
  display:flex;gap:14px;flex-wrap:wrap;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.06em;
  border-top:2px dashed var(--ink);padding-top:10px;color:var(--ink);opacity:.85;
}
.tl-svc-card .btn{align-self:flex-start;text-decoration:none}

/* FLOW */
.tl-flow{padding:72px 0;border-bottom:2px solid var(--ink)}
.tl-flow-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:8px}
@media(max-width:880px){.tl-flow-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.tl-flow-grid{grid-template-columns:1fr}}
.tl-step{
  background:var(--bg);border:2px solid var(--ink);
  padding:22px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:10px;
}
.tl-step-num{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--ink);opacity:.55;
}
.tl-step h3{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0}
.tl-step p{font-size:14px;line-height:1.5;margin:0;color:var(--ink-soft,#2a2a2a)}
.tl-step-when{
  margin-top:auto;align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  background:var(--ink);color:var(--bg);
  padding:5px 9px;
}

/* CTA */
.tl-cta{padding:72px 0;background:var(--bg)}
.tl-cta-in{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.tl-cta-in h2{font-size:clamp(26px,3.5vw,42px);font-weight:700;letter-spacing:-.03em;margin:0;text-wrap:balance}
</style>
