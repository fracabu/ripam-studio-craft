<script setup>
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const goMateria = () => router.push({ name: 'materia', params: { slug: 'contratti-pubblici' } })

</script>

<template>
  <section class="hero hero-anim">
    <div class="wrap">
      <div class="hero-grid hero-grid-v2">
        <div>
          <h1>Studia solo quello che <span class="hl">serve.</span></h1>
          <p class="hero-sub">Per il tuo concorso pubblico, solo l'essenziale di ogni materia: preso dalla normativa ufficiale e revisionato a mano. Niente sbobine infinite, niente pagine che non leggerai.</p>
          <div class="hero-ctas">
            <RouterLink to="/scrivimi" class="btn btn-primary">Scrivimi &rarr;</RouterLink>
          </div>
          <div class="hero-mono">
            &#9201; Rispondo entro 24h &middot; nessun pagamento anticipato richiesto
          </div>
        </div>

        <aside class="demo-card" aria-label="Il dossier completo di un bando">
          <img class="dossier-cover" src="/preview/dossier-cover.png"
               alt="Copertina del dossier completo MiC 1.800 Codice 01" loading="lazy" width="909" height="1287">
          <div class="dossier-facts">
            <span><b>16</b> report</span>
            <span><b>839</b> pagine</span>
            <span><b>1</b> volume</span>
          </div>
          <RouterLink to="/scrivimi?tipo=materia" class="dossier-cta">Chiedi l'anteprima &rarr;</RouterLink>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-grid-v2{
  display:grid;
  grid-template-columns:1.4fr 1fr;
  gap:60px;
  align-items:center;
}

/* Un solo CTA dominante: "Scrivimi" primario, più grande (la prova è il player). */
.hero-ctas .btn-primary{padding:18px 36px;font-size:18px}
@media(max-width:880px){
  .hero-grid-v2{grid-template-columns:1fr;gap:32px}
}

.hero-mono{
  margin-top:18px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;color:var(--muted,#6b6458);
  letter-spacing:.05em;
}

.dossier-cover{
  width:100%; display:block; height:auto;
  border:2px solid var(--ink); box-shadow:6px 6px 0 var(--ink);
}
.dossier-facts{
  display:flex; justify-content:space-between; gap:8px; margin:14px 0 12px;
  font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted,#6b6458);
}
.dossier-facts b{ font-size:17px; color:var(--ink); display:block; }
.dossier-cta{
  display:block; text-align:center; padding:11px 14px; font-weight:700; font-size:14px;
  border:2px solid var(--ink); background:var(--acid,#c6f432); color:var(--ink);
  text-decoration:none; box-shadow:3px 3px 0 var(--ink);
}
.dossier-cta:hover{ transform:translate(1px,1px); box-shadow:2px 2px 0 var(--ink); }
.demo-card{
  padding:22px 22px 18px;
  border:2px solid var(--ink);
  background:var(--bg);
  box-shadow:6px 6px 0 var(--ink);
  display:flex;flex-direction:column;gap:14px;
}
.demo-fallback a{color:var(--ink);text-decoration:underline;font-weight:700}
.demo-pills{
  display:flex;flex-wrap:wrap;gap:6px;
}
.demo-pills span{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  padding:5px 8px;border:2px solid var(--ink);
  background:var(--bg);color:var(--ink);
}
</style>
