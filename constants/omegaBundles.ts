import { isBundleHiddenByPreorder } from '~/constants/preorderProducts'

/**
 * Полный список bundle-товаров Omega + аминобиотик.
 * Порядок определяет порядок карточек в апсейлах.
 */
export const ALL_OMEGA_BUNDLE_SLUGS = [
  'dvizhenie-mysli',
  'obnovlenie-kozhi',
  'svoboda-dvizheniya',
] as const

export type OmegaBundleSlug = (typeof ALL_OMEGA_BUNDLE_SLUGS)[number]

/**
 * Активные для продажи/апсейла наборы вычисляются автоматически.
 * Если товар переведён в предзаказ и в preorderProducts.ts у него указан
 * hiddenBundleSlugs, соответствующий набор исчезает отсюда без ручных комментариев.
 */
export const OMEGA_BUNDLE_SLUGS: readonly OmegaBundleSlug[] =
  ALL_OMEGA_BUNDLE_SLUGS.filter((slug) => !isBundleHiddenByPreorder(slug))

export const OMEGA_PRODUCT_SLUG = 'zhir-pecheni-treski-omega-3'

export const OMEGA_BUNDLE_UI = {
  'dvizhenie-mysli': {
    title: 'Движение мысли',
    tabLabel: 'Фокус',
    partnerName: 'Brainy',
    oneImage: '/images/omega-bundle/ob-1-nabor.png',
    twoImage: '/images/omega-bundle/ob-2-nabor.png',
  },
  'obnovlenie-kozhi': {
    title: 'Обновление кожи',
    tabLabel: 'Кожа',
    partnerName: 'Dermic',
    oneImage: '/images/omega-bundle/od-1-nabor.png',
    twoImage: '/images/omega-bundle/od-2-nabor.png',
  },
  'svoboda-dvizheniya': {
    title: 'Свобода движения',
    tabLabel: 'Движение',
    partnerName: 'Jontic',
    oneImage: '/images/omega-bundle/oj-1-nabor.png',
    twoImage: '/images/omega-bundle/on-2-nabor.png',
  },
} as const satisfies Record<OmegaBundleSlug, {
  title: string
  tabLabel: string
  partnerName: string
  oneImage: string
  twoImage: string
}>

const OMEGA_BUNDLE_SLUG_SET = new Set<string>(ALL_OMEGA_BUNDLE_SLUGS)
const ACTIVE_OMEGA_BUNDLE_SLUG_SET = new Set<string>(OMEGA_BUNDLE_SLUGS)

const AMINO_PRODUCT_TO_BUNDLE: Readonly<Record<string, OmegaBundleSlug>> = {
  'daigo-brain': 'dvizhenie-mysli',
  'daigo-brainy': 'dvizhenie-mysli',
  'daigo-dermic': 'obnovlenie-kozhi',
  'daigo-jointic': 'svoboda-dvizheniya',
}

export function isOmegaBundleSlug(slug: unknown): slug is OmegaBundleSlug {
  return OMEGA_BUNDLE_SLUG_SET.has(String(slug || '').trim())
}

export function isActiveOmegaBundleSlug(slug: unknown): slug is OmegaBundleSlug {
  return ACTIVE_OMEGA_BUNDLE_SLUG_SET.has(String(slug || '').trim())
}

export function getAvailableOmegaBundleForProductSlug(
  productSlug: unknown,
): OmegaBundleSlug | null {
  const normalized = String(productSlug || '').trim().toLowerCase()
  const bundleSlug = AMINO_PRODUCT_TO_BUNDLE[normalized]
  return bundleSlug && isActiveOmegaBundleSlug(bundleSlug) ? bundleSlug : null
}

export function getAvailableOmegaBundleForProductTitle(
  title: unknown,
): OmegaBundleSlug | null {
  const normalized = String(title || '').toLowerCase().replace(/ё/g, 'е')

  // Наборы и сама омега не должны получать апсейл «в наборе выгоднее».
  if (
    normalized.includes('омега') ||
    normalized.includes('движение мысли') ||
    normalized.includes('обновление кожи') ||
    normalized.includes('свобода движения')
  ) {
    return null
  }

  let bundleSlug: OmegaBundleSlug | null = null
  if (normalized.includes('brainy')) bundleSlug = 'dvizhenie-mysli'
  else if (normalized.includes('dermic')) bundleSlug = 'obnovlenie-kozhi'
  else if (normalized.includes('jointic') || normalized.includes('jontic')) {
    bundleSlug = 'svoboda-dvizheniya'
  }

  return bundleSlug && isActiveOmegaBundleSlug(bundleSlug) ? bundleSlug : null
}

export function getOmegaBundleSort(slug: unknown): number {
  const index = OMEGA_BUNDLE_SLUGS.indexOf(String(slug || '') as OmegaBundleSlug)
  return index < 0 ? Number.MAX_SAFE_INTEGER : index
}

export function isOmegaProductTitle(title: unknown): boolean {
  const normalized = String(title || '').toLowerCase().replace(/ё/g, 'е')
  return normalized.includes('жир печени трески') && normalized.includes('омега')
}
