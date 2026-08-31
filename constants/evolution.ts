import type { Product, ProductVariant } from '~/types/product'

export const EVOLUTION_CANONICAL_SLUG = 'meta-napitok-daigo-evolution-mg10'
export const EVOLUTION_SINGLE_SLUG = 'meta-napitok-daigo-evolution-mg10-1-banka'
export const EVOLUTION_LEGACY_SLUG = 'evolution-mg'

export const EVOLUTION_SINGLE_PRODUCT_ID = 'c715839e-2854-4929-9e4e-6061c93605a0'
export const EVOLUTION_X12_PRODUCT_ID = '78b98d37-8283-406b-8b03-cce570ac4654'

export const EVOLUTION_PACK_SIZES = [1, 12] as const
export type EvolutionPackSize = (typeof EVOLUTION_PACK_SIZES)[number]

export type EvolutionProductConfig = {
  packSize: EvolutionPackSize
  productId: string
  slug: string
  backendName: string
  label: string
}

export const EVOLUTION_PRODUCTS: Record<EvolutionPackSize, EvolutionProductConfig> = {
  1: {
    packSize: 1,
    productId: EVOLUTION_SINGLE_PRODUCT_ID,
    slug: EVOLUTION_SINGLE_SLUG,
    backendName: 'Evolution',
    label: '1 банка',
  },
  12: {
    packSize: 12,
    productId: EVOLUTION_X12_PRODUCT_ID,
    slug: EVOLUTION_CANONICAL_SLUG,
    backendName: 'Evolution x12',
    label: '12 банок',
  },
}

export function getEvolutionProductConfig(packSize: EvolutionPackSize): EvolutionProductConfig {
  return EVOLUTION_PRODUCTS[packSize]
}

export function findEvolutionProductConfig(value: unknown): EvolutionProductConfig | null {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return null

  return Object.values(EVOLUTION_PRODUCTS).find((item) =>
    item.slug.toLowerCase() === normalized ||
    item.productId.toLowerCase() === normalized,
  ) || null
}

export function isEvolutionProductSlug(value: unknown): boolean {
  const slug = String(value || '').trim().toLowerCase()
  if (!slug) return false

  return slug === EVOLUTION_LEGACY_SLUG || Boolean(findEvolutionProductConfig(slug))
}

export function isEvolutionProductId(value: unknown): boolean {
  return Boolean(findEvolutionProductConfig(value))
}

export function getEvolutionPackSizeFromSlug(value: unknown): EvolutionPackSize {
  return String(value || '').trim().toLowerCase() === EVOLUTION_SINGLE_SLUG
    ? 1
    : 12
}

export function getEvolutionPackSizeFromProduct(product: Partial<Product> | null | undefined): EvolutionPackSize {
  const byId = findEvolutionProductConfig(product?.product_id)
  if (byId) return byId.packSize

  const bySlug = findEvolutionProductConfig(product?.slug)
  if (bySlug) return bySlug.packSize

  return getEvolutionPackSizeFromSlug(product?.slug)
}

export function getEvolutionSlugForPackSize(packSize: EvolutionPackSize): string {
  return EVOLUTION_PRODUCTS[packSize].slug
}

export function getEvolutionProductIdForPackSize(packSize: EvolutionPackSize): string {
  return EVOLUTION_PRODUCTS[packSize].productId
}

export function getEvolutionTitle(packSize: EvolutionPackSize): string {
  return `Метанапиток Daigo Evolution 10 + MG (${packSize === 1 ? '1 банка' : '12 банок'})`
}

function textPackSize(variant: ProductVariant): EvolutionPackSize | null {
  const text = [
    variant.label,
    variant.title,
    (variant as ProductVariant & { name?: string }).name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/ё/g, 'е')

  if (/\b12\s*(?:бан|шт|bottle|can)/i.test(text) || /\b12\b/.test(text)) return 12
  if (/\b1\s*(?:бан|шт|bottle|can)/i.test(text) || /(?:^|\s)1(?:\s|$)/.test(text)) return 1

  return null
}

