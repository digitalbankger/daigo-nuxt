import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductCard } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'
import { EVOLUTION_CANONICAL_SLUG, EVOLUTION_LEGACY_SLUG } from '~/constants/evolution'

type BaseQuery = Record<string, string[]>

const LOAD_BATCH_SIZE = 12

const PROPERTY_ALIASES: Record<string, string[]> = {
  produkty: ['produkty', 'producty', 'products', 'name'],
}

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

function unique(values: string[]) {
  return Array.from(new Set(values))
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

  function propValues(product: ProductCard, slug: string): string[] {
    const aliases = PROPERTY_ALIASES[slug] || [slug]
    const values: string[] = []

    for (const key of aliases) {
      values.push(...toStringArray((product as any)?.properties?.[key]))
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

  function matchesBaseFilters(
    product: ProductCard,
    base: BaseQuery,
    skipGroup?: string
  ) {
    for (const [key, values] of Object.entries(base)) {
      if (key === skipGroup) continue
      if (!values?.length) continue

      const productValues = propValues(product, key)
      const normalizedValues = values.map(normalizeFilterValue)

      const matches = normalizedValues.some((value) => {
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

  const fetchProducts = async (params: Record<string, string>) => {
    await ensureAllLoaded()

    const baseQuery = buildBaseQueryFromParams(params)
    const filteredProducts = allProducts.value.filter((product) => matchesBaseFilters(product, baseQuery))

    products.value = filteredProducts
    totalProducts.value = filteredProducts.length
    totalPages.value = Math.max(1, Math.ceil(filteredProducts.length / LOAD_BATCH_SIZE))
    page.value = 1
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

    await ensureAllLoaded()
    const flat: Record<string, number> = {}

    for (const group of filters.value || []) {
      const slug = group.slug

      for (const option of group.options) {
        const value = normalizeFilterValue(option.value)
        const count = allProducts.value.filter((product) => {
          if (!matchesBaseFilters(product, baseQuery, slug)) return false
          if (slug === 'napravlennost') {
            const strictMatch = strictDirectionMatch(product, value)
            if (strictMatch != null) return strictMatch
          }
          return propValues(product, slug).includes(value)
        }).length

        flat[`${slug}__${option.value}`] = count
      }
    }

    countsCache.set(cacheKey, flat)
    counts.value = flat
  }

  return {
    products,
    filters,
    catalogBanner,
    counts,
    page,
    perPageDisplayed,
    totalPages,
    totalProducts,
    allProducts,
    ensureAllLoaded,
    setPage,
    fetchFilters,
    fetchProducts,
    fetchCatalogBanner,
    fetchCounts,
    buildBaseQueryFromParams,
  }
})
