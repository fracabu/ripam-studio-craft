<script setup>
import { RouterLink } from 'vue-router'
import { LEGAL_HOLDER } from '../data/legale.js'
</script>

<template>
  <footer class="ed-footer">
    <div class="ed-tape" aria-hidden="true"></div>

    <section class="ed-manifesto">
      <div class="ed-manifesto-in wrap">
        <div class="kk">MANIFESTO</div>
        <h2>Niente catalogo, niente carrello.<br>Materiali fatti <em>uno alla volta.</em></h2>
      </div>
    </section>

    <section class="ed-cols-wrap">
      <div class="wrap">
        <div class="ed-cols-in">
          <div class="ed-col">
            <h4>01 · STUDIO CRAFT</h4>
            <p class="lead-col">Quello che faccio qui, su misura.</p>
            <ul>
              <li><span class="ar">&rarr;</span><a href="/#materie">Materie di studio</a></li>
              <li><span class="ar">&rarr;</span><RouterLink to="/coaching">Coaching NotebookLM</RouterLink></li>
              <li><span class="ar">&rarr;</span><RouterLink to="/tool">Tool su misura</RouterLink></li>
              <li><span class="ar">&rarr;</span><RouterLink to="/quiz-pro">RIPAM Studio Quiz Pro</RouterLink></li>
              <li><span class="ar">&rarr;</span><RouterLink to="/chi-sono">Chi sono</RouterLink></li>
            </ul>
          </div>
          <div class="ed-col">
            <h4>02 · PARLIAMONE</h4>
            <p class="lead-col">Mi trovi qui, dove leggo davvero.</p>
            <ul>
              <li><span class="ar">&rarr;</span><RouterLink to="/scrivimi">Scrivimi (form)</RouterLink></li>
              <li><span class="ar">&nearr;</span><a href="https://t.me/fcapurso" target="_blank" rel="noopener">Telegram <span class="num">@FCAPURSO</span></a></li>
              <li><span class="ar">&nearr;</span><a :href="`mailto:${LEGAL_HOLDER.email}`">{{ LEGAL_HOLDER.email }}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="ed-bottom">
      <div class="ed-bottom-in wrap">
        <div class="ed-logo">
          <div class="ed-stamp" aria-hidden="true">R</div>
          <div class="ed-wm">
            <span class="ed-wm-name">Ripam Studio<em>Craft</em></span>
            <span class="ed-wm-tag">EST &middot; 2025 &middot; {{ LEGAL_HOLDER.citta.toUpperCase() }}</span>
          </div>
        </div>
        <div class="ed-legals">
          <div class="row1">
            <RouterLink to="/privacy">PRIVACY</RouterLink>
            <RouterLink to="/cookie-policy">COOKIE</RouterLink>
            <RouterLink to="/termini">TERMINI</RouterLink>
            <span class="piva">P. IVA {{ LEGAL_HOLDER.piva }}</span>
          </div>
          <div class="row2">&copy; {{ new Date().getFullYear() }} {{ LEGAL_HOLDER.nome }} &middot; Costruito a mano, una pagina alla volta.</div>
          <div class="row3">
            Ripam Studio Craft è un'attività privata di formazione e preparazione concorsi.
            Non è affiliato né collegato alla Commissione RIPAM, al Dipartimento della Funzione Pubblica
            o ad altri enti pubblici. I marchi e i nomi dei concorsi citati appartengono ai rispettivi enti.
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* :deep override delle regole footer{...} in main.css */
.ed-footer{
  margin-top:60px;
  padding:0 !important;
  background:transparent;
}
.ed-tape{
  height:18px;
  background:repeating-linear-gradient(45deg, var(--ink) 0 12px, var(--acid) 12px 24px);
  border-bottom:2px solid var(--ink);
}

.ed-manifesto{
  padding:80px 0 56px;
  background:var(--ink);color:var(--bg);
  border-bottom:2px solid var(--bg);
}
.ed-manifesto .kk{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  color:var(--acid);margin-bottom:24px;
}
.ed-manifesto h2{
  font-size:clamp(32px,5vw,68px);
  font-weight:700;letter-spacing:-.035em;line-height:1.0;
  margin:0;max-width:22ch;text-wrap:balance;
}
.ed-manifesto h2 em{
  font-style:normal;background:var(--acid);color:var(--ink);
  padding:0 .2em;box-decoration-break:clone;
}

