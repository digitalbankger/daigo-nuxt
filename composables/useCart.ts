import { useCartStore } from '~/stores/cartStore'


export const useCart = () => {
  const store = useCartStore()

  const cartItems = computed(() => store.items)
  const gifts = computed(() => store.gifts)
  const total = computed(() =>
    store.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  const addToCart = async (product: {
    id: number
    title: string
    price: number
    image: string
    subtitle?: string
  }, quantity = 1) => {
    const existing = store.items.find(i => i.id === product.id)

    if (existing) {
      await store.updateItem(product.id, existing.quantity + quantity)
    } else {
      const newItem = {
        ...product,
        quantity
      }
      store.items.push(newItem)

      if (!store.isAuthenticated) {
        store.saveToLocal()
      } else {
        await $fetch('/api/cart/update', {
          method: 'POST',
          body: { id: product.id, quantity }
        })
      }
    }
  }

  return {
    cartItems,
    gifts,
    total,
    addToCart,
    updateItem: store.updateItem,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    loadCart: store.loadCart
  }
}
