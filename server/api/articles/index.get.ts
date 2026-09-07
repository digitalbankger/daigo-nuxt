import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { ARTICLE_CARDS } from '~/content/articles-json/articles.cards'
import { getArticleFilterGroups } from '~/server/utils/articleFilters'
import { fetchArticlesFromGo } from '~/server/utils/articlesApi'

const PINNED_SLUG = 'iskusstvo-dolgoletiya-filosofiya-zdorovogo-dolgoletiya-daigo'
const CACHE_TTL_MS = 60_000
const responseCache = new Map<string, { expiresAt: number; value: any }>()

function normalizeValues(raw: unknown): string[] {
  if (typeof raw === 'string') {
    return raw.split(',').map(value => value.trim()).filter(Boolean)
  }

  if (Array.isArray(raw)) {
    return raw
      .flatMap(value => String(value).split(','))
      .map(value => value.trim())
      .filter(Boolean)
  }

  return []
}

function localFallback(event: any) {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page ?? 1))
  const perPage = Math.max(1, Math.min(100, Number(query.page_size ?? query.per_page ?? 15)))
  const search = String(query.q ?? '').trim().toLowerCase()
  const allowedFilters = new Set(getArticleFilterGroups().map(group => group.slug))

  const activeFilters = Object.entries(query).reduce<Record<string, string[]>>(
    (filters, [key, raw]) => {
      if (!allowedFilters.has(key)) return filters
      const values = normalizeValues(raw)
      if (values.length) filters[key] = values
      return filters
    },
    {},
  )

  const filtered = ARTICLE_CARDS.filter((article: any) => {
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

  filtered.sort((a: any, b: any) => {
    if (a.slug === PINNED_SLUG) return -1
    if (b.slug === PINNED_SLUG) return 1
    return String(b.date ?? '').localeCompare(String(a.date ?? ''))
  })

  const total = filtered.length
  const start = (page - 1) * perPage

  return {
    items: filtered.slice(start, start + perPage),
    total,
    page,
    perPage,
  }
}

export default defineEventHandler(async (event) => {
  const cacheKey = event.node.req.url || '/api/articles'
  const cached = responseCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    setResponseHeader(event, 'X-Articles-Source', 'go-api-cache')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')
    return cached.value
  }

  try {
    const payload = await fetchArticlesFromGo(event)

    // Если закреплённая статья попала в текущую страницу API, оставляем её первой.
    // Глобальную пагинацию не ломаем и не скачиваем сотни статей на каждый запрос.
    payload.items.sort((a, b) => {
      if (a.slug === PINNED_SLUG) return -1
      if (b.slug === PINNED_SLUG) return 1
      return String(b.date ?? '').localeCompare(String(a.date ?? ''))
    })

    responseCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value: payload,
    })

    setResponseHeader(event, 'X-Articles-Source', 'go-api')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')
    return payload
  } catch (error) {
    // Пока detail-страницы ещё живут в локальных JSON, оставляем безопасный fallback:
    // при кратковременной недоступности Go раздел статей не превращается в 502.
    const payload = localFallback(event)
    setResponseHeader(event, 'X-Articles-Source', 'build-content-fallback')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=10, s-maxage=30, stale-while-revalidate=120')
    return payload
  }
})