function itemsPackSize(variant: ProductVariant): EvolutionPackSize | null {
  const quantities = (variant.items || [])
    .map((item) => Number(item.quantity || 0))
    .filter((quantity) => Number.isFinite(quantity) && quantity > 0)

  if (!quantities.length) return null

  const maxQuantity = Math.max(...quantities)
  if (maxQuantity >= 12) return 12
  if (maxQuantity === 1) return 1

  return null
}

/**
 * Legacy fallback: раньше Evolution был одним товаром с variants.
 * Оставляем распознавание на переходный период, но новые товары определяются
 * по отдельным product_id + slug из EVOLUTION_PRODUCTS.
 */
export function getEvolutionVariantPackSize(variant: ProductVariant): EvolutionPackSize | null {
  return textPackSize(variant) ?? itemsPackSize(variant)
}

export function findEvolutionVariant(
  variants: ProductVariant[] | undefined,
  packSize: EvolutionPackSize,
): ProductVariant | null {
  const list = [...(variants || [])].sort(
    (left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0),
  )

  const exact = list.find((variant) => getEvolutionVariantPackSize(variant) === packSize)
  if (exact) return exact

  if (list.length === 2) {
    const byPrice = [...list].sort(
      (left, right) => Number(left.price || 0) - Number(right.price || 0),
    )
    return packSize === 1 ? byPrice[0] : byPrice[1]
  }

  return null
}

export function presentEvolutionProduct(
  product: Product,
  requestedSlug: unknown,
): Product {
  if (!isEvolutionProductSlug(requestedSlug)) return product

  const packSize = getEvolutionPackSizeFromSlug(requestedSlug)
  const config = getEvolutionProductConfig(packSize)
  const productIdentity =
    findEvolutionProductConfig(product.product_id) || findEvolutionProductConfig(product.slug)
  const isNewSeparateProduct = String(product.product_id || '') === config.productId

  // Если mock-контент от 12 банок используется как визуальный fallback для URL 1 банки,
  // не разрешаем случайно купить другой товар. Реальный product_id известен, но цену
  // ждём строго от карточки соответствующего товара Go API.
  if (productIdentity && productIdentity.packSize !== packSize) {
    return {
      ...product,
      product_id: config.productId,
      slug: config.slug,
      title: getEvolutionTitle(packSize),
      price: 0,
      originalPrice: undefined,
      oldPrice: undefined,
    }
  }

  // Новая модель: 1 банка и 12 банок — два самостоятельных товара в БД.
  // Цена/product_id приходят непосредственно из карточки соответствующего товара.
  if (isNewSeparateProduct) {
    return {
      ...product,
      slug: config.slug,
      title: getEvolutionTitle(packSize),
    }
  }

  // Переходный fallback для старого API, где Evolution был одним товаром с variants.
  const variant = findEvolutionVariant(product.variants, packSize)
  const variantPrice = Number(variant?.price || 0)
  const variantOldPrice = Number(variant?.originalPrice || variant?.oldPrice || 0)

  const fallbackPrice = Number(product.price || 0)
  const currentPrice = variantPrice > 0 ? variantPrice : fallbackPrice
  const fallbackOldPrice = Number(product.originalPrice || product.oldPrice || 0)
  const oldPrice = variantOldPrice > currentPrice
    ? variantOldPrice
    : fallbackOldPrice > currentPrice
      ? fallbackOldPrice
      : undefined

  return {
    ...product,
    slug: config.slug,
    title: getEvolutionTitle(packSize),
    price: currentPrice,
    originalPrice: oldPrice,
    oldPrice,
  }
}

/**
 * Отзывы Evolution оставляем общими для обеих упаковок, как было согласовано ранее.
 */
export function getEvolutionUpstreamSlug(value: unknown): string {
  return isEvolutionProductSlug(value) ? EVOLUTION_LEGACY_SLUG : String(value || '')
}
