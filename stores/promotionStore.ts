// stores/promoStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRuntimeConfig, navigateTo } from '#imports'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import type { ApiPromotionItem, Promotion } from '~/types/promo'

type PromotionEx = Promotion & {
  is_applied?: boolean
  is_active?: boolean
  product_id?: string | null
  product_slug?: string | null
  related_products?: Array<{ product_id: string; url_cpu: string }>
}

export const usePromoStore = defineStore('promoStore', () => {
  const auth = useAuthStore()
  const cart = useCartStore()

  // state
  const promotions = ref<PromotionEx[]>([])
  const appliedPromotion = ref<PromotionEx | null>(null)
  const isLoading = ref(false)
  const isApplying = ref(false)
  const pendingId = ref<string | number | null>(null)
  const error = ref<string | null>(null)

  // guest session id
  const guestSessionId = ref<string | null>(process.client ? localStorage.getItem('guest_session_id') : null)
  function ensureGuestSession(): string {
    if (!guestSessionId.value && process.client) {
      const id = crypto.randomUUID()
      guestSessionId.value = id
      localStorage.setItem('guest_session_id', id)
    }
    return guestSessionId.value!
  }

  // helpers
  function apiOrigin(): string {
    const cfg: any = useRuntimeConfig()
    const base = cfg.public?.externalApiOrigin || 'https://api.daigo.ru'
    return String(base).replace(/\/+$/, '')
  }
  function normalizeImage(path?: string | null): string {
    if (!path) return '/images/placeholder-promo.jpg'
    if (/^https?:\/\//i.test(path)) return path
    return `${apiOrigin()}${path.startsWith('/') ? '' : '/'}${path}`
  }
  function mapApi(item: ApiPromotionItem): PromotionEx {
    const first = item.related_products?.[0]
    const promoType = (item as any).promo_type ?? (item as any).type
    const bannerRaw = (item as any).banner_url ?? (item as any).banner
    return {
      id: item.id,
      title: item.name,
      description: item.description,
      image: normalizeImage(bannerRaw),
      coupon: (item as any).coupon ?? null,
      promo_type: promoType as any,
      related_products: item.related_products ?? [],
      product_id: first?.product_id ?? null,
      product_slug: first?.url_cpu ?? null,
      is_applied: (item as any).is_applied === true,
      is_active: (item as any).is_active === true,
    }
  }
  function identityQuery(): { key: 'daigo_id' | 'session_id'; value: string } | null {
    const uid =
      (auth as any)?.user?.daigo_id ??
      (auth as any)?.daigo_id ??
      (auth as any)?.userId ??
      null
    const isAuth = (auth as any)?.isAuthenticated === true
    if (isAuth && uid) return { key: 'daigo_id', value: String(uid) }
    if (process.server) return null
    return { key: 'session_id', value: ensureGuestSession() }
  }
  function syncApplied(list: PromotionEx[]) {
    appliedPromotion.value = list.find(p => p.is_applied) ?? null
  }

  // actions
  async function loadPromotions() {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null
    try {
      const ident = identityQuery()
      const q = ident ? `?${ident.key}=${encodeURIComponent(ident.value)}` : ''
      const url = `${apiOrigin()}/v1/shop/promotion${q}`
      const data = await $fetch<ApiPromotionItem[]>(url, { method: 'GET' })
      const list = (data ?? []).map(mapApi)
      promotions.value = list
      syncApplied(list)
    } catch (e: any) {
      console.error('[promo] load error', e)
      error.value = e?.message || 'Не удалось загрузить акции'
      promotions.value = []
      appliedPromotion.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function apply(promo: PromotionEx) {
    if (pendingId.value) return
    pendingId.value = promo.id
    isApplying.value = true
    try {
      if (promo.promo_type === 'code') {
        await cart.ensureLoaded()
        const hasItems = cart.items.length > 0 || (cart.subtotal ?? 0) > 0
        if (!hasItems) throw new Error('Сначала добавьте товар в корзину')
        await cart.applyCoupon(promo.coupon || '')
        await loadPromotions()
        return true
      }
      if (promo.promo_type === '2plus1') {
        if (!promo.product_id) throw new Error('Не передан product_id для 2+1')
        await cart.apply2plus1(promo.product_id)
        await loadPromotions()
        return true
      }
      if (promo.promo_type === 'discount' && promo.product_slug) {
        navigateTo(`/catalog/${promo.product_slug}`)
        return
      }
      navigateTo('/catalog')
    } finally {
      isApplying.value = false
      pendingId.value = null
    }
  }

  /**
   * Отмена акции: новый единый ендпойнт
   *   DELETE /v1/shop/promotion/cancel?daigo_id=... | ?session_id=...
   *   body: { promo_id: <number|string> }
   */
  async function cancelActive(promo?: PromotionEx | number | string) {
    const ident = identityQuery()
    if (!ident) return
    const id = typeof promo === 'object'
      ? promo?.id
      : (promo ?? appliedPromotion.value?.id)

    if (id == null) return

    // отметим «busy» на конкретной карточке
    pendingId.value = id
    isApplying.value = true

    try {
      await $fetch(`${apiOrigin()}/v1/shop/promotion/cancel?${ident.key}=${encodeURIComponent(ident.value)}`, {
        method: 'DELETE',
        body: { promo_id: id },            // <— новый формат
        headers: { 'Content-Type': 'application/json' },
      })

      // синхронизируем корзину и список акций
      try { await cart.loadCart() } catch {}
      await loadPromotions()
    } catch (e) {
      console.error('[promo] cancel error', e)
    } finally {
      isApplying.value = false
      pendingId.value = null
    }
  }

  // удобные выборки
  const activePromotions = computed(() => promotions.value.filter(p => p.is_applied))
  const availablePromotions = computed(() => promotions.value.filter(p => !p.is_applied))

  return {
    // state
    promotions, appliedPromotion, isLoading, isApplying, pendingId, error,
    // actions
    loadPromotions, apply, cancelActive,
    // getters
    activePromotions, availablePromotions,
    // helpers (опционально наружу)
    apiOrigin, normalizeImage,
  }
})





// import { defineStore } from 'pinia'
// import { useRuntimeConfig, navigateTo } from '#imports'
// import { useCartStore } from '@/stores/cartStore'
// import type { ApiPromotionItem, Promotion } from '~/types/promo'

// export const usePromoStore = defineStore('promoStore', {
  
//   state: () => ({
//     promotions: [] as Promotion[],
//     appliedPromotion: null as Promotion | null,
//     isLoading: false as boolean,
//     error: null as string | null,
//     isApplying: false as boolean,
//   }),

//   actions: {
//     apiOrigin(): string {
//       const cfg = useRuntimeConfig()
//       const envOrigin = (cfg.public as any)?.externalApiOrigin as string | undefined
//       return envOrigin && /^https?:\/\//i.test(envOrigin)
//         ? envOrigin.replace(/\/+$/, '')
//         : 'https://api.daigo.ru'
//     },

//     normalizeImage(path?: string | null): string {
//       if (!path) return ''
//       if (/^https?:\/\//i.test(path)) return path
//       return `${this.apiOrigin()}${path.startsWith('/') ? '' : '/'}${path}`
//     },

//     mapApi(item: ApiPromotionItem): Promotion {
//       const first = item.related_products?.[0]
//       return {
//         id: item.id,
//         title: item.name,
//         description: item.description,
//         image: this.normalizeImage(item.banner_url),
//         coupon: item.coupon,
//         discount: item.discount ?? null,
//         label: item.lable ?? null,
//         promo_type: item.promo_type,
//         related_products: item.related_products ?? [],
//         product_id: first?.product_id ?? null,
//         product_slug: first?.url_cpu ?? null,
//       }
//     },

//     async loadPromotions() {
//       if (this.isLoading) return
//       this.isLoading = true
//       this.error = null
//       try {
//         const url = `${this.apiOrigin()}/v1/shop/promotion`
//         const { data, error } = await useFetch<ApiPromotionItem[]>(url, { method: 'GET' })
//         if (error.value) throw error.value
//         this.promotions = (data.value ?? []).map(this.mapApi)
//       } catch (e: any) {
//         console.error('Ошибка загрузки акций:', e)
//         this.error = e?.message || 'Не удалось загрузить акции'
//         this.promotions = []
//       } finally {
//         this.isLoading = false
//       }
//     },

//     async apply(promo: Promotion) {
//       const cart = useCartStore()

//       // Промокод
//       if (promo.promo_type === 'code') {
//         await cart.ensureLoaded()
//         const hasItems = cart.items.length > 0 || (cart.subtotal ?? 0) > 0
//         if (!hasItems) {
//           throw new Error('Сначала добавьте товар в корзину')
//         }
//         this.isApplying = true
//         try {
//           const res = await cart.applyCoupon(promo.coupon || '')
//           this.appliedPromotion = promo
//           return res
//         } finally {
//           this.isApplying = false
//         }
//       }

//       // 2+1
//       if (promo.promo_type === '2plus1') {
//         const productId = promo.product_id
//         if (!productId) throw new Error('Не передан product_id для 2+1')
//         this.isApplying = true
//         try {
//           const res = await cart.apply2plus1(productId, Number(promo.id))
//           this.appliedPromotion = promo
//           return res
//         } finally {
//           this.isApplying = false
//         }
//       }

//       // discount → если есть связанный товар — ведём на него
//       if (promo.promo_type === 'discount' && promo.product_slug) {
//         navigateTo(`/catalog/${promo.product_slug}`)
//         return
//       }

//       // notice/прочее → каталог
//       navigateTo('/catalog')
//     },

//     setApplied(p: Promotion | null) { this.appliedPromotion = p },
//     clearPromotion() { this.appliedPromotion = null },
//   },
// })
