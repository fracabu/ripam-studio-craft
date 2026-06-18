<script setup>
import { ref, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  open: { type: Boolean, default: false },
  // slug della materia richiesta (richiesto se open=true)
  slug: { type: String, default: '' },
  // titolo umano della materia (per copy del modale)
  materiaLabel: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const CONSENT_TEXT = 'Acconsento a ricevere la newsletter di Ripam Studio Craft (max 1-2 email al mese) per ricevere l\'anteprima del manuale richiesta e ho letto la Privacy Policy. Posso disiscrivermi in qualunque momento.'

const email = ref('')
const nome = ref('')
const consenso = ref(false)
const hp = ref('')

const status = ref('idle') // idle | sending | sent | error
const errorMsg = ref('')

const emailInput = ref(null)
const closeBtn = ref(null)
const trapRef = ref(null)
let prevFocused = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'

// Reset stato quando il modale si apre, focus su email
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    prevFocused = document.activeElement // per ripristinare il focus alla chiusura
    status.value = 'idle'
    errorMsg.value = ''
    email.value = ''
    nome.value = ''
    consenso.value = false
    hp.value = ''
    document.body.style.overflow = 'hidden'
    await nextTick()
    emailInput.value?.focus()
  } else {
    document.body.style.overflow = ''
    prevFocused?.focus?.() // torna sull'elemento che aveva aperto il modale
    prevFocused = null
  }
})

const close = () => {
  if (status.value === 'sending') return
  emit('close')
}

const onBackdrop = (e) => {
  if (e.target === e.currentTarget) close()
}

