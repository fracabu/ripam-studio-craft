<script setup>
// Pagina vetrina per i REPORT DI STUDIO SU MISURA (bundle di report per un
// concorso specifico, oggi venduti solo via mail ai lead — vedi
// api/_lib/report-custom-manifest.js). Dati imbeddati qui: sono solo 2
// concorsi, non serve un file dati dedicato come materie.js.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

// ── Sfogliatore anteprima ("effetto giornale") ────────────────────────────
// Le anteprime "sfogliabili" sono set di pagine PNG in
// public/report-cover/<concorso>/<slug>/p1.png … pN.png.
// Ogni giorno la vetrina mostra un'anteprima diversa (rotazione deterministica).
const SFOGLIABILI = [
  { slug: 'pubblico-impiego', concorsoKey: 'ripam-3997-amm', titolo: 'Pubblico Impiego', pagine: 12 },
]
// Rotazione giornaliera: indice = giorno dell'anno % numero anteprime
const dayIndex = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const doy = Math.floor((now - start) / 86400000)
  return doy % SFOGLIABILI.length
}
const featured = ref(SFOGLIABILI[0])
const HERO_PAGES = computed(() => featured.value.pagine)
const pageBase = computed(() => `/report-cover/${featured.value.concorsoKey}/${featured.value.slug}`)
const pageSrc = (n) => `${pageBase.value}/p${n}.png`

// stato flipbook
const flipOpen = ref(false)
const current = ref(1)
const turning = ref('')      // '' | 'next' | 'prev'
const leafSrc = ref('')
const underSrc = ref('')
const FLIP_MS = 650

const openFlip = () => { current.value = 1; flipOpen.value = true }
const closeFlip = () => { flipOpen.value = false; turning.value = '' }

const nextPage = () => {
  if (turning.value || current.value >= HERO_PAGES.value) return
  const nxt = current.value + 1
  underSrc.value = pageSrc(nxt); leafSrc.value = pageSrc(current.value)
  turning.value = 'next'
  window.setTimeout(() => { current.value = nxt; turning.value = '' }, FLIP_MS)
}
const prevPage = () => {
  if (turning.value || current.value <= 1) return
  const prv = current.value - 1
  underSrc.value = pageSrc(current.value); leafSrc.value = pageSrc(prv)
  turning.value = 'prev'
  window.setTimeout(() => { current.value = prv; turning.value = '' }, FLIP_MS)
}

const onKey = (e) => {
  if (!flipOpen.value) return
  if (e.key === 'Escape') closeFlip()
  else if (e.key === 'ArrowRight') nextPage()
  else if (e.key === 'ArrowLeft') prevPage()
}
onMounted(() => { featured.value = SFOGLIABILI[dayIndex()]; window.addEventListener('keydown', onKey) })
onUnmounted(() => window.removeEventListener('keydown', onKey))

