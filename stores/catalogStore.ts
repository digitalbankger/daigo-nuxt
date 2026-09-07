import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductCard } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'
import { EVOLUTION_CANONICAL_SLUG, EVOLUTION_LEGACY_SLUG } from '~/constants/evolution'

type BaseQuery = Record<string, string[]>

const LOAD_BATCH_SIZE = 12

function normalizeFilterValue(value: string) {
  const normalized = String(value || '').trim()

  if (['certificate', 'certificates', 'sertifikat', 'sertifikaty'].includes(normalized)) {
    return 'sertificate'
  }

  return normalized
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => toStringArray(item))
  }

  if (value == null) return []

  return String(value)
    .split(',')
    .map((item) => normalizeFilterValue(item))
    .filter(Boolean)
}

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<ProductCard[]>([])
  const filters = ref<FilterGroup[]>([])
  const catalogBanner = ref<CatalogBanner | null>(null)
  const counts = ref<Record<string, number>>({})

  const page = ref(1)
  const perPageDisplayed = computed(() => LOAD_BATCH_SIZE)
  const totalPages = ref(1)
  const totalProducts = ref(0)

  const allProducts = ref<ProductCard[]>([])
  const allLoaded = ref(false)
  let allLoadingPromise: Promise<void> | null = null
  const countsCache = new Map<string, Record<string, number>>()

  function getAllowedFilterSlugs() {
    return new Set(filters.value.map((group) => group.slug))
  }

  function isCatalogFilterKey(key: string) {
    return getAllowedFilterSlugs().has(key)
  }

  const setPage = (value: number) => {
    page.value = value
  }

  const fetchFilters = async () => {
    const result = await $fetch<FilterGroup[]>('/api/shop/filters')
    filters.value = result || []
  }

  const fetchCatalogBanner = async () => {
    const result = await $fetch<CatalogBanner>('/api/content/catalog-banner')
    catalogBanner.value = result || null
  }

  async function ensureAllLoaded() {
    if (allLoaded.value) return
    if (allLoadingPromise) return allLoadingPromise

    allLoadingPromise = (async () => {
      const res = await $fetch<{ items: ProductCard[] }>('/api/shop/products', {
        query: {
          page: '1',
          limit: '9999',
          no_total: '1',
          for: 'catalog',
        }
      })

      allProducts.value = Array.isArray(res?.items)
        ? res.items.map((product) =>
            product.slug === EVOLUTION_LEGACY_SLUG
              ? { ...product, slug: EVOLUTION_CANONICAL_SLUG }
              : product,
          )
        : []
      allLoaded.value = true
      allLoadingPromise = null
    })().catch((error) => {
      allLoadingPromise = null
      throw error
    })

    return allLoadingPromise
  }

  function buildBaseQueryFromParams(params: Record<string, string>): BaseQuery {
    const base: BaseQuery = {}

    for (const [key, value] of Object.entries(params)) {
      if (!isCatalogFilterKey(key)) continue
      if (!value) continue

      const values = toStringArray(value)
      if (values.length) base[key] = values
    }

    return base
  }



  const fetchProducts = async (params: Record<string, string>) => {
    const res = await $fetch<{
      items: ProductCard[]
      total: number
      page?: number
      pageSize?: number
    }>('/api/shop/products', {
      query: {
        ...params,
        page: '1',
        page_size: String(LOAD_BATCH_SIZE),
        for: 'catalog-page',
      },
    })

    products.value = Array.isArray(res?.items) ? res.items : []
    totalProducts.value = Number(res?.total || products.value.length)
    totalPages.value = Math.max(1, Math.ceil(totalProducts.value / LOAD_BATCH_SIZE))
    page.value = 1
  }

  const loadMoreProducts = async (params: Record<string, string>) => {
    if (products.value.length >= totalProducts.value) return

    const nextPage = page.value + 1
    const res = await $fetch<{
      items: ProductCard[]
      total: number
      page?: number
      pageSize?: number
    }>('/api/shop/products', {
      query: {
        ...params,
        page: String(nextPage),
        page_size: String(LOAD_BATCH_SIZE),
        for: 'catalog-page',
      },
    })

    const incoming = Array.isArray(res?.items) ? res.items : []
    const seen = new Set(products.value.map(product => String(product.product_id || product.slug)))
    products.value.push(...incoming.filter(product => {
      const key = String(product.product_id || product.slug)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }))

    totalProducts.value = Number(res?.total || totalProducts.value || products.value.length)
    totalPages.value = Math.max(1, Math.ceil(totalProducts.value / LOAD_BATCH_SIZE))
    page.value = nextPage
  }

  const fetchCounts = async (baseQuery: BaseQuery = {}) => {
    const cacheKey = JSON.stringify(
      Object.keys(baseQuery)
        .sort()
        .reduce((acc, key) => {
          acc[key] = [...baseQuery[key]].map(normalizeFilterValue).sort()
          return acc
        }, {} as BaseQuery)
    )

    if (countsCache.has(cacheKey)) {
      counts.value = countsCache.get(cacheKey) || {}
      return
    }

    // Количества считаются на сервере по единому snapshot каталога.
    // В браузер больше не скачивается весь каталог ради цифр в фильтрах.
    const query = Object.fromEntries(
      Object.entries(baseQuery)
        .filter(([, values]) => Array.isArray(values) && values.length)
        .map(([key, values]) => [key, values.join(',')])
    )

    const response = await $fetch<{
      counts: Record<string, number>
      generatedAt?: string
    }>('/api/shop/catalog-counts', { query })

    const nextCounts = response?.counts || {}
    countsCache.set(cacheKey, nextCounts)
    counts.value = nextCounts
  }

  const hasMore = computed(() => products.value.length < totalProducts.value)


  return {
    products,
    filters,
    catalogBanner,
    counts,
    page,
    perPageDisplayed,
    totalPages,
    totalProducts,
    hasMore,
    allProducts,
    ensureAllLoaded,
    setPage,
    fetchFilters,
    fetchProducts,
    loadMoreProducts,
    fetchCatalogBanner,
    fetchCounts,
    buildBaseQueryFromParams,
  }
})
