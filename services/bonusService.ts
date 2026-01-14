import { api } from '@/services/api'

export interface BonusCalculateRequest {
  cart_total: number
}

export interface BonusCalculateResponse {
  balance: number
  max_bonuses_available: number
  max_total_discount_percent: number
  currency: string
}

/**
 * Рассчитать доступные для списания бонусы для текущей корзины.
 * Бэкенд определяет лимиты на основе суммы корзины и баланса пользователя.
 */
export const bonusService = {
  async calculate(cartTotal: number): Promise<BonusCalculateResponse> {
    const payload: BonusCalculateRequest = { cart_total: cartTotal }
    const { data } = await api.post<BonusCalculateResponse>('/v1/shop/bonus/calculate', payload)
    return data
  }
}