const CONCORSI = [
  {
    key: 'ripam-3997-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 3.997 Assistenti Amministrativi',
    tag: 'profilo AMM · 14 Amministrazioni · Funzioni Centrali',
    intro: 'Le 10 materie del programma AMM, ognuna in un report a sé — più il Dossier completo con tutte e 10 in un unico PDF.',
    reports: [
      { t: 'Diritto Amministrativo', d: 'Procedimento, provvedimento, invalidità, accesso e processo amministrativo (L. 241/1990).', fileId: '1uf8RHgTVGvw0GwutsyYQdFepBaryzOxM', img: 'diritto-amministrativo' },
      { t: 'Pubblico Impiego', d: 'Costituzione del rapporto, responsabilità, codice di comportamento, sanzioni disciplinari (D.Lgs. 165/2001).', fileId: '1ZX6VFpaSBN1RAvB3sfSwYT1etNOzV6aA', img: 'pubblico-impiego' },
      { t: 'Contratti Pubblici', d: 'Soggetti, procedure di affidamento, fasi del contratto (D.Lgs. 36/2023).', fileId: '1AGrmmFR70ay54H8FImQoUepOTGI-u8vP', img: 'contratti-pubblici' },
      { t: 'Diritto Penale', d: "I reati contro la PA: peculato, corruzione, abuso d'ufficio (artt. 314-360 c.p.).", fileId: null, img: 'diritto-penale' },
      { t: 'Diritto UE', d: "Fonti, istituzioni, principi e rapporto con l'ordinamento italiano (TUE/TFUE).", fileId: '1Vx96Pv-1rpD08Xadih8GPJA7l6WV_M4C', img: 'diritto-ue' },
      { t: 'Contabilità di Stato', d: 'Ciclo di bilancio, DEF, rendiconto, controlli (L. 196/2009, art. 81 Cost.).', fileId: '1Nr7vzOJ9LL3EhnL4tU8JMdLNgkP1hoXU', img: 'contabilita-stato' },
      { t: 'CAD', d: 'Identità digitale, domicilio digitale, firme elettroniche, PDND (D.Lgs. 82/2005).', fileId: '1coPfbJP-kA5s02vYHCR9U6nrEi4NbSLz', img: 'cad' },
      { t: 'GDPR', d: "Principi, basi giuridiche, diritti dell'interessato, adempimenti del titolare (Reg. UE 2016/679).", fileId: null, img: 'gdpr' },
      { t: 'Informatica', d: 'Hardware, software, reti e sicurezza informatica di base.', fileId: '16ouxwSREj2Ie67DY4DesbV7uMrWWFki9', img: 'informatica' },
      { t: 'Ordinamento delle Amministrazioni', d: 'Assetto delle PA centrali, organi costituzionali, D.Lgs. 300/1999.', fileId: '1aTrEAhc0QmTOO5qks0KWX1IpxyYLRF5n', img: 'ordinamento-amministrazioni' },
    ],
  },
  {
    key: 'inps-1695-pecs',
    cod: 'INPS',
    nome: 'INPS 1.695 Funzionari PECS',
    tag: 'Progettazione, Erogazione e Controllo dei Servizi',
    intro: 'Il report della preselettiva (Cultura generale), le 5 materie della Sezione A della prova scritta e la Sezione B (prova situazionale, SJT) — ognuna in un report a sé.',
    reports: [
      { t: 'Cultura generale', d: 'La preselettiva (60 quesiti): Costituzione e ordinamento dello Stato, UE e organizzazioni internazionali, storia contemporanea, geografia, scienza, letteratura e arte.', fileId: '1zkYbN0hzpU1lmI-HmZYVYm30DnRzcmLW', img: 'cultura-generale' },
      { t: 'Diritto del lavoro e della previdenza', d: 'Rapporto di lavoro subordinato, sistema previdenziale, pensioni, ammortizzatori sociali, tutela INAIL.', fileId: '1u5EUA8O0Ob8OwXW1gRRq4vVlMixTaqVk', img: 'diritto-lavoro' },
      { t: 'Legislazione sociale', d: "L'assistenza e il welfare: invalidità civile, ISEE, Assegno Unico, Assegno di Inclusione.", fileId: '1aezvJ_PXauQ9jhKsNeC8WFrYE5TuoRmC', img: 'legislazione-sociale' },
      { t: 'Organizzazione e funzionamento della PA', d: 'Pubblico impiego, ordinamento INPS, trasparenza, anticorruzione e privacy.', fileId: '1fIT5frKIzMcleRdxGHDx1fPlFXSq3tnA', img: 'organizzazione-pa' },
      { t: 'Pianificazione e controllo di gestione', d: 'Budget, scostamenti, centri di responsabilità, ROI/EVA e performance nella PA.', fileId: '1WBrDY9zVELhdIO4_9F1Fm2vwkO8qnwhq', img: 'pianificazione-controllo' },
      { t: 'Competenze informatiche', d: 'Amministrazione digitale (CAD, SPID/PEC, firme, PDND), GDPR e informatica di base.', fileId: '19GtKRXMnSGihOODuxuJCSp4pGzchcEUz', img: 'competenze-informatiche' },
      { t: 'Sezione B — Prova situazionale (SJT)', d: 'Come ragioni e ti comporti, non cosa sai: metodo, griglia decisionale e 20 scenari commentati con le trappole tipiche.', fileId: '10sumfSmjfLktX4EPcTVFN4NKSVugzHHP', img: 'sezione-b-sjt' },
    ],
  },
  {
    key: 'ripam-1340-amm',
    cod: 'RIPAM',
    nome: 'RIPAM 1.340 Funzionari — profilo AMM',
    tag: 'profilo Amministrativo · Funzioni Centrali',
    intro: 'Le 10 materie del programma del profilo Amministrativo (AMM), ognuna in un report a sé.',
    reports: [
      { t: 'Diritto Amministrativo', d: 'Atti e provvedimenti, principi, procedimento, accesso, invalidità e autotutela (L. 241/1990).', fileId: '1aqb1pSX-TVJca3IPND25cVAvlyn9teFj', img: 'diritto-amministrativo' },
      { t: 'Diritto Costituzionale', d: 'Fonti del diritto, organi costituzionali, principi sulla PA (artt. 97-98 Cost.).', fileId: '1vjevz4ncIY-FdcAWKW_WVE9NBZL-qqFv', img: 'diritto-costituzionale' },
      { t: 'Diritto Civile', d: 'Nozioni essenziali di diritto civile per la Pubblica Amministrazione.', fileId: '1JvSJyTU_0KbqyNY0tXZcPtEa40pISzQr', img: 'diritto-civile' },
      { t: 'Diritto Penale', d: 'I reati contro la PA: peculato, concussione, corruzione, rifiuto/omissione di atti (artt. 314-360 c.p.).', fileId: '1mQ2sQvOWMPMjFv-J470jH8uLUu95Wtr4', img: 'diritto-penale' },
      { t: 'Contratti Pubblici', d: 'Principi, soglie, procedure di affidamento e fasi del contratto (D.Lgs. 36/2023).', fileId: '1Wje2nMKfGutRv8W8WyDczfFpGQDHPMw_', img: 'contratti-pubblici' },
      { t: 'Contabilità Pubblica', d: 'Ciclo di bilancio, art. 81 Cost., Corte dei conti e controlli (L. 196/2009).', fileId: '1J42TtZu16rl1t95X384NKoVGTcIVrd_n', img: 'contabilita-pubblica' },
      { t: 'Pubblico Impiego', d: 'Indirizzo e gestione, reclutamento, responsabilità e disciplina (TUPI, D.Lgs. 165/2001).', fileId: '1POFnqWZHrlKPDQrCwCbAZ_1JAKSGh8Yy', img: 'pubblico-impiego' },
      { t: 'Anticorruzione e Trasparenza', d: 'Piani, RPCT, obblighi di pubblicità e whistleblowing (L. 190/2012, D.Lgs. 33/2013, PIAO).', fileId: '17R68tZzQ53Rz8a8EN19yVuU0mBQWHy0E', img: 'anticorruzione-trasparenza' },
      { t: 'CAD', d: 'Identità digitale, firme elettroniche, documento informatico (D.Lgs. 82/2005).', fileId: '12fbUw9G5Nd2UJ_im0ipyWBnz2N41_aL3', img: 'cad' },
      { t: 'GDPR e Privacy', d: "Principi (art. 5), basi giuridiche, diritti dell'interessato e data breach (Reg. UE 2016/679).", fileId: '1AvQ29xq028haZxutJobIJO5Eo8WOchIv', img: 'gdpr' },
    ],
  },
  {
    key: 'ripam-1340-com',
    cod: 'RIPAM',
    nome: 'RIPAM 1.340 Funzionari — profilo COM',
    tag: 'profilo Comunicazione · Funzioni Centrali',
    intro: 'Gli 8 report del profilo Comunicazione (COM): le materie specialistiche della comunicazione pubblica più il diritto trasversale.',
    reports: [
      { t: 'Comunicazione Pubblica', d: 'Portavoce, ufficio stampa, URP, ciclo di programmazione e teoria della comunicazione (L. 150/2000).', fileId: '1c3IwKEWItzKizn0kqZF3xV-EFHSXXCnE', img: 'comunicazione-pubblica' },
      { t: 'Comunicazione Digitale e Social', d: 'Strategie e strumenti della comunicazione digitale e dei social nella PA.', fileId: '1ennHs5aIiPS_1y-AJuG4Z3cWn201W3pS', img: 'comunicazione-digitale' },
      { t: 'URP, Ufficio Stampa e Giornalismo PA', d: 'Campagne di comunicazione, comunicazione di crisi e rapporti con i media.', fileId: '1ORCmtazfOOZ5vSWurob-2sOIfwe8Inln', img: 'urp-ufficio-stampa' },
      { t: 'Diritto Amministrativo', d: 'Atti e provvedimenti, principi, procedimento, accesso (L. 241/1990).', fileId: '1TvhTYQ0MJAAfIewJ0W6TzWnI7iAmrlNz', img: 'diritto-amministrativo' },
      { t: 'Contratti Pubblici', d: 'Principi, soglie, procedure di affidamento e fasi del contratto (D.Lgs. 36/2023).', fileId: '1whqgm0_1aau9TAQBoonWRaNYIP8RoaFB', img: 'contratti-pubblici' },
      { t: 'Anticorruzione e Trasparenza', d: 'Piani, RPCT, obblighi di pubblicità e whistleblowing (L. 190/2012, D.Lgs. 33/2013, PIAO).', fileId: '1h7HaZZog0QodzgXCUffUwsb5GmNECAQZ', img: 'anticorruzione-trasparenza' },
      { t: 'GDPR e Privacy', d: "Principi (art. 5), basi giuridiche, diritti dell'interessato e data breach (Reg. UE 2016/679).", fileId: '1wjWhW9NEmNREYsZCBjxQSliyuVz7w3pc', img: 'gdpr' },
      { t: 'CAD', d: 'Identità digitale, firme elettroniche, documento informatico (D.Lgs. 82/2005).', fileId: '1OH2xRVQbyF9j4kCmtIJ6aYUIz5UILjmI', img: 'cad' },
    ],
  },
]

