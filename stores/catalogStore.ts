import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductCard } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'
import { useDeviceStore } from '@/stores/deviceStore'

type BaseQuery = Record<string, string[]>

export const useCatalogStore = defineStore('catalog', () => {
  const device = useDeviceStore()

  const products = ref<ProductCard[]>([])
  const filters = ref<FilterGroup[]>([])
  const catalogBanner = ref<CatalogBanner | null>(null)
  const counts = ref<Record<string, number>>({})

  const page = ref(1)
  const perPageDisplayed = computed(() => (device.isMobile ? 16 : 15))
  const totalPages = ref(1)

  const allProducts = ref<ProductCard[]>([])
  const allLoaded = ref(false)
  let allLoadingPromise: Promise<void> | null = null

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

  const fetchProducts = async (params: Record<string, string>) => {
    const limit = perPageDisplayed.value
    const query = {
      ...params,
      page: String(page.value),
      limit: String(limit),
    }

    const data = await $fetch<{ items: ProductCard[]; total: number }>('/api/shop/products', { query })

    products.value = Array.isArray(data?.items) ? data.items : []

    const total = Number(data?.total || 0)
    totalPages.value = Math.max(1, Math.ceil(total / limit))
  }

  async function ensureAllLoaded() {
    if (allLoaded.value) return
    if (allLoadingPromise) return allLoadingPromise

    allLoadingPromise = (async () => {
      const acc: ProductCard[] = []
      const batchSize = 50

      for (let p = 1; p <= 200; p++) {
        const res = await $fetch<{ items: ProductCard[] }>('/api/shop/products', {
          query: { page: String(p), limit: String(batchSize) }
        })

        const batch = Array.isArray(res?.items) ? res.items : []
        acc.push(...batch)

        if (batch.length < batchSize) break
      }

      allProducts.value = acc
      allLoaded.value = true
      allLoadingPromise = null
    })()

    return allLoadingPromise
  }

  function buildBaseQueryFromParams(params: Record<string, string>): BaseQuery {
    const base: BaseQuery = {}
    for (const [k, v] of Object.entries(params)) {
      if (['page', 'page_size', 'limit', 'empty'].includes(k)) continue
      if (!v) continue
      base[k] = String(v).split(',').filter(Boolean)
    }
    return base
  }

  function propValues(p: ProductCard, slug: string): string[] {
    const raw = (p as any)?.properties?.[slug]
    if (Array.isArray(raw)) return raw.map(String)
    if (raw == null) return []
    return String(raw).split(',').map((s) => s.trim()).filter(Boolean)
  }

  function matchesBaseFilters(
    p: ProductCard,
    base: BaseQuery,
    skipGroup?: string
  ) {
    for (const [k, values] of Object.entries(base)) {
      if (k === skipGroup) continue
      if (!values?.length) continue
      const pv = propValues(p, k)
      if (!values.some((v) => pv.includes(v))) return false
    }
    return true
  }

  const fetchCounts = async (baseQuery: BaseQuery = {}) => {
    await ensureAllLoaded()
    const flat: Record<string, number> = {}

    for (const group of filters.value || []) {
      const slug = group.slug
      for (const option of group.options) {
        const val = option.value
        const cnt = allProducts.value.filter((p) => {
          if (!matchesBaseFilters(p, baseQuery, slug)) return false
          const pv = propValues(p, slug)
          return pv.includes(val)
        }).length
        flat[`${slug}__${val}`] = cnt
      }
    }

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
    setPage,
    fetchFilters,
    fetchProducts,
    fetchCatalogBanner,
    fetchCounts,
    buildBaseQueryFromParams,
  }
})
