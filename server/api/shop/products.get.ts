import { defineEventHandler, getQuery, createError } from 'h3'

const RESPONSE_TTL_MS = 5 * 60 * 1000
const TOTAL_TTL_MS = 10 * 60 * 1000

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

const responseCache = new Map<string, CacheEntry<any>>()
const totalCache = new Map<string, CacheEntry<number>>()

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
    const s = String(src)
    if (s.startsWith('http') || s.startsWith('data:')) return s
    const base = filesBase.replace(/\/$/, '')
    return base + (s.startsWith('/') ? s : `/${s}`)
  }
}

function buildParamsFromQuery(q: Record<string, any>, page: number, pageSize: number) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('page_size', String(pageSize))

  if (q.napravlennost) {
    const csv = Array.isArray(q.napravlennost)
      ? q.napravlennost.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
      : String(q.napravlennost)
    params.set('napravlennost', csv)
  }

  if (q.produkty) {
    const vals = Array.isArray(q.produkty)
      ? q.produkty.flatMap(v => String(v).split(',')).filter(Boolean)
      : String(q.produkty).split(',').filter(Boolean)
    params.set('name', vals.join(','))
  }

  for (const [k, vAny] of Object.entries(q)) {
    if (
      [
        'page',
        'page_size',
        'limit',
        'napravlennost',
        'produkty',
        'empty',
        'podarochnye',
        'no_total',
        'for',
      ].includes(k)
    ) continue

    if (
      k === 'ysclid' ||
      k === 'yclid' ||
      k === 'gclid' ||
      k === 'fbclid' ||
      k.startsWith('utm_')
    ) continue

    if (vAny == null || vAny === '') continue

    const csv = Array.isArray(vAny)
      ? vAny.flatMap(v => String(v).split(',')).filter(Boolean).join(',')
      : String(vAny)

    if (csv) params.set(k, csv)
  }

  return params
}

function getFilterCacheKey(q: Record<string, any>) {
  const entries = Object.entries(q)
    .filter(([k, v]) => {
      if ([
        'page',
        'page_size',
        'limit',
        'empty',
        'no_total',
        'for',
      ].includes(k)) return false
      if (
        k === 'ysclid' ||
        k === 'yclid' ||
        k === 'gclid' ||
        k === 'fbclid' ||
        k.startsWith('utm_')
      ) return false
      return v != null && v !== ''
    })
    .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])
    .sort(([a], [b]) => a.localeCompare(b))

  return JSON.stringify(entries)
}

async function fetchRawProducts(base: string, params: URLSearchParams, timeout = 8000) {
  const qs = params.toString().replaceAll('%2C', ',')
  const url = `${base}/v1/shop/products?${qs}`
  const res: any = await $fetch.raw(url, { timeout })
  return { res, raw: res._data }
}

function mapProducts(raw: any, normalizeImg: (src: any) => string) {
  return (Array.isArray(raw?.products) ? raw.products : []).map((p: any) => {
    const price = Number(p.price) || 0
    const slug = String(p.slug || '')
    const baseProps = p.properties || {}

    let enrichedProps = { ...baseProps }

    const isExcluded =
      slug.startsWith('sertifikat') ||
      slug === 'tamotsu' ||
      slug === 'lux-daigo-metabiotik' ||
      slug.includes('mesyats') ||
      slug.includes('mesyatsev')

    if (price > 30000 && !isExcluded) {
      enrichedProps.podarochnye = ['nabory']
    }

    return {
      id: p.product_id ?? p.id,
      product_id: p.product_id ?? p.id,
      slug,
      name: p.name_ru || p.name,
      subtitle: p.subtitle || '',
      image: normalizeImg(p.image),
      detailImages: Array.isArray(p.detail_images)
        ? p.detail_images.map((img: any) => normalizeImg(img)).filter(Boolean)
        : [],
      price,
      originalPrice: Number(p.original_price) || 0,
      sort: p.sort_order === 0 ? 16 : p.sort_order,
      properties: enrichedProps,
    }
  })
}

function applyGiftFilter(items: any[], q: Record<string, any>) {
  if (!q.podarochnye) return items

  const values = Array.isArray(q.podarochnye)
    ? q.podarochnye
    : String(q.podarochnye).split(',')

  return items.filter((p) => {
    const prop = p.properties?.podarochnye || []
    return values.some((v) => prop.includes(v))
  })
}

