<script setup>
// Vetrina delle LEZIONI DA ASCOLTARE (audio con slide). Stesso schema di
// ReportCustom.vue — due modalità, un componente:
//   /media            → indice: tutti i concorsi + chip "cerca per concorso"
//   /media/:concorso  → pagina dedicata a un bando (link da mandare a un lead)
// (/lezioni resta come redirect: la rotta si chiamava così fino al 29/08/2026)
//
// Il prodotto era il peggio esposto del sito: materie.js dichiarava `vid: soon`
// su serie finite da mesi. Qui i dati vengono da src/data/lezioni.js, che
// rispecchia i file veri con le durate misurate.
import { computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  NOME_PRODOTTO, SOTTOTITOLO_PRODOTTO, LEZIONI_CONCORSI, SERIE,
  getConcorsoLezioni, serieDi, durata, totaleOre, totaleEp,
} from '../data/lezioni.js'

const props = defineProps({ concorso: { type: String, default: '' } })
const router = useRouter()

const single = computed(() => (props.concorso ? getConcorsoLezioni(props.concorso) : null))
const lista = computed(() => (single.value ? [single.value] : LEZIONI_CONCORSI))
watch(
  () => props.concorso,
  (k) => { if (k && !getConcorsoLezioni(k)) router.replace('/media') },
  { immediate: true }
)
watch(single, (c) => {
  document.title = c
    ? `${NOME_PRODOTTO} · ${c.nome} — Ripam Studio Craft`
    : `${NOME_PRODOTTO} — Ripam Studio Craft`
}, { immediate: true })

// Numeri di testata: sull'indice il catalogo intero, sulla pagina di un bando
// SOLO quel bando — altrimenti la barra promette 12 serie a chi ne vedrà 7.
const setCorrente = computed(() => (single.value ? serieDi(single.value) : SERIE))
const nSerie = computed(() => setCorrente.value.length)
const oreTotali = computed(() => totaleOre(setCorrente.value))
const nEpisodi = computed(() => totaleEp(setCorrente.value))

// ⚠️ NIENTE link diretto a Drive, nemmeno per le anteprime già pubbliche: chi
// scarica in silenzio non lascia un contatto, e il primo episodio è il pezzo che
// fa decidere. Stessa regola della vetrina report — la richiesta passa dal form,
// l'episodio lo mandiamo noi. Il campo `anteprima` in lezioni.js resta perché
// dice quali EP1 sono già pronti da spedire.
//
// Il form accetta solo tipo/concorso/note (vedi Scrivimi.vue): quale materia si
// vuole si dice DENTRO le note, come fa la vetrina dei report. Un parametro
// inventato verrebbe scartato in silenzio, e la richiesta arriverebbe muta.
const scrivimiUrl = (c, note) => {
  const q = new URLSearchParams({ tipo: 'materia', note })
  if (c?.cod) q.set('concorso', c.cod)
  return `/scrivimi?${q.toString()}`
}
const chiediUrl = (s, c) =>
  scrivimiUrl(c, `Vorrei il primo episodio delle lezioni di "${s.materia}" (${c.nome}).`)
const ctaUrl = (c) => scrivimiUrl(c, `Mi interessano le lezioni da ascoltare per ${c.nome}.`)
</script>

