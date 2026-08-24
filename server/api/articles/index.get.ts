import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { fetchArticlesFromGo } from '~/server/utils/articlesApi'
import { listArticlesLite } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  // Основной источник статей — Go API.
  // Актуальный endpoint Go API:
  // GET /v1/shop/articles
  try {
    const result = await fetchArticlesFromGo(event)

    // Не кешируем список на стороне браузера/CDN: новые статьи должны
    // появляться сразу после публикации в Go.
    setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')
    setResponseHeader(event, 'X-Articles-Source', 'go')
    return result
  } catch (error: any) {
    // Локальные JSON оставляем только аварийным fallback, чтобы раздел
    // не становился полностью пустым при временной недоступности Go API.
    console.error(
      '[articles/index] Go API unavailable, using local fallback:',
      error?.statusCode || error?.status || '',
      error?.statusMessage || error?.message || error,
    )

    const query = getQuery(event)
    const page = Math.max(1, Number(query.page ?? 1))
    const perPage = 15
    const search = String(query.q ?? '').trim().toLowerCase()

    const activeFilters = Object.entries(query).reduce<Record<string, string[]>>(
      (filters, [key, raw]) => {
        if (key === 'page' || key === 'q' || key === 'page_size' || key === 'per_page') return filters

        const values =
          typeof raw === 'string'
            ? raw.split(',').map(value => value.trim()).filter(Boolean)
            : Array.isArray(raw)
              ? raw.flatMap(value => String(value).split(',')).map(value => value.trim()).filter(Boolean)
              : []

        if (values.length) filters[key] = values
        return filters
      },
      {},
    )

    const all = await listArticlesLite()
    const filtered = all.filter((article) => {
      if (search) {
        const haystack = `${String(article.title ?? '')} ${String(article.preview ?? '')}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }

      for (const [key, values] of Object.entries(activeFilters)) {
        const property = article?.properties?.[key]
        if (property == null) return false

        if (Array.isArray(property)) {
          if (!property.some(value => values.includes(String(value)))) return false
        } else if (!values.includes(String(property))) {
          return false
        }
      }

      return true
    })

    const total = filtered.length
    const start = (page - 1) * perPage

    setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')
    setResponseHeader(event, 'X-Articles-Source', 'local-fallback')
    return {
      items: filtered.slice(start, start + perPage),
      total,
      page,
      perPage,
    }
  }
})
