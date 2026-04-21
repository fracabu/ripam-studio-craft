import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Materia from '../views/Materia.vue'
import Legale from '../views/Legale.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/materia/:slug', name: 'materia', component: Materia, props: true },
    { path: '/privacy', name: 'privacy', component: Legale, props: { slug: 'privacy' }, meta: { slug: 'privacy' } },
    { path: '/cookie-policy', name: 'cookie-policy', component: Legale, props: { slug: 'cookie-policy' }, meta: { slug: 'cookie-policy' } },
    { path: '/termini', name: 'termini', component: Legale, props: { slug: 'termini' }, meta: { slug: 'termini' } }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

export default router
