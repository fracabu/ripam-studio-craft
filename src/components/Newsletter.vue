<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

// Testo esatto della checkbox di consenso. Viene mandato come `consent_text`
// al backend e archiviato nel registro consensi GDPR (art. 7.1) per
// dimostrare cosa l'utente ha visto al momento del consenso.
const CONSENT_TEXT = 'Acconsento a ricevere la newsletter di Ripam Studio Craft (max 1-2 email al mese) e ho letto la Privacy Policy. Posso disiscrivermi in qualunque momento.'

const email = ref('')
const nome = ref('')
const consenso = ref(false)
const hp = ref('') // honeypot

const status = ref('idle') // idle | sending | sent | error
const errorMsg = ref('')

const submit = async (e) => {
  e.preventDefault()
  if (status.value === 'sending') return
  if (!consenso.value) {
    errorMsg.value = 'Spunta il consenso per iscriverti.'
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
        source: 'home',
        consent_text: CONSENT_TEXT,
        hp: hp.value
      })
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || !data.ok) throw new Error(data.error || 'Errore iscrizione')

    status.value = 'sent'
    email.value = ''
    nome.value = ''
    consenso.value = false
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message || 'Qualcosa è andato storto. Riprova o scrivimi a ripamstudiocraft@gmail.com'
  }
}
</script>

<template>
  <section id="newsletter" class="nl-section">
    <div class="wrap nl-grid">
      <div v-reveal class="nl-text">
        <span class="nl-kicker">NEWSLETTER</span>
        <h2 class="nl-h2">
          Una mail ogni tanto, <span class="nl-hl">solo cose utili.</span>
        </h2>
        <p class="nl-lead">
          1-2 email al mese: aggiornamenti normativi, anteprime dei materiali,
          bandi nuovi e qualche tip di studio con l'AI. Niente spam, niente promo aggressive.
          Ti disiscrivi con un click.
        </p>
        <ul class="nl-bullets">
          <li><span class="nl-tick">›</span> Massimo 1-2 email/mese</li>
          <li><span class="nl-tick">›</span> Anteprime gratuite dei materiali (audio, video, podcast, manuali)</li>
          <li><span class="nl-tick">›</span> Disiscrizione one-click sempre</li>
        </ul>
      </div>

      <div v-reveal class="nl-card">
        <!-- SUCCESS STATE -->
        <div v-if="status === 'sent'" class="nl-success">
          <div class="nl-success-k">QUASI FATTO &check;</div>
          <h3 class="nl-success-h">Controlla la mail.</h3>
          <p>
            Ti ho mandato un link di conferma. Cliccalo per attivare l'iscrizione.
            Guarda anche in <strong>spam/promozioni</strong> se non lo vedi entro 2 minuti.
          </p>
          <button type="button" class="btn btn-secondary" @click="status = 'idle'">
            Iscrivi un'altra mail
          </button>
        </div>

        <!-- FORM -->
        <form v-else class="nl-form" @submit="submit" novalidate>
          <div class="nl-card-pill">RESTA AGGIORNATO</div>

          <div class="nl-field">
            <label for="nl-email">Email <span class="nl-req">*</span></label>
            <input
              id="nl-email"
              v-model="email"
              type="email"
              required
              placeholder="tu@email.it"
              :disabled="status==='sending'"
              autocomplete="email"
            />
          </div>

          <div class="nl-field">
            <label for="nl-nome">Nome <span class="nl-opt">(facoltativo)</span></label>
            <input
              id="nl-nome"
              v-model="nome"
              type="text"
              placeholder="Come ti chiami"
              :disabled="status==='sending'"
              autocomplete="given-name"
            />
          </div>

          <label class="nl-consent">
            <input v-model="consenso" type="checkbox" required :disabled="status==='sending'" />
            <span>
              Acconsento a ricevere la newsletter di Ripam Studio Craft
              (max 1-2 email al mese) e ho letto la
              <RouterLink to="/privacy" target="_blank">Privacy Policy</RouterLink>.
              Posso disiscrivermi in qualunque momento.
            </span>
          </label>

          <!-- Honeypot: name senza semantica, altrimenti gli autofill lo
               compilano e l'iscrizione viene scartata in silenzio. Vedi
               Scrivimi.vue / api/contact.js. -->
          <input
            v-model="hp"
            type="text"
            name="nl-ref-2"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="nl-hp"
          />

          <div class="nl-actions">
            <button type="submit" class="btn btn-primary" :disabled="status==='sending' || !consenso">
              <span v-if="status==='sending'">Invio in corso…</span>
              <span v-else>Iscrivimi &rarr;</span>
            </button>
            <span class="nl-hint">Doppio opt-in via email · GDPR-clean</span>
          </div>

          <p v-if="status==='error'" class="nl-err">{{ errorMsg }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nl-section{
  padding:80px 0;
  border-top:2px solid var(--ink);
  border-bottom:2px solid var(--ink);
  background:var(--bg);
  position:relative;z-index:1;
}

.nl-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:center;
}
@media(max-width:880px){.nl-grid{grid-template-columns:1fr;gap:32px}}

