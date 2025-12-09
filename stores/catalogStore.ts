import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProductCard } from '~/types/product'
import type { FilterGroup } from '~/types/filter'
import type { CatalogBanner } from '~/types/catalog'
import { useDeviceStore } from '@/stores/deviceStore' // ваш стор для определения устройства

type BaseQuery = Record<string, string[]>

export const useCatalogStore = defineStore('catalog', () => {
  const device = useDeviceStore()

  const products = ref<ProductCard[]>([])
  const filters = ref<FilterGroup[]>([])
  const catalogBanner = ref<CatalogBanner | null>(null)
  const counts = ref<Record<string, number>>({})

  const page = ref(1)

  // Сколько показываем на странице: 10 на мобиле, 9 на десктопе
  const perPageDisplayed = computed(() => (device.isMobile ? 10 : 9))
  const totalPages = ref(1)

  // Кэш полного списка для facet-счётчиков и локального total
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
    const { data } = await useFetch<CatalogBanner>('/api/content/catalog-banner')
    catalogBanner.value = data.value
  }

  /**
   * Грузим карточки текущей страницы.
   * totalPages считаем по ответу бэка, а если загружен allProducts —
   * пересчитываем total локально теми же фильтрами и берём большее значение.
   */
  const fetchProducts = async (params: Record<string, string>) => {
    const limit = perPageDisplayed.value // ВАЖНО: limit == реальному показу

    const query = {
      ...params,
      page: String(page.value),
      limit: String(limit),
    }

    const { data } = await useFetch<{ items: ProductCard[]; total: number }>(
      '/api/shop/products',
      { query }
    )

    // Для fallback локального поиска загружаем allProducts
    await ensureAllLoaded()
    const baseQuery = buildBaseQueryFromParams(params)
    const localList = allProducts.value.filter((p) => matchesBaseFilters(p, baseQuery))

    const remoteItems = data.value?.items || []

    // Если бэк вернул пустой список, но локально есть совпадения — используем локальные
    if (remoteItems.length === 0 && localList.length > 0) {
      const start = (page.value - 1) * limit
      const end = start + limit
      products.value = localList.slice(start, end)
    } else {
      // Без обрезаний: показываем ровно то, что запросили
      products.value = remoteItems
    }

    // 1) total из ответа бэка
    let total = Number(data.value?.total || 0)
    // 2) Локальный total (если больше)
    const totalLocal = localList.length
    if (totalLocal > total) total = totalLocal
    totalPages.value = Math.max(1, Math.ceil(total / limit))
  }

  /**
   * Один раз грузим полный список для локального подсчёта counts/total.
   * Не используем limit=9999 — идём батчами, пока не закончится выдача.
   */
  async function ensureAllLoaded() {
    if (allLoaded.value) return
    if (allLoadingPromise) return allLoadingPromise

    allLoadingPromise = (async () => {
      const acc: ProductCard[] = []
      const batchSize = 50 // не перегружаем сеть

      // ограничение на 200 страниц
      for (let p = 1; p <= 200; p++) {
        const res = await $fetch<{ items: ProductCard[] }>(
          '/api/shop/products',
          { query: { page: String(p), limit: String(batchSize) } }
        )

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
   * Конъюнкция групп, внутри группы — дизъюнкция.
   */
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

  /**
   * Локальный расчёт facet-счётчиков по allProducts.
   * baseQuery — активные фильтры (без текущей группы).
   */
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
    // state
    products,
    filters,
    catalogBanner,
    counts,
    page,
    perPageDisplayed,
    totalPages,

    // actions
    setPage,
    fetchFilters,
    fetchProducts,
    fetchCatalogBanner,
    fetchCounts,
  }
})












// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// //import type { Product } from '~/types/product'
// import type { ProductCard } from '~/types/product'
// import type { FilterGroup } from '~/types/filter'
// import type { CatalogBanner } from '~/types/catalog'

// type BaseQuery = Record<string, string[]>

// export const useCatalogStore = defineStore('catalog', () => {
//   //const products = ref<Product[]>([])
//   const products = ref<ProductCard[]>([])
//   const filters  = ref<FilterGroup[]>([])
//   const catalogBanner = ref<CatalogBanner | null>(null)
//   const counts   = ref<Record<string, number>>({})

//   const page = ref(1)
//   const perPage = 9
//   const totalPages = ref(1)

//   // Кэш полного списка для facet-счётчиков и локального total
//   //const allProducts = ref<Product[]>([])
//   const allProducts = ref<ProductCard[]>([])
//   const allLoaded   = ref(false)
//   let allLoadingPromise: Promise<void> | null = null

//   const setPage = (value: number) => { page.value = value }

//   const fetchFilters = async () => {
//     const result = await $fetch<FilterGroup[]>('/api/shop/filters')
//     filters.value = result || []
//   }

//   const fetchCatalogBanner = async () => {
//     const { data } = await useFetch<CatalogBanner>('/api/content/catalog-banner')
//     catalogBanner.value = data.value
//   }

//   /**
//    * Грузим карточки текущей страницы.
//    * totalPages считаем по ответу бэка, а если загружен allProducts —
//    * пересчитываем total локально теми же фильтрами и берём большее значение.
//    */
//   const fetchProducts = async (params: Record<string, string>) => {
//     const query = {
//       ...params,
//       page:  String(page.value),
//       limit: String(perPage), // наш бэк ожидает 'limit'
//     }

//     const { data } = await useFetch<{ items: ProductCard[]; total: number }>(
//       '/api/shop/products',
//       { query }
//     )

//     products.value = data.value?.items || []

//     // 1) total из узкого запроса (может быть занижен — равен размеру страницы)
//     let total = Number(data.value?.total || 0)

//     // 2) Если есть "все товары" — пересчитываем total локально по тем же фильтрам
//     await ensureAllLoaded()
//     const baseQuery = buildBaseQueryFromParams(params)
//     const totalLocal = allProducts.value.filter(p => matchesBaseFilters(p, baseQuery)).length

//     if (totalLocal > total) total = totalLocal

//     totalPages.value = Math.max(1, Math.ceil(total / perPage))
//   }

//   /**
//    * Один раз грузим полный список для локального подсчёта counts/total.
//    * ВАЖНО: не используем limit=9999, потому что бэк режет до ~20.
//    * Вместо этого идём постранично батчами, пока не закончится выдача.
//    */
//   async function ensureAllLoaded() {
//     if (allLoaded.value) return
//     if (allLoadingPromise) return allLoadingPromise

//     allLoadingPromise = (async () => {
//       const acc: ProductCard[] = []
//       const batchSize = 50 // разумный батч, не перегружаем апи/сеть

//       // Хард-стоп на 200 страниц, чтобы не уйти в бесконечность
//       for (let p = 1; p <= 200; p++) {
//         const res = await $fetch<{ items: ProductCard[] }>(
//           '/api/shop/products',
//           { query: { page: String(p), limit: String(batchSize) } }
//         )

//         const batch = Array.isArray(res?.items) ? res.items : []
//         acc.push(...batch)

//         // Если вернулось меньше, чем запросили — дальше пусто
//         if (batch.length < batchSize) break
//       }

//       allProducts.value = acc
//       allLoaded.value = true
//       allLoadingPromise = null
//     })()

//     return allLoadingPromise
//   }

//   /**
//    * Собираем базовые фильтры из параметров запроса.
//    * Игнорируем служебные поля пагинации.
//    */
//   function buildBaseQueryFromParams(params: Record<string, string>): BaseQuery {
//     const base: BaseQuery = {}
//     for (const [k, v] of Object.entries(params)) {
//       if (['page', 'page_size', 'limit', 'empty'].includes(k)) continue
//       if (!v) continue
//       base[k] = String(v).split(',').filter(Boolean)
//     }
//     return base
//   }

//   /**
//    * Проверяем, что товар p соответствует набору базовых фильтров base.
//    * В логике — конъюнкция групп, внутри группы — дизъюнкция (любой из значений подходит).
//    * skipGroup — чтобы при расчёте counts игнорировать текущую группу.
//    */
//   function propValues(p: ProductCard, slug: string): string[] {
//     const raw = (p as any)?.properties?.[slug]
//     if (Array.isArray(raw)) return raw.map(String)
//     if (raw == null) return []
//     // на случай, если придёт CSV-строка
//     return String(raw).split(',').map(s => s.trim()).filter(Boolean)
//   }

//   function matchesBaseFilters(p: ProductCard, base: BaseQuery, skipGroup?: string) {
//     for (const [k, values] of Object.entries(base)) {
//       if (k === skipGroup) continue
//       if (!values?.length) continue
//       const pv = propValues(p, k)                // ← массив значений свойства
//       if (!values.some(v => pv.includes(v))) {   // ← есть ли пересечение
//         return false
//       }
//     }
//     return true
//   }

//   /**
//    * Локальный расчёт facet-счётчиков по allProducts.
//    * baseQuery — активные фильтры (без текущей группы).
//    */
//   const fetchCounts = async (baseQuery: BaseQuery = {}) => {
//     await ensureAllLoaded()
//     const flat: Record<string, number> = {}

//     for (const group of (filters.value || [])) {
//       const slug = group.slug
//       for (const option of group.options) {
//         const val = option.value
//         const cnt = allProducts.value.filter(p => {
//           if (!matchesBaseFilters(p, baseQuery, slug)) return false
//           const pv = propValues(p, slug)
//           return pv.includes(val)
//         }).length
//         flat[`${slug}__${val}`] = cnt
//       }
//     }

//     counts.value = flat
//   }

//   return {
//     // state
//     products, filters, catalogBanner, counts,
//     page, perPage, totalPages,

//     // actions
//     setPage,
//     fetchFilters, fetchProducts, fetchCatalogBanner,
//     fetchCounts,
//   }
// })
