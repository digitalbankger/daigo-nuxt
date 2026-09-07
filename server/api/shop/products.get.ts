import { defineEventHandler, getQuery, createError } from 'h3'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'
import { CATALOG_FILTER_SLUGS } from '~/constants/catalogFilters'
import { findEvolutionProductConfig, getEvolutionTitle } from '~/constants/evolution'

const RESPONSE_TTL_MS = 5 * 60 * 1000
const TOTAL_TTL_MS = 10 * 60 * 1000
const COLLECT_PAGE_SIZE = 100
const COLLECT_MAX_PAGES = 20

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const responseCache = new Map<string, CacheEntry<any>>()
const totalCache = new Map<string, CacheEntry<number>>()

const SERVICE_QUERY_KEYS = new Set([
  'page',
  'page_size',
  'limit',
  'empty',
  'no_total',
  'for',
  'product_ids',
])

const CATALOG_FILTER_KEYS = new Set(CATALOG_FILTER_SLUGS)

const LOCAL_ONLY_FILTER_KEYS = new Set([
  'podarochnye',
])

const PROPERTY_ALIASES: Record<string, string[]> = {
  produkty: ['produkty', 'producty', 'products', 'name'],
}

function getCachedValue<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
  const now = Date.now()
  const cached = store.get(key)
  if (!cached) return null
  if (cached.expiresAt <= now) {
    store.delete(key)
    return null
  }
  return cached.value
}

function setCachedValue<T>(store: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number) {
  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  })
}

function normalizeImgFactory(filesBase: string) {
  return (src: any): string => {
    if (!src) return '/images/placeholder-product.png'
    const s = String(src).trim()
    if (!s) return '/images/placeholder-product.png'

    if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) {
      return normalizeMediaUrlOrFallback(s, '/images/placeholder-product.png')
    }

    if (s.startsWith('/media-s3/') || s.startsWith('/images/') || s.startsWith('/icons/')) {
      return normalizeMediaUrlOrFallback(s, '/images/placeholder-product.png')
    }

    const base = filesBase.replace(/\/$/, '')
    return normalizeMediaUrlOrFallback(base + (s.startsWith('/') ? s : `/${s}`), '/images/placeholder-product.png')
  }
}

function isServiceQueryKey(key: string) {
  return SERVICE_QUERY_KEYS.has(key)
}

function isCatalogFilterKey(key: string) {
  return CATALOG_FILTER_KEYS.has(key)
}

function normalizeFilterValue(value: any) {
  const normalized = String(value || '').trim()

  if (['certificate', 'certificates', 'sertifikat', 'sertifikaty'].includes(normalized)) {
    return 'sertificate'
  }

  return normalized
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => toStringArray(item))
  if (value == null) return []

  return String(value)
    .split(',')
    .map((item) => normalizeFilterValue(item))
    .filter(Boolean)
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function normalizeProductName(value: unknown) {
  const name = String(value || '').trim()

  if (/^(?:daigo|дайго)\s*5\s*(?:ml|мл)$/i.test(name)) return 'Daigo 5 мл'
  if (/^(?:daigo|дайго)\s*10\s*(?:ml|мл)$/i.test(name)) return 'Daigo 10 мл'

  return name
}

