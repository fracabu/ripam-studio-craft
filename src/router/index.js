import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Materia from '../views/Materia.vue'
import Legale from '../views/Legale.vue'
import About from '../views/About.vue'
import Coaching from '../views/Coaching.vue'
import Tool from '../views/Tool.vue'
import Scrivimi from '../views/Scrivimi.vue'
import Anteprime from '../views/Anteprime.vue'
import Iscriviti from '../views/Iscriviti.vue'
import ReportCustom from '../views/ReportCustom.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/chi-sono', name: 'about', component: About },
    { path: '/coaching', name: 'coaching', component: Coaching },
    { path: '/tool', name: 'tool', component: Tool },
    { path: '/scrivimi', name: 'scrivimi', component: Scrivimi },
    // Rotta dedicata per la richiesta credenziali Quiz Pro: stesso componente
    // di /scrivimi ma in modalità bloccata (meta.tipo). URL linkabile/condivisibile.
    { path: '/quiz-pro', name: 'quiz-pro', component: Scrivimi, meta: { tipo: 'quiz-pro' } },
    { path: '/materia/:slug', name: 'materia', component: Materia, props: true },
    // Landing condivisibile per materia (link puliti per Telegram): 1 CTA → modale opt-in
    { path: '/anteprime/:slug', name: 'anteprime', component: Anteprime, props: true },
    // Landing iscrizione newsletter (link pulito /newsletter per i post social)
    { path: '/newsletter', name: 'newsletter', component: Iscriviti },
    { path: '/report-custom', name: 'report-custom', component: ReportCustom },
    { path: '/privacy', name: 'privacy', component: Legale, props: { slug: 'privacy' }, meta: { slug: 'privacy' } },
    { path: '/cookie-policy', name: 'cookie-policy', component: Legale, props: { slug: 'cookie-policy' }, meta: { slug: 'cookie-policy' } },
    { path: '/termini', name: 'termini', component: Legale, props: { slug: 'termini' }, meta: { slug: 'termini' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Hash-scroll cross-page: navigando da un'altra pagina la sezione target
    // non è ancora nel DOM quando scrollBehavior gira (il componente Home si
    // monta dopo la transizione). Aspettiamo che l'elemento compaia, poi
    // scrolliamo — altrimenti si resta in cima alla home (bug "ogni tanto va
    // a home ogni tanto al pilastro").
    if (to.hash) {
      return new Promise((resolve) => {
        const tryScroll = (attempt = 0) => {
          const el = document.querySelector(to.hash)
          if (el) resolve({ el: to.hash, behavior: 'smooth' })
          else if (attempt < 60) requestAnimationFrame(() => tryScroll(attempt + 1))
          else resolve({ top: 0 })
        }
        tryScroll()
      })
    }
    return { top: 0 }
  }
})

export default router
