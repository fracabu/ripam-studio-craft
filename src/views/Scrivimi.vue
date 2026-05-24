<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { CONCORSI } from '../data/formati.js'

const TIPI = [
  { v: 'materia', l: 'Materia di studio' },
  { v: 'coaching', l: 'Coaching NotebookLM' },
  { v: 'tool', l: 'Tool su misura' },
  { v: 'quiz-pro', l: 'Credenziali RIPAM Studio Quiz Pro' },
  { v: 'non-so', l: 'Non lo so ancora' }
]

const QUIZ_PRO_NOTE = 'Vorrei ricevere le credenziali per accedere a RIPAM Studio Quiz Pro.'

// Testo esatto della checkbox newsletter, registrato come consent_text
// nel registro consensi GDPR (art. 7.1). Allineato a Newsletter.vue.
const NEWSLETTER_CONSENT_TEXT = 'Acconsento a ricevere la newsletter di Ripam Studio Craft (max 1-2 email al mese) e ho letto la Privacy Policy. Posso disiscrivermi in qualunque momento.'

// Stato form
const nome = ref('')
const email = ref('')
const tipo = ref('non-so')
const concorso = ref('Altro / non so ancora')
const note = ref('')
const privacy = ref(false)
const newsletter = ref(false)
const hp = ref('') // honeypot

const status = ref('idle') // idle | sending | sent | error
const errorMsg = ref('')

// Modalità semplificata per richieste credenziali Quiz Pro: nasconde
// i selettori "Cosa ti serve" e "Concorso", mostra banner contestuale,
// pre-compila il testo della richiesta. L'utente deve solo nome + email.
const isQuizProMode = computed(() => tipo.value === 'quiz-pro')

// Permetti pre-compilazione via query string: /scrivimi?tipo=coaching&concorso=RIPAM&note=...
const route = useRoute()
watch(() => route.query, (q) => {
  if (q.tipo && TIPI.some(t => t.v === q.tipo)) tipo.value = q.tipo
  if (q.concorso && (CONCORSI.includes(q.concorso) || q.concorso === 'Altro')) {
    concorso.value = q.concorso === 'Altro' ? 'Altro / non so ancora' : q.concorso
  }
  if (q.note) {
    note.value = String(q.note)
  } else if (tipo.value === 'quiz-pro' && !note.value) {
    note.value = QUIZ_PRO_NOTE
  }
}, { immediate: true })

const submit = async (e) => {
  e.preventDefault()
  if (status.value === 'sending') return
  status.value = 'sending'
  errorMsg.value = ''

  // Concateno "Cosa ti serve" davanti alle note per non toccare lo schema dell'API
  const tipoLabel = TIPI.find(t => t.v === tipo.value)?.l || ''
  const composedNote = tipoLabel
    ? `Cosa serve: ${tipoLabel}\n\n${note.value}`
    : note.value

  try {
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        concorso: concorso.value,
        note: composedNote,
        hp: hp.value
      })
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || !data.ok) throw new Error(data.error || 'Errore invio')

    // Se l'utente ha spuntato anche la newsletter, fire-and-forget la
    // chiamata al subscribe endpoint. Eventuali errori vengono loggati ma
    // non bloccano il success state del contatto principale.
    if (newsletter.value && email.value) {
      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          nome: nome.value,
          source: 'scrivimi',
          consent_text: NEWSLETTER_CONSENT_TEXT
        })
      }).catch(err => console.warn('Newsletter subscribe failed:', err))
    }

    status.value = 'sent'
    nome.value = ''; email.value = ''; note.value = ''
    privacy.value = false
    newsletter.value = false
    setTimeout(() => {
      document.getElementById('sv-success')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message || 'Qualcosa è andato storto. Scrivimi a ripamstudiocraft@gmail.com'
  }
}
</script>