<template>
  <main id="main" class="lz-page">
    <div class="wrap">

      <RouterLink v-if="single" to="/media" class="lz-back">&larr; Tutti i concorsi</RouterLink>

      <header class="lz-hero">
        <div class="lz-kicker">{{ NOME_PRODOTTO.toUpperCase() }} · {{ SOTTOTITOLO_PRODOTTO }}</div>
        <h1 v-if="single" class="lz-h1"><span class="hl-acid">{{ single.nome }}</span></h1>
        <h1 v-else class="lz-h1">Studi anche quando <span class="hl-acid">non puoi leggere.</span></h1>
        <p v-if="single" class="lz-hero-tag">{{ single.tag }}</p>
        <p class="lz-lead">
          Una voce che spiega la materia dall'inizio alla fine, con le slide che scorrono a fianco.
          In auto ascolti e basta — <strong>il parlato si regge da solo</strong>; davanti allo schermo
          vedi anche schemi e riferimenti normativi. Non è il report letto ad alta voce: è un percorso a sé,
          e l'ultimo episodio è sempre trabocchetti più simulazione.
        </p>
        <p class="lz-stat">
          <strong>{{ nSerie }} serie{{ single ? ' per questo bando' : ' complete' }}</strong> ·
          {{ nEpisodi }} episodi · {{ oreTotali }} di lezioni · episodi da 30-45 minuti,
          la lunghezza di un tragitto
        </p>
      </header>

      <nav class="lz-chips" aria-label="Lezioni per concorso">
        <span class="lz-chips-label">{{ single ? 'Altri concorsi' : 'Cerca per concorso' }}</span>
        <RouterLink v-for="c in LEZIONI_CONCORSI" :key="c.key" :to="`/media/${c.key}`"
                    class="lz-chip" :class="{ 'is-active': single && single.key === c.key }">
          {{ c.nome }} <span class="lz-chip-n">{{ c.serie.length }}</span>
        </RouterLink>
      </nav>

      <section v-for="c in lista" :key="c.key" class="lz-concorso">
        <div v-if="!single" class="lz-concorso-head">
          <h2 class="lz-concorso-title">
            <RouterLink :to="`/media/${c.key}`" class="lz-concorso-link">{{ c.nome }}</RouterLink>
          </h2>
          <p class="lz-concorso-tag">{{ c.tag }}</p>
        </div>
        <p class="lz-concorso-intro">{{ c.intro }}</p>
        <p class="lz-concorso-stat">
          {{ serieDi(c).length }} serie · {{ totaleEp(serieDi(c)) }} episodi · {{ totaleOre(serieDi(c)) }} in tutto
        </p>

        <div class="lz-grid">
          <article v-for="s in serieDi(c)" :key="s.slug" class="lz-card">
            <div class="lz-card-top">
              <span class="lz-card-ep">{{ s.ep }} episodi</span>
              <span class="lz-card-dur">{{ durata(s.min) }}</span>
            </div>
            <h3 class="lz-card-title">{{ s.materia }}</h3>
            <p class="lz-card-desc">{{ s.d }}</p>
            <p class="lz-card-meta">
              Episodio 1 — «{{ s.ep1 }}» · circa {{ s.epMin }} min
              <span v-if="s.incompleta" class="lz-card-warn">⚠ {{ s.incompleta }}</span>
            </p>
            <RouterLink :to="chiediUrl(s, c)" class="lz-card-link">
              Ricevi il primo episodio &rarr;
            </RouterLink>
          </article>
        </div>

        <div class="lz-actions">
          <RouterLink :to="ctaUrl(c)" class="btn btn-secondary">
            Scrivimi per le lezioni di {{ c.nome }} &rarr;
          </RouterLink>
          <RouterLink v-if="!single" :to="`/media/${c.key}`" class="lz-page-link">
            Pagina dedicata a questo concorso &rarr;
          </RouterLink>
        </div>
      </section>

      <aside class="lz-how">
        <h2 class="lz-how-title">Come si usano</h2>
        <ul class="lz-how-list">
          <li><strong>Scaricale da computer, con il wifi.</strong> Ogni episodio pesa fra i 50 e i 100 MB:
            in mobilità ti fermi a metà. Poi le passi sul telefono e le hai anche senza rete.</li>
          <li><strong>In auto ascolta e basta.</strong> Sono costruite per reggere senza guardare lo schermo:
            se il lettore si spegne a schermo bloccato, aprile con VLC.</li>
          <li><strong>L'ultimo episodio tienilo per ultimo davvero.</strong> È trabocchetti e simulazione
            commentata: serve a dirti cosa hai fissato e cosa no, non a insegnarti la materia.</li>
          <li><strong>Sono file tuoi.</strong> Li scarichi e restano tuoi: nessun accesso da rinnovare,
            nessuna piattaforma che chiude.</li>
        </ul>
      </aside>

      <div class="lz-footer">
        <p>La tua materia non è tra queste?</p>
        <RouterLink to="/scrivimi?tipo=materia" class="btn btn-secondary">Scrivimi e vediamo cosa si può fare &rarr;</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
.lz-page{ padding:36px 0 80px; }
.lz-back{
  display:inline-block;margin-bottom:20px;font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:14px;font-weight:700;color:var(--ink-soft);text-decoration:none;
}
.lz-back:hover{ color:var(--ink); }

