import { optimizedImageManifest } from '~/generated/optimized-image-manifest'
import { normalizeMediaUrlOrFallback } from './mediaUrl'

export type OptimizedImageFormat = 'avif' | 'webp'

export interface OptimizedImageManifestEntry {
  base: string
  widths: readonly number[]
}

const FALLBACK_PLACEHOLDER = '/images/placeholder-product.png'
const manifest = optimizedImageManifest as Record<string, OptimizedImageManifestEntry>

function canonicalSource(value?: string | null): string {
  return String(value || '').trim().replace(/^http:\/\//i, 'https://').split('#')[0].split('?')[0]
}

export function normalizeOptimizedImageSrc(src?: string | null): string {
  return normalizeMediaUrlOrFallback(src, FALLBACK_PLACEHOLDER)
}

/**
 * Возвращает запись только если build-time генератор действительно создал
 * optimized-файлы для этого исходного URL. Это исключает лишние 404-запросы
 * к "угадываемым" путям на странице каталога.
 */
export function getOptimizedImageManifestEntry(
  src?: string | null,
): OptimizedImageManifestEntry | null {
  const key = canonicalSource(src)
  if (!key) return null
  return manifest[key] || null
}

export function isOptimizableImageSrc(src?: string | null): boolean {
  return Boolean(getOptimizedImageManifestEntry(src))
}

export function getOptimizedImageBasePath(src?: string | null): string | null {
  return getOptimizedImageManifestEntry(src)?.base || null
}

export function buildOptimizedImageUrl(
  src: string | null | undefined,
  width: number,
  format: OptimizedImageFormat,
): string | null {
  const entry = getOptimizedImageManifestEntry(src)
  if (!entry) return null

  const requestedWidth = Math.round(width)
  if (!entry.widths.includes(requestedWidth)) return null

  return `${entry.base}/w-${requestedWidth}.${format}`
}

/**
 * Оставлено как совместимый API для компонентов с последовательным fallback.
 * В отличие от старой реализации возвращает только физически известный по
 * manifest путь и не перебирает варианты host/bucket.
 */
export function buildOptimizedImageCandidates(
  src: string | null | undefined,
  width: number,
  format: OptimizedImageFormat,
): string[] {
  const url = buildOptimizedImageUrl(src, width, format)
  return url ? [url] : []
}

export function buildOptimizedImageSrcSet(
  src: string | null | undefined,
  widths: number[],
  format: OptimizedImageFormat,
): string {
  const entry = getOptimizedImageManifestEntry(src)
  if (!entry) return ''

  const requested = new Set(widths.map((width) => Math.round(width)))

  return entry.widths
    .filter((width) => requested.has(width))
    .map((width) => `${entry.base}/w-${width}.${format} ${width}w`)
    .join(', ')
}
