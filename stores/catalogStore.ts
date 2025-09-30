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

  // Кэш полного списка для facet-счётчиков и локального total
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

  /**
   * Грузим карточки текущей страницы.
   * totalPages считаем по ответу бэка, а если загружен allProducts —
   * пересчитываем total локально теми же фильтрами и берём большее значение.
   */
  const fetchProducts = async (params: Record<string, string>) => {
    const query = {
      ...params,
      page:  String(page.value),
      limit: String(perPage), // наш бэк ожидает 'limit'
    }

    const { data } = await useFetch<{ items: Product[]; total: number }>(
      '/api/shop/products',
      { query }
    )

    products.value = data.value?.items || []

    // 1) total из узкого запроса
    let total = Number(data.value?.total || 0)

    // 2) Если есть "все товары" — пересчитываем total локально по тем же фильтрам
    await ensureAllLoaded()
    const baseQuery = buildBaseQueryFromParams(params)
    const totalLocal = allProducts.value.filter(p => matchesBaseFilters(p, baseQuery)).length

    if (totalLocal > total) total = totalLocal

    totalPages.value = Math.max(1, Math.ceil(total / perPage))
  }

  /**
   * Один раз грузим полный список для локального подсчёта counts/total.
   * (limit 9999 — ок для наших объёмов, можно заменить на серверный endpoint /all)
   */
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

  /**
   * Собираем базовые фильтры из параметров запроса.
   * Игнорируем служебные поля пагинации.
   */
  function buildBaseQueryFromParams(params: Record<string, string>): BaseQuery {
    const base: BaseQuery = {}
    for (const [k, v] of Object.entries(params)) {
      if (['page', 'page_size', 'limit', 'empty'].includes(k)) continue
      if (!v) continue
      base[k] = String(v).split(',').filter(Boolean)
    }
    return base
  }

  /**
   * Проверяем, что товар p соответствует набору базовых фильтров base.
   * В логике — конъюнкция групп, внутри группы — дизъюнкция (любой из значений подходит).
   * skipGroup — чтобы при расчёте counts игнорировать текущую группу.
   */
  function matchesBaseFilters(p: Product, base: BaseQuery, skipGroup?: string) {
    const props = (p as any).properties || {}
    for (const [k, values] of Object.entries(base)) {
      if (k === skipGroup) continue
      if (!values?.length) continue
      const pv = String(props[k] ?? '')
      if (!values.includes(pv)) return false
    }
    return true
  }

  /**
   * Локальный расчёт facet-счётчиков по allProducts.
   * baseQuery — активные фильтры (без текущей группы).
   */
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
    // state
    products, filters, catalogBanner, counts,
    page, perPage, totalPages,

    // actions
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