async function resolveTotalViaLargeFetch(base: string, q: Record<string, any>, normalizeImg: (src: any) => string) {
  const totalKey = getFilterCacheKey(q)
  const cached = getCachedValue(totalCache, totalKey)
  if (cached != null) return cached

  const params = buildParamsFromQuery(q, 1, 9999)
  const { res, raw } = await fetchRawProducts(base, params, 12000)
  const mapped = applyGiftFilter(mapProducts(raw, normalizeImg), q)

  const headerTotal = Number(res.headers.get?.('X-Total-Count') ?? NaN)
  const bodyTotal = Number(
    raw?.total ??
    raw?.count ??
    raw?.meta?.total ??
    raw?.pagination?.total ??
    raw?.pagination?.count ??
    NaN
  )

  const total = q.podarochnye
    ? mapped.length
    : Number.isFinite(bodyTotal) && bodyTotal > 0
      ? bodyTotal
      : Number.isFinite(headerTotal) && headerTotal > 0
        ? headerTotal
        : mapped.length

  setCachedValue(totalCache, totalKey, total, TOTAL_TTL_MS)
  return total
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  if (q.product_ids) {
    const ids = (
      Array.isArray(q.product_ids)
        ? q.product_ids.flatMap(v => String(v).split(','))
        : String(q.product_ids).split(',')
    )
      .map(s => s.trim())
      .filter(Boolean)

    const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
    const filesBase =
      useRuntimeConfig(event).public.daigoFilesBase ||
      base ||
      ''

    const normalizeImg = normalizeImgFactory(filesBase)
    const url = `${base}/v1/shop/products?page=1&page_size=9999`
    const res: any = await $fetch(url).catch(() => ({ products: [] }))

    const items = (Array.isArray(res?.products) ? res.products : [])
      .map((p: any) => ({
        id: p.product_id ?? p.id,
        product_id: p.product_id ?? p.id,
        slug: p.slug,
        name: p.name_ru || p.name,
        subtitle: p.subtitle || '',
        image: normalizeImg(p.image),
        detailImages: Array.isArray(p.detail_images)
          ? p.detail_images.map((img: any) => normalizeImg(img)).filter(Boolean)
          : [],
        price: Number(p.price) || 0,
        originalPrice: Number(p.original_price) || 0,
        sort: p.sort_order === 0 ? 16 : p.sort_order,
        properties: p.properties || {},
      }))
      .filter((p: any) => ids.includes(String(p.product_id)))

    return { items, total: items.length }
  }

  const responseKey = event.node.req.url || JSON.stringify(q)
  const cachedResponse = getCachedValue(responseCache, responseKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const filesBase =
    useRuntimeConfig(event).public.daigoFilesBase ||
    useRuntimeConfig(event).public.daigoApiBase ||
    ''

  const normalizeImg = normalizeImgFactory(filesBase)

  const page = Number(q.page ?? 1) || 1
  const pageSize = Number(q.page_size ?? q.limit ?? 15) || 15
  const effectivePageSize = q.podarochnye ? 9999 : pageSize

  const params = buildParamsFromQuery(q, page, effectivePageSize)
  const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
  const noTotalMode = q.no_total === '1' || q.for === 'counts'

  try {
    const { res, raw } = await fetchRawProducts(base, params)
    const items = mapProducts(raw, normalizeImg)
    const filteredItems = applyGiftFilter(items, q)

    let total = filteredItems.length

    if (!noTotalMode) {
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

      total = q.podarochnye
        ? filteredItems.length
        : Number.isFinite(bodyTotal) && bodyTotal > 0
          ? bodyTotal
          : Number.isFinite(headerTotal) && headerTotal > 0
            ? headerTotal
            : Number.isFinite(bodyTotalPages) && bodyTotalPages > 0
              ? bodyTotalPages * effectivePageSize
              : NaN

      const needsExactTotal =
        !q.podarochnye &&
        page === 1 &&
        items.length > 0 &&
        (
          !Number.isFinite(total) ||
          total <= items.length
        )

      if (needsExactTotal) {
        total = await resolveTotalViaLargeFetch(base, q as Record<string, any>, normalizeImg)
      }

      if (!Number.isFinite(total)) {
        total = items.length < effectivePageSize
          ? (page - 1) * effectivePageSize + items.length
          : page * effectivePageSize + 1
      }
    }

    const payload = {
      items: filteredItems,
      total,
    }

    setCachedValue(responseCache, responseKey, payload, RESPONSE_TTL_MS)
    return payload
  } catch (e: any) {
    throw createError({
      statusCode: e?.response?.status || 502,
      statusMessage: 'Catalog upstream error',
    })
  }
})
