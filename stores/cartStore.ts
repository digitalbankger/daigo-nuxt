import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { cartService } from '~/services/cartService'

export interface CartItem {
  id: number
  title: string
  subtitle?: string
  price: number
  oldPrice?: number
  quantity: number
  image: string
  tag?: string
}

export interface CartGift {
  id: number
  title: string
  image: string
  note?: string
}

export interface PromoNotice {
  type?: 'discount' | 'code' | '2+1'
  discount?: number
  couponName?: string
  productName: string
  endTime: string
}

export interface UserForm {
  fullName: string
  phone: string
}

export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()
  const userStore = useUserStore()

  // state
  const items = ref<CartItem[]>([])
  const gifts = ref<CartGift[]>([])
  const promoNotice = ref<PromoNotice | null>(null)
  // sessionID гостя (храним только на клиенте)
  const guestSessionId = ref<string | null>(
    process.client ? localStorage.getItem('guest_session_id') : null
  )
  // форма для неавторизованного
  const userForm = ref<UserForm>({ fullName: '', phone: '' })

  // время окончания акции (для счётчика)
  const daysLeft = computed(() => {
    if (!promoNotice.value?.endTime) return null
    const end = new Date(promoNotice.value.endTime)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  })

  const isAuthenticated = computed(() => auth.isAuthenticated)

  /** Получить/создать sessionID для гостя (только на клиенте) */
  function ensureGuestSession() {
    if (!guestSessionId.value) {
      if (process.client) {
        const id = crypto.randomUUID()
        guestSessionId.value = id
        localStorage.setItem('guest_session_id', id)
      }
    }
    return guestSessionId.value!
  }

  /** Загрузка корзины */
  async function loadCart() {
    try {
      if (isAuthenticated.value && auth.userId) {
        const data: any = await cartService.getUserCart(auth.userId)
        const mapped = (data.items || []).map((i: any) => ({
          id: i.product_id,
          title: i.title || i.name,
          subtitle: i.subtitle || '',
          price: i.price,
          oldPrice: i.old_price,
          quantity: i.quantity,
          image: i.image || '',
          tag: i.tag
        }))
        // сортируем по id для стабильного порядка
        items.value = mapped.sort((a, b) => {
          const idA = String(a.id)
          const idB = String(b.id)
          return idA < idB ? -1 : idA > idB ? 1 : 0
        })
        gifts.value = data.gifts || []
        promoNotice.value = data.promo_notice || null
      } else {
        // аналогично для гостя
        if (process.server) {
          items.value = []
          gifts.value = []
          promoNotice.value = null
          return
        }
        const sid = ensureGuestSession()
        const data: any = await cartService.getGuestCart(sid)
        const mapped = (data.items || []).map((i: any) => ({
          id: i.product_id,
          title: i.title || i.name,
          subtitle: i.subtitle || '',
          price: i.price,
          oldPrice: i.old_price,
          quantity: i.quantity,
          image: i.image || '',
          tag: i.tag
        }))
        items.value = mapped.sort((a, b) => {
          const idA = String(a.id)
          const idB = String(b.id)
          return idA < idB ? -1 : idA > idB ? 1 : 0
        })
        gifts.value = data.gifts || []
        promoNotice.value = data.promo_notice || null
      }
    } catch (e: any) {
      // Если сессии нет на бэкенде (404), очищаем состояние и sessionID
      if (e?.response?.status === 404) {
        items.value = []
        gifts.value = []
        promoNotice.value = null
        if (process.client) {
          localStorage.removeItem('guest_session_id')
        }
        guestSessionId.value = null
      } else {
        console.warn('Ошибка при загрузке корзины', e)
      }
    }
  }

  /** Добавление товара */
  async function addToCart(item: CartItem) {
    // сначала обновляем локальный массив, чтобы UI сразу переключился
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push({ ...item })
    }

    if (isAuthenticated.value && auth.userId) {
      await cartService.addUserItem(auth.userId, item.id, item.quantity)
    } else {
      const sid = ensureGuestSession()
      await cartService.addGuestItem(sid, item.id, item.quantity)
    }
    await loadCart()
  }

  /** Обновление количества */
  async function updateItem(id: number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }
    // обновляем локальный массив
    const existing = items.value.find(i => i.id === id)
    if (existing) {
      existing.quantity = quantity
    }
    if (isAuthenticated.value && auth.userId) {
      await cartService.updateUserItem(auth.userId, id, quantity)
    } else {
      const sid = ensureGuestSession()
      await cartService.updateGuestItem(sid, id, quantity)
    }
    await loadCart()
  }

  /** Удалить товар */
  async function removeItem(id: number) {
    // локально убираем
    items.value = items.value.filter(i => i.id !== id)
    if (isAuthenticated.value && auth.userId) {
      await cartService.removeUserItem(auth.userId, id)
    } else {
      const sid = ensureGuestSession()
      await cartService.removeGuestItem(sid, id)
    }
    await loadCart()
  }

  /** Очистить корзину */
  async function clearCart() {
    if (isAuthenticated.value && auth.userId) {
      await cartService.clearUserCart(auth.userId)
    } else {
      const sid = ensureGuestSession()
      await cartService.clearGuestCart(sid)
      // сбрасываем sessionID и корзину
      if (process.client) {
        localStorage.removeItem('guest_session_id')
      }
      guestSessionId.value = null
    }
    items.value = []
    gifts.value = []
    promoNotice.value = null
  }

  /** Применить промокод */
  async function applyCoupon(code: string) {
    if (!code.trim()) return
    if (isAuthenticated.value && auth.userId) {
      const res: any = await cartService.applyUserCoupon(auth.userId, code)
      promoNotice.value = res.promo_notice || null
    } else {
      const sid = ensureGuestSession()
      const res: any = await cartService.applyGuestCoupon(sid, code)
      promoNotice.value = res.promo_notice || null
    }
    await loadCart()
  }

  /** Удалить промокод */
  async function removeCoupon() {
    if (isAuthenticated.value && auth.userId) {
      await cartService.removeUserCoupon(auth.userId)
    } else {
      const sid = ensureGuestSession()
      await cartService.removeGuestCoupon(sid)
    }
    promoNotice.value = null
    await loadCart()
  }

  /**
   * Предварительное оформление. Формирует тело запроса:
   * - для авторизованного пользователя берёт имя/телефон из профиля;
   * - для гостя использует введённые в форме данные.
   */
  async function preOrder() {
    if (isAuthenticated.value && auth.userId) {
      // берём только имя из профиля
      const profile = userStore.profile
      const fio = profile?.first_name || userForm.value.fullName
      const phone = profile?.phone_number || userForm.value.phone
      await cartService.preOrderUser(auth.userId, fio, phone)
    } else {
      const sid = ensureGuestSession()
      const fio = userForm.value.fullName
      const phone = userForm.value.phone
      await cartService.preOrderGuest(sid, fio, phone)
    }
  }

  return {
    items,
    gifts,
    promoNotice,
    userForm,
    daysLeft,
    isAuthenticated,
    loadCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    preOrder,
  }
})