// Richiesta anteprima → form /scrivimi precompilato (tipo + concorso + note).
// NIENTE link diretto Drive: la richiesta arriva via mail e l'anteprima la mando io.
const scrivimiUrl = (concorso, note) => {
  const q = new URLSearchParams({ tipo: 'materia', note })
  if (concorso.cod) q.set('concorso', concorso.cod)
  return `/scrivimi?${q.toString()}`
}
const anteprimaFormUrl = (concorso, report) =>
  scrivimiUrl(concorso, `Vorrei l'anteprima del report "${report}" (${concorso.nome}).`)
const ctaUrl = (concorso) =>
  scrivimiUrl(concorso, `Mi interessano i report custom per ${concorso.nome}.`)
// Cover: pagina 1 del PDF report renderizzata in public/report-cover/<concorso>/<img>.png
const coverUrl = (key, img) => `/report-cover/${key}/${img}.png`
</script>

<template>
  <main id="main" class="rc-page">
    <div class="wrap">
      <div class="rc-hero">
        <div class="rc-hero-text">
          <div class="rc-kicker">REPORT DI STUDIO SU MISURA</div>
          <h1 class="rc-h1">Non un manuale generico. <span class="hl-acid">Il tuo bando, materia per materia.</span></h1>
          <p class="rc-lead">
            Il report è lo strumento perfetto per il ripasso veloce e per fissare i concetti:
            poco discorsivo, tutto in schemi a due colonne, tabelle e contenuti di sintesi.
            In genere 30-50 pagine a materia, concentrate sulle domande e sui trabocchetti che
            trovi davvero all'esame. Ogni report ha un'anteprima gratuita: guardi com'è fatto
            prima di decidere.
          </p>
        </div>

        <!-- Teaser cover cliccabile → apre lo sfogliatore -->
        <div class="rc-cover">
          <button type="button" class="rc-teaser" @click="openFlip"
                  :aria-label="`Sfoglia l'anteprima del report ${featured.titolo}`">
            <img :src="pageSrc(1)" :alt="`Copertina report ${featured.titolo}`"
                 width="794" height="1123" fetchpriority="high" />
            <span class="rc-teaser-badge">Sfoglia l'anteprima &rarr;</span>
          </button>
        </div>
      </div>

      <!-- MODALE SFOGLIATORE (effetto pagina che gira) -->
      <Teleport to="body">
        <div v-if="flipOpen" class="flip-overlay" @click.self="closeFlip">
          <button type="button" class="flip-close" @click="closeFlip" aria-label="Chiudi">&times;</button>

          <button type="button" class="flip-nav flip-prev" @click="prevPage"
                  :disabled="current<=1 || !!turning" aria-label="Pagina precedente">&lsaquo;</button>

          <div class="flip-stage" :class="turning ? `is-${turning}` : ''">
            <template v-if="turning">
              <img class="flip-under" :src="underSrc" alt="" />
              <img class="flip-leaf" :src="leafSrc" alt="" />
            </template>
            <img v-else class="flip-static" :src="pageSrc(current)"
                 :alt="`${featured.titolo} — pagina ${current} di ${HERO_PAGES}`" />
          </div>

          <button type="button" class="flip-nav flip-next" @click="nextPage"
                  :disabled="current>=HERO_PAGES || !!turning" aria-label="Pagina successiva">&rsaquo;</button>

          <div class="flip-counter">{{ featured.titolo }} · {{ current }} / {{ HERO_PAGES }}</div>
        </div>
      </Teleport>

      <section v-for="c in CONCORSI" :key="c.key" class="rc-concorso">
        <div class="rc-concorso-head">
          <h2 class="rc-concorso-title">{{ c.nome }}</h2>
          <p class="rc-concorso-tag">{{ c.tag }}</p>
          <p class="rc-concorso-intro">{{ c.intro }}</p>
        </div>

        <div class="rc-grid">
          <article v-for="r in c.reports" :key="r.t" class="rc-card">
            <div class="rc-card-cover">
              <img :src="coverUrl(c.key, r.img)" :alt="`Copertina report ${r.t}`" loading="lazy" width="794" height="1123" />
            </div>
            <h3 class="rc-card-title">{{ r.t }}</h3>
            <p class="rc-card-desc">{{ r.d }}</p>
            <RouterLink v-if="r.fileId" :to="anteprimaFormUrl(c, r.t)" class="rc-card-link">
              Richiedi anteprima &rarr;
            </RouterLink>
            <span v-else class="rc-card-soon">Anteprima in arrivo</span>
          </article>
        </div>

        <RouterLink :to="ctaUrl(c)" class="btn btn-primary rc-cta">
          Richiedi i report per {{ c.nome }} &rarr;
        </RouterLink>
      </section>

      <div class="rc-footer">
        <p>Il tuo concorso non è tra questi due?</p>
        <RouterLink to="/scrivimi?tipo=materia" class="btn btn-secondary">Scrivimi e vediamo cosa si può fare &rarr;</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.rc-page{ padding:36px 0 80px; }