.ed-cols-wrap{
  background:var(--ink);color:var(--bg);
  padding:0 0 56px;
}
.ed-cols-in{
  display:grid;grid-template-columns:repeat(2,1fr);
  border:2px solid var(--bg);
}
@media(max-width:880px){
  .ed-cols-in{grid-template-columns:1fr}
}
.ed-col{
  padding:28px 26px;
  border-right:2px solid var(--bg);
  display:flex;flex-direction:column;gap:14px;
}
.ed-col:last-child{border-right:0}
@media(max-width:880px){
  .ed-col{border-right:0;border-bottom:2px solid var(--bg)}
  .ed-col:last-child{border-bottom:0}
}
.ed-col h4{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.12em;
  margin:0 0 4px;color:var(--acid);
}
.ed-col .lead-col{
  font-size:20px;font-weight:700;letter-spacing:-.02em;line-height:1.15;
  margin:0;color:var(--bg);max-width:24ch;
}
.ed-col ul{
  list-style:none;margin:6px 0 0;padding:0;
  display:flex;flex-direction:column;gap:10px;
}
.ed-col ul li{display:flex;align-items:baseline;gap:10px}
.ed-col ul li .ar{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;color:var(--acid);
  flex:0 0 auto;
}
.ed-col ul li a{
  color:var(--bg);text-decoration:none;
  font-size:14.5px;line-height:1.4;
  border-bottom:1px solid transparent;transition:border-color .15s, color .15s;
}
.ed-col ul li a:hover{border-bottom-color:var(--acid);color:var(--acid)}
.ed-col ul li .num{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.06em;
  color:var(--bg);opacity:.55;margin-left:6px;
}

.ed-bottom{
  background:var(--ink);color:var(--bg);
  padding:32px 0 40px;
  border-top:2px solid var(--bg);
}
.ed-bottom-in{
  display:flex;justify-content:space-between;align-items:flex-end;
  gap:36px;flex-wrap:wrap;
}
.ed-logo{display:flex;align-items:center;gap:16px}
.ed-stamp{
  width:54px;height:54px;
  background:var(--acid);color:var(--ink);
  display:grid;place-items:center;
  font-weight:700;font-size:38px;letter-spacing:-.04em;line-height:.85;
  transform:rotate(-2.6deg);
  clip-path:polygon(3% 5%, 28% 4%, 56% 3%, 85% 4%, 98% 2%, 99% 16%, 100% 44%, 100% 72%, 99% 97%, 72% 97%, 44% 98%, 16% 97%, 4% 99%, 2% 86%, 1% 58%, 3% 16%);
  position:relative;
}
.ed-stamp::after{
  content:"";position:absolute;inset:0;
  background:
    radial-gradient(circle at 22% 28%, rgba(41,38,27,.22) 0 4%, transparent 5%),
    radial-gradient(circle at 78% 76%, rgba(41,38,27,.18) 0 3%, transparent 4%);
  pointer-events:none;
}
.ed-wm{display:flex;flex-direction:column;gap:6px;line-height:1}
.ed-wm-name{
  font-size:20px;font-weight:700;letter-spacing:-.02em;
  display:flex;align-items:baseline;gap:.32em;flex-wrap:wrap;
}
.ed-wm-name em{
  font-style:normal;background:var(--acid);color:var(--ink);
  padding:.04em .25em .08em;
}
.ed-wm-tag{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;font-weight:700;letter-spacing:.18em;
  color:var(--bg);opacity:.6;
}

.ed-legals{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
@media(max-width:640px){
  .ed-legals{align-items:flex-start;width:100%}
}
.ed-legals .row1{
  display:flex;gap:14px;flex-wrap:wrap;justify-content:flex-end;
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:11px;font-weight:700;letter-spacing:.06em;
}
.ed-legals .row1 a{
  color:var(--bg);text-decoration:none;
  border-bottom:1px solid rgba(245,240,232,.3);
  transition:border-color .15s, color .15s;
}
.ed-legals .row1 a:hover{border-bottom-color:var(--acid);color:var(--acid)}
.ed-legals .row1 .piva{color:var(--bg);opacity:.6}
.ed-legals .row2{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:10px;letter-spacing:.05em;
  color:var(--bg);opacity:.55;
}
.ed-legals .row3{
  max-width:62ch;text-align:right;
  font-size:10.5px;line-height:1.45;
  color:var(--bg);opacity:.5;
  margin-top:6px;
}
@media(max-width:640px){
  .ed-legals .row3{text-align:left}
}
@media(max-width:640px){
  .ed-legals .row1{justify-content:flex-start}
}
</style>
