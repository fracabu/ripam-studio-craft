<script setup>
const emit = defineEmits(['select'])
const bullets = [
  'Come alimentare NotebookLM per la materia che devi studiare',
  'Come scrivere prompt che tirano fuori il massimo',
  'Come generare podcast, flashcard, riassunti, quiz personalizzati',
  'Come iterare e raffinare fino al risultato che ti serve'
]
const include = [
  { ico:'📋', t:'Template prompt pronti' },
  { ico:'📝', t:'Checklist setup materia' },
  { ico:'🎥', t:'Registrazione della call' },
  { ico:'📬', t:'Follow-up scritto entro 48h' }
]
</script>

<template>
  <section id="coaching">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">CONSULENZA · COACHING 1:1</span>
        <h2>Un'ora con me. E sai come studiare con NotebookLM.</h2>
        <p>Se vuoi essere autonomo e non pagare materiali pronti, ti insegno a costruirli da solo. Direttamente con NotebookLM, sulla materia che ti serve.</p>
      </div>

      <div class="coaching-grid">
        <div v-reveal="'left'" class="coaching-box">
          <h3 class="coaching-h3">Cosa ti porti a casa</h3>
          <ul class="coaching-list">
            <li v-for="(b, i) in bullets" :key="i">
              <span class="coaching-chk">✓</span><span>{{ b }}</span>
            </li>
          </ul>
        </div>

        <div v-reveal="'right'" class="coaching-box coaching-include">
          <h3 class="coaching-h3">Incluso nel servizio</h3>
          <div class="coaching-grid-4">
            <div v-for="(i, k) in include" :key="k" class="coaching-inc">
              <div class="coaching-inc-ico">{{ i.ico }}</div>
              <span>{{ i.t }}</span>
            </div>
          </div>
          <button class="btn btn-primary" type="button" @click="emit('select', {prodotto:'Coaching NotebookLM 1:1'})">
            Richiedi uno slot →
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