.rc-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:700;letter-spacing:.12em;
  color:var(--muted); margin-bottom:16px;
}
.rc-h1{
  font-size:clamp(38px,5vw,60px);font-weight:700;letter-spacing:-.035em;
  line-height:1.03;margin:0 0 22px;max-width:15ch;text-wrap:balance;
}
.hl-acid{
  background:var(--acid);color:var(--ink);
  padding:0 12px;display:inline-block;
  transform:rotate(-1deg);box-shadow:var(--shadow-sm);
}
.rc-lead{ font-size:20px;line-height:1.6;color:var(--ink-soft);max-width:52ch;margin:0; }

/* Hero due colonne: testo a sx, cover a dx */
.rc-hero{
  position:relative;
  display:grid;grid-template-columns:1fr minmax(300px,380px);gap:48px;align-items:center;
  margin-bottom:40px;
}
@media (max-width:860px){
  .rc-hero{ grid-template-columns:1fr;gap:32px; }
  .rc-cover{ justify-self:start; }
}

/* Teaser cover hero → apre lo sfogliatore */
.rc-cover{ justify-self:end;max-width:380px;width:100%; }
.rc-teaser{
  display:block;width:100%;padding:0;border:0;background:none;cursor:pointer;
  position:relative;transform:rotate(1.4deg);transition:transform .18s ease;
}
.rc-teaser:hover{ transform:rotate(1.4deg) translateY(-4px); }
.rc-teaser img{
  width:100%;height:auto;display:block;
  border:3px solid var(--ink);box-shadow:var(--shadow-lg,8px 8px 0 var(--ink));
}
.rc-teaser-badge{
  position:absolute;left:50%;bottom:16px;transform:translateX(-50%) rotate(-1.4deg);
  background:var(--acid);color:var(--ink);border:2px solid var(--ink);
  box-shadow:var(--shadow-sm);white-space:nowrap;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:700;font-size:13px;
  letter-spacing:.02em;padding:9px 16px;
}
.rc-teaser:hover .rc-teaser-badge{ background:var(--ink);color:var(--acid); }

