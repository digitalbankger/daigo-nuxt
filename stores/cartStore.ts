// stores/cartStore.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { cartService } from '~/services/cartService'

export interface CartItem {
  id: string | number
  title: string
  subtitle?: string
  price: number
  oldPrice?: number
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

export const useCartStore = defineStore('cart', () => {
  const auth = useAuthStore()
  const userStore = useUserStore()

  // --- state ---
  const items = ref<CartItem[]>([])
  const gifts = ref<CartGift[]>([])
  const promoNotice = ref<PromoNotice | null>(null)
  const isLoaded = ref(false)

  // Новые итоговые поля из бэка (с запасными значениями)
  const subtotal = ref<number>(0)        // сумма без скидки
  const total = ref<number>(0)           // итог со скидкой
  const discountAmount = ref<number>(0)  // абсолютная скидка в рублях
  const couponInfo = ref<CouponInfo | null>(null)

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

  /** Маппер айтемов с бэка */
  function mapApiItem(i: any): CartItem {
    return {
      id: i.product_id,
      title: i.title || i.name,
      subtitle: i.subtitle || '',
      price: Number(i.price ?? 0),
      oldPrice: i.old_price != null ? Number(i.old_price) : undefined,
      quantity: Number(i.quantity ?? 0),
      image: i.image || '',
      tag: i.tag,
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

    // total: либо из бэка, либо subtotal - discountAmount (не ниже нуля)
    const srvTotal = data?.total
    total.value =
      srvTotal != null ? Number(srvTotal) : Math.max(0, subtotal.value - discountAmount.value)

    // Купон (если есть)
    couponInfo.value = data?.coupon_info || null
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
          couponInfo.value = null
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
        couponInfo.value = null
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

    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.addUserItem(userId.value, item.id, item.quantity)
      } else {
        const sid = ensureGuestSession()
        await cartService.addGuestItem(sid, item.id, item.quantity)
      }
    } finally {
      await loadCart()
    }
  }

  /** Обновление количества (оптимистично) */
  async function updateItem(id: string | number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }
    const existing = items.value.find(i => String(i.id) === String(id))
    if (existing) existing.quantity = quantity

    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.updateUserItem(userId.value, id, quantity)
      } else {
        const sid = ensureGuestSession()
        await cartService.updateGuestItem(sid, id, quantity)
      }
    } finally {
      await loadCart()
    }
  }

  /** Удалить товар (оптимистично) */
  async function removeItem(id: string | number) {
    items.value = items.value.filter(i => String(i.id) !== String(id))
    try {
      if (isAuthenticated.value && userId.value) {
        await cartService.removeUserItem(userId.value, id)
      } else {
        const sid = ensureGuestSession()
        await cartService.removeGuestItem(sid, id)
      }
    } finally {
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
    couponInfo.value = null
  }

  /** Применить промокод — используем ответ бэка целиком */
  async function applyCoupon(code: string) {
    const trimmed = (code || '').trim()
    if (!trimmed) return

    let res: any
    if (isAuthenticated.value && userId.value) {
      res = await cartService.applyUserCoupon(userId.value, trimmed)
    } else {
      const sid = ensureGuestSession()
      res = await cartService.applyGuestCoupon(sid, trimmed)
    }

    applyServerCartState(res)
    // На случай асинхронных перерасчётов на бэке:
    await loadCart()
    return res
  }

  /** Удалить промокод */
  async function removeCoupon() {
    if (isAuthenticated.value && userId.value) {
      await cartService.removeUserCoupon(userId.value)
    } else {
      const sid = ensureGuestSession()
      await cartService.removeGuestCoupon(sid)
    }
    await loadCart()
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

  // внутри defineStore(...) рядом с остальными actions

async function apply2plus1(productId: string, promotionId?: number) {
  let res: any
  if (isAuthenticated.value && userId.value) {
    // /v1/shop/cart/{daigoID}/apply-2plus1
    res = await cartService.apply2Plus1User(userId.value, {
      product_id: productId,
      promotion_id: promotionId, // сервер может игнорить, но лучше передать
    })
  } else {
    const sid = ensureGuestSession()
    // /v1/shop/guest-cart/{sessionID}/apply-2plus1
    res = await cartService.apply2Plus1Guest(sid, {
      product_id: productId,
      promotion_id: promotionId,
    })
  }
  applyServerCartState(res)
  await loadCart()
  return res
}


  return {
    // state
    items, gifts, promoNotice, userForm, daysLeft,
    isAuthenticated, isLoaded, 
    // новые суммы/купоны из бэка
    subtotal, total, discountAmount, couponInfo,
    
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









// // stores/cartStore.ts
// import { defineStore } from 'pinia'
// import { computed, ref } from 'vue'
// import { useAuthStore } from '~/stores/authStore'
// import { useUserStore } from '~/stores/userStore'
// import { cartService } from '~/services/cartService'

// export interface CartItem {
//   id: string | number
//   title: string
//   subtitle?: string
//   price: number
//   oldPrice?: number
//   quantity: number
//   image: string
//   tag?: string
// }

// export interface CartGift {
//   id: number | string
//   title: string
//   image: string
//   note?: string
// }

// export interface PromoNotice {
//   type?: 'discount' | 'code' | '2+1'
//   discount?: number
//   couponName?: string
//   productName: string
//   endTime: string
// }

// export interface UserForm {
//   fullName: string
//   phone: string
// }

// export const useCartStore = defineStore('cart', () => {
//   const auth = useAuthStore()
//   const userStore = useUserStore()

//   // state
//   const items = ref<CartItem[]>([])
//   const gifts = ref<CartGift[]>([])
//   const promoNotice = ref<PromoNotice | null>(null)

//   // sessionID гостя (храним только на клиенте)
//   const guestSessionId = ref<string | null>(
//     process.client ? localStorage.getItem('guest_session_id') : null
//   )

//   // форма для неавторизованного (нужна только чтобы инициировать авторизацию из корзины)
//   const userForm = ref<UserForm>({ fullName: '', phone: '' })

//   const daysLeft = computed(() => {
//     if (!promoNotice.value?.endTime) return null
//     const end = new Date(promoNotice.value.endTime)
//     const now = new Date()
//     const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
//     return diff > 0 ? diff : null
//   })

//   const isAuthenticated = computed(() => auth.isAuthenticated)
//   const userId = computed(() => auth.userId)

//   /** Получить/создать sessionID для гостя (только на клиенте) */
//   function ensureGuestSession() {
//     if (!guestSessionId.value) {
//       if (process.client) {
//         const id = crypto.randomUUID()
//         guestSessionId.value = id
//         localStorage.setItem('guest_session_id', id)
//       }
//     }
//     return guestSessionId.value!
//   }

//   /** Загрузка корзины */
//   async function loadCart() {
//     try {
//       if (isAuthenticated.value && userId.value) {
//         const data: any = await cartService.getUserCart(userId.value)
//         const mapped = (data.items || []).map((i: any) => ({
//           id: i.product_id,
//           title: i.title || i.name,
//           subtitle: i.subtitle || '',
//           price: i.price,
//           oldPrice: i.old_price,
//           quantity: i.quantity,
//           image: i.image || '',
//           tag: i.tag
//         }))
//         items.value = mapped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
//         gifts.value = data.gifts || []
//         // если с бэка будут приходить уведомления по акциям — мапим сюда
//         promoNotice.value = data.promo_notice || null
//       } else {
//         if (process.server) {
//           items.value = []
//           gifts.value = []
//           promoNotice.value = null
//           return
//         }
//         const sid = ensureGuestSession()
//         const data: any = await cartService.getGuestCart(sid)
//         const mapped = (data.items || []).map((i: any) => ({
//           id: i.product_id,
//           title: i.title || i.name,
//           subtitle: i.subtitle || '',
//           price: i.price,
//           oldPrice: i.old_price,
//           quantity: i.quantity,
//           image: i.image || '',
//           tag: i.tag
//         }))
//         items.value = mapped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
//         gifts.value = data.gifts || []
//         promoNotice.value = data.promo_notice || null
//       }
//     } catch (e: any) {
//       if (e?.response?.status === 404) {
//         // если гостевой сессии нет на бэке — сбрасываем локально
//         items.value = []
//         gifts.value = []
//         promoNotice.value = null
//         if (process.client) localStorage.removeItem('guest_session_id')
//         guestSessionId.value = null
//       } else {
//         console.warn('Ошибка при загрузке корзины', e)
//       }
//     }
//   }

//   /** Добавление товара */
//   async function addToCart(item: CartItem) {
//     // локальный optimistic update
//     const existing = items.value.find(i => String(i.id) === String(item.id))
//     if (existing) existing.quantity += item.quantity
//     else items.value.push({ ...item })

//     if (isAuthenticated.value && userId.value) {
//       await cartService.addUserItem(userId.value, item.id, item.quantity)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.addGuestItem(sid, item.id, item.quantity)
//     }
//     await loadCart()
//   }

//   /** Обновление количества */
//   async function updateItem(id: string | number, quantity: number) {
//     if (quantity <= 0) {
//       await removeItem(id)
//       return
//     }
//     const existing = items.value.find(i => String(i.id) === String(id))
//     if (existing) existing.quantity = quantity

//     if (isAuthenticated.value && userId.value) {
//       await cartService.updateUserItem(userId.value, id, quantity)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.updateGuestItem(sid, id, quantity)
//     }
//     await loadCart()
//   }

//   /** Удалить товар */
//   async function removeItem(id: string | number) {
//     items.value = items.value.filter(i => String(i.id) !== String(id))
//     if (isAuthenticated.value && userId.value) {
//       await cartService.removeUserItem(userId.value, id)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.removeGuestItem(sid, id)
//     }
//     await loadCart()
//   }

//   /** Очистить корзину */
//   async function clearCart() {
//     if (isAuthenticated.value && userId.value) {
//       await cartService.clearUserCart(userId.value)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.clearGuestCart(sid)
//       if (process.client) localStorage.removeItem('guest_session_id')
//       guestSessionId.value = null
//     }
//     items.value = []
//     gifts.value = []
//     promoNotice.value = null
//   }

//   /** Применить промокод */
//   async function applyCoupon(code: string) {
//     if (!code.trim()) return
//     if (isAuthenticated.value && userId.value) {
//       const res: any = await cartService.applyUserCoupon(userId.value, code)
//       promoNotice.value = res.promo_notice || null
//     } else {
//       const sid = ensureGuestSession()
//       const res: any = await cartService.applyGuestCoupon(sid, code)
//       promoNotice.value = res.promo_notice || null
//     }
//     await loadCart()
//   }

//   /** Удалить промокод */
//   async function removeCoupon() {
//     if (isAuthenticated.value && userId.value) {
//       await cartService.removeUserCoupon(userId.value)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.removeGuestCoupon(sid)
//     }
//     promoNotice.value = null
//     await loadCart()
//   }

//   /**
//    * ВАЖНО: preOrder — ТОЛЬКО для авторизованного.
//    * Для гостя preOrder НЕ вызываем (по ТЗ).
//    */
//   async function preOrder() {
//     if (!isAuthenticated.value || !userId.value) {
//       throw new Error('AUTH_REQUIRED')
//     }
//     const profile = userStore.profile
//     const fio = profile?.first_name || userForm.value.fullName
//     const phone = profile?.phone_number || userForm.value.phone
//     await cartService.preOrderUser(userId.value, fio, phone)
//   }

//   /**
//    * Миграция гостевой корзины в пользовательскую после успешной авторизации.
//    */
//   async function migrateGuestToUser(targetUserId?: string | number) {
//     const uid = targetUserId ?? userId.value
//     if (!uid) return
//     if (process.server) return

//     const sid = guestSessionId.value
//     if (!sid) {
//       // ничего не мигрируем — корзина уже могла быть пустой
//       await loadCart()
//       return
//     }
//     await cartService.migrateGuestToUser(sid, uid)
//     // после успешной миграции — чистим гостевую сессию
//     localStorage.removeItem('guest_session_id')
//     guestSessionId.value = null
//     await loadCart()
//   }

//   return {
//     // state
//     items, gifts, promoNotice, userForm, daysLeft,
//     isAuthenticated,

//     // actions
//     loadCart,
//     addToCart,
//     updateItem,
//     removeItem,
//     clearCart,
//     applyCoupon,
//     removeCoupon,
//     preOrder,               // только для авторизованного!
//     migrateGuestToUser,     // миграция после логина
//   }
// })


