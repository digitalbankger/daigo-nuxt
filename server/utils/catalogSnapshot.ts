import type { H3Event } from 'h3'
import type { ProductCard } from '~/types/product'
import { CATALOG_FILTERS, CATALOG_FILTER_SLUGS } from '~/constants/catalogFilters'
import { findEvolutionProductConfig, getEvolutionTitle } from '~/constants/evolution'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'

const SNAPSHOT_VERSION = 1
const SNAPSHOT_STORAGE_KEY = `catalog/snapshot-v${SNAPSHOT_VERSION}`
const COLLECT_PAGE_SIZE = 100
const COLLECT_MAX_PAGES = 20
const DEFAULT_TTL_SECONDS = 15 * 60
const PIVOT = 15

const PROPERTY_ALIASES: Record<string, string[]> = {
  produkty: ['produkty', 'producty', 'products', 'name'],
}

export type CatalogFilterQuery = Record<string, string[]>

export type CatalogSnapshot = {
  version: number
  generatedAt: string
  generatedAtMs: number
  expiresAtMs: number
  sourceBase: string
  products: ProductCard[]
  baseCounts: Record<string, number>
}

export type CatalogSnapshotResult = {
  snapshot: CatalogSnapshot
  source: 'memory' | 'storage' | 'rebuilt' | 'memory-stale' | 'storage-stale'
}

let memorySnapshot: CatalogSnapshot | null = null
let buildPromise: Promise<CatalogSnapshot> | null = null
const countsCache = new Map<string, Record<string, number>>()

function normalizeFilterValue(value: unknown) {
  const normalized = String(value || '').trim()

  if (['certificate', 'certificates', 'sertifikat', 'sertifikaty'].includes(normalized)) {
    return 'sertificate'
  }

  return normalized
}

export function toCatalogStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => toCatalogStringArray(item))
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

function getPrimaryImageSource(product: any) {
  if (product?.image || product?.image_url || product?.preview_image || product?.picture) {
    return product.image || product.image_url || product.preview_image || product.picture
  }

  const images = Array.isArray(product?.images)
    ? product.images
    : Array.isArray(product?.detail_images)
      ? product.detail_images
      : []

  const primary = images.find((image: any) => image?.is_primary) || images[0]
  return typeof primary === 'string'
    ? primary
    : primary?.image_url || primary?.url || primary?.src || primary?.path
}

function getDetailImageSources(product: any) {
  const detailImages = Array.isArray(product?.detail_images) ? product.detail_images : []
  const images = Array.isArray(product?.images) ? product.images : []

  return [...detailImages, ...images]
    .map((image: any) => typeof image === 'string'
      ? image
      : image?.image_url || image?.url || image?.src || image?.path)
    .filter(Boolean)
}

function normalizeImgFactory(filesBase: string) {
  return (src: any): string => {
    if (!src) return '/images/placeholder-product.png'
    const value = String(src).trim()
    if (!value) return '/images/placeholder-product.png'

    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
      return normalizeMediaUrlOrFallback(value, '/images/placeholder-product.png')
    }

    if (value.startsWith('/media-s3/') || value.startsWith('/images/') || value.startsWith('/icons/')) {
      return normalizeMediaUrlOrFallback(value, '/images/placeholder-product.png')
    }

    const base = filesBase.replace(/\/$/, '')
    return normalizeMediaUrlOrFallback(
      base + (value.startsWith('/') ? value : `/${value}`),
      '/images/placeholder-product.png',
    )
  }
}

function addPropertyValue(properties: Record<string, any>, key: string, value: string) {
  const current = toCatalogStringArray(properties[key])
  if (!current.includes(value)) current.push(value)
  properties[key] = current
}

