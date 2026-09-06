import { isProxiedS3MediaUrl, normalizeMediaUrlOrFallback } from './mediaUrl'

export type OptimizedImageFormat = 'avif' | 'webp'

const OPTIMIZED_PREFIX = '/images/optimized'
const FALLBACK_PLACEHOLDER = '/images/placeholder-product.png'

// Скрипт generate-optimized-images.mjs сохраняет локальные варианты и для внешних
// API/S3 URL. Каталожная карточка использует один WebP candidate и умеет откатиться
// на исходный URL при 404, поэтому remote prerender можно включить без <picture>-ловушек.
const ENABLE_REMOTE_OPTIMIZED_IMAGES = true

function safeSegment(value: string): string {
  return encodeURIComponent(value.trim())
}

function stripQueryAndHash(value: string): string {
  return value.split('#')[0]?.split('?')[0] || value
}

function getLocalPathParts(src: string): string[] {
  const clean = stripQueryAndHash(src).replace(/^\/+/, '')
  return clean.split('/').filter(Boolean)
}

function getRemotePathParts(src: string): string[] {
  const url = new URL(src)
  const pathname = stripQueryAndHash(url.pathname).replace(/^\/+/, '')
  return [url.host, ...pathname.split('/').filter(Boolean)]
}

function splitBaseName(fileName: string): { name: string; ext: string } {
  const match = fileName.match(/^(.*?)(\.[^.]+)?$/)
  return {
    name: match?.[1] || fileName,
    ext: match?.[2] || '',
  }
}

export function normalizeOptimizedImageSrc(src?: string | null): string {
  return normalizeMediaUrlOrFallback(src, FALLBACK_PLACEHOLDER)
}

export function isOptimizableImageSrc(src?: string | null): boolean {
  const normalized = normalizeOptimizedImageSrc(src)

  if (!normalized) return false
  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) return false

  if (/^https?:\/\//i.test(normalized)) {
    return ENABLE_REMOTE_OPTIMIZED_IMAGES
  }

  // /media-s3/... — это браузерная форма FirstVDS S3 URL.
  // Скрипт оптимизации сохраняет эти же файлы как remote/s3.firstvds.ru/...
  // Поэтому такие URL тоже можно сопоставить с build-time вариантами.
  if (isProxiedS3MediaUrl(normalized)) return true

  return normalized.startsWith('/')
}

export function getOptimizedImageBasePath(src?: string | null): string | null {
  const normalized = normalizeOptimizedImageSrc(src)

  if (!isOptimizableImageSrc(normalized)) {
    return null
  }

  const absolute = /^https?:\/\//i.test(normalized)
  const proxiedS3 = isProxiedS3MediaUrl(normalized)

  const parts = proxiedS3
    ? [
        'remote',
        's3.firstvds.ru',
        ...getLocalPathParts(normalized.replace(/^\/media-s3\//, '/')),
      ]
    : absolute
      ? ['remote', ...getRemotePathParts(normalized)]
      : ['local', ...getLocalPathParts(normalized)]

  if (!parts.length) return null

  const fileName = parts.pop() || 'image'
  const { name } = splitBaseName(fileName)
  const finalParts = [...parts, name]
    .map(safeSegment)
    .filter(Boolean)

  return `${OPTIMIZED_PREFIX}/${finalParts.join('/')}`
}

export function buildOptimizedImageUrl(
  src: string | null | undefined,
  width: number,
  format: OptimizedImageFormat,
): string | null {
  const base = getOptimizedImageBasePath(src)
  if (!base) return null
  return `${base}/w-${Math.round(width)}.${format}`
}


export function buildOptimizedImageCandidates(
  src: string | null | undefined,
  width: number,
  format: OptimizedImageFormat,
): string[] {
  const normalized = normalizeOptimizedImageSrc(src)
  const roundedWidth = Math.round(width)
  const candidates: string[] = []

  const push = (value: string | null) => {
    if (value && !candidates.includes(value)) candidates.push(value)
  }

  // Точный путь для исходного URL. Для абсолютного S3 URL это полностью
  // совпадает с generate-optimized-images.mjs.
  push(buildOptimizedImageUrl(src, roundedWidth, format))

  // После normalizeMediaUrl два разных FirstVDS URL становятся одинаковыми:
  // https://products.s3.firstvds.ru/a.png -> /media-s3/products/a.png
  // https://s3.firstvds.ru/products/a.png -> /media-s3/products/a.png
  // Генератор же сохраняет их в разные каталоги. Для проксированного URL
  // пробуем оба варианта, а также относительный вариант API.
  if (isProxiedS3MediaUrl(normalized)) {
    const localParts = getLocalPathParts(normalized.replace(/^\/media-s3\//, '/'))
    const bucket = localParts.shift()

    if (bucket && localParts.length) {
      const fileName = localParts.pop() || 'image'
      const { name } = splitBaseName(fileName)
      const tail = [...localParts, name].map(safeSegment).filter(Boolean).join('/')
      const safeBucket = safeSegment(bucket)

      push(`${OPTIMIZED_PREFIX}/remote/${safeBucket}.s3.firstvds.ru/${tail}/w-${roundedWidth}.${format}`)
      push(`${OPTIMIZED_PREFIX}/remote/s3.firstvds.ru/${safeBucket}/${tail}/w-${roundedWidth}.${format}`)
      push(`${OPTIMIZED_PREFIX}/local/${safeBucket}/${tail}/w-${roundedWidth}.${format}`)
    }
  }

  return candidates
}

export function buildOptimizedImageSrcSet(
  src: string | null | undefined,
  widths: number[],
  format: OptimizedImageFormat,
): string {
  return widths
    .map((width) => ({
      width: Math.round(width),
      url: buildOptimizedImageUrl(src, width, format),
    }))
    .filter((item): item is { width: number; url: string } => Boolean(item.url))
    .map((item) => `${item.url} ${item.width}w`)
    .join(', ')
}
