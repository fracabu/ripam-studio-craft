<script setup>
// Searchbar globale: cerca in TUTTO il sito (concorsi, materie, report, lezioni,
// pagine, risorse gratuite) da un campo solo. Indice in src/data/ricerca.js,
// costruito dai dati esistenti — nessun elenco da mantenere a mano.
//
// È un combobox ARIA come il campo email del form: frecce per scorrere, Invio
// per aprire, Esc per chiudere. Su mobile il dropdown resta sotto il campo e
// non copre la pagina.
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { cerca, ETICHETTA_TIPO, SCORCIATOIE } from '../data/ricerca.js'

const props = defineProps({
  placeholder: { type: String, default: 'Cerca il tuo concorso, una materia, un report…' },
  autofocus: { type: Boolean, default: false },
})

const router = useRouter()
const q = ref('')
const aperto = ref(false)
const attivo = ref(-1)
const input = ref(null)

const risultati = computed(() => cerca(q.value))
const mostraScorciatoie = computed(() => aperto.value && !q.value.trim())
const vuoto = computed(() => aperto.value && q.value.trim().length >= 2 && !risultati.value.length)

const apri = () => { aperto.value = true }
// Il blur si chiude in ritardo: senza, il click su un risultato non arriva mai
// perché l'elemento sparisce prima del mousedown.
const chiudiDopo = () => { window.setTimeout(() => { aperto.value = false; attivo.value = -1 }, 120) }

const vai = (v) => {
  if (!v) return
  aperto.value = false
  attivo.value = -1
  if (v.href) window.open(v.href, '_blank', 'noopener')
  else router.push(v.to)
  q.value = ''
  input.value?.blur()
}

const onKey = (e) => {
  const lista = mostraScorciatoie.value ? SCORCIATOIE : risultati.value
  if (!lista.length) return
  if (e.key === 'ArrowDown') { e.preventDefault(); aperto.value = true; attivo.value = (attivo.value + 1) % lista.length }
  else if (e.key === 'ArrowUp') { e.preventDefault(); attivo.value = attivo.value <= 0 ? lista.length - 1 : attivo.value - 1 }
  else if (e.key === 'Enter') {
    // Invio senza selezione: apre il primo risultato. È quello che si aspetta
    // chi digita e preme Invio senza guardare la lista.
    e.preventDefault()
    vai(lista[attivo.value >= 0 ? attivo.value : 0])
  } else if (e.key === 'Escape') { aperto.value = false; attivo.value = -1; input.value?.blur() }
}

if (props.autofocus) nextTick(() => input.value?.focus())
</script>

<template>
  <div class="rk" role="search">
    <div class="rk-field">
      <span class="rk-icon" aria-hidden="true">⌕</span>
      <input
        ref="input"
        v-model="q"
        type="search"
        class="rk-input"
        :placeholder="placeholder"
        role="combobox"
        aria-expanded="true"
        aria-controls="rk-lista"
        :aria-activedescendant="attivo >= 0 ? `rk-opt-${attivo}` : undefined"
        aria-label="Cerca nel sito"
        autocomplete="off"
        @focus="apri"
        @blur="chiudiDopo"
        @keydown="onKey"
      />
      <span v-if="q" class="rk-n">{{ risultati.length }}</span>
    </div>

    <div v-if="aperto" id="rk-lista" class="rk-drop" role="listbox" aria-label="Risultati">
      <template v-if="mostraScorciatoie">
        <p class="rk-hint">Le strade più battute</p>
        <button
          v-for="(s, i) in SCORCIATOIE" :key="s.to" :id="`rk-opt-${i}`"
          type="button" role="option" :aria-selected="attivo === i"
          class="rk-row rk-row-short" :class="{ 'is-on': attivo === i }"
          @mousedown.prevent="vai(s)" @mouseenter="attivo = i">
          <span class="rk-row-t">{{ s.t }}</span>
          <span class="rk-go" aria-hidden="true">→</span>
        </button>
      </template>

      <template v-else-if="risultati.length">
        <button
          v-for="(r, i) in risultati" :key="`${r.tipo}-${r.t}`" :id="`rk-opt-${i}`"
          type="button" role="option" :aria-selected="attivo === i"
          class="rk-row" :class="{ 'is-on': attivo === i }"
          @mousedown.prevent="vai(r)" @mouseenter="attivo = i">
          <span class="rk-tag" :data-tipo="r.tipo">{{ ETICHETTA_TIPO[r.tipo] }}</span>
          <span class="rk-txt">
            <span class="rk-row-t">{{ r.t }}</span>
            <span class="rk-row-d">{{ r.d }}</span>
          </span>
          <span class="rk-go" aria-hidden="true">{{ r.href ? '↗' : '→' }}</span>
        </button>
      </template>

      <p v-else-if="vuoto" class="rk-empty">
        Niente con «{{ q }}».
        <RouterLink to="/scrivimi?tipo=materia" @mousedown.prevent="vai({ to: '/scrivimi?tipo=materia' })">
          Scrivimi e vediamo cosa si può fare →
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.rk{ position:relative;width:100%;max-width:640px; }

