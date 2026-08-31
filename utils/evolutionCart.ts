export const EVOLUTION_SINGLE_PRODUCT_ID = 'c715839e-2854-4929-9e4e-6061c93605a0'
export const EVOLUTION_PACK_PRODUCT_ID = '78b98d37-8283-406b-8b03-cce570ac4654'

export const EVOLUTION_SINGLE_SLUG = 'meta-napitok-daigo-evolution-mg10-1-banka'
export const EVOLUTION_PACK_SLUG = 'meta-napitok-daigo-evolution-mg10'

export const EVOLUTION_SINGLE_DELIVERY_MESSAGE =
  'Доставка одной банки Daigo Evolution доступна только вместе с упаковкой 12 шт. или с другими товарами.'

type CartLikeItem = {
  id?: string | number | null
  product_id?: string | number | null
  quantity?: number | null
  qty?: number | null
}

type ProductLike = {
  id?: string | number | null
  product_id?: string | number | null
  slug?: string | null
}

function itemId(item: CartLikeItem | ProductLike): string {
  return String(item.product_id ?? item.id ?? '')
}

function itemQuantity(item: CartLikeItem): number {
  return Number(item.quantity ?? item.qty ?? 0)
}

export function isEvolutionSingleProduct(product: ProductLike): boolean {
  return (
    itemId(product) === EVOLUTION_SINGLE_PRODUCT_ID ||
    String(product.slug || '') === EVOLUTION_SINGLE_SLUG
  )
}

export function isEvolutionPackProduct(product: ProductLike): boolean {
  return (
    itemId(product) === EVOLUTION_PACK_PRODUCT_ID ||
    String(product.slug || '') === EVOLUTION_PACK_SLUG
  )
}

/**
 * Одну банку Evolution можно добавить только если в корзине уже есть
 * любой другой товар (включая упаковку Evolution x12).
 */
export function hasEvolutionSingleCompanion(items: CartLikeItem[]): boolean {
  return items.some((item) => {
    if (itemQuantity(item) <= 0) return false
    return itemId(item) !== EVOLUTION_SINGLE_PRODUCT_ID
  })
}

export function canAddEvolutionSingle(items: CartLikeItem[]): boolean {
  return hasEvolutionSingleCompanion(items)
}

/**
 * Невалидная для оформления корзина: в ней есть товары, но все позиции —
 * только одиночные банки Evolution.
 */
export function isEvolutionSingleOnlyCart(items: CartLikeItem[]): boolean {
  const activeItems = items.filter((item) => itemQuantity(item) > 0)
  return (
    activeItems.length > 0 &&
    activeItems.every((item) => itemId(item) === EVOLUTION_SINGLE_PRODUCT_ID)
  )
}
