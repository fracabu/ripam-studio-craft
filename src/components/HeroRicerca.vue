<script setup>
// Nuova hero: una domanda, un campo di ricerca, e tutte le strade del sito a un
// click. Sostituisce l'apertura narrativa — quella resta, ma sotto: chi arriva
// da un post social ha già deciso perché è qui, e deve arrivare al suo bando
// senza attraversare la pagina.
//
// Lo sfondo è animato in CSS puro (nessuna libreria, nessun canvas): forme
// geometriche del brand che galleggiano. Si ferma con prefers-reduced-motion.
import Ricerca from './Ricerca.vue'
import { NOME_PRODOTTO } from '../data/lezioni.js'
import { REPORT_CONCORSI } from '../data/report-concorsi.js'
import { SERIE } from '../data/lezioni.js'

// I numeri veri, presi dai dati: dicono "c'è roba" meglio di qualsiasi aggettivo.
const nConcorsi = REPORT_CONCORSI.length
const nReport = REPORT_CONCORSI.reduce((a, c) => a + c.reports.length, 0)
const nSerie = SERIE.length

const BLOCCHI = [
  { t: 'Il tuo concorso', d: `${nConcorsi} bandi · ${nReport} report di studio`, to: '/report-custom', ico: '◆' },
  { t: NOME_PRODOTTO, d: `${nSerie} serie · audio con le slide`, to: '/media', ico: '⏵' },
  { t: 'Le materie', d: 'Catalogo per materia, formato per formato', to: '/#catalogo', ico: '▤' },
  { t: 'Piano di studio', d: 'Su misura, in PDF — gratis', to: '/piano-studio', ico: '✎', free: true },
  { t: 'Anteprime', d: 'Estratti e primo episodio — gratis', to: '/newsletter', ico: '◐', free: true },
  { t: 'Quiz Pro', d: 'Quiz dagli articoli di legge — gratis', to: '/quiz-pro', ico: '✓', free: true },
]

const SECONDARI = [
  { t: 'Coaching NotebookLM', to: '/coaching' },
  { t: 'Tool su misura', to: '/tool' },
  { t: 'Chi sono', to: '/chi-sono' },
  { t: 'Scrivimi', to: '/scrivimi' },
]
</script>

<template>
  <section class="hr" aria-labelledby="hr-title">
    <!-- sfondo animato, puramente decorativo -->
    <div class="hr-bg" aria-hidden="true">
      <span class="hr-shape hr-s1"></span>
      <span class="hr-shape hr-s2"></span>
      <span class="hr-shape hr-s3"></span>
      <span class="hr-shape hr-s4"></span>
    </div>

    <div class="wrap hr-inner">
      <p class="hr-kicker">MATERIALI DI STUDIO PER CONCORSI PUBBLICI</p>
      <h1 id="hr-title" class="hr-title">
        Cosa devi <span class="hl-acid">preparare?</span>
      </h1>
      <p class="hr-lead">
        Scrivi il tuo concorso o una materia: ti porto dritto dove serve.
      </p>

      <Ricerca class="hr-search" />

      <div class="hr-grid">
        <RouterLink v-for="b in BLOCCHI" :key="b.to" :to="b.to" class="hr-card">
          <span class="hr-card-ico" aria-hidden="true">{{ b.ico }}</span>
          <span class="hr-card-t">
            {{ b.t }}
            <span v-if="b.free" class="hr-free">gratis</span>
          </span>
          <span class="hr-card-d">{{ b.d }}</span>
        </RouterLink>
      </div>

      <nav class="hr-more" aria-label="Altre pagine">
        <RouterLink v-for="s in SECONDARI" :key="s.to" :to="s.to" class="hr-more-link">{{ s.t }}</RouterLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.hr{ position:relative;overflow:hidden;padding:44px 0 56px;border-bottom:3px solid var(--ink); }
.hr-inner{ position:relative;z-index:2; }

