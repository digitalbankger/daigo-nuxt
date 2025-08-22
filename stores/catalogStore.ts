import { defineStore } from 'pinia'
import type { Product } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([])
  const filters = ref<FilterGroup[]>([])
  const catalogBanner = ref<CatalogBanner | null>(null)
  const counts = ref<Record<string, number>>({})

  const page = ref(1)
  const perPage = 9
  const totalPages = ref(1)

  const setPage = (value: number) => {
    page.value = value
  }

  const fetchFilters = async () => {
    const result = await $fetch<FilterGroup[]>('/api/shop/filters')
    filters.value = result || []
  }

  const fetchCatalogBanner = async () => {
    const { data } = await useFetch<CatalogBanner>('/api/content/catalog-banner')
    catalogBanner.value = data.value
  }

  const fetchProducts = async (params: Record<string, string>) => {
    const { data } = await useFetch<{ items: Product[]; total: number }>(
      '/api/shop/products',
      { query: params }
    )

    products.value = data.value?.items || []
    const total = data.value?.total || 0
    totalPages.value = Math.ceil(total / perPage)
  }

  const fetchCounts = async (baseQuery: Record<string, string[]> = {}) => {
    const flatOptions: { key: string, value: string }[] = []

    filters.value.forEach(group => {
      group.options.forEach(option => {
        flatOptions.push({ key: group.slug, value: option.value })
      })
    })

    const results = await Promise.all(flatOptions.map(async ({ key, value }) => {
      const query: Record<string, string> = {}

      for (const baseKey in baseQuery) {
        if (baseKey !== key) {
          query[baseKey] = baseQuery[baseKey].join(',')
        }
      }

      query[key] = value

      const { count } = await $fetch<{ count: number }>(
        '/api/shop/products/count',
        { query }
      )
      return { id: `${key}__${value}`, count }
    }))

    counts.value = Object.fromEntries(results.map(r => [r.id, r.count]))
  }


  return {
    products,
    filters,
    catalogBanner,
    counts,
    page,
    perPage,
    totalPages,
    setPage,
    fetchFilters,
    fetchProducts,
    fetchCatalogBanner,
    fetchCounts
  }
})
