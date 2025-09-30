import { defineNuxtPlugin } from '#app'
import { useCartStore } from '@/stores/cartStore'

export default defineNuxtPlugin(async () => {
  const cart = useCartStore()
  if (!cart.isLoaded) await cart.ensureLoaded()
})
