/**
 * Единственный локальный список товаров недели.
 *
 * Сами товары, их product_id, цены, изображения и variants приходят с Go API.
 * Порядок slug в массиве определяет порядок карточек в блоке каталога.
 */
export const OMEGA_BUNDLE_SLUGS = [
  'dvizhenie-mysli',
  'obnovlenie-kozhi',
  'svoboda-dyhaniya',
] as const

export type OmegaBundleSlug = (typeof OMEGA_BUNDLE_SLUGS)[number]

const OMEGA_BUNDLE_SLUG_SET = new Set<string>(OMEGA_BUNDLE_SLUGS)

export function isOmegaBundleSlug(slug: unknown): slug is OmegaBundleSlug {
  return OMEGA_BUNDLE_SLUG_SET.has(String(slug || '').trim())
}

export function getOmegaBundleSort(slug: unknown): number {
  const index = OMEGA_BUNDLE_SLUGS.indexOf(String(slug || '') as OmegaBundleSlug)
  return index < 0 ? Number.MAX_SAFE_INTEGER : index
}
