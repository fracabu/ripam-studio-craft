<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { MATERIE } from '../data/materie.js'
import { CONCORSI } from '../data/formati.js'

const nome = ref('')
const email = ref('')
const concorso = ref('')
const prodotto = ref('')
const materia = ref('')
const note = ref('')
const privacy = ref(false) // consenso GDPR
const hp = ref('') // honeypot: se compilato, bot

const status = ref('idle') // idle | sending | sent | error
const errorMsg = ref('')

const prefill = (data = {}) => {
  if (data.concorso) concorso.value = data.concorso
  if (data.prodotto) prodotto.value = data.prodotto
  if (data.materia) materia.value = data.materia
  if (data.note) note.value = data.note
}
defineExpose({ prefill })

const submit = async (e) => {
  e.preventDefault()
  if (status.value === 'sending') return
  status.value = 'sending'
  errorMsg.value = ''

  try {
    const r = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        concorso: concorso.value,
        prodotto: prodotto.value,
        materia: materia.value,
        note: note.value,
        hp: hp.value
      })
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok || !data.ok) throw new Error(data.error || 'Errore invio')

    status.value = 'sent'
    nome.value = ''; email.value = ''; concorso.value = ''
    prodotto.value = ''; materia.value = ''; note.value = ''
    privacy.value = false
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err.message || 'Qualcosa è andato storto. Scrivimi direttamente a ripamstudiocraft@gmail.com'
  }
}

const reset = () => { status.value = 'idle'; errorMsg.value = '' }
</script>

<template>
  <section id="contatti">
    <div class="wrap">
      <div class="form-wrap">
        <div v-reveal="'left'" class="form-side">
          <span class="sec-kicker">PARLIAMOCI</span>
          <h3 style="margin-top:16px">Raccontami cosa ti serve.</h3>
          <p>Nessun pagamento anticipato, nessun carrello. Scrivimi cosa stai preparando o cosa non ti è chiaro: ti rispondo entro poche ore con domande, idee, proposte.</p>
          <p>Preferisci Telegram? È anche più veloce.</p>
          <a href="https://t.me/[USERNAME]" target="_blank" rel="noopener" class="tg">
            <span>📱</span> Scrivimi su Telegram
          </a>
        </div>

        <!-- FORM -->
        <form v-reveal="'right'" class="contact" @submit="submit">
          <div>
            <label for="f-nome">Il tuo nome</label>
            <input id="f-nome" v-model="nome" type="text" required placeholder="Mario Rossi" :disabled="status==='sending'" />
          </div>
          <div>
            <label for="f-email">Email</label>
            <input id="f-email" v-model="email" type="email" required placeholder="mario.rossi@email.it" :disabled="status==='sending'" />
          </div>
          <div class="form-row">
            <div>
              <label for="f-concorso">Concorso</label>
              <select id="f-concorso" v-model="concorso" required :disabled="status==='sending'">
                <option value="">Seleziona...</option>
                <option v-for="c in CONCORSI" :key="c">{{ c }}</option>
                <option>Altro</option>
              </select>
            </div>
            <div>
              <label for="f-prodotto">Cosa ti interessa</label>
              <select id="f-prodotto" v-model="prodotto" required :disabled="status==='sending'">
                <option value="">Seleziona...</option>
                <optgroup label="Formazione">
                  <option>Podcast</option>
                  <option>Video</option>
                  <option>Report</option>
                  <option>Manuale Completo</option>
                  <option>Simulatore Custom</option>
                  <option>Bundle materia</option>
                  <option>Bundle concorso</option>
                </optgroup>
                <optgroup label="Consulenza">
                  <option>Coaching NotebookLM 1:1</option>
                </optgroup>
                <optgroup label="Sviluppo tool">
                  <option>Web App Mono-Materia</option>
                  <option>Simulatore Custom (white-label)</option>
                  <option>Tool di studio personalizzato</option>
                </optgroup>
                <optgroup label="Servizi di produzione">
                  <option>Servizio: Testo → Podcast</option>
                  <option>Servizio: Audio → Testo</option>
                </optgroup>
                <option>Altro / da valutare insieme</option>
              </select>
            </div>
          </div>
          <div>
            <label for="f-materia">Materia di interesse</label>
            <select id="f-materia" v-model="materia" :disabled="status==='sending'">
              <option value="">Seleziona (opzionale)...</option>
              <option v-for="m in MATERIE" :key="m.slug" :value="m.t">{{ m.t }}</option>
            </select>
          </div>
          <div>
            <label for="f-note">Note</label>
            <textarea id="f-note" v-model="note" placeholder="Qualsiasi cosa utile per rispondere meglio..." :disabled="status==='sending'"></textarea>
          </div>

          <label class="privacy-check">
            <input v-model="privacy" type="checkbox" required :disabled="status==='sending'" />
            <span>Ho letto la <RouterLink to="/privacy" target="_blank">Privacy Policy</RouterLink> e acconsento al trattamento dei miei dati per rispondere a questa richiesta.</span>
          </label>

          <!-- honeypot nascosto: bot lo compilano, umani no -->
          <input v-model="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp-field" />

          <button type="submit" :disabled="status==='sending' || !privacy">
            <span v-if="status==='sending'">Invio in corso...</span>
            <span v-else>Scrivimi →</span>
          </button>

          <p v-if="status==='error'" class="form-err">{{ errorMsg }}</p>
          <p v-else class="form-note">Nessun pagamento anticipato. Risposta entro poche ore.</p>
        </form>
      </div>
    </div>

    <!-- MODAL SUCCESS -->
    <transition name="modal">
      <div v-if="status==='sent'" class="modal-backdrop" @click.self="reset" role="dialog" aria-modal="true">
        <div class="modal-card">
          <div class="modal-ico">✓</div>
          <h3 class="modal-title">Richiesta inviata!</h3>
          <p class="modal-text">Grazie, <strong>ho ricevuto la tua richiesta</strong>. Ti rispondo entro poche ore con domande, idee o una proposta concreta — direttamente all'email che mi hai dato.</p>
          <p class="modal-text" style="opacity:0.8;font-size:14px">Nel frattempo, se vuoi, puoi anche scrivermi su Telegram.</p>
          <button type="button" class="btn btn-primary modal-btn" @click="reset">Perfetto, chiudi →</button>
        </div>
      </div>
    </transition>
  </section>
</template>
