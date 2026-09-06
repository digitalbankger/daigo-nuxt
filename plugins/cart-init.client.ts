import { defineNuxtPlugin } from '#app'
import { useCartStore } from '@/stores/cartStore'

export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore()

  // Не загружаем гостевую корзину ДО hydration.
  // Иначе SSR рендерит пустую корзину, а первый client render уже получает
  // реальные items и Vue видит другую DOM-структуру (CartBadge/ProductCard).
  // После app:mounted hydration уже завершена, и обновление store становится
  // обычным реактивным обновлением без mismatch.
  nuxtApp.hook('app:mounted', () => {
    if (!cart.isLoaded) {
      void cart.ensureLoaded()
    }
  })
})
