<script setup>
import { RouterLink } from 'vue-router'
import { LEGAL_HOLDER } from '../data/legale.js'

const tags = ['FULL-STACK DEV', 'AI BUILDER', 'CONCORSI P.A.']

const stats = [
  { n: '~100K', l: 'utenti unici' },
  { n: '800K+', l: 'visite alle pagine' },
  { n: '3 mesi', l: 'di vita finora' }
]
</script>

<template>
  <main id="main" class="about-page">
    <!-- HERO -->
    <section class="ab-hero">
      <div class="wrap ab-hero-grid">
        <div>
          <div class="ab-kicker">CHI SONO</div>
          <h1 class="ab-h1">
            Mi conoscono per <span class="hl-acid">Ripam Studio</span>.
            Qui faccio l'altra cosa: lavori su misura.
          </h1>
          <p class="ab-sub">
            Sono {{ LEGAL_HOLDER.nome }}. Ho costruito Ripam Studio, un'app gratuita per
            chi prepara concorsi pubblici. In tre mesi ha portato circa 100.000 utenti
            e oltre 800.000 visite alle pagine — e parecchie persone hanno cominciato
            a chiedermi materiali e tool fatti su misura. Da lì è nato Ripam Studio Craft.
          </p>
          <div class="ab-ctas">
            <RouterLink to="/scrivimi" class="btn btn-primary">Scrivimi &rarr;</RouterLink>
            <a href="/#pilastri" class="btn btn-secondary">Cosa faccio qui &rarr;</a>
          </div>
        </div>
        <aside class="ab-card">
          <div class="ab-avatar" aria-hidden="true">RC</div>
          <div class="ab-card-name">{{ LEGAL_HOLDER.nome }}</div>
          <div class="ab-card-where">{{ LEGAL_HOLDER.citta }} &middot; Italia</div>
          <ul class="ab-tags">
            <li v-for="t in tags" :key="t">{{ t }}</li>
          </ul>
        </aside>
      </div>
    </section>

    <!-- STATS Ripam Studio -->
    <section class="ab-stats">
      <div class="wrap">
        <div class="ab-stats-kicker">RIPAM STUDIO &middot; APP GRATUITA, NO-PROFIT</div>
        <div class="ab-stats-grid">
          <div v-for="s in stats" :key="s.l" class="ab-stat">
            <div class="ab-stat-num">{{ s.n }}</div>
            <div class="ab-stat-l">{{ s.l }}</div>
          </div>
        </div>
        <p class="ab-stats-note">
          Ripam Studio resta gratuita, no-profit, separata da Studio Craft.
          Sono due cose distinte: l'app la mantengo per chi non può permettersi materiali a pagamento;
          qui invece costruisco lavori su misura per chi me li chiede.
        </p>
      </div>
    </section>

    <!-- STORY -->
    <section class="ab-story">
      <div class="wrap ab-story-grid">
        <div>
          <div class="ab-kicker">PERCHÉ ESISTE STUDIO CRAFT</div>
          <h2 class="ab-h2">Da uno strumento gratuito a lavori su misura.</h2>
        </div>
        <div class="ab-story-body">
          <p>
            Non sono uno studioso dei concorsi pubblici e non ho mai voluto fingere di esserlo.
            Sono un developer e un appassionato di AI. La prima cosa che ho costruito è stata
            un'app per simulare le prove: ho preso le banche dati ufficiali pubbliche e ci ho
            aggiunto distrattori per trasformarle in quiz davvero usabili. Funzionava, e in
            poco tempo è diventata uno strumento di riferimento per parecchie persone.
          </p>
          <p>
            Da lì le richieste si sono spostate: <strong>"puoi farmi materiali su misura
            sulla mia materia? Un podcast, un manuale, un simulatore mio?"</strong>.
            Oggi produco io stesso le domande, scrivo i contenuti, scelgo formati e taglio
            come serve a chi mi scrive — usando AI dove ha senso e revisionando tutto a mano.
          </p>
          <p class="ab-pull">
            Studio Craft è questo: un laboratorio artigiano. Un lavoro alla volta,
            costruito con te, su quello che ti serve davvero.
          </p>
        </div>
      </div>
    </section>

    <!-- TWO COMPETENZE -->
    <section class="ab-skills">
      <div class="wrap">
        <div class="ab-kicker">PERCHÉ FUNZIONA</div>
        <h2 class="ab-h2">Due cose rare insieme.</h2>
        <div class="ab-skills-grid">
          <div class="ab-skill ab-skill-blue">
            <div class="ab-skill-pill">SVILUPPO</div>
            <h3>Full-stack web</h3>
            <p>Vue, Node, database, deploy. Costruisco web app, simulatori custom e
            tool didattici on-demand. Niente template, niente boilerplate noioso.</p>
          </div>
          <div class="ab-skill ab-skill-acid">
            <div class="ab-skill-pill">AI APPLICATA</div>
            <h3>NotebookLM &middot; RAG &middot; prompt</h3>
            <p>So come far ragionare un modello su un corpus di norme, come costruire
            podcast a due voci, e come iterare i prompt fino al risultato che serve.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="ab-cta">
      <div class="wrap ab-cta-in">
        <h2>Hai un concorso in vista? Raccontamelo.</h2>
        <RouterLink to="/scrivimi" class="btn btn-primary">Scrivimi &rarr;</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page{padding-bottom:60px}

