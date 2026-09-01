import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { ARTICLE_CARDS } from '~/content/articles-json/articles.cards'

const PINNED_SLUG = 'iskusstvo-dolgoletiya-filosofiya-zdorovogo-dolgoletiya-daigo'

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

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page ?? 1))
  const perPage = Math.max(1, Math.min(100, Number(query.page_size ?? query.per_page ?? 15)))
  const search = String(query.q ?? '').trim().toLowerCase()

  const activeFilters = Object.entries(query).reduce<Record<string, string[]>>(
    (filters, [key, raw]) => {
      if (key === 'page' || key === 'q' || key === 'page_size' || key === 'per_page') return filters
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

  // Сначала закреплённая статья, затем новые по дате.
  filtered.sort((a: any, b: any) => {
    if (a.slug === PINNED_SLUG) return -1
    if (b.slug === PINNED_SLUG) return 1
    return String(b.date ?? '').localeCompare(String(a.date ?? ''))
  })

  const total = filtered.length
  const start = (page - 1) * perPage

  // Контент меняется только вместе с деплоем. Запросы фильтров можно безопасно кешировать.
  setResponseHeader(
    event,
    'Cache-Control',
    'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
  )
  setResponseHeader(event, 'X-Articles-Source', 'build-content')

  return {
    items: filtered.slice(start, start + perPage),
    total,
    page,
    perPage,
  }
})
