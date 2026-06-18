<script setup>
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getLegalPage, LEGAL_HOLDER } from '../data/legale.js'

const route = useRoute()
const page = computed(() => getLegalPage(route.name))

// Mapping kicker per pagina (mostrato come pill acid sopra l'H1)
const KICKERS = {
  'privacy': 'PRIVACY · POLICY',
  'cookie-policy': 'COOKIE · POLICY',
  'termini': 'TERMINI · DI UTILIZZO'
}
const kicker = computed(() => KICKERS[route.name] || 'LEGALE')

// Splitta "1. Titolare del trattamento" → { num: '01', title: 'Titolare del trattamento' }
const splitNum = (t) => {
  const m = String(t).match(/^\s*(\d+)[.\)]?\s+(.*)$/)
  if (m) return { num: m[1].padStart(2, '0'), title: m[2] }
  return { num: '', title: t }
}

const sectionsWithNum = computed(() => {
  if (!page.value) return []
  return page.value.sections.map((s, i) => {
    const sp = splitNum(s.t)
    return {
      id: `s${i + 1}`,
      num: sp.num || String(i + 1).padStart(2, '0'),
      title: sp.title,
      body: s.p
    }
  })
})

watch(page, (p) => { if (p) document.title = `${p.title} — Ripam Studio Craft` }, { immediate: true })
</script>

<template>
  <main id="main" v-if="page" class="lh-page">
    <!-- HERO -->
    <section class="lh-hero">
      <div class="wrap lh-hero-in">
        <div>
          <span class="lh-kicker">{{ kicker }}</span>
          <h1>{{ page.title }}.</h1>
          <p class="lh-lead">{{ page.subtitle }}</p>
        </div>
        <aside class="lh-meta">
          <div><b>TITOLARE</b><span>{{ LEGAL_HOLDER.nome }}</span></div>
          <div><b>BRAND</b><span>{{ LEGAL_HOLDER.brand }}</span></div>
          <div><b>SEDE</b><span>{{ LEGAL_HOLDER.citta }} &middot; Italia</span></div>
          <div><b>P. IVA</b><span>{{ LEGAL_HOLDER.piva }}</span></div>
          <div><b>EMAIL</b><span>{{ LEGAL_HOLDER.email }}</span></div>
          <div><b>AGGIORNATO</b><span class="acid">{{ LEGAL_HOLDER.ultimoAggiornamento }}</span></div>
        </aside>
      </div>
    </section>

    <!-- TOC -->
    <section v-if="sectionsWithNum.length > 1" class="lh-toc">
      <div class="wrap lh-toc-in">
        <h3>INDICE</h3>
        <ol>
          <li v-for="s in sectionsWithNum" :key="s.id">
            <a :href="`#${s.id}`">
              <span class="nn">{{ s.num }}</span>
              <span>{{ s.title }}</span>
            </a>
          </li>
        </ol>
      </div>
    </section>

    <!-- BODY -->
    <section class="lh-body">
      <div class="lh-body-in">
        <article
          v-for="s in sectionsWithNum"
          :key="s.id"
          :id="s.id"
          class="lh-art"
        >
          <div class="nn">{{ s.num }}</div>
          <div>
            <h2>{{ s.title }}</h2>
            <p>{{ s.body }}</p>
          </div>
        </article>

        <div class="lh-contact">
          <div class="t">
            <h4>Hai una domanda su questa pagina?</h4>
            <p>Scrivimi e ti rispondo io, in chiaro.</p>
          </div>
          <a :href="`mailto:${LEGAL_HOLDER.email}`" class="cta">EMAIL &rarr;</a>
        </div>

        <div class="lh-other">
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <span>&middot;</span>
          <RouterLink to="/cookie-policy">Cookie Policy</RouterLink>
          <span>&middot;</span>
          <RouterLink to="/termini">Termini di utilizzo</RouterLink>
        </div>
      </div>
    </section>
  </main>

  <main v-else>
    <section class="lh-hero">
      <div class="wrap" style="padding:80px 24px;text-align:center">
        <h1 class="lh-404">Pagina non trovata.</h1>
        <RouterLink to="/" class="btn btn-primary">&larr; Torna alla home</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.lh-page{position:relative;z-index:1}

/* HERO */
.lh-hero{
  padding:96px 0 56px;
  border-bottom:2px solid var(--ink);
  background:var(--bg);
}
.lh-hero-in{
  display:grid;grid-template-columns:1.3fr 1fr;gap:56px;align-items:end;
}
@media(max-width:880px){.lh-hero-in{grid-template-columns:1fr;gap:28px}}

