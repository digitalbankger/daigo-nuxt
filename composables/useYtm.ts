import type {
  EventEcommerce, ProductObject, ListingObject, CartObject,
  CheckoutObject, TransactionObject, GeoObject, UserObject
} from '@/types/ytm'

export function useYtm() {
  const push = (payload: Partial<EventEcommerce>) => {
    if (!process.client) return
    window.dataLayer = window.dataLayer || []
    const clean = JSON.parse(JSON.stringify(payload, (_, v) => (v === null || v === '' ? undefined : v)))
    window.dataLayer.push(clean)
  }

  const setPageType = (page_type: string, extras?: { geo?: GeoObject; user?: UserObject }) =>
    push({ event: 'page_view', page_type, ...extras })

  const productClick = (product: ProductObject, list_id?: string) =>
    push({ event: 'product_click', product, event_data: list_id ? { list_id } : undefined })

  const addToCart = (product: ProductObject) => push({ event: 'add_to_cart', product })
  const removeFromCart = (product: ProductObject) => push({ event: 'remove_from_cart', product })

  const viewListing = (listing: ListingObject) => push({ event: 'view_item_list', listing })
  const viewDetail = (detail: { product: ProductObject }) => push({ event: 'view_item', detail })
  const viewCart = (cart: CartObject) => push({ event: 'view_cart', cart })

  const beginCheckout = (checkout: CheckoutObject) => push({ event: 'begin_checkout', checkout })
  const checkoutProgress = (checkout: CheckoutObject) => push({ event: 'checkout_progress', checkout })
  const purchase = (transaction: TransactionObject) => push({ event: 'purchase', transaction })

  const promoApply = (coupon: string) => push({ event: 'apply_promo', event_data: { coupon } })
  const promoRemove = (coupon: string) => push({ event: 'remove_promo', event_data: { coupon } })

  return {
    push, setPageType,
    productClick, addToCart, removeFromCart,
    viewListing, viewDetail, viewCart,
    beginCheckout, checkoutProgress, purchase,
    promoApply, promoRemove
  }
}
