<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  to: { type: [Number, String], required: true },
  duration: { type: Number, default: 1200 },
  suffix: { type: String, default: '' },
  prefix: { type: String, default: '' }
})

const display = ref(0)
const el = ref(null)

// supporta valori tipo "24h": estrae il numero e mantiene suffix
const num = Number(String(props.to).replace(/[^\d.]/g, '')) || 0
const autoSuffix = String(props.to).replace(/[\d.]/g, '')

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const format = (n) => {
  const int = Math.round(n)
  return int >= 1000 ? int.toLocaleString('it-IT') : String(int)
}

const run = () => {
  if (reducedMotion) {
    display.value = num
    return
  }
  const start = performance.now()
  const tick = (t) => {
    const p = Math.min(1, (t - start) / props.duration)
    const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
    display.value = num * eased
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        run()
        io.disconnect()
      }
    },
    { threshold: 0.4 }
  )
  io.observe(el.value)
})
</script>

<template>
  <span ref="el">{{ prefix }}{{ format(display) }}{{ suffix || autoSuffix }}</span>
</template>
