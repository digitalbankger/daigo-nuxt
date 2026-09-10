/**
 * Единый источник правды для товаров, доступных только по предзаказу.
 *
 * Чтобы включить/выключить предзаказ, достаточно изменить `enabled` у правила.
 * Все UI-проверки и зависимые ограничения (например, скрытие bundle-апсейлов)
 * должны использовать хелперы из этого файла, а не проверять slug/id напрямую.
 */
export type PreorderProductLike = {
  slug?: unknown
  product_id?: unknown
  id?: unknown
}

export type PreorderRule = {
  enabled: boolean
  slugs: readonly string[]
  productIds: readonly string[]
  ctaLabel: string
  phoneLabel: string
  phoneHref: string
  cartBlockedMessage: string
  /** Наборы, которые нельзя продавать/предлагать, пока товар на предзаказе. */
  hiddenBundleSlugs?: readonly string[]
}

export const PREORDER_RULES = {
  brainy: {
    enabled: true,
    slugs: ['daigo-brain', 'daigo-brainy'],
    productIds: ['3e719f30-647d-4234-ac98-90824d573801'],
    ctaLabel: 'Предзаказ',
    phoneLabel: '8 (800) 555-20-43',
    phoneHref: 'tel:88005552043',
    cartBlockedMessage: 'Товар доступен только по предзаказу',
    hiddenBundleSlugs: ['dvizhenie-mysli'],
  },
  legacyPromo: {
    enabled: true,
    slugs: [],
    productIds: ['old-02417fb2-3a7d-40fd-a2fd-02446eef174f'],
    ctaLabel: 'Предзаказ',
    phoneLabel: '8 (800) 555-20-43',
    phoneHref: 'tel:88005552043',
    cartBlockedMessage: 'Товар доступен только по предзаказу',
    hiddenBundleSlugs: [],
  },
} as const satisfies Record<string, PreorderRule>

export type PreorderRuleKey = keyof typeof PREORDER_RULES

const normalizeSlug = (value: unknown) => String(value || '').trim().toLowerCase()
const normalizeId = (value: unknown) => String(value || '').trim()

const activeRules = (): readonly PreorderRule[] =>
  Object.values(PREORDER_RULES).filter((rule) => rule.enabled)

export function getPreorderRule(
  product: PreorderProductLike | null | undefined,
): PreorderRule | null {
  if (!product) return null

  const slug = normalizeSlug(product.slug)
  const id = normalizeId(product.product_id || product.id)

  return (
    activeRules().find(
      (rule) =>
        (slug && rule.slugs.some((item) => normalizeSlug(item) === slug)) ||
        (id && rule.productIds.some((item) => normalizeId(item) === id)),
    ) || null
  )
}

export function isPreorderProduct(
  product: PreorderProductLike | null | undefined,
): boolean {
  return Boolean(getPreorderRule(product))
}

export function isBundleHiddenByPreorder(slug: unknown): boolean {
  const normalized = normalizeSlug(slug)
  if (!normalized) return false

  return activeRules().some((rule) =>
    (rule.hiddenBundleSlugs || []).some(
      (bundleSlug) => normalizeSlug(bundleSlug) === normalized,
    ),
  )
}