/* ── sfondo animato ──────────────────────────────────────────────
   Quattro forme del brand che galleggiano lente. Volutamente poche e
   lentissime: dietro c'è del testo da leggere. */
.hr-bg{ position:absolute;inset:0;z-index:1;pointer-events:none; }
.hr-shape{ position:absolute;display:block;border:3px solid var(--ink);opacity:.16; }
.hr-s1{
  width:120px;height:120px;top:8%;right:6%;background:var(--acid);
  animation:hr-float 17s ease-in-out infinite;
}
.hr-s2{
  width:78px;height:78px;bottom:14%;right:22%;border-radius:50%;
  animation:hr-float 23s ease-in-out infinite reverse;
}
.hr-s3{
  width:150px;height:150px;top:22%;right:32%;background:transparent;
  transform:rotate(14deg);animation:hr-drift 29s linear infinite;
}
.hr-s4{
  width:56px;height:56px;bottom:8%;left:4%;background:var(--acid);
  animation:hr-float 19s ease-in-out infinite;
}
@keyframes hr-float{
  0%,100%{ transform:translateY(0) rotate(0deg); }
  50%    { transform:translateY(-26px) rotate(8deg); }
}
@keyframes hr-drift{
  0%  { transform:translate(0,0) rotate(14deg); }
  50% { transform:translate(-30px,18px) rotate(-6deg); }
  100%{ transform:translate(0,0) rotate(14deg); }
}
/* Chi ha chiesto meno movimento non lo riceve: le forme restano, ferme. */
@media (prefers-reduced-motion: reduce){
  .hr-shape{ animation:none !important; }
}
@media (max-width:860px){
  .hr-s3{ display:none; }
  .hr-shape{ opacity:.1; }
}

.hr-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:700;
  letter-spacing:.12em;color:var(--muted);margin:0 0 14px;
}
.hr-title{
  font-size:clamp(40px,6vw,68px);font-weight:700;letter-spacing:-.04em;
  line-height:1;margin:0 0 14px;
}
.hl-acid{
  background:var(--acid);color:var(--ink);padding:0 12px;display:inline-block;
  transform:rotate(-1deg);box-shadow:var(--shadow-sm);
}
.hr-lead{ font-size:19px;color:var(--ink-soft);margin:0 0 22px;max-width:46ch; }
.hr-search{ margin-bottom:34px; }

.hr-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
  gap:14px;margin-bottom:22px;
}
.hr-card{
  display:flex;flex-direction:column;gap:4px;
  border:3px solid var(--ink);background:#fff;padding:16px;
  box-shadow:var(--shadow-sm);text-decoration:none;color:var(--ink);
  transition:transform .14s ease, box-shadow .14s ease, background .14s ease;
}
.hr-card:hover{
  background:var(--acid);transform:translate(-2px,-2px);
  box-shadow:var(--shadow-lg,8px 8px 0 var(--ink));
}
.hr-card-ico{ font-size:21px;line-height:1;margin-bottom:2px; }
.hr-card-t{ font-size:18px;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.hr-free{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;
  background:var(--ink);color:var(--acid);padding:2px 6px;
}
.hr-card:hover .hr-free{ background:#fff;color:var(--ink); }
.hr-card-d{ font-size:15px;color:var(--ink-soft);line-height:1.45; }
.hr-card:hover .hr-card-d{ color:var(--ink); }

.hr-more{ display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center; }
.hr-more-link{
  font-size:15px;font-weight:600;color:var(--ink-soft);text-decoration:none;
  border-bottom:2px solid var(--acid);padding-bottom:1px;
}
.hr-more-link:hover{ color:var(--ink); }

@media (max-width:600px){
  .hr{ padding:28px 0 36px; }
  .hr-grid{ grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px; }
  .hr-card{ padding:13px; }
  .hr-card-t{ font-size:16px; }
  .hr-card-d{ font-size:14px; }
}
</style>
