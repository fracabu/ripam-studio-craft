<script setup>
// Pagina vetrina per i REPORT DI STUDIO SU MISURA (bundle di report per un
// concorso specifico, oggi venduti solo via mail ai lead — vedi
// api/_lib/report-custom-manifest.js). Dati in src/data/report-concorsi.js.
//
// Due modalità, stesso componente:
//  - /report-custom            → indice: tutti i concorsi + chip "cerca per concorso"
//  - /report-custom/:concorso  → pagina dedicata a un solo bando (link da mandare
//                                a un lead: vede solo i report che lo riguardano)
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { REPORT_CONCORSI, SFOGLIABILI, getConcorso, hasAnteprima } from '../data/report-concorsi.js'

const props = defineProps({ concorso: { type: String, default: '' } })
const router = useRouter()

// Concorso singolo (rotta dedicata) o null (indice). Slug sconosciuto → indice.
const single = computed(() => (props.concorso ? getConcorso(props.concorso) : null))
const lista = computed(() => (single.value ? [single.value] : REPORT_CONCORSI))
watch(
  () => props.concorso,
  (k) => { if (k && !getConcorso(k)) router.replace('/report-custom') },
  { immediate: true }
)
// Titolo del tab: la pagina dedicata è pensata per essere linkata a mano.
watch(single, (c) => {
  document.title = c
    ? `Report di studio · ${c.nome} — Ripam Studio Craft`
    : 'Report di studio su misura — Ripam Studio Craft'
}, { immediate: true })

// ── Sfogliatore anteprima ("effetto giornale") ────────────────────────────
// Le anteprime "sfogliabili" sono set di pagine PNG in
// public/report-cover/<concorso>/<slug>/p1.png … pN.png. Nell'indice si mostra
// quella del concorso di punta; nella pagina dedicata quella del suo concorso,
// se esiste (altrimenti l'hero usa la cover del primo report, non sfogliabile).
const heroKey = computed(() => (single.value ? single.value.key : 'ripam-3997-amm'))
const featured = computed(() => SFOGLIABILI[heroKey.value] || null)
const HERO_PAGES = computed(() => featured.value?.pagine || 0)
const pageBase = computed(() => `/report-cover/${heroKey.value}/${featured.value?.slug}`)
const pageSrc = (n) => `${pageBase.value}/p${n}.png`
// Fallback quando il concorso non ha un'anteprima sfogliabile: cover del primo report.
const heroCover = computed(() => {
  const c = single.value
  return c ? `/report-cover/${c.key}/${c.reports[0].img}.png` : ''
})

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
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

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
// Un click solo per chi le vuole tutte: chi ne vuole una sola usa il link sulla card.
const nAnteprime = (concorso) => concorso.reports.filter(hasAnteprima).length
const tutteAnteprimeUrl = (concorso) =>
  scrivimiUrl(
    concorso,
    `Vorrei ricevere TUTTE le anteprime dei report di ${concorso.nome} ` +
    `(${nAnteprime(concorso)} materie, estratti gratuiti).`
  )
// Cover: pagina 1 del PDF report renderizzata in public/report-cover/<concorso>/<img>.png
const coverUrl = (key, img) => `/report-cover/${key}/${img}.png`
</script>

