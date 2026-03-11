import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { cartService } from '~/services/cartService'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '@/composables/useYtm'
import { getCouponApplyMessage, isCouponApplySuccess } from '~/utils/coupon'

export interface CartItem {
  id: string | number
  title: string
  subtitle?: string
  price: number
  oldPrice?: number
  originalPrice?: number
  quantity: number
  image: string
  tag?: string
}

export interface CartGift {
  id: number | string
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

// ➕ Информация о купоне из ответа бэка
export interface CouponInfo {
  id?: number
  code?: string
  applied?: boolean
  discount_percent?: number
  discount_amount?: number
}

export interface CartCoupon {
  id?: number
  code?: string
  applied?: boolean
  discount_percent?: number
  discount_amount?: number
  is_stackable?: boolean
  type?: string
}

export const useCartStore = defineStore('cart', () => {
  const analytics = useAnalytics()
  const auth = useAuthStore()
  const userStore = useUserStore()
  const ytm = useYtm()

  // --- state ---
  const items = ref<CartItem[]>([])
  const gifts = ref<CartGift[]>([])
  const promoNotice = ref<PromoNotice | null>(null)
  const isLoaded = ref(false)

  // Новые итоговые поля из бэка (с запасными значениями)
  const subtotal = ref<number>(0)        // сумма без скидки
  const total = ref<number>(0)           // итог со скидкой
  const discountAmount = ref<number>(0)  // абсолютная скидка в рублях
  const remarketingDiscountAmount = ref<number>(0)
  const exhibitionDiscountAmount = ref<number>(0)
  const couponInfo = ref<CouponInfo | null>(null)
  const coupons = ref<CartCoupon[]>([])

  // 🆕 VIP-скидка
  const vipDiscountAmount = ref<number>(0)
  const vipDiscountPercent = ref<number | null>(null)

  // sessionID гостя (храним только на клиенте)
  const guestSessionId = ref<string | null>(
    process.client ? localStorage.getItem('guest_session_id') : null
  )

  // форма для гостя (для старта авторизации из корзины)
  const userForm = ref<UserForm>({ fullName: '', phone: '' })

  const daysLeft = computed(() => {
    if (!promoNotice.value?.endTime) return null
    const end = new Date(promoNotice.value.endTime)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  })

  const isAuthenticated = computed(() => auth.isAuthenticated)
  const userId = computed(() => auth.userId)

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

  function mapApiItem(i: any): CartItem {
    const price = Number(i.price ?? 0)

    const original =
      i.original_price ?? i.originalPrice ?? i.old_price ?? i.oldPrice ?? null

    const originalPrice = original != null ? Number(original) : undefined

    return {
      id: i.product_id,
      title: i.title || i.name,
      subtitle: i.subtitle || '',
      price,
      originalPrice:
        originalPrice != null && originalPrice > price ? originalPrice : undefined,
      oldPrice: i.old_price != null ? Number(i.old_price) : undefined,
      quantity: Number(i.quantity ?? 0),
      image: i.image || '',
      tag: i.tag,
    }
  }

  /** Приведение CartItem → ProductObject для YTM */
  function toYtmProduct(it: CartItem) {
    return {
      id: String(it.id),
      name: it.title,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      category: it.tag ? [it.tag] : undefined,
      url: `/catalog/${it.id}`,
      image_url: it.image || undefined
    }
  }

  const itemsCount = computed(() =>
    items.value.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
  )
  const itemsUniqueCount = computed(() => items.value.length)

  /** Применить состояние корзины с сервера + безопасные фоллбеки */
  function applyServerCartState(data: any) {
    const mapped = (data?.items || []).map(mapApiItem)
    items.value = mapped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
    gifts.value = data?.gifts || []
    promoNotice.value = data?.promo_notice || null

    // Итоги
    const calcSubtotal = mapped.reduce((s, it) => s + it.price * it.quantity, 0)
    subtotal.value = Number(data?.subtotal ?? calcSubtotal)

    // если на бэке прислали discount_amount — используем, иначе 0
    discountAmount.value = Number(data?.discount_amount ?? 0)

    remarketingDiscountAmount.value = Number(data?.remarketing_discount_amount ?? 0)
    exhibitionDiscountAmount.value = Number(data?.exhibition_discount_amount ?? 0)

    // total: либо из бэка, либо subtotal - discountAmount (не ниже нуля)
    const srvTotal = data?.total
    total.value =
      srvTotal != null ? Number(srvTotal) : Math.max(0, subtotal.value - discountAmount.value)

    // Купон (если есть)
    couponInfo.value = data?.coupon_info || null
    coupons.value = Array.isArray(data?.coupons) ? data.coupons : []

    // 🆕 VIP discount: ищем среди coupons
    vipDiscountAmount.value = 0
    vipDiscountPercent.value = null
    if (Array.isArray(data?.coupons)) {
      for (const c of data.coupons) {
        if (!c?.applied) continue
        const t = String(c.type || '').toLowerCase()
        // vip type
        if (t === 'vip') {
          vipDiscountAmount.value += Number(c.discount_amount || 0)
          if (c.discount_percent != null && vipDiscountPercent.value == null) {
            vipDiscountPercent.value = Number(c.discount_percent)
          }
        }
      }
    }
  }

  /** Загрузка корзины */
  async function loadCart() {
    try {
      if (isAuthenticated.value && userId.value) {
        const data: any = await cartService.getUserCart(userId.value)
        applyServerCartState(data)
      } else {
        if (process.server) {
          items.value = []
          gifts.value = []
          promoNotice.value = null
          subtotal.value = 0
          total.value = 0
          discountAmount.value = 0
          remarketingDiscountAmount.value = 0
          exhibitionDiscountAmount.value = 0
          couponInfo.value = null
          coupons.value = []
          return
        }
        const sid = ensureGuestSession()
        const data: any = await cartService.getGuestCart(sid)
        applyServerCartState(data)
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // если гостевой сессии нет на бэке — сбрасываем локально
        items.value = []
        gifts.value = []
        promoNotice.value = null
        subtotal.value = 0
        total.value = 0
        discountAmount.value = 0
        remarketingDiscountAmount.value = 0
        exhibitionDiscountAmount.value = 0
        couponInfo.value = null
        coupons.value = []
        if (process.client) localStorage.removeItem('guest_session_id')
        guestSessionId.value = null
      } else {
        console.warn('Ошибка при загрузке корзины', e)
      }
    } finally {
      isLoaded.value = true
    }
  }

  /** Добавление товара (оптимистично) */
  async function addToCart(item: CartItem) {
    const existing = items.value.find(i => String(i.id) === String(item.id))
    if (existing) existing.quantity += item.quantity
    else items.value.push({ ...item })

    let ok = false

    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.addUserItem(userId.value, item.id, item.quantity)
      } else {
        const sid = ensureGuestSession()
        await cartService.addGuestItem(sid, item.id, item.quantity)
      }
      ok = true
    } finally {
      await loadCart()
    }

    if (ok && process.client) {
      try {
        ytm.addToCart(toYtmProduct(item), 'cart')

        analytics.addToCart({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          category: item.tag
        })
      } catch {}
    }
  }

