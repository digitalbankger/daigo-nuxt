import { useRuntimeConfig } from '#imports'

/**
 * Сервис для работы с корзиной. Для гостя используется sessionID
 * (uuid, сохраняется в localStorage), для авторизованного пользователя – daigo_id.
 */
export const cartService = {
  /** Получить корзину пользователя */
  async getUserCart(userId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}`)
  },

  /** Получить корзину гостя */
  async getGuestCart(sessionId: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}`)
  },

  /** Добавить товар в корзину пользователя */
  async addUserItem(userId: number | string, productId: number | string, quantity: number) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}`, {
      method: 'POST',
      body: { product_id: String(productId), quantity }
    })
  },

  /** Добавить товар в гостевую корзину */
  async addGuestItem(sessionId: string, productId: number | string, quantity: number) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}`, {
      method: 'POST',
      body: { product_id: String(productId), quantity }
    })
  },

  /** Изменить количество товара пользователя */
  async updateUserItem(userId: number | string, productId: number | string, quantity: number) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}/${productId}`, {
      method: 'PUT',
      body: { quantity }
    })
  },

  /** Изменить количество товара гостя */
  async updateGuestItem(sessionId: string, productId: number | string, quantity: number) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/${productId}`, {
      method: 'PUT',
      body: { quantity }
    })
  },

  /** Удалить товар пользователя */
  async removeUserItem(userId: number | string, productId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}/${productId}`, { method: 'DELETE' })
  },

  /** Удалить товар гостя */
  async removeGuestItem(sessionId: string, productId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/${productId}`, {
      method: 'DELETE'
    })
  },

  /** Очистить корзину пользователя */
  async clearUserCart(userId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}`, { method: 'DELETE' })
  },

  /** Очистить корзину гостя */
  async clearGuestCart(sessionId: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}`, { method: 'DELETE' })
  },

  /** Применить купон авторизованного пользователя */
  async applyUserCoupon(userId: number | string, code: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}/coupon/apply`, {
      method: 'POST',
      body: { coupon_code: code }
    })
  },

  /** Применить купон гостя */
  async applyGuestCoupon(sessionId: string, code: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/coupon/apply`, {
      method: 'POST',
      body: { coupon_code: code }
    })
  },

  /** Отменить купон пользователя */
  async removeUserCoupon(userId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}/coupon`, { method: 'DELETE' })
  },

  /** Отменить купон гостя */
  async removeGuestCoupon(sessionId: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/coupon`, { method: 'DELETE' })
  },

  /** Предварительное оформление заказа для авторизованного */
  async preOrderUser(userId: number | string, fio: string, phone: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/cart/${userId}/pre-order`, {
      method: 'POST',
      body: { fio, phone_number: phone }
    })
  },

  /** Предварительное оформление заказа для гостя */
  async preOrderGuest(sessionId: string, fio: string, phone: string) {
    const { daigoApiBase } = useRuntimeConfig().public
    return await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/pre-order`, {
      method: 'POST',
      body: { fio, phone_number: phone }
    })
  },

  async migrateGuestToUser(sessionId: string, userId: number | string) {
    const { daigoApiBase } = useRuntimeConfig().public
    await $fetch(`${daigoApiBase}/v1/shop/guest-cart/${sessionId}/migrate`, {
      method: 'POST',
      body: { user_id: userId }
    })
  }

}