.rk-field{
  display:flex;align-items:center;gap:10px;
  border:3px solid var(--ink);background:#fff;
  box-shadow:var(--shadow-lg,8px 8px 0 var(--ink));
  padding:0 14px;
}
.rk-field:focus-within{ background:#fffdf5; }
.rk-icon{ font-size:24px;line-height:1;color:var(--ink);flex:none; }
.rk-input{
  flex:1;border:0;outline:0;background:transparent;
  font-family:inherit;font-size:18px;color:var(--ink);
  padding:16px 0;min-width:0;
}
.rk-input::placeholder{ color:var(--muted); }
.rk-input::-webkit-search-cancel-button{ cursor:pointer; }
.rk-n{
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13.5px;font-weight:700;
  background:var(--acid);border:2px solid var(--ink);padding:2px 7px;flex:none;
}

.rk-drop{
  position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:60;
  background:#fff;border:3px solid var(--ink);box-shadow:var(--shadow-lg,8px 8px 0 var(--ink));
  max-height:min(60vh,420px);overflow-y:auto;
}
.rk-hint{
  margin:0;padding:10px 14px;border-bottom:2px solid var(--ink);
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;
  font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
}
.rk-row{
  display:flex;align-items:center;gap:12px;width:100%;text-align:left;
  padding:11px 14px;border:0;border-bottom:1px solid rgba(10,10,10,.12);
  background:#fff;cursor:pointer;font-family:inherit;
}
.rk-row:last-child{ border-bottom:0; }
.rk-row.is-on{ background:var(--acid); }
.rk-row-short{ justify-content:space-between;font-weight:700;font-size:17px; }
.rk-tag{
  flex:none;width:74px;text-align:center;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12.5px;font-weight:700;
  letter-spacing:.06em;text-transform:uppercase;
  border:2px solid var(--ink);padding:3px 0;background:#fff;
}
.rk-tag[data-tipo="concorso"]{ background:var(--acid); }
.rk-tag[data-tipo="esterna"]{ background:var(--ink);color:var(--acid); }
.rk-txt{ display:flex;flex-direction:column;gap:2px;min-width:0;flex:1; }
.rk-row-t{ font-size:17px;font-weight:700;color:var(--ink);line-height:1.25; }
.rk-row-d{
  font-size:14px;color:var(--ink-soft);line-height:1.4;
  overflow:hidden;text-overflow:ellipsis;display:-webkit-box;
  -webkit-line-clamp:1;-webkit-box-orient:vertical;
}
.rk-go{ flex:none;font-weight:700;color:var(--ink); }
.rk-empty{ margin:0;padding:16px 14px;font-size:16px;color:var(--ink-soft); }
.rk-empty a{ color:var(--ink);font-weight:700; }

@media (max-width:600px){
  .rk-field{ box-shadow:var(--shadow-sm,4px 4px 0 var(--ink)); }
  .rk-input{ font-size:17px;padding:14px 0; }  /* mai sotto i 16px: iOS zooma da solo */
  .rk-tag{ display:none; }
}
</style>
