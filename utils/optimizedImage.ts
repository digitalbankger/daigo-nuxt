export type OptimizedImageFormat = 'avif' | 'webp'

const OPTIMIZED_PREFIX = '/images/optimized'
const FALLBACK_PLACEHOLDER = '/images/placeholder-product.png'

// Важно для каталога: большинство товарных изображений приходит с внешнего API/S3.
// Для таких URL нельзя слепо строить статические /images/optimized/... ссылки,
// потому что эти файлы существуют только после ручной предгенерации.
// На iOS Safari/Chrome браузер может выбрать отсутствующий AVIF/WebP candidate
// из <picture>/<srcset> и не показать fallback. Поэтому внешние изображения
// выводим напрямую, а оптимизацию оставляем только для локальных /images/... файлов.
const ENABLE_REMOTE_OPTIMIZED_IMAGES = false

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
  const value = String(src || '').trim()
  if (!value) return FALLBACK_PLACEHOLDER
  return value.replace(/^http:\/\//i, 'https://')
}

export function isOptimizableImageSrc(src?: string | null): boolean {
  const normalized = normalizeOptimizedImageSrc(src)

  if (!normalized) return false
  if (normalized.startsWith('data:') || normalized.startsWith('blob:')) return false

  if (/^https?:\/\//i.test(normalized)) {
    return ENABLE_REMOTE_OPTIMIZED_IMAGES
  }

  return normalized.startsWith('/')
}

export function getOptimizedImageBasePath(src?: string | null): string | null {
  const normalized = normalizeOptimizedImageSrc(src)

  if (!isOptimizableImageSrc(normalized)) {
    return null
  }

  const absolute = /^https?:\/\//i.test(normalized)
  const parts = absolute
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