<template>
  <main class="sv-page">
    <div class="wrap sv-wrap">
      <div class="sv-kicker">{{ isQuizProMode ? 'RICHIESTA CREDENZIALI' : 'SCRIVIMI' }}</div>
      <h1 v-if="isQuizProMode" class="sv-h1">
        Richiedi le credenziali di <span class="hl-blue">Quiz Pro.</span>
      </h1>
      <h1 v-else class="sv-h1">
        Raccontami <span class="hl-blue">cosa ti serve.</span>
      </h1>
      <p v-if="isQuizProMode" class="sv-lead">
        Bastano <strong>nome ed email</strong>. Ti invio le credenziali entro 24h via mail.
        L'app è in beta ed è <strong>100% gratuita</strong>: nessun pagamento, nessun carrello.
      </p>
      <p v-else class="sv-lead">
        Bastano 4 campi. Ti rispondo entro 24h via email — o via Telegram se preferisci.
        Nessun pagamento anticipato, nessun carrello.
      </p>

      <!-- Banner contestuale: richiesta credenziali Quiz Pro -->
      <div v-if="isQuizProMode && status !== 'sent'" class="sv-quiz-banner" role="status">
        <div class="sv-quiz-banner-k">🔐 RIPAM STUDIO QUIZ PRO</div>
        <p>
          Stai richiedendo l'accesso a <strong>Quiz Pro</strong>: 5.500+ articoli di legge,
          26 leggi d'esame, quiz generati con AI. Compila <strong>nome ed email</strong> qui
          sotto — alle credenziali pensiamo noi.
        </p>
      </div>

      <!-- SUCCESS STATE in pagina (no modal) -->
      <div v-if="status === 'sent'" id="sv-success" class="sv-success">
        <div class="sv-success-k">RICEVUTO &check;</div>
        <h2 v-if="isQuizProMode" class="sv-success-h">Richiesta ricevuta. Credenziali in arrivo entro 24h.</h2>
        <h2 v-else class="sv-success-h">Grazie. Ti rispondo a mano entro 24h.</h2>
        <p v-if="isQuizProMode">
          Ti invio username e password via email. Controlla anche la cartella <strong>spam/promozioni</strong>.
          Se hai urgenza, scrivimi su Telegram <strong>@fcapurso</strong>.
        </p>
        <p v-else>Se hai urgenza, scrivimi su Telegram <strong>@fcapurso</strong> — leggo lì prima.</p>
        <div class="sv-success-ctas">
          <a href="https://t.me/fcapurso" target="_blank" rel="noopener" class="btn btn-primary">Telegram &nearr;</a>
          <RouterLink to="/" class="btn btn-secondary">Torna alla home &rarr;</RouterLink>
        </div>
      </div>

      <form v-else class="sv-form" @submit="submit" novalidate>
        <div class="sv-row">
          <div class="sv-field">
            <label for="sv-nome">Nome</label>
            <input id="sv-nome" v-model="nome" type="text" required placeholder="Come ti chiami" :disabled="status==='sending'" />
          </div>
          <div class="sv-field">
            <label for="sv-email">Email</label>
            <input id="sv-email" v-model="email" type="email" required placeholder="tu@email.it" :disabled="status==='sending'" />
          </div>
        </div>

        <div v-if="!isQuizProMode" class="sv-field">
          <label>Cosa ti serve</label>
          <div class="sv-seg" role="radiogroup" aria-label="Cosa ti serve">
            <label v-for="t in TIPI" :key="t.v" class="sv-seg-opt" :class="{active: tipo === t.v}">
              <input type="radio" name="sv-tipo" :value="t.v" v-model="tipo" :disabled="status==='sending'" />
              <span>{{ t.l }}</span>
            </label>
          </div>
        </div>

        <div v-if="!isQuizProMode" class="sv-field">
          <label>Concorso che stai preparando</label>
          <div class="sv-seg" role="radiogroup" aria-label="Concorso">
            <label v-for="c in CONCORSI" :key="c" class="sv-seg-opt" :class="{active: concorso === c}">
              <input type="radio" name="sv-concorso" :value="c" v-model="concorso" :disabled="status==='sending'" />
              <span>{{ c }}</span>
            </label>
            <label class="sv-seg-opt" :class="{active: concorso === 'Altro / non so ancora'}">
              <input type="radio" name="sv-concorso" value="Altro / non so ancora" v-model="concorso" :disabled="status==='sending'" />
              <span>Altro</span>
            </label>
          </div>
        </div>

        <div class="sv-field">
          <label for="sv-note">{{ isQuizProMode ? 'Note (facoltative)' : 'Dimmi di più' }}</label>
          <textarea
            id="sv-note"
            v-model="note"
            :rows="isQuizProMode ? 3 : 5"
            :required="!isQuizProMode"
            :placeholder="isQuizProMode ? 'Aggiungi qualcosa se vuoi — oppure lascia così com\'è.' : 'Materia, scadenza del concorso, cosa hai già provato, cosa non ti torna…'"
            :disabled="status==='sending'"
          ></textarea>
        </div>

        <label class="sv-privacy">
          <input v-model="privacy" type="checkbox" required :disabled="status==='sending'" />
          <span>Ho letto la <RouterLink to="/privacy" target="_blank">Privacy Policy</RouterLink> e acconsento al trattamento dei dati per rispondere a questa richiesta.</span>
        </label>

        <label class="sv-privacy sv-newsletter">
          <input v-model="newsletter" type="checkbox" :disabled="status==='sending'" />
          <span>Voglio anche ricevere la <strong>newsletter</strong> (max 1-2 email/mese, disiscrizione one-click). Riceverai una mail di conferma separata.</span>
        </label>

        <input v-model="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="sv-hp" />

        <div class="sv-actions">
          <button type="submit" class="btn btn-primary" :disabled="status==='sending' || !privacy">
            <span v-if="status==='sending'">Invio in corso…</span>
            <span v-else-if="isQuizProMode">Richiedi credenziali &rarr;</span>
            <span v-else>Invia &rarr;</span>
          </button>
          <span class="sv-hint">{{ isQuizProMode ? 'Credenziali via email entro 24h · 100% gratis' : 'Risposta entro 24h · nessun pagamento anticipato' }}</span>
        </div>

        <p v-if="status==='error'" class="sv-err">{{ errorMsg }}</p>
      </form>

      <!-- ALT: Telegram strip -->
      <div class="sv-alt">
        <span class="sv-alt-blurb">Preferisci scrivere a voce o un vocale?</span>
        <a href="https://t.me/fcapurso" target="_blank" rel="noopener" class="sv-alt-cta">TELEGRAM @FCAPURSO &nearr;</a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.sv-page{padding:60px 0 100px;position:relative;z-index:1}
