import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { getWeeklyProductSort, isWeeklyProductSlug } from '~/constants/weeklyProducts'
import {
  filterCatalogProducts,
  getCatalogSnapshot,
  toCatalogStringArray,
} from '~/server/utils/catalogSnapshot'

const DEFAULT_PAGE_SIZE = 15
const MAX_PAGE_SIZE = 9999

function positiveInt(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.floor(parsed)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, unknown>

  try {
    // Каталог работает от единого server-side snapshot.
    // Первый запрос собирает полную выборку Go API один раз, последующие запросы
    // (пагинация, фильтры, product_ids, квиз) работают только с быстрым cache/storage.
    const { snapshot, source } = await getCatalogSnapshot(event, { allowStale: true })

    setResponseHeader(event, 'X-Catalog-Snapshot', source)
    setResponseHeader(event, 'X-Catalog-Snapshot-Generated-At', snapshot.generatedAt)

    const productIds = toCatalogStringArray(query.product_ids)
    if (productIds.length) {
      const ids = new Set(productIds.map(String))
      const items = snapshot.products.filter((product) => ids.has(String(product.product_id)))
      return { items, total: items.length }
    }

    const filtered = filterCatalogProducts(snapshot.products, query)
    const total = filtered.length

    // Для каталога гарантируем попадание «Продуктов недели» в первую SSR-порцию
    // без отдельного запроса к API и без дублирования ProductCard-данных.
    // Остальные товары сохраняют исходный порядок snapshot, а пагинация работает
    // уже по единой последовательности weekly + regular, поэтому loadMore не дублирует товары.
    const paginatedProducts = query.for === 'catalog-page'
      ? [
          ...filtered
            .filter((product) => isWeeklyProductSlug(product.slug))
            .sort(
              (a, b) =>
                getWeeklyProductSort(a.slug) - getWeeklyProductSort(b.slug),
            ),
          ...filtered.filter((product) => !isWeeklyProductSlug(product.slug)),
        ]
      : filtered

    const page = positiveInt(query.page, 1)
    const requestedPageSize = positiveInt(query.page_size ?? query.limit, DEFAULT_PAGE_SIZE)
    const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE)

    // Старые внутренние вызовы no_total/for=catalog ожидают всю выборку.
    // Теперь это не Go API на 9999 товаров, а уже готовый локальный snapshot.
    const returnAll =
      query.no_total === '1' ||
      query.for === 'catalog' ||
      query.for === 'counts' ||
      requestedPageSize >= 999

    if (returnAll) {
      return {
        items: filtered,
        total,
        page: 1,
        pageSize: total,
      }
    }

    const start = Math.max(0, (page - 1) * pageSize)
    return {
      items: paginatedProducts.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    }
  } catch (error: any) {
    console.error('[catalog-products] snapshot error', error)
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage: 'Catalog upstream error',
    })
  }
})