.lh-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:700;letter-spacing:.14em;
  color:var(--ink);margin-bottom:22px;
  display:inline-block;padding:5px 10px;
  background:var(--acid);border:2px solid var(--ink);
}
.lh-hero h1{
  font-size:clamp(40px,5.6vw,78px);font-weight:700;
  letter-spacing:-.035em;line-height:1.0;
  margin:0 0 18px;max-width:18ch;text-wrap:balance;
}
.lh-lead{
  font-size:19px;line-height:1.55;color:var(--muted,#6b6458);
  margin:0;max-width:52ch;
}

.lh-meta{
  border:2px solid var(--ink);padding:18px 20px;
  background:var(--bg-alt,#f6f4ef);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;line-height:1.7;
  display:flex;flex-direction:column;gap:6px;
  transform:rotate(.6deg);
  box-shadow:3px 3px 0 var(--ink);
}
.lh-meta > div{display:flex;gap:10px;justify-content:space-between;align-items:baseline;flex-wrap:wrap}
.lh-meta b{
  color:var(--ink);letter-spacing:.06em;
  text-transform:uppercase;font-size:10px;font-weight:700;
}
.lh-meta span.acid{background:var(--acid);padding:1px 6px}

/* TOC */
.lh-toc{
  padding:32px 0;
  border-bottom:2px solid var(--ink);
  background:var(--ink);color:var(--bg);
  position:relative;z-index:1;
}
.lh-toc h3{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--acid);margin:0 0 16px;
}
.lh-toc ol{
  list-style:none;margin:0;padding:0;
  display:grid;grid-template-columns:repeat(2,1fr);gap:6px 36px;
}
@media(max-width:720px){.lh-toc ol{grid-template-columns:1fr}}
.lh-toc ol li a{
  display:flex;align-items:baseline;gap:14px;
  color:var(--bg);text-decoration:none;padding:6px 0;
  font-size:15px;line-height:1.4;
  border-bottom:1px solid rgba(254,247,234,.12);
  transition:color .15s, border-color .15s;
}
.lh-toc ol li a:hover{color:var(--acid);border-bottom-color:var(--acid)}
.lh-toc ol li .nn{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;color:var(--acid);
  flex:0 0 28px;
}

/* BODY */
.lh-body{padding:72px 24px 96px;background:var(--bg);position:relative;z-index:1}
.lh-body-in{
  max-width:880px;margin:0 auto;
  display:flex;flex-direction:column;gap:48px;
}

.lh-art{
  display:grid;grid-template-columns:80px 1fr;gap:28px;
  scroll-margin-top:calc(var(--nav-h, 73px) + 24px);
}
@media(max-width:720px){.lh-art{grid-template-columns:1fr;gap:8px}}
.lh-art .nn{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.08em;
  color:var(--ink);padding-top:6px;
}
.lh-art h2{
  font-size:clamp(26px,2.8vw,34px);font-weight:700;
  letter-spacing:-.02em;line-height:1.15;
  margin:0 0 16px;text-wrap:balance;
}
.lh-art p{
  font-size:16.5px;line-height:1.7;color:var(--ink);
  margin:0 0 14px;max-width:65ch;white-space:pre-wrap;
}
.lh-art p:last-child{margin-bottom:0}
.lh-art p strong{font-weight:700}

/* CONTACT BLOCK */
.lh-contact{
  margin-top:24px;padding:28px;
  background:var(--ink);color:var(--bg);
  border:2px solid var(--ink);box-shadow:6px 6px 0 var(--ink);
  display:flex;justify-content:space-between;align-items:center;
  gap:28px;flex-wrap:wrap;
}
.lh-contact .t h4{
  margin:0 0 6px;font-size:22px;font-weight:700;letter-spacing:-.02em;
}
.lh-contact .t p{
  margin:0;font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;color:var(--bg);opacity:.7;
}
.lh-contact a.cta{
  background:var(--acid);color:var(--ink);
  padding:14px 22px;border:2px solid var(--acid);
  text-decoration:none;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;
  box-shadow:4px 4px 0 var(--bg);
  transition:transform .15s, box-shadow .15s;
}
.lh-contact a.cta:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--bg)}

/* OTHER LEGAL LINKS */
.lh-other{
  display:flex;gap:14px;flex-wrap:wrap;justify-content:center;
  padding-top:8px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;letter-spacing:.06em;color:var(--muted,#6b6458);
}
.lh-other a{color:var(--ink);text-decoration:none;border-bottom:2px solid var(--acid)}
.lh-other a:hover{background:var(--acid)}

.lh-404{font-size:clamp(36px,5vw,64px);font-weight:700;letter-spacing:-.03em;margin-bottom:24px}
</style>
