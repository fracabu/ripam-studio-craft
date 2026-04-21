import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { revealDirective } from './composables/useReveal.js'
import './assets/main.css'

const app = createApp(App)
app.use(router)
app.directive('reveal', revealDirective)
app.mount('#app')