/* ── MODALE SFOGLIATORE ─────────────────────────────────────────── */
.flip-overlay{
  position:fixed;inset:0;z-index:1000;
  background:rgba(10,10,10,.86);
  display:flex;align-items:center;justify-content:center;gap:clamp(8px,3vw,40px);
  padding:24px;
}
.flip-stage{
  position:relative;
  height:min(86vh,900px);aspect-ratio:794/1123;
  perspective:2200px;
}
.flip-stage img{
  position:absolute;inset:0;width:100%;height:100%;
  border:2px solid #0a0a0a;background:#fff;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
}
.flip-under{ z-index:1; }
.flip-leaf{ z-index:2;transform-origin:left center;backface-visibility:hidden; }
.flip-stage.is-next .flip-leaf{ animation:turnNext .65s cubic-bezier(.4,0,.2,1) forwards; }
.flip-stage.is-prev .flip-leaf{ animation:turnPrev .65s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes turnNext{ from{ transform:rotateY(0deg);   box-shadow:0 20px 60px rgba(0,0,0,.5); }
                     to{   transform:rotateY(-168deg); box-shadow:0 8px 30px rgba(0,0,0,.35); } }
@keyframes turnPrev{ from{ transform:rotateY(-168deg); box-shadow:0 8px 30px rgba(0,0,0,.35); }
                     to{   transform:rotateY(0deg);    box-shadow:0 20px 60px rgba(0,0,0,.5); } }

.flip-nav{
  flex:0 0 auto;width:56px;height:56px;border-radius:50%;
  border:2px solid var(--acid);background:transparent;color:var(--acid);
  font-size:30px;line-height:1;cursor:pointer;transition:background .15s,color .15s;
}
.flip-nav:hover:not(:disabled){ background:var(--acid);color:var(--ink); }
.flip-nav:disabled{ opacity:.3;cursor:default; }
.flip-close{
  position:absolute;top:18px;right:22px;width:44px;height:44px;
  border:2px solid #fff;background:transparent;color:#fff;border-radius:50%;
  font-size:24px;line-height:1;cursor:pointer;
}
.flip-close:hover{ background:#fff;color:#0a0a0a; }
.flip-counter{
  position:absolute;left:50%;bottom:18px;transform:translateX(-50%);
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;font-weight:700;
  letter-spacing:.06em;color:#fff;opacity:.85;
}
@media (max-width:640px){
  .flip-nav{ width:44px;height:44px;font-size:24px; }
  .flip-stage{ height:min(74vh,700px); }
}
@media (prefers-reduced-motion:reduce){
  .flip-stage.is-next .flip-leaf,.flip-stage.is-prev .flip-leaf{ animation-duration:.01s; }
}

.rc-concorso{ padding:40px 0; border-top:2px solid var(--ink); }
.rc-concorso:first-of-type{ border-top:none; }
.rc-concorso-title{ font-size:clamp(22px,3vw,30px);font-weight:700;letter-spacing:-.02em;margin:0 0 6px; }
.rc-concorso-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:600;
  letter-spacing:.04em;color:var(--ink);margin:0 0 12px;
  border-left:3px solid var(--acid);padding-left:12px;
}
.rc-concorso-intro{ font-size:17px;line-height:1.5;color:var(--ink-soft);max-width:64ch;margin:0 0 30px; }

.rc-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
  gap:18px;margin-bottom:30px;
}
.rc-card{
  border:2px solid var(--ink);background:var(--bg);
  box-shadow:var(--shadow-sm);padding:16px;
  display:flex;flex-direction:column;gap:8px;
}
.rc-card-cover{
  margin:-16px -16px 4px;border-bottom:2px solid var(--ink);
  background:var(--bg-soft,#f0efe9);overflow:hidden;
}
.rc-card-cover img{
  width:100%;height:auto;display:block;
  /* mostra la fascia alta della cover (logo + titolone), taglia il fondo */
  aspect-ratio:1 / 1;object-fit:cover;object-position:top center;
}
.rc-card-title{ font-size:17px;font-weight:700;margin:0;letter-spacing:-.01em; }
.rc-card-desc{ font-size:14px;line-height:1.45;color:var(--ink-soft);margin:0;flex:1; }
.rc-card-link{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;font-weight:700;
  color:var(--blue);text-decoration:none;
}
.rc-card-link:hover{ text-decoration:underline; }
.rc-card-soon{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;font-weight:600;
  letter-spacing:.04em;color:var(--muted);
}

.rc-cta{ display:inline-block;margin-top:8px; }

.rc-footer{
  padding-top:40px;border-top:2px solid var(--ink);
  display:flex;flex-direction:column;gap:14px;align-items:flex-start;
}
.rc-footer p{ font-size:16px;color:var(--ink-soft);margin:0; }
</style>
