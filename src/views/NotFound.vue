<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const path = ref('—')
const referrer = ref('DIRETTO')
const ts = ref('')

onMounted(() => {
  path.value = window.location.pathname || '/'
  if (document.referrer) {
    try {
      const u = new URL(document.referrer)
      referrer.value = u.host || 'DIRETTO'
    } catch {
      referrer.value = 'DIRETTO'
    }
  }
  const d = new Date()
  ts.value = d.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'medium' })
})
</script>

<template>
  <main id="main" class="nf-page">
    <section class="nf-hero">
      <div class="wrap nf-hero-grid">
        <div>
          <div class="nf-badge">ERRORE &middot; 404</div>
          <div class="nf-num" aria-hidden="true">
            <span class="d d-out">4</span><span class="d d-fill">0</span><span class="d d-out d-rot">4</span>
          </div>
          <h1 class="nf-h1">
            Questa pagina <span class="hl-acid">non esiste</span>,
            oppure non è ancora stata scritta a mano.
          </h1>
          <p class="nf-sub">
            Costruisco le pagine una alla volta. Quella che cercavi non l'ho ancora fatta —
            o l'URL ha qualcosa che non torna.
          </p>
          <div class="nf-ctas">
            <RouterLink to="/" class="btn btn-primary">Torna alla home &rarr;</RouterLink>
            <RouterLink to="/scrivimi" class="btn btn-secondary">Dimmi cosa cercavi &rarr;</RouterLink>
          </div>
        </div>

        <aside class="nf-receipt" aria-label="Diagnostica richiesta">
          <div class="nf-receipt-top"></div>
          <div class="nf-receipt-body">
            <div class="r-row r-status"><span>STATUS</span><span>404 NOT FOUND</span></div>
            <div class="r-sep"></div>
            <div class="r-row"><span>RICHIESTA</span><span class="r-mono">{{ path }}</span></div>
            <div class="r-row"><span>PROVENIENZA</span><span class="r-mono">{{ referrer }}</span></div>
            <div class="r-row"><span>SERVER</span><span class="r-ok">ONLINE</span></div>
            <div class="r-sep"></div>
            <div class="r-block">
              <div class="r-h">POSSIBILI CAUSE</div>
              <ul>
                <li>1. Link vecchio o rotto</li>
                <li>2. Pagina non ancora pubblicata</li>
                <li>3. Refuso nell'indirizzo</li>
              </ul>
            </div>
            <div class="r-sep"></div>
            <div class="r-row r-tot">
              <span>SOLUZIONE</span><span>&rarr; SCRIVIMI</span>
            </div>
            <div class="r-bar" aria-hidden="true"></div>
            <div class="r-ts">{{ ts }}</div>
          </div>
          <div class="nf-receipt-bot"></div>
        </aside>
      </div>
    </section>

    <section class="nf-suggest">
      <div class="wrap">
        <div class="nf-kicker">FORSE STAVI CERCANDO</div>
        <div class="nf-cards">
          <RouterLink to="/#materie" class="nf-card">
            <div class="nf-card-num">01</div>
            <h3>Materie</h3>
            <p>Indice delle materie su cui posso lavorare con te.</p>
            <span class="nf-arrow">&rarr;</span>
          </RouterLink>
          <RouterLink to="/#coaching" class="nf-card">
            <div class="nf-card-num">02</div>
            <h3>Coaching</h3>
            <p>Un'ora con me per imparare a usare NotebookLM sulla tua materia.</p>
            <span class="nf-arrow">&rarr;</span>
          </RouterLink>
          <RouterLink to="/scrivimi" class="nf-card">
            <div class="nf-card-num">03</div>
            <h3>Scrivimi</h3>
            <p>Form di contatto. Rispondo entro 24h.</p>
            <span class="nf-arrow">&rarr;</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.nf-page{padding-bottom:80px;position:relative;z-index:1}

.nf-hero{padding:80px 0 60px;border-bottom:2px solid var(--ink)}
.nf-hero-grid{
  display:grid;grid-template-columns:1.3fr 1fr;gap:50px;align-items:start;
}
@media(max-width:880px){.nf-hero-grid{grid-template-columns:1fr;gap:36px}}

