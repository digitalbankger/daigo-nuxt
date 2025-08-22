import Lenis from '@studio-freight/lenis'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    duration: 0.4,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.2,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    infinite: false,
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
})