.sv-wrap{max-width:880px}

.sv-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:14px;
}
.sv-h1{
  font-size:clamp(36px,4.6vw,56px);font-weight:700;letter-spacing:-.035em;
  line-height:1;margin:0 0 18px;text-wrap:balance;
}
.hl-acid{background:var(--acid);color:var(--ink);padding:0 .15em;box-decoration-break:clone}
.hl-blue{
  background:var(--blue);color:var(--bg);
  padding:0 12px;display:inline-block;
  transform:rotate(-1deg);
  box-shadow:var(--shadow-sm);
}
.sv-lead{font-size:16px;line-height:1.55;color:var(--ink-soft,#2a2a2a);max-width:62ch;margin:0}

/* Banner contestuale: richiesta credenziali Quiz Pro */
.sv-quiz-banner{
  margin-top:28px;
  padding:18px 22px;
  border:2px solid var(--ink);
  background:var(--acid);
  box-shadow:6px 6px 0 var(--ink);
}
.sv-quiz-banner-k{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  margin-bottom:8px;
}
.sv-quiz-banner p{
  font-size:14.5px;line-height:1.55;margin:0;color:var(--ink);
}

/* FORM */
.sv-form{
  margin-top:34px;
  padding:32px;
  border:2px solid var(--ink);background:var(--bg);
  box-shadow:10px 10px 0 var(--ink);
  display:flex;flex-direction:column;gap:20px;
}
.sv-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:600px){.sv-row{grid-template-columns:1fr}}

.sv-field{display:flex;flex-direction:column;gap:6px}
.sv-field > label{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.08em;
  color:var(--muted);text-transform:uppercase;
}
.sv-field input[type="text"],
.sv-field input[type="email"],
.sv-field textarea{
  padding:12px 14px;
  background:var(--bg);color:var(--ink);
  border:2px solid var(--ink);
  font:inherit;font-size:15px;line-height:1.4;
  transition:background .12s;
}
.sv-field input:focus,
.sv-field textarea:focus{outline:none;background:var(--acid)}
.sv-field textarea{resize:vertical;min-height:110px;font-family:inherit}

/* SEGMENTED CONTROLS */
.sv-seg{display:flex;flex-wrap:wrap;gap:8px}
.sv-seg-opt{
  cursor:pointer;
  padding:9px 14px;
  border:2px solid var(--ink);background:var(--bg);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12px;font-weight:600;letter-spacing:.05em;
  transition:background .12s, transform .12s;
  user-select:none;
}
.sv-seg-opt input{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px}
.sv-seg-opt:hover{background:var(--bg-alt,#ede6d8)}
.sv-seg-opt.active{background:var(--acid);color:var(--ink)}
.sv-seg-opt:has(input:focus-visible){outline:2px solid var(--blue,#3d5aff);outline-offset:2px}

.sv-privacy{
  display:flex;align-items:flex-start;gap:10px;
  font-size:13px;line-height:1.45;color:var(--ink-soft,#2a2a2a);
  cursor:pointer;
}
.sv-privacy input{margin-top:2px;width:16px;height:16px;accent-color:var(--ink);flex:0 0 auto}
.sv-privacy a{color:var(--ink);font-weight:700;text-decoration:underline}
.sv-newsletter{
  padding:10px 12px;
  border-left:3px solid var(--blue,#3d5aff);
  background:rgba(61,90,255,.05);
}

.sv-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0}

.sv-actions{
  display:flex;gap:18px;align-items:center;flex-wrap:wrap;
}
.sv-actions .btn{align-self:flex-start;min-width:140px;text-align:center}
.sv-hint{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;letter-spacing:.05em;color:var(--muted,#6b6458);
}

.sv-err{
  font-size:14px;color:#c63d3d;margin:0;
  padding:12px 14px;border:2px solid #c63d3d;background:rgba(198,61,61,.08);
}

/* SUCCESS */
.sv-success{
  margin-top:34px;padding:32px;
  border:2px solid var(--ink);background:var(--acid);
  box-shadow:10px 10px 0 var(--ink);
  display:flex;flex-direction:column;gap:14px;
}
.sv-success-k{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
}
.sv-success-h{font-size:clamp(22px,3vw,32px);font-weight:700;letter-spacing:-.025em;margin:0;line-height:1.15}
.sv-success p{font-size:15px;line-height:1.55;margin:0}
.sv-success-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px}

/* ALT */
.sv-alt{
  margin-top:24px;padding:18px 22px;
  background:var(--ink);color:var(--bg);
  border:2px solid var(--ink);
  display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:center;
}
.sv-alt-blurb{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;letter-spacing:.05em;
}
.sv-alt-cta{
  padding:9px 14px;
  border:2px solid var(--bg);background:var(--blue,#3d5aff);color:var(--bg);
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.08em;
  text-decoration:none;
  transition:transform .15s, box-shadow .15s;
}
.sv-alt-cta:hover{transform:translate(-2px,-2px);box-shadow:3px 3px 0 var(--bg)}

@media (prefers-reduced-motion:reduce){
  .sv-seg-opt, .sv-alt-cta{transition:none}
}
</style>
