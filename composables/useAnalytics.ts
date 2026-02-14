import { useRuntimeConfig } from '#imports'

export interface AnalyticsProduct {
  id: string | number
  name: string
  price: number
  quantity: number
  category?: string
}

/**
 * Продукт для ecom-шагов 2–4 воронки (листинг/клик/деталка).
 * quantity здесь не нужен.
 */
export interface AnalyticsListItem {
  id: string | number
  name: string
  price: number
  position?: number
  category?: string
  list?: string
  url?: string
  image_url?: string
  brand?: string
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
    if (!process.client || typeof window === 'undefined') return

    const w = window as any

    // Если вызов произошёл раньше инициализации плагина — ставим shim,
    // чтобы цели/хиты не потерялись.
    if (typeof w.ym !== 'function') {
      const ymQueue: any[] = []
      w.ym = (...q: any[]) => { ymQueue.push(q) }
      ;(w.ym as any).a = ymQueue
      ;(w.ym as any).l = Date.now()
    }

    w.ym(...args)
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

  // --------- ECOMMERCE (ШАГИ 2–4 ВОРОНКИ) ---------
  const ssKey = (k: string) => `ym_ecom_${k}`

  const alreadySent = (k: string) => {
    if (!process.client) return false
    try {
      return sessionStorage.getItem(ssKey(k)) === '1'
    } catch {
      return false
    }
  }

  const markSent = (k: string) => {
    if (!process.client) return
    try {
      sessionStorage.setItem(ssKey(k), '1')
    } catch {
      // ignore
    }
  }

  /**
   * Шаг 2: "Посмотрели товар в списке".
   * Отправляем impressions (Enhanced Ecommerce) в dataLayer, который читает Я.Метрика.
   */
  function viewItemList(listName: string, items: AnalyticsListItem[], listId?: string) {
    if (!items?.length) return

    // Дедуп: один и тот же листинг на одной и той же странице не должен улетать многократно.
    const sig = `${listId || listName}::${items.map(i => String(i.id)).join(',')}`
    if (alreadySent(`impr::${sig}`)) return
    markSent(`impr::${sig}`)

    ecommercePush({
      currencyCode: 'RUB',
      impressions: items.map(i => ({
        id: String(i.id),
        name: i.name,
        price: Number(i.price),
        list: i.list || listName,
        position: i.position,
        ...(i.category ? { category: i.category } : {}),
        ...(i.brand ? { brand: i.brand } : {}),
        ...(i.url ? { url: i.url } : {}),
        ...(i.image_url ? { image_url: i.image_url } : {})
      }))
    })
  }

  /**
   * Шаг 3: "Кликнули по товару".
   */
  function selectItem(listName: string, item: AnalyticsListItem, listId?: string) {
    if (!item?.id) return
    ecommercePush({
      currencyCode: 'RUB',
      click: {
        actionField: {
          list: listName,
          ...(listId ? { id: listId } : {})
        },
        products: [{
          id: String(item.id),
          name: item.name,
          price: Number(item.price),
          ...(typeof item.position === 'number' ? { position: item.position } : {}),
          ...(item.category ? { category: item.category } : {}),
          ...(item.brand ? { brand: item.brand } : {})
        }]
      }
    })
  }

  /**
   * Шаг 4: "Посмотрели товар".
   */
  function viewItem(item: AnalyticsListItem) {
    if (!item?.id) return
    ecommercePush({
      currencyCode: 'RUB',
      detail: {
        products: [{
          id: String(item.id),
          name: item.name,
          price: Number(item.price),
          ...(item.category ? { category: item.category } : {}),
          ...(item.brand ? { brand: item.brand } : {}),
          ...(item.url ? { url: item.url } : {}),
          ...(item.image_url ? { image_url: item.image_url } : {})
        }]
      }
    })
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
    reach('addtocart', {
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

  return {
    hit,
    reach,
    ecommercePush,
    // шаги 2–4
    viewItemList,
    selectItem,
    viewItem,
    // шаги 5–6
    addToCart,
    purchase,
    phoneClick,
    formSubmit
  }
}
