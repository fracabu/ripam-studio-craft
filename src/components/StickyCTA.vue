<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(false)
const onScroll = () => { visible.value = window.scrollY > 600 }

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const goToContatti = (e) => {
  e.preventDefault()
  router.push({ name: 'scrivimi' })
}
</script>

<template>
  <Transition name="sticky-fade">
    <div v-if="visible" class="sticky-cta" role="complementary">
      <div class="blurb">Una materia che non vedi? <strong>Ne parliamo insieme.</strong></div>
      <div class="actions">
        <a href="/scrivimi" class="a" @click="goToContatti">Scrivimi &rarr;</a>
        <a href="https://t.me/fcapurso" target="_blank" rel="noopener" class="a tg">Telegram &nearr;</a>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sticky-cta{
  position:fixed;left:0;right:0;bottom:0;z-index:40;
  background:var(--ink);color:var(--bg);
  border-top:2px solid var(--ink);
  padding:12px 24px;
  display:flex;align-items:center;justify-content:space-between;gap:18px;
  flex-wrap:wrap;
}
.blurb{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13.5px;letter-spacing:.05em;
}
.blurb strong{color:var(--acid);font-weight:700}
.actions{display:flex;gap:10px}
.a{
  font-family:"JetBrains Mono",ui-monospace,monospace;
  font-size:13px;font-weight:700;letter-spacing:.08em;
  padding:9px 14px;
  background:var(--acid);color:var(--ink);
  border:2px solid var(--bg);
  text-decoration:none;
  transition:transform .15s, box-shadow .15s;
}
.a:hover{transform:translate(-2px,-2px);box-shadow:3px 3px 0 var(--bg)}
.a.tg{background:var(--blue);color:var(--bg)}
@media (max-width:640px){
  .sticky-cta{padding:10px 14px;gap:10px}
  .blurb{font-size:13px;flex:1 1 100%;text-align:center}
  .actions{flex:1 1 100%;justify-content:center}
  .a{padding:8px 12px;font-size:12.5px}
}
.sticky-fade-enter-from,.sticky-fade-leave-to{opacity:0;transform:translateY(8px)}
.sticky-fade-enter-active,.sticky-fade-leave-active{transition:opacity .2s, transform .2s}
@media (prefers-reduced-motion:reduce){
  .sticky-fade-enter-active,.sticky-fade-leave-active{transition:none}
}
</style>