.ab-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:14px;
}

/* HERO */
.ab-hero{
  padding:72px 0 60px;
  border-bottom:2px solid var(--ink);
  background:var(--bg);
  position:relative;z-index:1;
}
.ab-hero-grid{
  display:grid;grid-template-columns:1.4fr 1fr;gap:50px;align-items:center;
}
@media(max-width:880px){.ab-hero-grid{grid-template-columns:1fr;gap:32px}}
.ab-h1{
  font-size:clamp(34px,4.8vw,58px);font-weight:700;letter-spacing:-.035em;
  line-height:1.02;margin:0 0 18px;text-wrap:balance;
}
.hl-acid{
  background:var(--acid);color:var(--ink);
  padding:0 .15em;box-decoration-break:clone;
}
.ab-sub{
  font-size:17px;line-height:1.55;color:var(--ink-soft,#2a2a2a);
  max-width:60ch;margin:0 0 22px;
}
.ab-ctas{display:flex;gap:14px;flex-wrap:wrap}

.ab-card{
  border:2px solid var(--ink);background:var(--bg);
  padding:24px;box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:14px;align-items:flex-start;
  transform:rotate(1deg);
}
.ab-avatar{
  width:84px;height:84px;background:var(--acid);
  border:2px solid var(--ink);display:grid;place-items:center;
  font-weight:700;font-size:32px;letter-spacing:-.04em;
  background-image:repeating-linear-gradient(45deg, var(--acid) 0 6px, var(--ink) 6px 7px);
  color:var(--ink);
}
.ab-card-name{font-size:20px;font-weight:700;letter-spacing:-.02em}
.ab-card-where{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.06em;color:var(--ink);opacity:.7;
}
.ab-tags{
  list-style:none;padding:0;margin:6px 0 0;
  display:flex;flex-wrap:wrap;gap:6px;
}
.ab-tags li{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:4px 8px;border:2px solid var(--ink);
}

/* STATS */
.ab-stats{
  background:var(--ink);color:var(--bg);
  padding:60px 0;
  border-bottom:2px solid var(--ink);
  position:relative;z-index:1;
}
.ab-stats-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--acid);margin-bottom:28px;
}
.ab-stats-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:24px;
  border-top:2px solid var(--bg);border-bottom:2px solid var(--bg);
  padding:36px 0;
}
@media(max-width:720px){.ab-stats-grid{grid-template-columns:1fr;gap:18px}}
.ab-stat-num{
  font-size:clamp(48px,7vw,96px);font-weight:700;
  letter-spacing:-.04em;line-height:.95;
  color:var(--acid);
}
.ab-stat-l{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  margin-top:8px;color:var(--bg);opacity:.75;
}
.ab-stats-note{
  margin-top:24px;max-width:62ch;
  font-size:14px;line-height:1.6;opacity:.8;
}

/* STORY */
.ab-story{padding:72px 0 60px;border-bottom:2px solid var(--ink);position:relative;z-index:1}
.ab-story-grid{display:grid;grid-template-columns:1fr 1.4fr;gap:50px;align-items:start}
@media(max-width:880px){.ab-story-grid{grid-template-columns:1fr;gap:24px}}
.ab-h2{
  font-size:clamp(28px,3.8vw,46px);font-weight:700;letter-spacing:-.03em;
  line-height:1.05;margin:0 0 24px;text-wrap:balance;
}
.ab-story-body p{font-size:16px;line-height:1.7;margin:0 0 18px;color:var(--ink-soft,#2a2a2a)}
.ab-pull{
  background:var(--acid);color:var(--ink);
  padding:18px 20px;border:2px solid var(--ink);
  font-weight:700;font-size:18px;line-height:1.35;
  letter-spacing:-.01em;
}

/* SKILLS */
.ab-skills{padding:72px 0;border-bottom:2px solid var(--ink);position:relative;z-index:1}
.ab-skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px}
@media(max-width:720px){.ab-skills-grid{grid-template-columns:1fr}}
.ab-skill{
  border:2px solid var(--ink);padding:26px;
  box-shadow:6px 6px 0 var(--ink);background:var(--bg);
}
.ab-skill h3{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:14px 0 10px}
.ab-skill p{font-size:15px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.ab-skill-pill{
  display:inline-block;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.1em;
  padding:5px 9px;border:2px solid var(--ink);
}
.ab-skill-blue .ab-skill-pill{background:var(--blue);color:var(--bg)}
.ab-skill-acid .ab-skill-pill{background:var(--acid);color:var(--ink)}

/* CTA */
.ab-cta{padding:80px 0;background:var(--bg-alt,#ede6d8);position:relative;z-index:1}
.ab-cta-in{display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.ab-cta-in h2{font-size:clamp(26px,3.5vw,42px);font-weight:700;letter-spacing:-.03em;margin:0;text-wrap:balance}
</style>