  /** Обновление количества (оптимистично) */
  async function updateItem(id: string | number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }

    // запомним предыдущее количество ДО локального изменения
    const before = items.value.find(i => String(i.id) === String(id))
    const beforeQty = Number(before?.quantity ?? 0)

    // локально обновим
    if (before) before.quantity = quantity

    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.updateUserItem(userId.value, id, quantity)
      } else {
        const sid = ensureGuestSession()
        await cartService.updateGuestItem(sid, id, quantity)
      }
    } finally {
      await loadCart()

      if (process.client) {
        const after = items.value.find(i => String(i.id) === String(id))
        if (!after) return
        const afterQty = Number(after.quantity || 0)
        const delta = afterQty - beforeQty

        // по ТЗ: увеличение = add_to_cart, уменьшение = remove_from_cart (на дельту)
        try {
          if (delta > 0) {
            ytm.addToCart(toYtmProduct(after), 'cart')
          } else if (delta < 0) {
            ytm.removeFromCart(toYtmProduct(after), 'cart')
          }
        } catch {
          // no-op
        }
      }
    }
  }

  /** Удалить товар (оптимистично) */
  async function removeItem(id: string | number) {
    const removed = items.value.find(i => String(i.id) === String(id))

    items.value = items.value.filter(i => String(i.id) !== String(id))
    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.removeUserItem(userId.value, id)
      } else {
        const sid = ensureGuestSession()
        await cartService.removeGuestItem(sid, id)
      }
    } finally {
      if (removed && process.client) {
        try {
           ytm.removeFromCart(toYtmProduct(removed), 'cart')

        } catch {
          // no-op
        }
      }
      await loadCart()
    }
  }

  /** Очистить корзину */
  async function clearCart() {
    if (isAuthenticated.value && userId.value) {
      await cartService.clearUserCart(userId.value)
    } else {
      const sid = ensureGuestSession()
      await cartService.clearGuestCart(sid)
      if (process.client) localStorage.removeItem('guest_session_id')
      guestSessionId.value = null
    }
    items.value = []
    gifts.value = []
    promoNotice.value = null
    subtotal.value = 0
    total.value = 0
    discountAmount.value = 0
    remarketingDiscountAmount.value = 0
    exhibitionDiscountAmount.value = 0
    couponInfo.value = null
    coupons.value = []
  }

  /** Применить промокод — используем ответ бэка целиком */
  async function applyCoupon(code: string) {
    const trimmed = (code || '').trim()
    if (!trimmed) return

    // ⛔ Промокоды доступны только авторизованным пользователям
    if (!isAuthenticated.value || !userId.value) {
      throw new Error('Для применения промокода необходимо авторизоваться')
    }

    const res: any = await cartService.applyUserCoupon(userId.value, trimmed)

    applyServerCartState(res)
    // На случай асинхронных перерасчётов на бэке:
    await loadCart()

    if (!isCouponApplySuccess(res)) {
      throw new Error(getCouponApplyMessage(res))
    }

    return res
  }

  /** Удалить промокод */
  async function removeCoupon() {
    // сохраним текущий код, чтобы отправить remove после успешного удаления
    const prevCode = couponInfo.value?.code

    if (!isAuthenticated.value || !userId.value) {
      throw new Error('Для удаления промокода необходимо авторизоваться')
    }

    await cartService.removeUserCoupon(userId.value)
    await loadCart()

    // YTM: успешная отмена купона
    if (process.client && prevCode) {
      try {
        ytm.promoRemove(String(prevCode))
      } catch {
        // no-op
      }
    }
  }

  /**
   * preOrder — ТОЛЬКО для авторизованного.
   */
  async function preOrder() {
    if (!isAuthenticated.value || !userId.value) {
      throw new Error('AUTH_REQUIRED')
    }
    const profile = userStore.profile
    const fio = profile?.first_name || userForm.value.fullName
    const phone = profile?.phone_number || userForm.value.phone
    await cartService.preOrderUser(userId.value, fio, phone)
  }

  async function ensureLoaded() {
    if (!isLoaded.value) {
      await loadCart()
    }
  }

  /**
   * Миграция гостевой корзины в пользовательскую после успешной авторизации.
   */
  async function migrateGuestToUser(targetUserId?: string | number) {
    const uid = targetUserId ?? userId.value
    if (!uid) return
    if (process.server) return

    const sid = guestSessionId.value
    if (!sid) {
      await loadCart()
      return
    }
    await cartService.migrateGuestToUser(sid, uid)
    // после успешной миграции — чистим гостевую сессию
    localStorage.removeItem('guest_session_id')
    guestSessionId.value = null
    await loadCart()
  }

  async function apply2plus1(productId: string) {
    let res: any
    if (isAuthenticated.value && userId.value) {
      res = await cartService.apply2Plus1User(userId.value, { product_id: productId })
    } else {
      const sid = ensureGuestSession()
      res = await cartService.apply2Plus1Guest(sid, { product_id: productId })
    }
    // сервер сам применяет правило; просто перечитаем корзину
    await loadCart()
    return res
  }

  return {
    // state
    items, gifts, promoNotice, userForm, daysLeft,
    isAuthenticated, isLoaded, 
    // новые суммы/купоны из бэка
    subtotal, total, discountAmount, remarketingDiscountAmount, exhibitionDiscountAmount, couponInfo, coupons,
    // VIP
    vipDiscountAmount, vipDiscountPercent,
    
    itemsCount,
    itemsUniqueCount,

    // actions
    loadCart,
    ensureLoaded,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    preOrder,
    migrateGuestToUser,
    apply2plus1
  }
})
