/**
 * Единственный локальный список товаров недели.
 *
 * Сами товары, их product_id, цены, изображения и variants приходят с Go API.
 * Порядок slug в массиве определяет порядок карточек в блоке каталога.
 */
export const OMEGA_BUNDLE_SLUGS = [
  'dvizhenie-mysli',
  'obnovlenie-kozhi',
  'svoboda-dvizheniya',
] as const

export type OmegaBundleSlug = (typeof OMEGA_BUNDLE_SLUGS)[number]

export const OMEGA_PRODUCT_SLUG = 'zhir-pecheni-treski-omega-3'

export const OMEGA_BUNDLE_UI = {
  'dvizhenie-mysli': {
    title: 'Движение мысли',
    partnerName: 'Brainy',
    oneImage: '/images/omega-bundle/ob-1-nabor.png',
    twoImage: '/images/omega-bundle/ob-2-nabor.png',
  },
  'obnovlenie-kozhi': {
    title: 'Обновление кожи',
    partnerName: 'Dermic',
    oneImage: '/images/omega-bundle/od-1-nabor.png',
    twoImage: '/images/omega-bundle/od-2-nabor.png',
  },
  'svoboda-dvizheniya': {
    title: 'Свобода движения',
    partnerName: 'Jontic',
    oneImage: '/images/omega-bundle/oj-1-nabor.png',
    twoImage: '/images/omega-bundle/on-2-nabor.png',
  },
} as const satisfies Record<OmegaBundleSlug, {
  title: string
  partnerName: string
  oneImage: string
  twoImage: string
}>

const OMEGA_BUNDLE_SLUG_SET = new Set<string>(OMEGA_BUNDLE_SLUGS)

export function isOmegaBundleSlug(slug: unknown): slug is OmegaBundleSlug {
  return OMEGA_BUNDLE_SLUG_SET.has(String(slug || '').trim())
}

export function getOmegaBundleSort(slug: unknown): number {
  const index = OMEGA_BUNDLE_SLUGS.indexOf(String(slug || '') as OmegaBundleSlug)
  return index < 0 ? Number.MAX_SAFE_INTEGER : index
}

export function isOmegaProductTitle(title: unknown): boolean {
  const normalized = String(title || '').toLowerCase().replace(/ё/g, 'е')
  return normalized.includes('жир печени трески') && normalized.includes('омега')
}
