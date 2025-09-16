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

  // форма для неавторизованного (нужна только чтобы инициировать авторизацию из корзины)
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

  /** Загрузка корзины */
  async function loadCart() {
    try {
      if (isAuthenticated.value && userId.value) {
        const data: any = await cartService.getUserCart(userId.value)
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
        items.value = mapped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
        gifts.value = data.gifts || []
        // если с бэка будут приходить уведомления по акциям — мапим сюда
        promoNotice.value = data.promo_notice || null
      } else {
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
        items.value = mapped.sort((a, b) => String(a.id).localeCompare(String(b.id)))
        gifts.value = data.gifts || []
        promoNotice.value = data.promo_notice || null
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // если гостевой сессии нет на бэке — сбрасываем локально
        items.value = []
        gifts.value = []
        promoNotice.value = null
        if (process.client) localStorage.removeItem('guest_session_id')
        guestSessionId.value = null
      } else {
        console.warn('Ошибка при загрузке корзины', e)
      }
    }
  }

  /** Добавление товара */
  async function addToCart(item: CartItem) {
    // локальный optimistic update
    const existing = items.value.find(i => String(i.id) === String(item.id))
    if (existing) existing.quantity += item.quantity
    else items.value.push({ ...item })

    if (isAuthenticated.value && userId.value) {
      await cartService.addUserItem(userId.value, item.id, item.quantity)
    } else {
      const sid = ensureGuestSession()
      await cartService.addGuestItem(sid, item.id, item.quantity)
    }
    await loadCart()
  }

  /** Обновление количества */
  async function updateItem(id: string | number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(id)
      return
    }
    const existing = items.value.find(i => String(i.id) === String(id))
    if (existing) existing.quantity = quantity

    if (isAuthenticated.value && userId.value) {
      await cartService.updateUserItem(userId.value, id, quantity)
    } else {
      const sid = ensureGuestSession()
      await cartService.updateGuestItem(sid, id, quantity)
    }
    await loadCart()
  }

  /** Удалить товар */
  async function removeItem(id: string | number) {
    items.value = items.value.filter(i => String(i.id) !== String(id))
    if (isAuthenticated.value && userId.value) {
      await cartService.removeUserItem(userId.value, id)
    } else {
      const sid = ensureGuestSession()
      await cartService.removeGuestItem(sid, id)
    }
    await loadCart()
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
  }

  /** Применить промокод */
  async function applyCoupon(code: string) {
    if (!code.trim()) return
    if (isAuthenticated.value && userId.value) {
      const res: any = await cartService.applyUserCoupon(userId.value, code)
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
    if (isAuthenticated.value && userId.value) {
      await cartService.removeUserCoupon(userId.value)
    } else {
      const sid = ensureGuestSession()
      await cartService.removeGuestCoupon(sid)
    }
    promoNotice.value = null
    await loadCart()
  }

  /**
   * ВАЖНО: preOrder — ТОЛЬКО для авторизованного.
   * Для гостя preOrder НЕ вызываем (по ТЗ).
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

  /**
   * Миграция гостевой корзины в пользовательскую после успешной авторизации.
   */
  async function migrateGuestToUser(targetUserId?: string | number) {
    const uid = targetUserId ?? userId.value
    if (!uid) return
    if (process.server) return

    const sid = guestSessionId.value
    if (!sid) {
      // ничего не мигрируем — корзина уже могла быть пустой
      await loadCart()
      return
    }
    await cartService.migrateGuestToUser(sid, uid)
    // после успешной миграции — чистим гостевую сессию
    localStorage.removeItem('guest_session_id')
    guestSessionId.value = null
    await loadCart()
  }

  return {
    // state
    items, gifts, promoNotice, userForm, daysLeft,
    isAuthenticated,

    // actions
    loadCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    preOrder,               // только для авторизованного!
    migrateGuestToUser,     // миграция после логина
  }
})




// import { defineStore } from 'pinia'
// import { computed, ref } from 'vue'
// import { useAuthStore } from '~/stores/authStore'
// import { useUserStore } from '~/stores/userStore'
// import { cartService } from '~/services/cartService'

// /** Важное: id может быть string (UUID) или number — не приводим тип насильно */
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

