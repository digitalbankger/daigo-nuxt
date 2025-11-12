import { useRuntimeConfig } from '#imports'

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

  const ymCall = (...args: any[]) => {
    if (process.client && typeof window !== 'undefined' && typeof (window as any).ym === 'function') {
      ;(window as any).ym(...args)
    }
  }

  function hit(path?: string, title?: string) {
    if (!counterId) return
    const p = path ?? (process.client ? location.pathname + location.search : '')
    ymCall(counterId, 'hit', p, { title: title ?? (process.client ? document.title : undefined) })
  }

  function reach(goal: string, params?: Record<string, any>) {
    if (!counterId) return
    ymCall(counterId, 'reachGoal', goal, params || {})
  }

  function ecommercePush(payload: any) {
    if (!process.client) return
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({ ecommerce: payload })
  }

  function addToCart(p: AnalyticsProduct) {
    ecommercePush({
      add: { products: [{
        id: String(p.id),
        name: p.name,
        price: Number(p.price),
        quantity: Number(p.quantity),
        ...(p.category ? { category: p.category } : {})
      }]}
    })
    // параллельно шлём явную цель для наглядной конверсии
    reach('add_to_cart', {
      product_id: String(p.id),
      price: Number(p.price),
      quantity: Number(p.quantity)
    })
  }

  function purchase(o: AnalyticsOrder) {
    ecommercePush({
      purchase: {
        actionField: {
          id: String(o.id),
          revenue: Number(o.revenue),
          currency: o.currency || 'RUB'
        },
        products: o.products.map(p => ({
          id: String(p.id),
          name: p.name,
          price: Number(p.price),
          quantity: Number(p.quantity),
          ...(p.category ? { category: p.category } : {})
        }))
      }
    })
    reach('purchase', {
      order_id: String(o.id),
      revenue: Number(o.revenue),
      currency: o.currency || 'RUB'
    })
  }

  function phoneClick(source: 'header' | 'other' = 'other') {
    reach(source === 'header' ? 'header_phone_click' : 'call_click')
  }

  function formSubmit(formName?: string) {
    reach('form_submit', { form: formName || 'unknown' })
  }

  return { hit, reach, ecommercePush, addToCart, purchase, phoneClick, formSubmit }
}
