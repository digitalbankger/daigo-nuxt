import { defineStore } from 'pinia'
import type { Product } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'

type BaseQuery = Record<string, string[]>

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([])
  const filters  = ref<FilterGroup[]>([])
  const catalogBanner = ref<CatalogBanner | null>(null)
  const counts   = ref<Record<string, number>>({})

  const page = ref(1)
  const perPage = 9
  const totalPages = ref(1)

  // кэш полного списка для facet-счётчиков
  const allProducts = ref<Product[]>([])
  const allLoaded   = ref(false)
  let allLoadingPromise: Promise<void> | null = null

  const setPage = (value: number) => { page.value = value }

  const fetchFilters = async () => {
    const result = await $fetch<FilterGroup[]>('/api/shop/filters')
    filters.value = result || []
  }

  const fetchCatalogBanner = async () => {
    const { data } = await useFetch<CatalogBanner>('/api/content/catalog-banner')
    catalogBanner.value = data.value
  }

  // карточки текущей страницы
  const fetchProducts = async (params: Record<string, string>) => {
    const query = {
      ...params,
      page:  String(page.value),
      limit: String(perPage),        // <— важно, чтобы бэк понимал пагинацию
    }

    const { data } = await useFetch<{ items: Product[]; total: number }>(
      '/api/shop/products',
      { query }
    )

    products.value = data.value?.items || []
    const total = data.value?.total || 0
    totalPages.value = Math.max(1, Math.ceil(total / perPage))
  }

  // один раз грузим полный список (50 шт — ок)
  async function ensureAllLoaded() {
    if (allLoaded.value) return
    if (allLoadingPromise) return allLoadingPromise

    allLoadingPromise = (async () => {
      const res = await $fetch<{ items: Product[] }>(
        '/api/shop/products',
        { query: { page: '1', limit: '9999' } }
      )
      allProducts.value = res.items || []
      allLoaded.value = true
      allLoadingPromise = null
    })()

    return allLoadingPromise
  }

  // проверка соответствия базовым фильтрам (с дисъюнктивностью)
  function matchesBaseFilters(p: Product, base: BaseQuery, skipGroup?: string) {
    const props = (p as any).properties || {}
    for (const [k, values] of Object.entries(base)) {
      if (k === skipGroup) continue         // внутри своей группы игнорим её же фильтры
      if (!values?.length) continue
      const pv = String(props[k] ?? '')
      if (!values.includes(pv)) return false
    }
    return true
  }

  // считаем counts локально
  const fetchCounts = async (baseQuery: BaseQuery = {}) => {
    await ensureAllLoaded()
    const flat: Record<string, number> = {}

    for (const group of (filters.value || [])) {
      const slug = group.slug
      for (const option of group.options) {
        const val = option.value
        const cnt = allProducts.value.filter(p => {
          if (!matchesBaseFilters(p, baseQuery, slug)) return false
          const pv = String(((p as any).properties || {})[slug] ?? '')
          return pv === val
        }).length
        flat[`${slug}__${val}`] = cnt
      }
    }

    counts.value = flat
  }

  return {
    products, filters, catalogBanner, counts,
    page, perPage, totalPages,
    setPage,
    fetchFilters, fetchProducts, fetchCatalogBanner,
    fetchCounts,
  }
})








// import { defineStore } from 'pinia'
// import type { Product } from '~/types/product'
// import type { FilterGroup } from '~/types/filter'
// import type { CatalogBanner } from '~/types/catalog'

// export const useCatalogStore = defineStore('catalog', () => {
//   const products = ref<Product[]>([])
//   const filters = ref<FilterGroup[]>([])
//   const catalogBanner = ref<CatalogBanner | null>(null)
//   const counts = ref<Record<string, number>>({})

//   const page = ref(1)
//   const perPage = 9
//   const totalPages = ref(1)

//   const setPage = (value: number) => {
//     page.value = value
//   }

//   const fetchFilters = async () => {
//     const result = await $fetch<FilterGroup[]>('/api/shop/filters')
//     filters.value = result || []
//   }

//   const fetchCatalogBanner = async () => {
//     const { data } = await useFetch<CatalogBanner>('/api/content/catalog-banner')
//     catalogBanner.value = data.value
//   }

//   const fetchProducts = async (params: Record<string, string>) => {
//     const query = {
//       ...params,
//       page:  String(page.value),
//       limit: String(perPage)
//     }

//     const { data } = await useFetch<{ items: Product[]; total: number }>(
//       '/api/shop/products',
//       { query }
//     )

//     products.value = data.value?.items || []
//     const total = data.value?.total || 0
//     totalPages.value = Math.max(1, Math.ceil(total / perPage))
//   }

//   // const fetchProducts = async (params: Record<string, string>) => {
//   //   const { data } = await useFetch<{ items: Product[]; total: number }>(
//   //     '/api/shop/products',
//   //     { query: params }
//   //   )

//   //   products.value = data.value?.items || []
//   //   const total = data.value?.total || 0
//   //   totalPages.value = Math.ceil(total / perPage)
//   // }

//   const fetchCounts = async (baseQuery: Record<string, string[]> = {}) => {
//     const flatOptions: { key: string, value: string }[] = []

//     filters.value.forEach(group => {
//       group.options.forEach(option => {
//         flatOptions.push({ key: group.slug, value: option.value })
//       })
//     })

//     const results = await Promise.all(flatOptions.map(async ({ key, value }) => {
//       const query: Record<string, string> = {}

//       for (const baseKey in baseQuery) {
//         if (baseKey !== key) {
//           query[baseKey] = baseQuery[baseKey].join(',')
//         }
//       }

//       query[key] = value

//       const { count } = await $fetch<{ count: number }>(
//         '/api/shop/products/count',
//         { query }
//       )
//       return { id: `${key}__${value}`, count }
//     }))

//     counts.value = Object.fromEntries(results.map(r => [r.id, r.count]))
//   }


//   return {
//     products,
//     filters,
//     catalogBanner,
//     counts,
//     page,
//     perPage,
//     totalPages,
//     setPage,
//     fetchFilters,
//     fetchProducts,
//     fetchCatalogBanner,
//     fetchCounts
//   }
// })