.nl-text{display:flex;flex-direction:column}
.nl-kicker{
  display:inline-block;align-self:flex-start;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13.5px;font-weight:700;letter-spacing:.08em;
  background:var(--ink);color:var(--bg);
  padding:5px 12px;margin-bottom:18px;
}
.nl-h2{
  font-size:clamp(34px,4.8vw,60px);font-weight:700;
  letter-spacing:-.035em;line-height:1.02;
  margin:0 0 16px;text-wrap:balance;
}
.nl-hl{
  background:var(--acid);color:var(--ink);
  padding:0 .15em;box-decoration-break:clone;
}
.nl-lead{
  font-size:17px;line-height:1.55;color:var(--ink-soft,#2a2a2a);
  max-width:54ch;margin:0 0 22px;
}
.nl-bullets{
  list-style:none;padding:0;margin:0;
  display:flex;flex-direction:column;gap:8px;
}
.nl-bullets li{
  display:flex;gap:10px;align-items:baseline;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:14.5px;letter-spacing:.02em;color:var(--ink);
}
.nl-tick{font-weight:700;color:var(--blue,#3d5aff)}

/* CARD FORM */
.nl-card{
  background:var(--bg);
  border:2px solid var(--ink);
  box-shadow:10px 10px 0 var(--ink);
  padding:28px;
  position:relative;
}
.nl-card-pill{
  position:absolute;top:-12px;left:20px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;font-weight:700;letter-spacing:.12em;
  background:var(--acid);color:var(--ink);
  padding:5px 10px;border:2px solid var(--ink);
}

.nl-form{display:flex;flex-direction:column;gap:16px;padding-top:6px}

.nl-field{display:flex;flex-direction:column;gap:6px}
.nl-field > label{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.08em;
  color:var(--muted,#6b6458);text-transform:uppercase;
}
.nl-req{color:var(--blue,#3d5aff)}
.nl-opt{color:var(--muted,#6b6458);font-weight:500;text-transform:none;letter-spacing:0}
.nl-field input{
  padding:12px 14px;
  background:var(--bg);color:var(--ink);
  border:2px solid var(--ink);
  font:inherit;font-size:15px;line-height:1.4;
  transition:background .12s;
}
.nl-field input:focus{background:var(--acid)}
.nl-field input:focus-visible{outline:2px solid var(--blue);outline-offset:2px}

.nl-consent{
  display:flex;align-items:flex-start;gap:10px;
  font-size:13.5px;line-height:1.5;color:var(--ink-soft,#2a2a2a);
  cursor:pointer;
}
.nl-consent input{
  margin-top:2px;width:16px;height:16px;
  accent-color:var(--ink);flex:0 0 auto;
}
.nl-consent a{color:var(--ink);font-weight:700;text-decoration:underline}

.nl-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0}

.nl-actions{
  display:flex;gap:14px;align-items:center;flex-wrap:wrap;
  margin-top:4px;
}
.nl-actions .btn{min-width:160px;text-align:center}
.nl-hint{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;letter-spacing:.05em;color:var(--muted,#6b6458);
}

.nl-err{
  font-size:14.5px;color:#c63d3d;margin:0;
  padding:10px 12px;border:2px solid #c63d3d;background:rgba(198,61,61,.08);
}

/* SUCCESS */
.nl-success{
  display:flex;flex-direction:column;gap:12px;
  padding:8px 0;
}
.nl-success-k{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.12em;
  background:var(--acid);color:var(--ink);
  padding:5px 10px;border:2px solid var(--ink);
  align-self:flex-start;
}
.nl-success-h{
  font-size:clamp(22px,2.6vw,28px);font-weight:700;
  letter-spacing:-.025em;margin:0;line-height:1.15;
}
.nl-success p{font-size:14.5px;line-height:1.55;margin:0;color:var(--ink-soft,#2a2a2a)}
.nl-success .btn{align-self:flex-start;margin-top:6px}

@media (prefers-reduced-motion:reduce){
  .nl-field input{transition:none}
}
</style>
