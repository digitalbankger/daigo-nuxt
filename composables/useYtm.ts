import type {
  EventPayload,
  ProductObject,
  ListingObject,
  DetailObject,
  CartObject,
  CheckoutObject,
  TransactionObject,
  GeoObject,
  UserObject
} from '@/types/ytm'

const CLEAN = (obj: any) =>
  JSON.parse(
    JSON.stringify(obj, (_k, v) => (v === null || v === '' ? undefined : v))
  )

/**
 * Простая генерация стабильных идентификаторов для user/visitor.
 * Аналитику важнее стабильность, чем «красота».
 */
function getOrCreateId(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key)
    if (existing) return existing
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    storage.setItem(key, id)
    return id
  } catch {
    // storage может быть недоступен (Safari ITP и т.п.)
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`
  }
}

function getDefaultGeo(): GeoObject {
  // Минимально полезный «дефолт» (по ТЗ — geo должен быть всегда).
  // При необходимости можно расширить данными из DaData/адреса.
  return {
    country: 'Россия',
    country_id: 7
  }
}

function getDefaultUser(): UserObject {
  // По требованию аналитика: всегда guest, при авторизации ничего не меняем.
  // user_id обязателен — делаем стабильный ID в localStorage.
  const user_id = typeof window !== 'undefined'
    ? getOrCreateId(window.localStorage, 'daigo_user_id')
    : 'server'

  const visitor_id = typeof window !== 'undefined'
    ? getOrCreateId(window.sessionStorage, 'daigo_visitor_id')
    : 'server'

  return {
    user_id,
    visitor_id,
    user_type: 'guest'
  }
}

export function useYtm() {
  const push = (payload: Partial<EventPayload>) => {
    // SSR-safe: ничего не делаем, если нет window
    if (typeof window === 'undefined') return

    const base: Partial<EventPayload> = {}

    // geo/user должны присутствовать «на всех страницах/событиях»
    if (!payload.geo) base.geo = getDefaultGeo()
    if (!payload.user) base.user = getDefaultUser()

    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push(CLEAN({ ...base, ...payload }))
  }

  // ---------- PAGE ----------
  const setPageType = (
    page_type: string,
    extras?: { geo?: GeoObject; user?: UserObject; cart?: CartObject }
  ) =>
    push({
      // важно: в ТЗ у аналитика — view_page
      event: 'view_page',
      page_type,
      ...extras
    })

  // ---------- VIEWS ----------
  const viewListing = (listing: ListingObject) =>
    push({ event: 'view_item_list', listing, event_ecommerce: { items: listing.items, currency: listing.currency } })

  const viewDetail = (detail: DetailObject) =>
    push({ event: 'view_item', detail, event_ecommerce: { items: detail.items, currency: detail.currency } })

  const viewCart = (cart: CartObject) =>
    push({ event: 'view_cart', cart, event_ecommerce: { items: cart.items ?? undefined, currency: cart.currency } })

  // ---------- PRODUCT ACTIONS ----------
  const productClick = (
    product: ProductObject,
    list_id?: string,
    list_name?: string
  ) => {
    // анти-дубль: один и тот же клик в пределах короткого окна
    if (typeof window !== 'undefined') {
      const k = `ytm_product_click_${String(product.id)}`
      const now = Date.now()
      try {
        const prev = Number(sessionStorage.getItem(k) || '0')
        if (prev && now - prev < 800) return
        sessionStorage.setItem(k, String(now))
      } catch {
        // ignore
      }
    }

    push({
      event: 'product_click',
      event_ecommerce: { items: [product], list_id, list_name, currency: 'RUB' }
    })
  }

  const addToCart = (product: ProductObject, source: string = 'cart') =>
    push({
      event: 'add_to_cart',
      event_ecommerce: { items: [product], source, currency: 'RUB' }
    })

  const removeFromCart = (product: ProductObject, source: string = 'cart') =>
    push({
      event: 'remove_from_cart',
      event_ecommerce: { items: [product], source, currency: 'RUB' }
    })

  // ---------- CHECKOUT ----------
  const beginCheckout = (arg1: any, arg2?: ProductObject[], arg3?: string) => {
    // если пришёл объект с products — используем новую форму
    if (arg1 && Array.isArray(arg1.products)) {
      const {
        step,
        option,
        products,
        value,
        currency = 'RUB'
      } = arg1 as {
        step: number
        option?: string
        products: ProductObject[]
        value?: number
        currency?: string
      }
      const checkout: CheckoutObject = CLEAN({ step, option, value })
      push({
        event: 'begin_checkout',
        checkout,
        event_ecommerce: { items: products, currency }
      })
      return
    }
    // 2) Обратная совместимость со старой сигнатурой: (checkout, items, currency?)
    const checkout = arg1 as CheckoutObject
    const items = (arg2 || []) as ProductObject[]
    const currency = arg3 || 'RUB'
    push({
      event: 'begin_checkout',
      checkout,
      event_ecommerce: { items, currency }
    })
  }

  const checkoutProgress = (checkout: CheckoutObject) =>
    push({ event: 'checkout_progress', checkout })

  // ---------- PURCHASE (анти-дубль) ----------
  const purchase = (transaction: TransactionObject) => {
    if (typeof window === 'undefined') return
    const key = `ytm_purchase_${transaction.id}`
    if (localStorage.getItem(key)) return
    push({ event: 'purchase', transaction })
    localStorage.setItem(key, '1')
  }

  // ---------- PROMOS ----------
  const promoApply = (coupon: string) =>
    push({ event: 'apply_promo', event_data: { coupon } })

  const promoRemove = (coupon: string) =>
    push({ event: 'remove_promo', event_data: { coupon } })

  const promoView = (promotions: any[]) =>
    push({ event: 'promo_view', event_data: { promotions } })

  const promoClick = (promotions: any[]) =>
    push({ event: 'promo_click', event_data: { promotions } })

  return {
    push,
    setPageType,
    viewListing,
    viewDetail,
    viewCart,
    productClick,
    addToCart,
    removeFromCart,
    beginCheckout,
    checkoutProgress,
    purchase,
    promoApply,
    promoRemove,
    promoView,
    promoClick
  }
}