function getRawProductList(raw: any): any[] {
  const candidates = [
    raw?.products,
    raw?.items,
    raw?.data,
    raw?.data?.products,
    raw?.data?.items,
    raw?.data?.data,
    raw?.result,
    raw?.result?.products,
    raw?.result?.items,
    raw?.payload,
    raw?.payload?.products,
    raw?.payload?.items,
    raw?.list,
    raw?.rows,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

function getPrimaryImageSource(p: any) {
  if (p?.image || p?.image_url || p?.preview_image || p?.picture) {
    return p.image || p.image_url || p.preview_image || p.picture
  }

  const images = Array.isArray(p?.images)
    ? p.images
    : Array.isArray(p?.detail_images)
      ? p.detail_images
      : []

  const primary = images.find((img: any) => img?.is_primary) || images[0]
  return typeof primary === 'string' ? primary : primary?.image_url || primary?.url || primary?.src || primary?.path
}

function getDetailImageSources(p: any) {
  const detailImages = Array.isArray(p?.detail_images) ? p.detail_images : []
  const images = Array.isArray(p?.images) ? p.images : []

  return [...detailImages, ...images]
    .map((img: any) => typeof img === 'string' ? img : img?.image_url || img?.url || img?.src || img?.path)
    .filter(Boolean)
}

function buildParamsFromQuery(q: Record<string, any>, page: number, pageSize: number, withFilters = true) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('page_size', String(pageSize))

  if (!withFilters) return params

  if (q.napravlennost) {
    const csv = toStringArray(q.napravlennost).join(',')
    if (csv) params.set('napravlennost', csv)
  }

  if (q.produkty) {
    const csv = toStringArray(q.produkty).join(',')
    if (csv) params.set('name', csv)
  }

  for (const [key, value] of Object.entries(q)) {
    if (key === 'napravlennost' || key === 'produkty') continue
    if (isServiceQueryKey(key) || !isCatalogFilterKey(key) || LOCAL_ONLY_FILTER_KEYS.has(key)) continue

    const csv = toStringArray(value).join(',')
    if (csv) params.set(key, csv)
  }

  return params
}

function getRelevantQueryEntries(q: Record<string, any>, includeServiceKeys = false) {
  return Object.entries(q)
    .filter(([key, value]) => {
      if (value == null || value === '') return false
      if (isCatalogFilterKey(key)) return true
      return includeServiceKeys && isServiceQueryKey(key)
    })
    .map(([key, value]) => [key, toStringArray(value).sort().join(',')])
    .sort(([a], [b]) => a.localeCompare(b))
}

function getFilterCacheKey(q: Record<string, any>) {
  return JSON.stringify(getRelevantQueryEntries(q, false))
}

function getResponseCacheKey(q: Record<string, any>) {
  return JSON.stringify(getRelevantQueryEntries(q, true))
}

async function fetchRawProducts(base: string, params: URLSearchParams, timeout = 8000) {
  const qs = params.toString().replaceAll('%2C', ',')
  const url = `${base}/v1/shop/products?${qs}`
  const res: any = await $fetch.raw(url, { timeout })
  return { res, raw: res._data }
}

async function collectRawProducts(base: string, q: Record<string, any>, withFilters = false) {
  const collected: any[] = []
  const seen = new Set<string>()
  let firstResponse: any = null
  let firstRaw: any = null

  for (let page = 1; page <= COLLECT_MAX_PAGES; page++) {
    const params = buildParamsFromQuery(q, page, COLLECT_PAGE_SIZE, withFilters)
    let res: any
    let raw: any

    try {
      const response = await fetchRawProducts(base, params, 12000)
      res = response.res
      raw = response.raw
    } catch (error) {
      if (collected.length > 0) break
      throw error
    }

    if (page === 1) {
      firstResponse = res
      firstRaw = raw
    }

    const rawProducts = getRawProductList(raw)
    if (!rawProducts.length) break

    let added = 0

    rawProducts.forEach((product: any, index: number) => {
      const key = String(product?.product_id ?? product?.id ?? product?.slug ?? `${page}-${index}`)
      if (seen.has(key)) return

      seen.add(key)
      collected.push(product)
      added++
    })

    if (added === 0) break

    const totalPages = Number(
      raw?.total_pages ??
      raw?.pages ??
      raw?.last_page ??
      raw?.meta?.total_pages ??
      raw?.meta?.last_page ??
      raw?.pagination?.total_pages ??
      raw?.pagination?.last_page ??
      NaN
    )

    if (Number.isFinite(totalPages) && totalPages > 0 && page >= totalPages) break
  }

  return {
    res: firstResponse,
    raw: {
      ...(firstRaw || {}),
      products: collected,
    },
  }
}

function addPropertyValue(properties: Record<string, any>, key: string, value: string) {
  const current = toStringArray(properties[key])
  if (!current.includes(value)) current.push(value)
  properties[key] = current
}

function mapProducts(raw: any, normalizeImg: (src: any) => string) {
  return getRawProductList(raw).map((p: any) => {
    const price = Number(p.price) || 0
    const productId = String(p.product_id ?? p.id ?? '')
    const rawSlug = String(p.slug || '')
    const evolutionConfig =
      findEvolutionProductConfig(productId) || findEvolutionProductConfig(rawSlug)
    const slug = evolutionConfig?.slug || rawSlug
    const baseProps = p.properties || {}
    const enrichedProps: Record<string, any> = { ...baseProps }

    const isCertificate = slug.startsWith('sertifikat')
    if (isCertificate) {
      addPropertyValue(enrichedProps, 'produkty', 'sertificate')
      addPropertyValue(enrichedProps, 'producty', 'sertificate')
      addPropertyValue(enrichedProps, 'products', 'sertificate')
      addPropertyValue(enrichedProps, 'podarochnye', 'sertificate')
    }

    const isExcludedGift =
      isCertificate ||
      slug === 'tamotsu' ||
      slug === 'lux-daigo-metabiotik' ||
      slug.includes('mesyats') ||
      slug.includes('mesyatsev')

    if (price > 30000 && !isExcludedGift) {
      addPropertyValue(enrichedProps, 'podarochnye', 'nabory')
    }

    const primaryImage =
      getPrimaryImageSource(p) ||
      (evolutionConfig ? '/images/evolution/hero-main.webp' : '')
    const detailImageSources = getDetailImageSources(p)

    return {
      id: p.product_id ?? p.id,
      product_id: p.product_id ?? p.id,
      slug,
      name: evolutionConfig
        ? getEvolutionTitle(evolutionConfig.packSize)
        : normalizeProductName(p.name_ru || p.name || p.title || p.name_en || ''),
      subtitle: p.subtitle || '',
      // Сохраняем исходные значения из API: генератор optimized-изображений
      // строит путь именно из них. Нормализованная /media-s3/ форма теряет
      // исходный FirstVDS host/bucket и не всегда позволяет восстановить
      // физический путь build-time файла однозначно.
      imageSource: String(primaryImage || ''),
      image: normalizeImg(primaryImage),
      detailImageSources: detailImageSources.map((img: any) => String(img || '')).filter(Boolean),
      detailImages: detailImageSources.map((img: any) => normalizeImg(img)).filter(Boolean),
      price,
      originalPrice: Number(p.original_price ?? p.old_price ?? p.oldPrice ?? p.originalPrice) || 0,
      sort: p.sort_order === 0 ? 16 : (p.sort_order ?? p.sort ?? 0),
      properties: enrichedProps,
    }
  })
}

function prepareCatalogProducts(raw: any, normalizeImg: (src: any) => string) {
  return mapProducts(raw, normalizeImg)
}

function propValues(product: any, slug: string): string[] {
  const aliases = PROPERTY_ALIASES[slug] || [slug]
  const values: string[] = []

  for (const key of aliases) {
    values.push(...toStringArray(product?.properties?.[key]))
  }

  if (
    (slug === 'produkty' || slug === 'podarochnye') &&
    String(product?.slug || '').startsWith('sertifikat')
  ) {
    values.push('sertificate')
  }

  return unique(values)
}

function strictDirectionMatch(product: any, direction: string): boolean | null {
  const identity = [
    String(product?.slug || ''),
    String(product?.name || ''),
    ...propValues(product, 'produkty'),
  ]
    .join(' ')
    .toLowerCase()

  if (direction === 'zuby-i-desna') {
    return identity.includes('dent') || identity.includes('zubnaya-pasta') || identity.includes('зубн')
  }

  if (direction === 'kosti-i-myshtsy') {
    return identity.includes('jointic')
  }

  return null
}

function matchesLocalFilters(product: any, q: Record<string, any>) {
  for (const [key, rawValue] of Object.entries(q)) {
    if (!isCatalogFilterKey(key)) continue

    const selectedValues = toStringArray(rawValue)
    if (!selectedValues.length) continue

    const productValues = propValues(product, key)
    const matches = selectedValues.some((value) => {
      if (key === 'napravlennost') {
        const strictMatch = strictDirectionMatch(product, value)
        if (strictMatch != null) return strictMatch
      }

      return productValues.includes(value)
    })

    if (!matches) return false
  }

  return true
}

function applyLocalFilters(items: any[], q: Record<string, any>) {
  return items.filter((product) => matchesLocalFilters(product, q))
}

async function resolveTotalViaLargeFetch(base: string, q: Record<string, any>, normalizeImg: (src: any) => string) {
  const totalKey = getFilterCacheKey(q)
  const cached = getCachedValue(totalCache, totalKey)
  if (cached != null) return cached

  const { raw } = await collectRawProducts(base, q, false)
  const mapped = prepareCatalogProducts(raw, normalizeImg)
  const total = applyLocalFilters(mapped, q).length

  setCachedValue(totalCache, totalKey, total, TOTAL_TTL_MS)
  return total
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>
  const base = String(
    useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru',
  )
  const filesBase = String(
    useRuntimeConfig(event).public.daigoFilesBase ||
    useRuntimeConfig(event).public.daigoApiBase ||
    base ||
    '',
  )

  const normalizeImg = normalizeImgFactory(filesBase)

  if (q.product_ids) {
    const ids = toStringArray(q.product_ids)
    const { raw } = await collectRawProducts(base, {}, false)

    const items = prepareCatalogProducts(raw, normalizeImg)
      .filter((product: any) => ids.includes(String(product.product_id)))

    return { items, total: items.length }
  }

  const responseKey = getResponseCacheKey(q)
  const cachedResponse = getCachedValue(responseCache, responseKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const page = Number(q.page ?? 1) || 1
  const pageSize = Number(q.page_size ?? q.limit ?? 15) || 15
  const noTotalMode = q.no_total === '1' || q.for === 'counts' || q.for === 'catalog'

  try {
    // Для каталога фильтруем по полной выборке на сервере, но в SSR/client payload
    // возвращаем только текущую порцию. Так сохраняется прежняя точность локальных
    // фильтров, но больше не сериализуются все товары в HTML первой загрузки.
    if (q.for === 'catalog-page') {
      const { raw } = await collectRawProducts(base, q, false)
      const filtered = applyLocalFilters(prepareCatalogProducts(raw, normalizeImg), q)

      const PIVOT = 15
      filtered.sort((a: any, b: any) => {
        const aSort = Number.isFinite(+a.sort) ? +a.sort : 0
        const bSort = Number.isFinite(+b.sort) ? +b.sort : 0
        const aKey = aSort === 0 ? PIVOT + 0.5 : aSort
        const bKey = bSort === 0 ? PIVOT + 0.5 : bSort
        if (aKey !== bKey) return aKey - bKey

        const aTie = String(a.name ?? a.product_id ?? '')
        const bTie = String(b.name ?? b.product_id ?? '')
        return aTie.localeCompare(bTie, 'ru')
      })

      const total = filtered.length
      const start = Math.max(0, (page - 1) * pageSize)
      const payload = {
        items: filtered.slice(start, start + pageSize),
        total,
        page,
        pageSize,
      }

      setCachedValue(responseCache, responseKey, payload, RESPONSE_TTL_MS)
      return payload
    }

    if (noTotalMode || pageSize >= 999) {
      const { raw } = await collectRawProducts(base, q, false)
      const items = applyLocalFilters(prepareCatalogProducts(raw, normalizeImg), q)
      const payload = { items, total: items.length }

      setCachedValue(responseCache, responseKey, payload, RESPONSE_TTL_MS)
      return payload
    }

    const params = buildParamsFromQuery(q, page, pageSize, true)
    const { res, raw } = await fetchRawProducts(base, params)
    const items = applyLocalFilters(prepareCatalogProducts(raw, normalizeImg), q)

    let total = items.length

    const headerTotal = Number(res.headers.get?.('X-Total-Count') ?? NaN)
    const bodyTotal = Number(
      raw?.total ??
      raw?.count ??
      raw?.meta?.total ??
      raw?.pagination?.total ??
      raw?.pagination?.count ??
      NaN
    )

    const bodyTotalPages = Number(
      raw?.total_pages ??
      raw?.pages ??
      raw?.last_page ??
      raw?.meta?.total_pages ??
      raw?.meta?.last_page ??
      raw?.pagination?.total_pages ??
      raw?.pagination?.last_page ??
      NaN
    )

    total = Number.isFinite(bodyTotal) && bodyTotal > 0
      ? bodyTotal
      : Number.isFinite(headerTotal) && headerTotal > 0
        ? headerTotal
        : Number.isFinite(bodyTotalPages) && bodyTotalPages > 0
          ? bodyTotalPages * pageSize
          : NaN

    const needsExactTotal = !Number.isFinite(total) || total <= items.length

    if (needsExactTotal) {
      total = await resolveTotalViaLargeFetch(base, q, normalizeImg)
    }

    if (!Number.isFinite(total)) {
      total = items.length < pageSize
        ? (page - 1) * pageSize + items.length
        : page * pageSize + 1
    }

    const payload = { items, total }

    setCachedValue(responseCache, responseKey, payload, RESPONSE_TTL_MS)
    return payload
  } catch (e: any) {
    throw createError({
      statusCode: e?.response?.status || 502,
      statusMessage: 'Catalog upstream error',
    })
  }
})