.nf-badge{
  display:inline-block;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.12em;
  padding:6px 10px;background:var(--acid);border:2px solid var(--ink);
  margin-bottom:28px;
}
.nf-num{
  display:flex;gap:8px;align-items:flex-end;
  font-weight:700;line-height:.9;letter-spacing:-.06em;
  font-size:clamp(96px,18vw,200px);
  margin-bottom:24px;
}
.nf-num .d{display:inline-block}
.nf-num .d-fill{background:var(--acid);color:var(--ink);padding:0 .04em;box-shadow:6px 6px 0 var(--ink);transform:rotate(-2deg)}
.nf-num .d-out{
  -webkit-text-stroke:3px var(--ink);color:transparent;
}
.nf-num .d-rot{transform:rotate(4deg)}

.nf-h1{
  font-size:clamp(26px,3.5vw,40px);font-weight:700;letter-spacing:-.03em;
  line-height:1.1;margin:0 0 16px;text-wrap:balance;max-width:30ch;
}
.hl-acid{background:var(--acid);color:var(--ink);padding:0 .15em;box-decoration-break:clone}
.nf-sub{font-size:16px;line-height:1.55;color:var(--ink-soft,#2a2a2a);max-width:54ch;margin:0 0 22px}
.nf-ctas{display:flex;gap:14px;flex-wrap:wrap}

/* RECEIPT */
.nf-receipt{
  background:var(--bg);border:2px solid var(--ink);
  box-shadow:10px 10px 0 var(--ink);
  transform:rotate(1.2deg);
  position:relative;
}
.nf-receipt-top, .nf-receipt-bot{
  height:14px;
  background:repeating-linear-gradient(135deg, var(--ink) 0 4px, var(--bg) 4px 10px);
  border-bottom:2px solid var(--ink);
}
.nf-receipt-bot{border-bottom:0;border-top:2px solid var(--ink)}
.nf-receipt-body{padding:20px 22px}
.r-row{
  display:flex;justify-content:space-between;gap:12px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.05em;
  padding:6px 0;
}
.r-status{font-size:14.5px;color:#c63d3d}
.r-mono{opacity:.85;word-break:break-all;max-width:60%;text-align:right}
.r-ok{color:#1aa06b}
.r-sep{height:0;border-top:2px dashed var(--ink);margin:8px 0}
.r-block{padding:6px 0}
.r-block .r-h{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;font-weight:700;letter-spacing:.08em;color:var(--ink);opacity:.6;
  margin-bottom:6px;
}
.r-block ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px}
.r-block ul li{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;letter-spacing:.04em;
}
.r-tot{
  background:var(--acid);padding:10px 12px;border:2px solid var(--ink);
  margin-top:8px;font-size:14.5px;
}
.r-bar{
  height:36px;margin-top:14px;
  background:repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 4px, var(--ink) 4px 5px, transparent 5px 9px);
}
.r-ts{
  margin-top:8px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:12.5px;letter-spacing:.06em;opacity:.6;text-align:right;
}

/* SUGGEST */
.nf-suggest{padding:64px 0 0}
.nf-kicker{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.12em;
  color:var(--muted,#6b6458);margin-bottom:18px;
}
.nf-cards{
  display:grid;grid-template-columns:repeat(3,1fr);gap:18px;
}
@media(max-width:720px){.nf-cards{grid-template-columns:1fr}}
.nf-card{
  display:block;
  border:2px solid var(--ink);background:var(--bg);
  padding:22px;box-shadow:3px 3px 0 var(--ink);
  text-decoration:none;color:var(--ink);
  transition:transform .15s, box-shadow .15s, background .15s;
  position:relative;
}
.nf-card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 var(--ink);background:var(--acid)}
.nf-card-num{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.1em;opacity:.6;margin-bottom:8px;
}
.nf-card h3{font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 8px}
.nf-card p{font-size:14px;line-height:1.5;margin:0 0 18px;color:var(--ink-soft,#2a2a2a)}
.nf-arrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:700}
</style>
