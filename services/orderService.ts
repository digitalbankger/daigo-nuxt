// services/orderService.ts
import { useAuthStore } from '@/stores/authStore'

export interface OrderCreatePayload {
  daigo_id: number
  // ... остальные поля, которые требует ваш бэкенд (адрес, товары, оплата и т.д.)
  [k: string]: any
}

export async function createOrder(orderData: OrderCreatePayload) {
  const auth = useAuthStore()
  return await $fetch('/api/orders', {
    method: 'POST',
    body: orderData,
    headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined
  })
}

export async function fetchOrderHistory(daigoId: number) {
  const auth = useAuthStore()
  return await $fetch(`/api/orders/history/${daigoId}`, {
    headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined
  })
}

export async function cancelOrder(orderId: number | string) {
  const auth = useAuthStore()
  return await $fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined
  })
}
