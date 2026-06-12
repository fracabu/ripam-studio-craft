<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getMateriaBySlug } from '../data/materie.js'
import RichiediAnteprimaModale from '../components/RichiediAnteprimaModale.vue'

// Slug delle materie con anteprima manuale 15 pp offerta — in sync con
// src/views/Materia.vue e api/_lib/anteprime-manifest.js. Aggiornare insieme.
// (3 di queste hanno il PDF ancora in lavorazione → il modale consegna la mail
//  "in arrivo": il flusso non si rompe, come su /materia.)
const ANTEPRIME_SLUGS = new Set([
  'anticorruzione-trasparenza','cad','contabilita-pubblica','contratti-pubblici',
  'diritto-amministrativo','diritto-civile','diritto-costituzionale',
  'diritto-penale-pa','diritto-processuale-civile','diritto-ue','gdpr',
  'informatica','logica','ordinamento-pa','patrimonio-culturale',
  'pubblico-impiego','sicurezza-lavoro',
])

const route = useRoute()
const slug = computed(() => route.params.slug)
const materia = computed(() => getMateriaBySlug(slug.value))
const hasAnteprima = computed(() => !!materia.value && ANTEPRIME_SLUGS.has(materia.value.slug))

const open = ref(false)
const openModale = () => { open.value = true }
const closeModale = () => { open.value = false }
</script>

<template>
  <main class="ap-page">
    <div class="wrap ap-wrap">
      <!-- MATERIA SCONOSCIUTA -->
      <template v-if="!materia">
        <div class="ap-kicker">ANTEPRIMA</div>
        <h1 class="ap-h1">Materia <span class="hl-blue">non trovata.</span></h1>
        <p class="ap-lead">
          Il link che hai aperto non corrisponde a nessuna materia. Sfoglia il catalogo
          e scegli quella che ti serve.
        </p>
        <div class="ap-ctas">
          <RouterLink to="/#materie" class="btn btn-primary">Vedi le materie &rarr;</RouterLink>
          <RouterLink to="/scrivimi?tipo=materia" class="btn btn-secondary">Non la trovi? Scrivimi &rarr;</RouterLink>
        </div>
      </template>

      <!-- LANDING ANTEPRIMA -->
      <template v-else>
        <div class="ap-kicker">ANTEPRIMA GRATIS · 15 PAGINE · PDF</div>
        <h1 class="ap-h1">
          L'anteprima di <span class="hl-blue">{{ materia.t }}.</span>
        </h1>
        <p class="ap-norm">{{ materia.norm }}</p>
        <p class="ap-lead">
          Studia solo quello che serve. Prima di spendere un euro, guarda com'è fatto
          il manuale: taglio, livello di dettaglio, com'è spiegata la materia. Poi decidi.
        </p>

        <ul class="ap-list">
          <li><span class="ap-tick">→</span> <strong>Indice completo</strong>: vedi tutto quello che copre il manuale</li>
          <li><span class="ap-tick">→</span> <strong>Introduzione + primi due capitoli</strong> per intero, non spezzoni</li>
          <li><span class="ap-tick">→</span> <strong>PDF via email in pochi minuti</strong> — niente carta di credito</li>
        </ul>

        <div v-if="hasAnteprima" class="ap-ctas">
          <button type="button" class="btn btn-primary ap-cta" @click="openModale">
            Ricevi l'anteprima &rarr;
          </button>
          <RouterLink :to="`/materia/${materia.slug}`" class="btn btn-secondary">
            Vedi tutta la materia &rarr;
          </RouterLink>
        </div>
        <div v-else class="ap-ctas">
          <RouterLink :to="`/materia/${materia.slug}`" class="btn btn-primary">
            Vedi la materia &rarr;
          </RouterLink>
          <RouterLink :to="`/scrivimi?tipo=materia&note=${encodeURIComponent('Mi interessa l\'anteprima di ' + materia.t)}`" class="btn btn-secondary">
            Avvisami quando è pronta &rarr;
          </RouterLink>
        </div>

        <p class="ap-hint">Doppio opt-in via email · GDPR-clean · disiscrizione one-click</p>
      </template>
    </div>

    <RichiediAnteprimaModale
      :open="open"
      :slug="materia?.slug || ''"
      :materia-label="materia?.t || ''"
      @close="closeModale"
    />
  </main>
</template>

<style scoped>
.ap-page{
  padding:28px 0 36px;position:relative;z-index:1;
  min-height:calc(100dvh - var(--nav-h, 76px));
  display:flex;flex-direction:column;justify-content:center;
}
.ap-wrap{max-width:720px;width:100%}

.ap-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:14px;
}
.ap-h1{
  font-size:clamp(30px,4.4vw,48px);font-weight:700;letter-spacing:-.035em;
  line-height:1.02;margin:0 0 10px;text-wrap:balance;
}
.hl-blue{
  background:var(--blue);color:var(--bg);
  padding:0 12px;display:inline-block;
  transform:rotate(-1deg);box-shadow:var(--shadow-sm);
}
.ap-norm{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:600;letter-spacing:.04em;
  color:var(--ink);margin:0 0 14px;
  border-left:3px solid var(--acid);padding-left:12px;
}
.ap-lead{font-size:16px;line-height:1.55;color:var(--ink-soft,#2a2a2a);max-width:60ch;margin:0 0 20px}

.ap-list{list-style:none;margin:0 0 26px;padding:0;display:flex;flex-direction:column;gap:9px}
.ap-list li{font-size:15px;line-height:1.4;color:var(--ink);display:flex;align-items:baseline;gap:10px}
.ap-tick{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-weight:700;color:var(--blue,#3d5aff);flex:0 0 auto;
}

.ap-ctas{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.ap-cta{min-width:220px;text-align:center}

.ap-hint{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.05em;color:var(--muted,#6b6458);
  margin:22px 0 0;
}
</style>
