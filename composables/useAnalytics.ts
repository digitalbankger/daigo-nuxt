// composables/useAnalytics.ts
import { useRuntimeConfig } from '#imports'
import { useYtm } from '@/composables/useYtm'

export interface AnalyticsProduct {
  id: string | number
  name: string
  price: number
  quantity: number
  category?: string
}

export interface AnalyticsOrder {
  id: string | number
  revenue: number
  currency?: string
  products: AnalyticsProduct[]
}

export function useAnalytics() {
  const { public: { ymCounterId } } = useRuntimeConfig()
  const counterId = Number(ymCounterId)
  const ytm = useYtm()

  const ymCall = (...args: any[]) => {
    if (process.client && typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
      ;(window as any).ym(...args)
    }
  }

  // --- НЕ eCom: оставляем как было ---
  function hit(path?: string, title?: string) {
    if (!counterId) return
    const p = path ?? (process.client ? location.pathname + location.search : '')
    ymCall(counterId, 'hit', p, { title: title ?? (process.client ? document.title : undefined) })
  }

  function reach(goal: string, params?: Record<string, any>) {
    if (!counterId) return
    ymCall(counterId, 'reachGoal', goal, params || {})
  }

  // ─────────────────────────────────────────────────────────────
  // Удалено: ecommercePush(...) — больше не пушим eCom вручную.
  // Весь eCom идёт ТОЛЬКО через useYtm() → dataLayer.
  // ─────────────────────────────────────────────────────────────

  // --- eCom события → ТОЛЬКО в Tag Manager через useYtm() ---
  function addToCart(p: AnalyticsProduct) {
    ytm.addToCart({
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      quantity: Number(p.quantity),
      ...(p.category ? { category: p.category } : {})
    })
    // Если вдруг захочешь параллельно цель в Метрику — раскомментируй:
    // reach('add_to_cart', { product_id: String(p.id), price: Number(p.price), quantity: Number(p.quantity) })
  }

  function purchase(o: AnalyticsOrder) {
    ytm.purchase({
      id: String(o.id),
      value: Number(o.revenue),
      currency: o.currency || 'RUB',
      products: o.products.map(p => ({
        id: String(p.id),
        name: p.name,
        price: Number(p.price),
        quantity: Number(p.quantity),
        ...(p.category ? { category: p.category } : {})
      }))
    })
    // Если понадобятся цели в Метрике — раскомментируй:
    // reach('purchase', { order_id: String(o.id), revenue: Number(o.revenue), currency: o.currency || 'RUB' })
  }

  // --- не eCom, оставляем как было ---
  function phoneClick(source: 'header' | 'other' = 'other') {
    reach(source === 'header' ? 'header_phone_click' : 'call_click')
  }

  function formSubmit(formName?: string) {
    reach('form_submit', { form: formName || 'unknown' })
  }

  // ВОЗВРАЩАЕМ БЕЗ ecommercePush
  return { hit, reach, addToCart, purchase, phoneClick, formSubmit }
}