// /** Полная информация о купоне из ответа бэка */
// export interface CouponInfo {
//   id?: number
//   code?: string
//   applied?: boolean
//   discount_percent?: number
//   discount_amount?: number
// }

// export interface UserForm {
//   fullName: string
//   phone: string
// }

// function normId(id: string | number) {
//   return String(id)
// }

// export const useCartStore = defineStore('cart', () => {
//   const auth = useAuthStore()
//   const userStore = useUserStore()

//   // --- state ---
//   const items = ref<CartItem[]>([])
//   const gifts = ref<CartGift[]>([])
//   const promoNotice = ref<PromoNotice | null>(null)

//   // 💰 суммы от бэкенда — показываем как есть, не пересчитываем на клиенте
//   const subtotal = ref<number>(0)
//   const total = ref<number>(0)
//   const discountAmount = ref<number>(0)
//   const couponInfo = ref<CouponInfo | null>(null)

//   // sessionID гостя (храним только на клиенте)
//   const guestSessionId = ref<string | null>(
//     process.client ? localStorage.getItem('guest_session_id') : null
//   )

//   // форма для неавторизованного
//   const userForm = ref<UserForm>({ fullName: '', phone: '' })

//   const isAuthenticated = computed(() => auth.isAuthenticated)

//   // время окончания акции (для счётчика)
//   const daysLeft = computed(() => {
//     if (!promoNotice.value?.endTime) return null
//     const end = new Date(promoNotice.value.endTime)
//     const now = new Date()
//     const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
//     return diff > 0 ? diff : null
//   })

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

//   /** Маппинг item из бэка в CartItem */
//   function mapApiItem(i: any): CartItem {
//     return {
//       id: i.product_id, // не трогаем тип: UUID string или number — как пришло
//       title: i.title || i.name,
//       subtitle: i.subtitle || '',
//       price: Number(i.price || 0),
//       oldPrice: i.old_price ? Number(i.old_price) : undefined,
//       quantity: Number(i.quantity || 0),
//       image: i.image || '',
//       tag: i.tag
//     }
//   }

//   /** Сброс сумм/купона */
//   function resetTotals() {
//     subtotal.value = 0
//     total.value = 0
//     discountAmount.value = 0
//     couponInfo.value = null
//   }

//   /** Загрузка корзины */
//   async function loadCart() {
//     try {
//       if (isAuthenticated.value && auth.userId) {
//         const data: any = await cartService.getUserCart(auth.userId)

//         const mapped = (data.items || []).map(mapApiItem)
//         // стабильный порядок (по строковому id)
//         items.value = mapped.sort((a, b) => normId(a.id).localeCompare(normId(b.id)))

//         gifts.value = data.gifts || []
//         promoNotice.value = data.promo_notice || null

//         // суммы и купон — строго из ответа бэка
//         subtotal.value = Number(data.subtotal || 0)
//         total.value = Number(data.total || 0)
//         discountAmount.value = Number(data.discount_amount || 0)
//         couponInfo.value = data.coupon_info || null
//       } else {
//         if (process.server) {
//           items.value = []
//           gifts.value = []
//           promoNotice.value = null
//           resetTotals()
//           return
//         }
//         const sid = ensureGuestSession()
//         const data: any = await cartService.getGuestCart(sid)

//         const mapped = (data.items || []).map(mapApiItem)
//         items.value = mapped.sort((a, b) => normId(a.id).localeCompare(normId(b.id)))

//         gifts.value = data.gifts || []
//         promoNotice.value = data.promo_notice || null

//         subtotal.value = Number(data.subtotal || 0)
//         total.value = Number(data.total || 0)
//         discountAmount.value = Number(data.discount_amount || 0)
//         couponInfo.value = data.coupon_info || null
//       }
//     } catch (e: any) {
//       // Если сессии нет на бэкенде (404), очищаем состояние и sessionID
//       if (e?.response?.status === 404) {
//         items.value = []
//         gifts.value = []
//         promoNotice.value = null
//         resetTotals()
//         if (process.client) {
//           localStorage.removeItem('guest_session_id')
//         }
//         guestSessionId.value = null
//       } else {
//         console.warn('Ошибка при загрузке корзины', e)
//       }
//     }
//   }

