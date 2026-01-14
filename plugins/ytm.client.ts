export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.server) return
  (window as any).dataLayer = (window as any).dataLayer || []

  const { useYtm } = await import('@/composables/useYtm')
  const ytm = useYtm()
  const { useCartStore } = await import('@/stores/cartStore')
  const { useAuthStore } = await import('@/stores/authStore')

  const detectPageType = (path: string) => {
    if (path === '/' || path === '') return 'home'
    if (/^\/catalog(\/|$)/.test(path)) return 'category'
    if (/^\/catalog\/[^/]+$/.test(path)) return 'product'
    if (/^\/cart(\/|$)/.test(path)) return 'cart'
    if (/^\/order(\/|$)/.test(path)) return 'checkout'
    if (/\/(thanks|success|order-success)/.test(path)) return 'purchase'
    if (/^\/articles(\/|$)/.test(path)) return 'content'
    if (/^\/akcii(\/|$)|^\/promotions(\/|$)/.test(path)) return 'promolist'
    return 'other'
  }

  nuxtApp.hook('page:finish', async () => {
    const page_type = detectPageType(location.pathname)

    // user
    const auth = useAuthStore()
    const user = auth.isAuthenticated
      ? { user_id: String(auth.userId), user_type: 'user' as const }
      : { user_type: 'guest' as const }

    // cart
    const cartStore = useCartStore()
    await cartStore.ensureLoaded?.()
    const cart = {
      currency: 'RUB',
      total: cartStore.total ?? 0,
      count: cartStore.items.length,
      items: cartStore.items.map(i => ({
        id: i.id, name: i.title, price: i.price, quantity: i.quantity
      }))
    }

    ytm.setPageType(page_type, { user, cart })
  })
})
