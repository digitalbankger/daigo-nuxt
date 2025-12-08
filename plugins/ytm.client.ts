import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  ;(window as any).dataLayer = (window as any).dataLayer || []
})
