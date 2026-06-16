const FIRSTVDS_S3_HOST = 's3.firstvds.ru'
const FIRSTVDS_BUCKET_HOST_SUFFIX = '.s3.firstvds.ru'
const MEDIA_PROXY_PREFIX = '/media-s3/'
export const DEFAULT_MEDIA_PLACEHOLDER = '/images/placeholder-product.png'

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

function buildProxyUrl(bucketOrPath: string, path = '', suffix = ''): string {
  const cleanBucketOrPath = trimSlashes(bucketOrPath)
  const cleanPath = trimSlashes(path)
  const parts = [cleanBucketOrPath, cleanPath].filter(Boolean).join('/')
  return `${MEDIA_PROXY_PREFIX}${parts}${suffix}`
}

export function replaceFirstVdsS3Urls(value: string): string {
  return value
    .replace(/https?:\/\/([a-z0-9-]+)\.s3\.firstvds\.ru\/([^\s"'<>)]*)/gi, `${MEDIA_PROXY_PREFIX}$1/$2`)
    .replace(/https?:\/\/s3\.firstvds\.ru\/([^\s"'<>)]*)/gi, `${MEDIA_PROXY_PREFIX}$1`)
    .replace(/\/\/([a-z0-9-]+)\.s3\.firstvds\.ru\/([^\s"'<>)]*)/gi, `${MEDIA_PROXY_PREFIX}$1/$2`)
    .replace(/\/\/s3\.firstvds\.ru\/([^\s"'<>)]*)/gi, `${MEDIA_PROXY_PREFIX}$1`)
}

export function isProxiedS3MediaUrl(src?: string | null): boolean {
  return String(src || '').trim().startsWith(MEDIA_PROXY_PREFIX)
}

export function isFirstVdsS3Url(src?: string | null): boolean {
  const value = String(src || '').trim()
  if (!value) return false

  const absolute = value.startsWith('//') ? `https:${value}` : value

  try {
    const url = new URL(absolute)
    const host = url.hostname.toLowerCase()
    return host === FIRSTVDS_S3_HOST || host.endsWith(FIRSTVDS_BUCKET_HOST_SUFFIX)
  } catch {
    return false
  }
}

/**
 * Приводит media URL к безопасному виду для фронта.
 *
 * Меняем только FirstVDS S3:
 * - https://s3.firstvds.ru/products/a.png          -> /media-s3/products/a.png
 * - https://products.s3.firstvds.ru/a.png         -> /media-s3/products/a.png
 * - https://feedbacks.s3.firstvds.ru/stars/a.jpg  -> /media-s3/feedbacks/stars/a.jpg
 *
 * Локальные пути, data/blob и сторонние домены не трогаем.
 */
export function normalizeMediaUrl(src?: string | null): string {
  const value = String(src || '').trim()
  if (!value) return ''

  if (isProxiedS3MediaUrl(value)) return value
  if (value.startsWith('data:') || value.startsWith('blob:')) return value

  const replacedValue = replaceFirstVdsS3Urls(value)
  if (replacedValue !== value) return replacedValue

  const absolute = value.startsWith('//') ? `https:${value}` : value

  if (/^https?:\/\//i.test(absolute)) {
    try {
      const url = new URL(absolute.replace(/^http:\/\//i, 'https://'))
      const host = url.hostname.toLowerCase()
      const suffix = `${url.search}${url.hash}`

      if (host === FIRSTVDS_S3_HOST) {
        return buildProxyUrl(url.pathname, '', suffix)
      }

      if (host.endsWith(FIRSTVDS_BUCKET_HOST_SUFFIX)) {
        const bucket = host.slice(0, -FIRSTVDS_BUCKET_HOST_SUFFIX.length)
        return buildProxyUrl(bucket, url.pathname, suffix)
      }
    } catch {
      // Если URL некорректный, возвращаем исходное значение ниже.
    }

    return replaceFirstVdsS3Urls(absolute.replace(/^http:\/\//i, 'https://'))
  }

  return replaceFirstVdsS3Urls(value)
}

export function normalizeMediaUrlOrFallback(
  src?: string | null,
  fallback = DEFAULT_MEDIA_PLACEHOLDER,
): string {
  return normalizeMediaUrl(src) || fallback
}