function mapRawProduct(product: any, normalizeImg: (src: any) => string): ProductCard {
  const price = Number(product.price) || 0
  const productId = String(product.product_id ?? product.id ?? '')
  const rawSlug = String(product.slug || '')
  const evolutionConfig =
    findEvolutionProductConfig(productId) || findEvolutionProductConfig(rawSlug)
  const slug = evolutionConfig?.slug || rawSlug
  const enrichedProps: Record<string, any> = { ...(product.properties || {}) }

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
    getPrimaryImageSource(product) ||
    (evolutionConfig ? '/images/evolution/hero-main.webp' : '')
  const detailImageSources = getDetailImageSources(product)
  const sort = product.sort_order === 0 ? 16 : (product.sort_order ?? product.sort ?? 0)

  return {
    tag: product.tag ?? product.category ?? undefined,
    oldPrice: Number(product.old_price ?? product.oldPrice) || undefined,
    id: product.product_id ?? product.id,
    product_id: product.product_id ?? product.id,
    slug,
    name: evolutionConfig
      ? getEvolutionTitle(evolutionConfig.packSize)
      : normalizeProductName(product.name_ru || product.name || product.title || product.name_en || ''),
    subtitle: product.subtitle || '',
    imageSource: String(primaryImage || ''),
    image: normalizeImg(primaryImage),
    detailImageSources: detailImageSources.map((image: any) => String(image || '').trim()).filter(Boolean),
    detailImages: detailImageSources.map((image: any) => normalizeImg(image)).filter(Boolean),
    price,
    originalPrice: Number(
      product.original_price ?? product.old_price ?? product.oldPrice ?? product.originalPrice,
    ) || 0,
    sort: Number(sort) || 0,
    sortOrder: Number(sort) || 0,
    properties: enrichedProps,
  } as ProductCard
}

export function sortCatalogProducts(products: ProductCard[]) {
  return products.slice().sort((a, b) => {
    const aSort = Number.isFinite(+a.sort) ? +a.sort : 0
    const bSort = Number.isFinite(+b.sort) ? +b.sort : 0
    const aKey = aSort === 0 ? PIVOT + 0.5 : aSort
    const bKey = bSort === 0 ? PIVOT + 0.5 : bSort

    if (aKey !== bKey) return aKey - bKey

    const aTie = String(a.name ?? a.product_id ?? '')
    const bTie = String(b.name ?? b.product_id ?? '')
    return aTie.localeCompare(bTie, 'ru')
  })
}

function propValues(product: ProductCard, slug: string): string[] {
  const aliases = PROPERTY_ALIASES[slug] || [slug]
  const values: string[] = []

  for (const key of aliases) {
    values.push(...toCatalogStringArray((product as any)?.properties?.[key]))
  }

  if (
    (slug === 'produkty' || slug === 'podarochnye') &&
    String(product.slug || '').startsWith('sertifikat')
  ) {
    values.push('sertificate')
  }

  return unique(values)
}