//   /** Добавление товара (оптимистично, с нормализацией id) */
//   async function addToCart(item: CartItem) {
//     const targetId = normId(item.id)
//     const existing = items.value.find(i => normId(i.id) === targetId)
//     if (existing) {
//       existing.quantity += item.quantity
//     } else {
//       items.value.push({ ...item })
//     }

//     if (isAuthenticated.value && auth.userId) {
//       await cartService.addUserItem(auth.userId, item.id, item.quantity)
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
//     const nId = normId(id)
//     const existing = items.value.find(i => normId(i.id) === nId)
//     if (existing) {
//       existing.quantity = quantity
//     }

//     if (isAuthenticated.value && auth.userId) {
//       await cartService.updateUserItem(auth.userId, id, quantity)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.updateGuestItem(sid, id, quantity)
//     }
//     await loadCart()
//   }

//   /** Удалить товар */
//   async function removeItem(id: string | number) {
//     const nId = normId(id)
//     items.value = items.value.filter(i => normId(i.id) !== nId)

//     if (isAuthenticated.value && auth.userId) {
//       await cartService.removeUserItem(auth.userId, id)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.removeGuestItem(sid, id)
//     }
//     await loadCart()
//   }

//   /** Очистить корзину */
//   async function clearCart() {
//     if (isAuthenticated.value && auth.userId) {
//       await cartService.clearUserCart(auth.userId)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.clearGuestCart(sid)
//       // сбрасываем sessionID и корзину
//       if (process.client) {
//         localStorage.removeItem('guest_session_id')
//       }
//       guestSessionId.value = null
//     }
//     items.value = []
//     gifts.value = []
//     promoNotice.value = null
//     resetTotals()
//   }

//   /** Применить промокод (итоги берём из последующего loadCart) */
//   async function applyCoupon(code: string) {
//     const trimmed = (code || '').trim()
//     if (!trimmed) return

//     if (isAuthenticated.value && auth.userId) {
//       await cartService.applyUserCoupon(auth.userId, trimmed)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.applyGuestCoupon(sid, trimmed)
//     }
//     await loadCart()
//   }

//   /** Удалить промокод */
//   async function removeCoupon() {
//     if (isAuthenticated.value && auth.userId) {
//       await cartService.removeUserCoupon(auth.userId)
//     } else {
//       const sid = ensureGuestSession()
//       await cartService.removeGuestCoupon(sid)
//     }
//     await loadCart()
//   }

//   /**
//    * Предварительное оформление (contacts only).
//    * Скидки/итоги НЕ шлём — они уже на бэке в корзине.
//    */
//   async function preOrder() {
//     if (isAuthenticated.value && auth.userId) {
//       const profile = userStore.profile
//       const fio = profile?.first_name || userForm.value.fullName
//       const phone = profile?.phone_number || userForm.value.phone
//       await cartService.preOrderUser(auth.userId, fio, phone)
//     } else {
//       const sid = ensureGuestSession()
//       const fio = userForm.value.fullName
//       const phone = userForm.value.phone
//       await cartService.preOrderGuest(sid, fio, phone)
//     }
//   }

//   /**
//    * (Опционально) Миграция гостевой корзины в пользовательскую
//    * — удобно вызвать сразу после успешной авторизации.
//    */
//   async function migrateGuestCartToUser(userId: number | string) {
//     const sid = process.client ? localStorage.getItem('guest_session_id') : null
//     if (!sid) return
//     await cartService.migrateGuestToUser(sid, userId)
//     await loadCart()
//   }

//   return {
//     // state
//     items,
//     gifts,
//     promoNotice,
//     userForm,
//     // суммы/купоны с бэка
//     subtotal,
//     total,
//     discountAmount,
//     couponInfo,

//     // computed/helpers
//     daysLeft,
//     isAuthenticated,

//     // actions
//     loadCart,
//     addToCart,
//     updateItem,
//     removeItem,
//     clearCart,
//     applyCoupon,
//     removeCoupon,
//     preOrder,
//     migrateGuestCartToUser, // пригодится в auth-flow
//   }
// })
