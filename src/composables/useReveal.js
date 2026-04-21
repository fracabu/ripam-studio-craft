// Singleton IntersectionObserver + Vue directive `v-reveal`.
// Uso: <div v-reveal> o v-reveal:up:.delay-200
// Modificatori supportati nelle classi: .reveal-up, .reveal-left, .reveal-right,
// .reveal-pop, .reveal-tilt, .delay-100..800

let io
const ensureObserver = () => {
  if (io) return io
  io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
  )
  return io
}

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const revealDirective = {
  mounted(el, binding) {
    if (reducedMotion()) {
      el.classList.add('in')
      return
    }
    el.classList.add('reveal')
    if (binding.arg) el.classList.add(`reveal-${binding.arg}`)
    const delay = Object.keys(binding.modifiers || {}).find(k => k.startsWith('d'))
    if (delay) el.classList.add(delay.replace('d', 'delay-'))
    ensureObserver().observe(el)
  },
  unmounted(el) {
    io?.unobserve(el)
  }
}
