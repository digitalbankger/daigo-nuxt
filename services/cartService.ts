import { useRuntimeConfig } from '#imports'
import { getLastUtm } from '@/composables/useUtmTracker'

function buildUtmPayload() {
  const last = getLastUtm()
  if (!last) return undefined

  const utm: any = {
    source: last.source,
    medium: last.medium,
    campaign: last.campaign,
    content: last.content,
    term: last.term,
  }

  // убираем undefined
  Object.keys(utm).forEach((k) => utm[k] === undefined && delete utm[k])

  // если нет ни одной UTM-метки (кроме ts) — не отправляем
  const hasMeaningful = ['source', 'medium', 'campaign', 'content', 'term'].some((k) => k in utm)
  if (!hasMeaningful) return undefined

  return utm
}

/**
 * Сервис для работы с корзиной. Для гостя используется sessionID
 * (uuid, сохраняется в localStorage), для авторизованного пользователя – daigo_id.
 */
export const cartService = {
  // --- helpers ---
  _base(): string {
    const { daigoApiBase } = useRuntimeConfig().public as any
    return String(daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  },

  // ====== NEW 2+1 ======
  /** Применить 2+1 для гостя: POST /v1/shop/guest-cart/{sessionId}/apply-2plus1  { product_id } */
  apply2Plus1Guest(sessionId: string, body: { product_id: string }) {
    return $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/apply-2plus1`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Применить 2+1 для пользователя: POST /v1/shop/cart/{daigoID}/apply-2plus1  { product_id } */
  apply2Plus1User(userId: string | number, body: { product_id: string }) {
    return $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/apply-2plus1`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Получить корзину пользователя */
  async getUserCart(userId: number | string) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}`)
  },

  /** Получить корзину гостя */
  async getGuestCart(sessionId: string) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}`)
  },

  /** Добавить товар в корзину пользователя */
  async addUserItem(userId: number | string, productId: number | string, quantity: number) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}`, {
      method: 'POST',
      body: { product_id: String(productId), quantity },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Добавить товар в гостевую корзину */
  async addGuestItem(sessionId: string, productId: number | string, quantity: number) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      body: { product_id: String(productId), quantity },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Изменить количество товара пользователя */
  async updateUserItem(userId: number | string, productId: number | string, quantity: number) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/${encodeURIComponent(String(productId))}`, {
      method: 'PUT',
      body: { quantity },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Изменить количество товара гостя */
  async updateGuestItem(sessionId: string, productId: number | string, quantity: number) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/${encodeURIComponent(String(productId))}`, {
      method: 'PUT',
      body: { quantity },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Удалить товар пользователя */
  async removeUserItem(userId: number | string, productId: number | string) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/${encodeURIComponent(String(productId))}`, {
      method: 'DELETE'
    })
  },

  /** Удалить товар гостя */
  async removeGuestItem(sessionId: string, productId: number | string) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/${encodeURIComponent(String(productId))}`, {
      method: 'DELETE'
    })
  },

  /** Очистить корзину пользователя */
  async clearUserCart(userId: number | string) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}`, { method: 'DELETE' })
  },

  /** Очистить корзину гостя */
  async clearGuestCart(sessionId: string) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}`, { method: 'DELETE' })
  },

  /** Применить купон авторизованного пользователя */
  async applyUserCoupon(userId: number | string, code: string) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/coupon/apply`, {
      method: 'POST',
      body: { coupon_code: code },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Применить купон гостя */
  async applyGuestCoupon(sessionId: string, code: string) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/coupon/apply`, {
      method: 'POST',
      body: { coupon_code: code },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Отменить купон пользователя */
  async removeUserCoupon(userId: number | string) {
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/coupon`, { method: 'DELETE' })
  },

  /** Отменить купон гостя */
  async removeGuestCoupon(sessionId: string) {
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/coupon`, { method: 'DELETE' })
  },

  /** Предварительное оформление заказа для авторизованного */
  async preOrderUser(userId: number | string, fio: string, phone: string) {
    const utm = buildUtmPayload()
    return await $fetch(`${this._base()}/v1/shop/cart/${encodeURIComponent(String(userId))}/pre-order`, {
      method: 'POST',
      body: {
        fio,
        phone_number: phone,
        ...(utm ? { utm } : {}),
      },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Предварительное оформление заказа для гостя */
  async preOrderGuest(sessionId: string, fio: string, phone: string) {
    const utm = buildUtmPayload()
    return await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/pre-order`, {
      method: 'POST',
      body: {
        fio,
        phone_number: phone,
        ...(utm ? { utm } : {}),
      },
      headers: { 'Content-Type': 'application/json' },
    })
  },

  /** Миграция гостевой корзины в пользовательскую */
  async migrateGuestToUser(sessionId: string, userId: number | string) {
    await $fetch(`${this._base()}/v1/shop/guest-cart/${encodeURIComponent(sessionId)}/migrate`, {
      method: 'POST',
      body: { daigo_id: userId },
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
