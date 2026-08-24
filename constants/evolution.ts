import type { Product, ProductVariant } from '~/types/product'

export const EVOLUTION_CANONICAL_SLUG = 'meta-napitok-daigo-evolution-mg10'
export const EVOLUTION_SINGLE_SLUG = 'meta-napitok-daigo-evolution-mg10-1-banka'
export const EVOLUTION_LEGACY_SLUG = 'evolution-mg'

export const EVOLUTION_PACK_SIZES = [1, 12] as const
export type EvolutionPackSize = (typeof EVOLUTION_PACK_SIZES)[number]

export function isEvolutionProductSlug(value: unknown): boolean {
  const slug = String(value || '').trim().toLowerCase()
  if (!slug) return false

  return slug.includes('evolution')
}

export function getEvolutionPackSizeFromSlug(value: unknown): EvolutionPackSize {
  return String(value || '').trim().toLowerCase() === EVOLUTION_SINGLE_SLUG
    ? 1
    : 12
}

export function getEvolutionSlugForPackSize(packSize: EvolutionPackSize): string {
  return packSize === 1 ? EVOLUTION_SINGLE_SLUG : EVOLUTION_CANONICAL_SLUG
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

  // Фолбэк для API, где label/title ещё не содержат количество:
  // для двух вариантов дешёвый считаем 1 банкой, дорогой — 12 банками.
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
  const variant = findEvolutionVariant(product.variants, packSize)
  const variantPrice = Number(variant?.price || 0)
  const variantOldPrice = Number(variant?.originalPrice || variant?.oldPrice || 0)

  const fallbackPrice = packSize === 12 ? Number(product.price || 0) : 0
  const currentPrice = variantPrice > 0 ? variantPrice : fallbackPrice
  const fallbackOldPrice = packSize === 12
    ? Number(product.originalPrice || product.oldPrice || 0)
    : 0
  const oldPrice = variantOldPrice > currentPrice
    ? variantOldPrice
    : fallbackOldPrice > currentPrice
      ? fallbackOldPrice
      : undefined

  return {
    ...product,
    slug: getEvolutionSlugForPackSize(packSize),
    title: getEvolutionTitle(packSize),
    price: currentPrice,
    originalPrice: oldPrice,
    oldPrice,
  }
}

export function getEvolutionUpstreamSlug(value: unknown): string {
  return isEvolutionProductSlug(value) ? EVOLUTION_LEGACY_SLUG : String(value || '')
}
