<script setup>
const fasce = [
  {
    k:'48h',
    tempo:'48 ore',
    t:'Materiali nel mio archivio',
    desc:'Se la materia che ti serve è già nel mio archivio e l\'ho già prodotta, te la invio in 48 ore dalla conferma. Esempio: Diritto Amministrativo.',
    accent:'acid'
  },
  {
    k:'settimana',
    tempo:'Prossimi slot',
    t:'Coaching NotebookLM 1:1',
    desc:'Prenoti uno slot disponibile — di solito entro la settimana. Ti mando link alla call, template preparati ad hoc sulla tua materia.',
    accent:'pink'
  },
  {
    k:'1-2sett',
    tempo:'1-2 settimane',
    t:'Materiali nuovi o molto personalizzati',
    desc:'Materie che non sono ancora nel mio archivio, o tagli molto specifici. Concordiamo insieme struttura e tempi prima di partire.',
    accent:'bg'
  },
  {
    k:'2-4sett',
    tempo:'2-4 settimane',
    t:'Web app e tool custom',
    desc:'Progetti di sviluppo: dipende dallo scope. Fase 1 = chiacchierata per capirlo, poi ti mando stima tempi e costi realistica.',
    accent:'blue'
  }
]
</script>

<template>
  <section id="tempi">
    <div class="wrap">
      <div v-reveal class="sec-head">
        <span class="sec-kicker">TEMPISTICHE</span>
        <h2>Onestà sui tempi: non tutto può essere pronto in 48 ore.</h2>
        <p>Dipende da cosa ti serve. Intanto qui sotto trovi i tempi indicativi per capirci — scrivendomi ti confermo quando potrei consegnarti quello che ti serve.</p>
      </div>

      <div v-reveal class="tempi stagger">
        <div v-for="f in fasce" :key="f.k" class="tempo-card" :class="`tempo-${f.accent}`">
          <div class="tempo-pill">{{ f.tempo }}</div>
          <h3 class="tempo-h3">{{ f.t }}</h3>
          <p class="tempo-desc">{{ f.desc }}</p>
        </div>
      </div>

      <div v-reveal class="tempo-note">
        <strong>Nessun muro</strong> — se hai urgenza o dubbi sui tempi, scrivi lo stesso: vediamo se e come fattibile.
      </div>
    </div>
  </section>
</template>
