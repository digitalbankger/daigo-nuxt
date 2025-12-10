import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRuntimeConfig, navigateTo } from '#imports'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import type { ApiPromotionItem, Promotion } from '~/types/promo'
import { useYtm } from '@/composables/useYtm'

type PromotionEx = Promotion & {
  is_applied?: boolean
  is_active?: boolean
  product_id?: string | null
  product_slug?: string | null
  related_products?: Array<{ product_id: string; url_cpu: string }>
  link?: string | null
}

export const usePromoStore = defineStore('promoStore', () => {
  const auth = useAuthStore()
  const cart = useCartStore()
  const ytm = useYtm()

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
      link: (item as any).link ?? null,
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
    // 1) Если задан явный линк — идём по нему и выходим
    if (promo.link) {
      const url = String(promo.link)
      if (/^https?:\/\//i.test(url)) {
        navigateTo(url, { external: true })
      } else {
        navigateTo(url)
      }
      return true
    }

    // 2) Логика промокода (акции с типом code)
    if (promo.promo_type === 'code') {
      // Берём промокод из самой акции
      const code = (promo.coupon || '').trim()
      if (!code) {
        throw new Error('Для данной акции не задан промокод')
      }

      await cart.ensureLoaded()
      const hasItems = cart.items.length > 0 || (cart.subtotal ?? 0) > 0
      if (!hasItems) throw new Error('Сначала добавьте товар в корзину')

      // Делаем реальный запрос к API корзины
      const res = await cart.applyCoupon(code)
      await loadPromotions()

      // YTM: успешное применение купона
      try { ytm.promoApply(String(code)) } catch {}

      // возвращаем ответ бэкенда (если есть), чтобы модалка могла показать его message
      return res ?? true
    }

    if (promo.promo_type === '2plus1') {
      if (!promo.product_id) throw new Error('Не передан product_id для 2+1')
      await cart.apply2plus1(promo.product_id)
      await loadPromotions()
      try { ytm.promoApply(String(promo.promo_type)) } catch {}
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
      const prev =
        (typeof promo === 'object' ? promo : promotions.value.find(p => p.id === id)) ||
        appliedPromotion.value ||
        null
      await $fetch(`${apiOrigin()}/v1/shop/promotion/cancel?${ident.key}=${encodeURIComponent(ident.value)}`, {
        method: 'DELETE',
        body: { promo_id: id },            // <— новый формат
        headers: { 'Content-Type': 'application/json' },
      })

      // синхронизируем корзину и список акций
      try { await cart.loadCart() } catch {}
      await loadPromotions()
       try {
        const label = String(prev?.coupon || prev?.title || id)
        ytm.promoRemove(label)
      } catch {}
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