<template>
  <main id="main" class="rc-page">
    <div class="wrap">
      <!-- Pagina dedicata: si torna sempre all'indice -->
      <RouterLink v-if="single" to="/report-custom" class="rc-back">
        &larr; Tutti i report di studio
      </RouterLink>

      <div class="rc-hero">
        <div class="rc-hero-text">
          <div class="rc-kicker">REPORT DI STUDIO SU MISURA</div>
          <h1 v-if="single" class="rc-h1 rc-h1-single">
            <span class="hl-acid">{{ single.nome }}</span>
          </h1>
          <h1 v-else class="rc-h1">Non un manuale generico. <span class="hl-acid">Il tuo bando, materia per materia.</span></h1>
          <p v-if="single" class="rc-hero-tag">{{ single.tag }}</p>
          <p class="rc-lead">
            <template v-if="single">{{ single.intro }}</template>
            <template v-else>
              Il report è lo strumento perfetto per il ripasso veloce e per fissare i concetti:
              poco discorsivo, tutto in schemi a due colonne, tabelle e contenuti di sintesi.
              In genere 30-50 pagine a materia, concentrate sulle domande e sui trabocchetti che
              trovi davvero all'esame. Ogni report ha un'anteprima gratuita: guardi com'è fatto
              prima di decidere.
            </template>
          </p>
          <p v-if="single" class="rc-lead rc-lead-sub">
            Poco discorsivo, tutto in schemi a due colonne, tabelle e sintesi: 30-50 pagine a
            materia, concentrate sulle domande e sui trabocchetti che trovi davvero all'esame.
          </p>
        </div>

        <!-- Teaser cover: cliccabile se il concorso ha un'anteprima sfogliabile -->
        <div class="rc-cover">
          <button v-if="featured" type="button" class="rc-teaser" @click="openFlip"
                  :aria-label="`Sfoglia l'anteprima del report ${featured.titolo}`">
            <img :src="pageSrc(1)" :alt="`Copertina report ${featured.titolo}`"
                 width="794" height="1123" fetchpriority="high" />
            <span class="rc-teaser-badge">Sfoglia l'anteprima &rarr;</span>
          </button>
          <div v-else-if="single" class="rc-teaser rc-teaser-static">
            <img :src="heroCover" :alt="`Copertina report ${single.reports[0].t}`"
                 width="794" height="1123" fetchpriority="high" />
          </div>
        </div>
      </div>

      <!-- Cerca per concorso: nell'indice porta alla pagina dedicata,
           nella pagina dedicata fa da navigazione tra i bandi. -->
      <nav class="rc-chips" aria-label="Report per concorso">
        <span class="rc-chips-label">{{ single ? 'Altri concorsi' : 'Cerca per concorso' }}</span>
        <RouterLink v-for="c in REPORT_CONCORSI" :key="c.key"
                    :to="`/report-custom/${c.key}`" class="rc-chip"
                    :class="{ 'is-active': single && single.key === c.key }">
          {{ c.nome }} <span class="rc-chip-n">{{ c.reports.length }}</span>
        </RouterLink>
      </nav>

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

      <section v-for="c in lista" :key="c.key" class="rc-concorso">
        <!-- Nella pagina dedicata nome/tag/intro sono già nell'hero -->
        <div v-if="!single" class="rc-concorso-head">
          <h2 class="rc-concorso-title">
            <RouterLink :to="`/report-custom/${c.key}`" class="rc-concorso-link">{{ c.nome }}</RouterLink>
          </h2>
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
            <RouterLink v-if="hasAnteprima(r)" :to="anteprimaFormUrl(c, r.t)" class="rc-card-link">
              Richiedi anteprima &rarr;
            </RouterLink>
            <span v-else class="rc-card-soon">Anteprima in arrivo</span>
          </article>
        </div>

        <div v-if="nAnteprime(c)" class="rc-allbox">
          <div class="rc-allbox-text">
            <p class="rc-allbox-title">Le vuoi tutte insieme?</p>
            <p class="rc-allbox-desc">
              Un solo messaggio e ti mando gli estratti di tutte e {{ nAnteprime(c) }} le materie
              di {{ c.nome }}. Sono gratis: le prime pagine vere di ogni report, non le copertine.
            </p>
          </div>
          <RouterLink :to="tutteAnteprimeUrl(c)" class="btn rc-allbox-cta">
            Ricevi tutte le {{ nAnteprime(c) }} anteprime &rarr;
          </RouterLink>
        </div>

        <div class="rc-actions">
          <RouterLink :to="ctaUrl(c)" class="btn btn-secondary rc-cta">
            Richiedi i report per {{ c.nome }} &rarr;
          </RouterLink>
          <RouterLink v-if="!single" :to="`/report-custom/${c.key}`" class="rc-page-link">
            Pagina dedicata a questo concorso &rarr;
          </RouterLink>
        </div>
      </section>

      <div class="rc-footer">
        <p>Il tuo concorso non è tra questi?</p>
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
.rc-actions{ display:flex;flex-wrap:wrap;align-items:center;gap:18px; }

