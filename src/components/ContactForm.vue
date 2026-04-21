<script setup>
import { ref } from 'vue'
import { MATERIE } from '../data/materie.js'
import { CONCORSI } from '../data/formati.js'

const EMAIL = 'hello@ripamstudio.it' // TODO: sostituire con email reale

const nome = ref('')
const email = ref('')
const concorso = ref('')
const prodotto = ref('')
const materia = ref('')
const note = ref('')

const prefill = (data = {}) => {
  if (data.concorso) concorso.value = data.concorso
  if (data.prodotto) prodotto.value = data.prodotto
  if (data.materia) materia.value = data.materia
  if (data.note) note.value = data.note
}
defineExpose({ prefill })

const submit = (e) => {
  e.preventDefault()
  const subject = `Richiesta materiali — ${prodotto.value} (${concorso.value})`
  const body =
`Ciao,
sono interessato al seguente materiale:

• Nome: ${nome.value}
• Email: ${email.value}
• Concorso: ${concorso.value}
• Materia: ${materia.value || '—'}
• Prodotto: ${prodotto.value}

Note:
${note.value || '—'}

Grazie!`
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
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
        <form v-reveal="'right'" class="contact" @submit="submit">
          <div>
            <label for="f-nome">Il tuo nome</label>
            <input id="f-nome" v-model="nome" type="text" required placeholder="Mario Rossi" />
          </div>
          <div>
            <label for="f-email">Email</label>
            <input id="f-email" v-model="email" type="email" required placeholder="mario.rossi@email.it" />
          </div>
          <div class="form-row">
            <div>
              <label for="f-concorso">Concorso</label>
              <select id="f-concorso" v-model="concorso" required>
                <option value="">Seleziona...</option>
                <option v-for="c in CONCORSI" :key="c">{{ c }}</option>
                <option>Altro</option>
              </select>
            </div>
            <div>
              <label for="f-prodotto">Prodotto</label>
              <select id="f-prodotto" v-model="prodotto" required>
                <option value="">Seleziona...</option>
                <optgroup label="Formazione">
                  <option>Podcast</option>
                  <option>Video</option>
                  <option>Report</option>
                  <option>Simulatore Custom</option>
                  <option>Bundle materia</option>
                  <option>Bundle concorso</option>
                  <option>Bundle Omnia</option>
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
            <select id="f-materia" v-model="materia">
              <option value="">Seleziona (opzionale)...</option>
              <option v-for="m in MATERIE" :key="m.slug" :value="m.t">{{ m.t }}</option>
            </select>
          </div>
          <div>
            <label for="f-note">Note</label>
            <textarea id="f-note" v-model="note" placeholder="Qualsiasi cosa utile per rispondere meglio..."></textarea>
          </div>
          <button type="submit">Scrivimi →</button>
          <p class="form-note">Nessun pagamento anticipato. Risposta entro poche ore.</p>
        </form>
      </div>
    </div>
  </section>
</template>
