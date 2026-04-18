export type CatalogImageOptions = {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
}

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 640
const DEFAULT_QUALITY = 78
const DEFAULT_FORMAT = 'webp'

export function normalizeCatalogImageSrc(src?: string | null): string {
  const value = String(src || '').trim()
  if (!value) return '/images/placeholder-product.png'
  return value.replace(/^http:\/\//i, 'https://')
}

export function isDirectCatalogImageSrc(src?: string | null): boolean {
  const normalized = normalizeCatalogImageSrc(src)
  return normalized.startsWith('data:') || normalized.startsWith('blob:')
}

export function buildCatalogImageUrl(
  src?: string | null,
  options: CatalogImageOptions = {}
): string {
  const normalized = normalizeCatalogImageSrc(src)

  if (isDirectCatalogImageSrc(normalized)) {
    return normalized
  }

  const params = new URLSearchParams()

  params.set('src', normalized)
  params.set('w', String(options.width ?? DEFAULT_WIDTH))
  params.set('h', String(options.height ?? DEFAULT_HEIGHT))
  params.set('q', String(options.quality ?? DEFAULT_QUALITY))
  params.set('format', options.format ?? DEFAULT_FORMAT)

  return `/api/image?${params.toString()}`
}