/* "Le vuoi tutte insieme?" — un click per l'intero set di anteprime del bando */
.rc-allbox{
  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;
  border:3px solid var(--ink);background:var(--acid);
  padding:20px 22px;margin:26px 0 18px;box-shadow:var(--shadow);
}
.rc-allbox-text{ flex:1 1 340px;min-width:0; }
.rc-allbox-title{
  font-size:20px;font-weight:700;letter-spacing:-.02em;color:var(--ink);margin:0 0 6px;
}
.rc-allbox-desc{ font-size:15px;line-height:1.5;color:var(--ink);margin:0;max-width:62ch; }
/* Dentro il box acid il primario sparirebbe: qui il pieno è nero */
.rc-allbox-cta{
  flex:0 0 auto;margin-top:0;text-decoration:none;
  background:var(--ink);color:var(--acid);box-shadow:var(--shadow);
}
.rc-allbox-cta:hover{
  background:var(--bg);color:var(--ink);
  transform:translate(-3px,-3px);box-shadow:var(--shadow-lg);
}
@media (max-width:640px){
  .rc-allbox{ padding:18px; }
  .rc-allbox-cta{ width:100%;text-align:center; }
}
.rc-page-link,.rc-back{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;font-weight:700;
  color:var(--blue);text-decoration:none;
}
.rc-page-link:hover,.rc-back:hover{ text-decoration:underline; }
.rc-back{ display:inline-block;margin-bottom:20px; }
.rc-concorso-link{ color:inherit;text-decoration:none; }
.rc-concorso-link:hover{ text-decoration:underline;text-decoration-color:var(--acid);text-decoration-thickness:3px; }

/* Hero della pagina dedicata */
.rc-h1-single{ font-size:clamp(30px,4vw,46px);max-width:20ch; }
.rc-h1-single .hl-acid{ padding:2px 12px; }
.rc-hero-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:600;
  letter-spacing:.04em;color:var(--ink);margin:0 0 18px;
  border-left:3px solid var(--acid);padding-left:12px;
}
.rc-lead-sub{ font-size:17px;margin-top:14px; }
.rc-teaser-static{ cursor:default; }

/* Chip "cerca per concorso" */
.rc-chips{
  display:flex;flex-wrap:wrap;align-items:center;gap:10px;
  padding:18px 0 26px;border-top:2px solid var(--ink);
}
.rc-chips-label{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-right:4px;
}
.rc-chip{
  display:inline-flex;align-items:center;gap:8px;
  border:2px solid var(--ink);background:var(--bg);color:var(--ink);
  font-size:13px;font-weight:600;line-height:1;padding:9px 12px;text-decoration:none;
  box-shadow:var(--shadow-sm);transition:transform .12s ease,background .12s ease;
}
.rc-chip:hover{ transform:translateY(-2px);background:var(--acid); }
.rc-chip.is-active{ background:var(--ink);color:var(--bg);box-shadow:none; }
.rc-chip-n{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;font-weight:700;
  background:var(--acid);color:var(--ink);border:1px solid var(--ink);padding:2px 6px;
}
.rc-chip.is-active .rc-chip-n{ border-color:var(--bg); }

.rc-footer{
  padding-top:40px;border-top:2px solid var(--ink);
  display:flex;flex-direction:column;gap:14px;align-items:flex-start;
}
.rc-footer p{ font-size:16px;color:var(--ink-soft);margin:0; }
</style>
