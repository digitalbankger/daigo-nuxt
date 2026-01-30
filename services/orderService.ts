// services/orderService.ts
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '@/stores/authStore'
import type { OrderCancelReason } from '~/types/orders'

/** Товар в заказе */
export interface OrderItemPayload {
  product_id: string            // UUID товара (или строковый ID)
  name: string                  // Название (для логов/админки)
  quantity: number              // Кол-во
  price: number                 // Цена за единицу (руб)
  amo_id?: number | null        // опционально
}

/** Получатель */
export interface OrderRecipient {
  name: string
  phone: string                 // уже очищенный номер (только цифры) — см. checkoutStore
  email?: string
  city?: string
}

/** Другой получатель */
export interface OtherRecipient {
  enabled: boolean
  name?: string
  phone?: string
  email?: string
}

/** Адрес (для курьера / ПВЗ / самовывоза) */
export interface OrderAddress {
  street?: string
  house?: string
  apartment?: string
  apt?: string
  entrance?: string
  floor?: string
  intercom?: string
  [k: string]: any              // допускаем доп. поля
}

/**
 * Payload создания заказа.
 *
 * ВАЖНО: у вас в разных местах встречались разные ключи:
 * - delivery / payment_method (рекомендовано)
 * - deliveryMethod / address / paymentMethod (исторически)
 *
 * Чтобы не ломать совместимость, тип содержит ОБА варианта.
 * Бэку отправляем как есть — без насильной трансформации.
 */
export interface OrderCreatePayload {
  daigo_id: number | string
  recipient: OrderRecipient
  items: OrderItemPayload[]

  // Рекомендованные ключи:
  delivery?: any                // { type: 'courier' | 'pvz' | 'pickup', ... }
  payment_method?: string       // 'sbp' | 'bank_card' | ...

  // Исторические ключи (если где-то ещё используются):
  deliveryMethod?: string
  address?: OrderAddress
  paymentMethod?: string

  // Другой получатель (новое поле — поддержка фронта)
  other_recipient?: OtherRecipient

  // Прочее
  comment?: string
  currency?: 'RUB'
  coupon_code?: string
  bonuses_discount?: number
  [k: string]: any
}

export interface CreateOrderResponse {
  order_id?: string | number
  confirmation?: { confirmation_url?: string }
  [k: string]: any
}

/* ----------------------- internal helpers ----------------------- */

function authHeaders() {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined
}

function toReadableError(e: any): Error & { status?: number } {
  const status = e?.status || e?.response?.status
  const backendMsg =
    e?.data?.message ||
    e?.response?._data?.message ||
    e?.message

  const err = new Error(
    status === 501
      ? 'ORDER_API_NOT_IMPLEMENTED'
      : backendMsg || 'ORDER_CREATE_FAILED'
  ) as Error & { status?: number } & { stage?: string }

  err.status = status
  // прокинем stage из ответа бэка, если есть
  const stage = e?.data?.stage ?? e?.response?._data?.stage ?? e?.stage
  if (stage) (err as any).stage = stage
  return err
}

/* ---------------------------- API ------------------------------- */

/** Создание заказа */
export async function createOrder(orderData: OrderCreatePayload): Promise<CreateOrderResponse> {
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    return await $fetch<CreateOrderResponse>(`${daigoApiBase}/v1/shop/order`, {
      method: 'POST',
      body: orderData,
      headers: authHeaders(),
    })
  } catch (e: any) {
    throw toReadableError(e)
  }
}

/** История заказов пользователя */
export async function fetchOrderHistory(daigoId: number | string) {
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    return await $fetch(`${daigoApiBase}/v1/shop/order/history/${daigoId}`, {
      headers: authHeaders(),
    })
  } catch (e: any) {
    throw toReadableError(e)
  }
}

/** Отмена заказа */
export async function cancelOrder(
  orderId: number | string,
  reason: OrderCancelReason,
  comment?: string
) {
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    return await $fetch(`${daigoApiBase}/v1/shop/order/${orderId}/cancel/`, {
      method: 'POST',
      headers: authHeaders(),
      body: {
        reason,
        comment,
      },
    })
  } catch (e: any) {
    throw toReadableError(e)
  }
}

/** Данные для страницы "Спасибо" по номеру заказа */
export type OrderThanksResponse = {
  order_id: number
  total_amount: string | number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  status?: string
}

/** Получить данные для страницы "Спасибо" */
export async function fetchOrderThanks(orderId: number | string): Promise<OrderThanksResponse> {
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    return await $fetch<OrderThanksResponse>(`${daigoApiBase}/v1/shop/order/thanks/${orderId}`, {
      headers: authHeaders(),
    })
  } catch (e: any) {
    throw toReadableError(e)
  }
}