.lz-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:700;letter-spacing:.12em;
  color:var(--muted);margin-bottom:16px;
}
.lz-hero{ margin-bottom:40px; }
.lz-h1{
  font-size:clamp(38px,5vw,60px);font-weight:700;letter-spacing:-.035em;
  line-height:1.03;margin:0 0 22px;max-width:16ch;text-wrap:balance;
}
.hl-acid{
  background:var(--acid);color:var(--ink);padding:0 12px;display:inline-block;
  transform:rotate(-1deg);box-shadow:var(--shadow-sm);
}
.lz-hero-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;
  color:var(--muted);margin:0 0 14px;
}
.lz-lead{ font-size:20px;line-height:1.65;color:var(--ink-soft);max-width:58ch;margin:0 0 18px; }
.lz-stat{
  display:inline-block;background:var(--ink);color:#fff;padding:10px 16px;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;margin:0;
  box-shadow:var(--shadow-sm);
}
.lz-stat strong{ color:var(--acid); }

.lz-chips{ display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 44px; }
.lz-chips-label{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;
  font-weight:700;letter-spacing:.08em;color:var(--muted);margin-right:4px;
}
.lz-chip{
  border:2px solid var(--ink);padding:7px 12px;font-size:15px;font-weight:600;
  color:var(--ink);text-decoration:none;background:#fff;box-shadow:var(--shadow-sm);
}
.lz-chip:hover,.lz-chip.is-active{ background:var(--acid); }
.lz-chip-n{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;color:var(--muted);
}

.lz-concorso{ margin-bottom:56px; }
.lz-concorso-title{ font-size:clamp(24px,3vw,32px);font-weight:700;letter-spacing:-.02em;margin:0 0 6px; }
.lz-concorso-link{ color:var(--ink);text-decoration:none;border-bottom:3px solid var(--acid); }
.lz-concorso-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;
  color:var(--muted);margin:0 0 10px;
}
.lz-concorso-intro{ font-size:18px;line-height:1.6;color:var(--ink-soft);max-width:60ch;margin:0 0 8px; }
.lz-concorso-stat{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;
  font-weight:700;color:var(--ink);margin:0 0 22px;
}

.lz-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:20px;margin-bottom:26px;
}
.lz-card{
  border:3px solid var(--ink);background:#fff;padding:18px;
  box-shadow:var(--shadow-sm);display:flex;flex-direction:column;
}
.lz-card:hover{ box-shadow:var(--shadow-lg,8px 8px 0 var(--ink));transform:translateY(-2px); }
.lz-card-top{ display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px; }
.lz-card-ep{
  background:var(--acid);border:2px solid var(--ink);padding:3px 8px;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:700;
}
.lz-card-dur{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;
  font-weight:700;color:var(--ink-soft);
}
.lz-card-title{ font-size:20px;font-weight:700;letter-spacing:-.01em;margin:0 0 8px;line-height:1.2; }
.lz-card-desc{ font-size:16px;line-height:1.55;color:var(--ink-soft);margin:0 0 12px;flex:1; }
.lz-card-meta{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;
  color:var(--muted);margin:0 0 14px;line-height:1.5;
}
.lz-card-warn{ display:block;color:var(--ink);font-weight:700;margin-top:4px; }
.lz-card-link{
  align-self:flex-start;border:2px solid var(--ink);background:var(--acid);
  padding:8px 14px;font-weight:700;font-size:15px;color:var(--ink);
  text-decoration:none;box-shadow:var(--shadow-sm);
}
.lz-card-link:hover{ background:var(--ink);color:var(--acid); }
.lz-card-link-soft{ background:#fff; }

.lz-actions{ display:flex;flex-wrap:wrap;align-items:center;gap:16px; }
.lz-page-link{ font-size:15px;font-weight:600;color:var(--ink-soft);text-decoration:none;border-bottom:2px solid var(--acid); }
.lz-page-link:hover{ color:var(--ink); }

.lz-how{ border:3px solid var(--ink);background:var(--bg,#f5f0e8);padding:24px;margin:12px 0 44px;box-shadow:var(--shadow-sm); }
.lz-how-title{ font-size:24px;font-weight:700;margin:0 0 14px; }
.lz-how-list{ margin:0;padding-left:20px;display:grid;gap:10px; }
.lz-how-list li{ font-size:17px;line-height:1.6;color:var(--ink-soft); }

.lz-footer{ text-align:center;padding-top:20px;border-top:3px solid var(--ink); }
.lz-footer p{ font-size:19px;font-weight:600;margin:18px 0 14px; }

@media (max-width:600px){
  .lz-grid{ grid-template-columns:1fr; }
  .lz-stat{ font-size:12px; }
}
</style>
