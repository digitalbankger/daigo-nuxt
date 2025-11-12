// composables/useYtm.ts
import type {
  EventPayload, ProductObject, ListingObject, DetailObject,
  CartObject, CheckoutObject, TransactionObject, GeoObject, UserObject
} from '@/types/ytm'

const CLEAN = (obj: any) =>
  JSON.parse(JSON.stringify(obj, (_k, v) => (v === null || v === '' ? undefined : v)))

export function useYtm() {
  const push = (payload: Partial<EventPayload>) => {
    if (process.server) return
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push(CLEAN(payload))
  }

  // ---------- PAGE ----------
  const setPageType = (
    page_type: string,
    extras?: { geo?: GeoObject; user?: UserObject; cart?: CartObject }
  ) => push({ event: 'page_view', page_type, ...extras })

  // ---------- VIEWS ----------
  const viewListing = (listing: ListingObject) => push({ event: 'view_item_list', listing })
  const viewDetail  = (detail: DetailObject)        => push({ event: 'view_item', detail })
  const viewCart    = (cart: CartObject)            => push({ event: 'view_cart', cart })

  // ---------- PRODUCT ACTIONS ----------
  // добавляю currency: 'RUB' по умолчанию, как требует ТЗ для ecom-событий
  const productClick  = (product: ProductObject, list_id?: string, list_name?: string) =>
    push({ event: 'product_click',
      event_ecommerce: { items: [product], list_id, list_name, currency: 'RUB' }
    })

  const addToCart     = (product: ProductObject, source: string = 'cart') =>
    push({ event: 'add_to_cart',
      event_ecommerce: { items: [product], source, currency: 'RUB' }
    })

  const removeFromCart = (product: ProductObject, source: string = 'cart') =>
    push({ event: 'remove_from_cart',
      event_ecommerce: { items: [product], source, currency: 'RUB' }
    })

  // ---------- CHECKOUT ----------
  // 1) Новая «удобная» сигнатура: beginCheckout({ step, option, products, value, currency })
  const beginCheckout = (arg1: any, arg2?: ProductObject[], arg3?: string) => {
    // если пришёл объект с products — используем новую форму
    if (arg1 && Array.isArray(arg1.products)) {
      const { step, option, products, value, currency = 'RUB' } = arg1 as {
        step: number; option?: string; products: ProductObject[]; value?: number; currency?: string
      }
      const checkout: CheckoutObject = CLEAN({ step, option, value })
      push({ event: 'begin_checkout', checkout, event_ecommerce: { items: products, currency } })
      return
    }
    // 2) Обратная совместимость со старой сигнатурой: (checkout, items, currency?)
    const checkout = arg1 as CheckoutObject
    const items = (arg2 || []) as ProductObject[]
    const currency = arg3 || 'RUB'
    push({ event: 'begin_checkout', checkout, event_ecommerce: { items, currency } })
  }

  const checkoutProgress = (checkout: CheckoutObject) =>
    push({ event: 'checkout_progress', checkout })

  // ---------- PURCHASE (анти-дубль) ----------
  const purchase = (transaction: TransactionObject) => {
    if (process.server) return
    const key = `ytm_purchase_${transaction.id}`
    if (localStorage.getItem(key)) return
    push({ event: 'purchase', transaction })
    localStorage.setItem(key, '1')
  }

  // ---------- PROMOS ----------
  const promoApply  = (coupon: string) => push({ event: 'apply_promo',  event_data: { coupon } })
  const promoRemove = (coupon: string) => push({ event: 'remove_promo', event_data: { coupon } })

  const promoView   = (promotions: any[]) => push({ event: 'promo_view',  event_data: { promotions } })
  const promoClick  = (promotion: any)    => push({ event: 'promo_click', event_data: { promotions: [promotion] } })

  return {
    push, setPageType, viewListing, viewDetail, viewCart,
    productClick, addToCart, removeFromCart,
    beginCheckout, checkoutProgress, purchase,
    promoApply, promoRemove, promoView, promoClick
  }
}
