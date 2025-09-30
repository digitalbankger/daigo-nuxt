import { defineStore } from 'pinia'
import type { Promotion } from '~/types/promo'

export const usePromoStore = defineStore('promoStore', {
  state: () => ({
    promotions: [] as Promotion[],
    appliedPromotion: null as Promotion | null,
  }),

  actions: {
    async loadPromotions() {
      try {
        const { data } = await useFetch<Promotion[]>('/api/promotions/all')
        this.promotions = data.value ?? []
      } catch (err) {
        console.error('Ошибка загрузки акций:', err)
      }
    },

    async applyPromotion(promotion: Promotion) {
      if (this.appliedPromotion && this.appliedPromotion.id !== promotion.id) {
        return {
          success: false,
          error: 'Уже применена другая акция. Сначала сбросьте текущую.',
        }
      }

      this.appliedPromotion = promotion
      return { success: true }
    },

    clearPromotion() {
      this.appliedPromotion = null
    },
  },
})