function strictDirectionMatch(product: ProductCard, direction: string): boolean | null {
  const identity = [
    String(product.slug || ''),
    String(product.name || ''),
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

export function normalizeCatalogFilterQuery(query: Record<string, unknown>): CatalogFilterQuery {
  const allowed = new Set(CATALOG_FILTER_SLUGS)
  const result: CatalogFilterQuery = {}

  for (const [key, value] of Object.entries(query)) {
    if (!allowed.has(key)) continue
    const values = unique(toCatalogStringArray(value))
    if (values.length) result[key] = values
  }

  return result
}

export function matchesCatalogFilters(
  product: ProductCard,
  filters: CatalogFilterQuery,
  skipGroup?: string,
) {
  for (const [key, values] of Object.entries(filters)) {
    if (key === skipGroup || !values.length) continue

    const productValues = propValues(product, key)
    const matches = values.some((rawValue) => {
      const value = normalizeFilterValue(rawValue)

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

export function filterCatalogProducts(products: ProductCard[], query: Record<string, unknown>) {
  const filters = normalizeCatalogFilterQuery(query)
  if (!Object.keys(filters).length) return products
  return products.filter((product) => matchesCatalogFilters(product, filters))
}

export function calculateCatalogCounts(
  products: ProductCard[],
  rawBaseQuery: Record<string, unknown> = {},
) {
  const baseQuery = normalizeCatalogFilterQuery(rawBaseQuery)
  const flat: Record<string, number> = {}

  for (const group of CATALOG_FILTERS) {
    const slug = group.slug

    for (const option of group.options) {
      const value = normalizeFilterValue(option.value)
      const count = products.filter((product) => {
        if (!matchesCatalogFilters(product, baseQuery, slug)) return false

        if (slug === 'napravlennost') {
          const strictMatch = strictDirectionMatch(product, value)
          if (strictMatch != null) return strictMatch
        }

        return propValues(product, slug).includes(value)
      }).length

      flat[`${slug}__${option.value}`] = count
    }
  }

  return flat
}

function getRuntimeSettings(event: H3Event) {
  const config = useRuntimeConfig(event)
  const base = String(config.public.daigoApiBase || 'https://api.daigo.ru').replace(/\/$/, '')
  const filesBase = String(
    config.public.daigoFilesBase ||
    config.public.daigoApiBase ||
    base,
  ).replace(/\/$/, '')
  const ttlSecondsRaw = Number(config.catalogSnapshotTtlSeconds ?? DEFAULT_TTL_SECONDS)
  const ttlSeconds = Number.isFinite(ttlSecondsRaw) && ttlSecondsRaw >= 0
    ? ttlSecondsRaw
    : DEFAULT_TTL_SECONDS

  return { base, filesBase, ttlSeconds }
}

async function fetchRawProductsPage(base: string, page: number, pageSize: number) {
  const url = `${base}/v1/shop/products?page=${page}&page_size=${pageSize}`
  const response: any = await $fetch.raw(url, { timeout: 12000 })
  return response?._data
}

async function collectAllRawProducts(base: string) {
  const collected: any[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= COLLECT_MAX_PAGES; page++) {
    const raw = await fetchRawProductsPage(base, page, COLLECT_PAGE_SIZE)
    const pageProducts = getRawProductList(raw)

    if (!pageProducts.length) break

    let added = 0
    pageProducts.forEach((product: any, index: number) => {
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
      NaN,
    )

    if (Number.isFinite(totalPages) && totalPages > 0 && page >= totalPages) break
    if (pageProducts.length < COLLECT_PAGE_SIZE) break
  }

  return collected
}

function snapshotIsValid(snapshot: CatalogSnapshot | null | undefined, sourceBase: string) {
  return Boolean(
    snapshot &&
    snapshot.version === SNAPSHOT_VERSION &&
    snapshot.sourceBase === sourceBase &&
    Array.isArray(snapshot.products),
  )
}

function snapshotIsExpired(snapshot: CatalogSnapshot, now = Date.now()) {
  return snapshot.expiresAtMs > 0 && snapshot.expiresAtMs <= now
}

async function buildSnapshot(event: H3Event): Promise<CatalogSnapshot> {
  const { base, filesBase, ttlSeconds } = getRuntimeSettings(event)
  const normalizeImg = normalizeImgFactory(filesBase)
  const rawProducts = await collectAllRawProducts(base)
  const products = sortCatalogProducts(rawProducts.map((item) => mapRawProduct(item, normalizeImg)))
  const generatedAtMs = Date.now()

  const snapshot: CatalogSnapshot = {
    version: SNAPSHOT_VERSION,
    generatedAt: new Date(generatedAtMs).toISOString(),
    generatedAtMs,
    expiresAtMs: ttlSeconds > 0 ? generatedAtMs + ttlSeconds * 1000 : 0,
    sourceBase: base,
    products,
    baseCounts: calculateCatalogCounts(products),
  }

  await useStorage('cache').setItem(SNAPSHOT_STORAGE_KEY, snapshot)
  memorySnapshot = snapshot
  countsCache.clear()

  return snapshot
}

async function rebuildSingleFlight(event: H3Event) {
  if (buildPromise) return buildPromise

  buildPromise = buildSnapshot(event)
    .finally(() => {
      buildPromise = null
    })

  return buildPromise
}

export async function getCatalogSnapshot(
  event: H3Event,
  options: { forceRefresh?: boolean; allowStale?: boolean } = {},
): Promise<CatalogSnapshotResult> {
  const { base } = getRuntimeSettings(event)
  const allowStale = options.allowStale !== false

  if (options.forceRefresh) {
    const snapshot = await rebuildSingleFlight(event)
    return { snapshot, source: 'rebuilt' }
  }

  if (snapshotIsValid(memorySnapshot, base)) {
    const snapshot = memorySnapshot as CatalogSnapshot
    if (!snapshotIsExpired(snapshot)) {
      return { snapshot, source: 'memory' }
    }

    if (allowStale) {
      void rebuildSingleFlight(event).catch((error) => {
        console.error('[catalog-cache] background refresh failed', error)
      })
      return { snapshot, source: 'memory-stale' }
    }
  }

  const stored = await useStorage('cache').getItem<CatalogSnapshot>(SNAPSHOT_STORAGE_KEY)
  if (snapshotIsValid(stored, base)) {
    memorySnapshot = stored as CatalogSnapshot

    if (!snapshotIsExpired(memorySnapshot)) {
      return { snapshot: memorySnapshot, source: 'storage' }
    }

    if (allowStale) {
      void rebuildSingleFlight(event).catch((error) => {
        console.error('[catalog-cache] background refresh failed', error)
      })
      return { snapshot: memorySnapshot, source: 'storage-stale' }
    }
  }

  const snapshot = await rebuildSingleFlight(event)
  return { snapshot, source: 'rebuilt' }
}

export async function refreshCatalogSnapshot(event: H3Event) {
  const snapshot = await rebuildSingleFlight(event)
  return snapshot
}

export async function clearCatalogSnapshot() {
  // Если в этот момент идёт background refresh, сначала даём ему закончиться,
  // затем удаляем snapshot. Иначе завершившийся refresh мог бы записать cache
  // обратно сразу после clear.
  if (buildPromise) {
    try {
      await buildPromise
    } catch {
      // Ошибка rebuild не мешает очистить существующий cache.
    }
  }

  memorySnapshot = null
  countsCache.clear()
  await useStorage('cache').removeItem(SNAPSHOT_STORAGE_KEY)
}

export async function getCatalogCacheStatus(event: H3Event) {
  const { base, ttlSeconds } = getRuntimeSettings(event)
  const current = snapshotIsValid(memorySnapshot, base)
    ? memorySnapshot
    : await useStorage('cache').getItem<CatalogSnapshot>(SNAPSHOT_STORAGE_KEY)

  if (!snapshotIsValid(current, base)) {
    return {
      cached: false,
      storageKey: SNAPSHOT_STORAGE_KEY,
      ttlSeconds,
      sourceBase: base,
    }
  }

  const snapshot = current as CatalogSnapshot
  return {
    cached: true,
    storageKey: SNAPSHOT_STORAGE_KEY,
    ttlSeconds,
    sourceBase: snapshot.sourceBase,
    generatedAt: snapshot.generatedAt,
    expiresAt: snapshot.expiresAtMs > 0 ? new Date(snapshot.expiresAtMs).toISOString() : null,
    expired: snapshotIsExpired(snapshot),
    productCount: snapshot.products.length,
    baseCountKeys: Object.keys(snapshot.baseCounts || {}).length,
  }
}

function countsCacheKey(snapshot: CatalogSnapshot, query: Record<string, unknown>) {
  const normalized = normalizeCatalogFilterQuery(query)
  const stable = Object.keys(normalized)
    .sort()
    .reduce((result, key) => {
      result[key] = normalized[key].slice().sort()
      return result
    }, {} as CatalogFilterQuery)

  return `${snapshot.generatedAtMs}:${JSON.stringify(stable)}`
}

export function getCatalogCountsFromSnapshot(
  snapshot: CatalogSnapshot,
  query: Record<string, unknown> = {},
) {
  const normalized = normalizeCatalogFilterQuery(query)
  if (!Object.keys(normalized).length) return snapshot.baseCounts

  const key = countsCacheKey(snapshot, normalized)
  const cached = countsCache.get(key)
  if (cached) return cached

  const counts = calculateCatalogCounts(snapshot.products, normalized)
  countsCache.set(key, counts)
  return counts
}