const onKeydown = (e) => {
  if (e.key === 'Escape') { close(); return }
  if (e.key !== 'Tab') return
  // focus-trap: tieni il Tab dentro al modale
  const root = trapRef.value
  if (!root) return
  const items = Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

const submit = async (e) => {
  e.preventDefault()
  if (status.value === 'sending') return
  if (!consenso.value) {
    errorMsg.value = 'Spunta il consenso per ricevere l\'anteprima.'
    status.value = 'error'
    return
  }
  if (!props.slug) {
    errorMsg.value = 'Materia non identificata. Ricarica la pagina e riprova.'
    status.value = 'error'
    return
  }

  status.value = 'sending'
  errorMsg.value = ''

  try {
    const r = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        nome: nome.value,
        source: 'anteprima',
        requested_materia: props.slug,
        consent_text: CONSENT_TEXT,
        hp: hp.value,
      }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || !data.ok) throw new Error(data.error || 'Errore iscrizione')

    status.value = 'sent'
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message || 'Qualcosa è andato storto. Riprova o scrivimi a ripamstudiocraft@gmail.com'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="trapRef"
      class="ant-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ant-title"
      @click="onBackdrop"
      @keydown="onKeydown"
      tabindex="-1"
    >
      <div class="ant-card">
        <button
          ref="closeBtn"
          class="ant-close"
          type="button"
          aria-label="Chiudi"
          @click="close"
        >×</button>

        <!-- SUCCESS STATE -->
        <div v-if="status === 'sent'" class="ant-success">
          <div class="ant-pill ant-pill-success">QUASI FATTO &check;</div>
          <h3 id="ant-title" class="ant-title">Controlla la mail.</h3>
          <p>
            Ti ho mandato un link di conferma. <strong>Cliccalo</strong> per attivare
            l'iscrizione e ricevere l'anteprima di
            <strong>{{ materiaLabel || 'la materia richiesta' }}</strong>.
          </p>
          <p class="ant-note">
            Guarda anche in <strong>spam/promozioni</strong> se non la vedi entro 2 minuti.
            Arriva da <code>ripamstudiocraft@gmail.com</code>.
          </p>
          <div class="ant-actions">
            <button type="button" class="btn btn-primary" @click="close">Ok, ho capito</button>
          </div>
        </div>

        <!-- FORM -->
        <form v-else class="ant-form" @submit="submit" novalidate>
          <div class="ant-pill">ANTEPRIMA GRATIS · 15 PP</div>
          <h3 id="ant-title" class="ant-title">
            Ti mando l'anteprima<br>
            di <span class="ant-hl">{{ materiaLabel || 'questa materia' }}</span>.
          </h3>
          <p class="ant-lead">
            PDF di 15 pagine: indice, introduzione e primi due capitoli del manuale.
            Lascia la mail, conferma con un click, ricevi il link. Niente carta di credito.
          </p>

          <div class="ant-field">
            <label for="ant-email">Email <span class="ant-req">*</span></label>
            <input
              id="ant-email"
              ref="emailInput"
              v-model="email"
              type="email"
              required
              placeholder="tu@email.it"
              :disabled="status === 'sending'"
              autocomplete="email"
            />
          </div>

          <div class="ant-field">
            <label for="ant-nome">Nome <span class="ant-opt">(facoltativo)</span></label>
            <input
              id="ant-nome"
              v-model="nome"
              type="text"
              placeholder="Come ti chiami"
              :disabled="status === 'sending'"
              autocomplete="given-name"
            />
          </div>

          <label class="ant-consent">
            <input
              v-model="consenso"
              type="checkbox"
              required
              :disabled="status === 'sending'"
            />
            <span>
              Acconsento a ricevere la newsletter di Ripam Studio Craft (max 1-2 email
              al mese) per ricevere l'anteprima richiesta, e ho letto la
              <RouterLink to="/privacy" target="_blank">Privacy Policy</RouterLink>.
              Posso disiscrivermi in qualunque momento.
            </span>
          </label>

          <input
            v-model="hp"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="ant-hp"
          />

          <div class="ant-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="status === 'sending' || !consenso"
            >
              <span v-if="status === 'sending'">Invio in corso…</span>
              <span v-else>Mandami l'anteprima &rarr;</span>
            </button>
            <button
              type="button"
              class="btn btn-secondary ant-cancel"
              :disabled="status === 'sending'"
              @click="close"
            >Annulla</button>
          </div>

          <p v-if="status === 'error'" class="ant-err" role="alert">{{ errorMsg }}</p>
          <p class="ant-hint">Doppio opt-in via email · GDPR-clean</p>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ant-backdrop{
  position:fixed;inset:0;z-index:1000;
  background:rgba(10,10,10,.6);
  display:grid;place-items:center;
  padding:24px;
  animation:antFadeIn .15s ease-out;
}
@keyframes antFadeIn{from{opacity:0}to{opacity:1}}

.ant-card{
  position:relative;
  width:min(520px,100%);max-height:90vh;overflow-y:auto;
  background:var(--bg,#f5f0e8);
  border:2px solid var(--ink,#0a0a0a);
  box-shadow:10px 10px 0 var(--ink,#0a0a0a);
  padding:32px 28px 28px;
  animation:antPop .18s ease-out;
}
@keyframes antPop{from{transform:translate(6px,6px);opacity:.7}to{transform:translate(0,0);opacity:1}}

.ant-close{
  position:absolute;top:8px;right:10px;
  width:34px;height:34px;
  background:transparent;border:none;
  font-size:28px;line-height:1;font-weight:400;
  color:var(--ink,#0a0a0a);cursor:pointer;
  display:grid;place-items:center;
  border-radius:0;
}
.ant-close:hover{background:var(--acid,#c6f432)}

.ant-pill{
  display:inline-block;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10.5px;font-weight:700;letter-spacing:.12em;
  background:var(--acid,#c6f432);color:var(--ink,#0a0a0a);
  padding:5px 10px;border:2px solid var(--ink,#0a0a0a);
  margin-bottom:14px;
}
.ant-pill-success{background:var(--acid,#c6f432)}

.ant-title{
  font-size:clamp(22px,2.6vw,28px);font-weight:700;
  letter-spacing:-.025em;line-height:1.15;
  margin:0 0 12px;
}
.ant-hl{
  background:var(--acid,#c6f432);color:var(--ink,#0a0a0a);
  padding:0 .15em;box-decoration-break:clone;
}
.ant-lead{
  font-size:14px;line-height:1.55;color:var(--ink-soft,#2a2a2a);
  margin:0 0 18px;
}

.ant-form{display:flex;flex-direction:column;gap:14px}

.ant-field{display:flex;flex-direction:column;gap:6px}
.ant-field > label{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.08em;
  color:var(--muted,#6b6458);text-transform:uppercase;
}
.ant-req{color:var(--blue,#3d5aff)}
.ant-opt{color:var(--muted,#6b6458);font-weight:500;text-transform:none;letter-spacing:0}
.ant-field input{
  padding:12px 14px;
  background:var(--bg,#f5f0e8);color:var(--ink,#0a0a0a);
  border:2px solid var(--ink,#0a0a0a);
  font:inherit;font-size:15px;line-height:1.4;
  transition:background .12s;
}
.ant-field input:focus{background:var(--acid,#c6f432)}
.ant-field input:focus-visible{outline:2px solid var(--blue,#3d5aff);outline-offset:2px}

.ant-consent{
  display:flex;align-items:flex-start;gap:10px;
  font-size:12.5px;line-height:1.5;color:var(--ink-soft,#2a2a2a);
  cursor:pointer;
}
.ant-consent input{
  margin-top:2px;width:16px;height:16px;
  accent-color:var(--ink,#0a0a0a);flex:0 0 auto;
}
.ant-consent a{color:var(--ink,#0a0a0a);font-weight:700;text-decoration:underline}

.ant-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0}

.ant-actions{
  display:flex;gap:10px;align-items:center;flex-wrap:wrap;
  margin-top:6px;
}
.ant-actions .btn{min-width:160px;text-align:center}
.ant-cancel{min-width:auto !important}

.ant-hint{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10.5px;letter-spacing:.05em;color:var(--muted,#6b6458);
  margin:4px 0 0;
}
.ant-err{
  font-size:13.5px;color:#c63d3d;margin:0;
  padding:10px 12px;border:2px solid #c63d3d;background:rgba(198,61,61,.08);
}

/* SUCCESS */
.ant-success{display:flex;flex-direction:column;gap:10px}
.ant-success p{font-size:14.5px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.ant-note{font-size:12.5px !important;color:var(--muted,#6b6458) !important}
.ant-note code{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11.5px;background:var(--bg-alt,#ede6d8);padding:1px 4px;border:1px solid var(--ink,#0a0a0a);
}

@media (prefers-reduced-motion:reduce){
  .ant-backdrop,.ant-card{animation:none}
  .ant-field input{transition:none}
}

@media(max-width:520px){
  .ant-card{padding:28px 20px 22px;box-shadow:6px 6px 0 var(--ink,#0a0a0a)}
  .ant-actions .btn{min-width:auto;flex:1}
}
</style>
