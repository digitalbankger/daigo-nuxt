import { useAuthStore } from '@/stores/authStore'
import { unref } from 'vue'

export interface ReviewProductOption {
  product_id?: string | number
  id?: string | number
  slug?: string
  title?: string
  name?: string
}

export interface ReviewCreatePayload {
  daigo_id: string | number
  author: string
  rating: number
  title?: string
  text: string
  product_slug?: string
  product_id?: string | number
  order_id?: string | number
  tags?: string[]
  media?: Array<{ type: 'image' | 'video'; thumb?: string; src?: string }>
}

function authHeaders() {
  const auth = useAuthStore()
  const raw = (auth as any).token
  const token = typeof raw === 'string' ? raw : unref(raw)
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

export async function createProductReview(slug: string, payload: ReviewCreatePayload | FormData) {
  return await $fetch(`/api/shop/reviews/${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  })
}

export async function createOrderReview(payload: ReviewCreatePayload | FormData) {
  return await $fetch('/api/shop/reviews/order', {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  })
}

export async function createCommonReview(payload: ReviewCreatePayload) {
  return await $fetch('/api/shop/reviews', {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  })
}
