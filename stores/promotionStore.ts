import { defineStore } from 'pinia'
import { useRuntimeConfig, navigateTo } from '#imports'
import { useCartStore } from '@/stores/cartStore'
import type { ApiPromotionItem, Promotion } from '~/types/promo'

export const usePromoStore = defineStore('promoStore', {
  state: () => ({
    promotions: [] as Promotion[],
    appliedPromotion: null as Promotion | null,
    isLoading: false as boolean,
    error: null as string | null,
    isApplying: false as boolean,
  }),

  actions: {
    apiOrigin(): string {
      const cfg = useRuntimeConfig()
      const envOrigin = (cfg.public as any)?.externalApiOrigin as string | undefined
      return envOrigin && /^https?:\/\//i.test(envOrigin)
        ? envOrigin.replace(/\/+$/, '')
        : 'https://api.daigo.ru'
    },

    normalizeImage(path?: string | null): string {
      if (!path) return ''
      if (/^https?:\/\//i.test(path)) return path
      return `${this.apiOrigin()}${path.startsWith('/') ? '' : '/'}${path}`
    },

    mapApi(item: ApiPromotionItem): Promotion {
      const first = item.related_products?.[0]
      return {
        id: item.id,
        title: item.name,
        description: item.description,
        image: this.normalizeImage(item.banner_url),
        coupon: item.coupon,
        discount: item.discount ?? null,
        label: item.lable ?? null,
        promo_type: item.promo_type,
        related_products: item.related_products ?? [],
        product_id: first?.product_id ?? null,
        product_slug: first?.url_cpu ?? null,
      }
    },

    async loadPromotions() {
      if (this.isLoading) return
      this.isLoading = true
      this.error = null
      try {
        const url = `${this.apiOrigin()}/v1/shop/promotion`
        const { data, error } = await useFetch<ApiPromotionItem[]>(url, { method: 'GET' })
        if (error.value) throw error.value
        this.promotions = (data.value ?? []).map(this.mapApi)
      } catch (e: any) {
        console.error('Ошибка загрузки акций:', e)
        this.error = e?.message || 'Не удалось загрузить акции'
        this.promotions = []
      } finally {
        this.isLoading = false
      }
    },

    async apply(promo: Promotion) {
      const cart = useCartStore()

      // Промокод
      if (promo.promo_type === 'code') {
        await cart.ensureLoaded()
        const hasItems = cart.items.length > 0 || (cart.subtotal ?? 0) > 0
        if (!hasItems) {
          throw new Error('Сначала добавьте товар в корзину')
        }
        this.isApplying = true
        try {
          const res = await cart.applyCoupon(promo.coupon || '')
          this.appliedPromotion = promo
          return res
        } finally {
          this.isApplying = false
        }
      }

      // 2+1
      if (promo.promo_type === '2plus1') {
        const productId = promo.product_id
        if (!productId) throw new Error('Не передан product_id для 2+1')
        this.isApplying = true
        try {
          const res = await cart.apply2plus1(productId, Number(promo.id))
          this.appliedPromotion = promo
          return res
        } finally {
          this.isApplying = false
        }
      }

      // discount → если есть связанный товар — ведём на него
      if (promo.promo_type === 'discount' && promo.product_slug) {
        navigateTo(`/product/${promo.product_slug}`)
        return
      }

      // notice/прочее → каталог
      navigateTo('/catalog')
    },

    setApplied(p: Promotion | null) { this.appliedPromotion = p },
    clearPromotion() { this.appliedPromotion = null },
  },
})
