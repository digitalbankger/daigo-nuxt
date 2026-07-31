import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listArticlesLite } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page ?? 1))
  const perPage = 15
  const search = String(query.q ?? '').trim().toLowerCase()

  const activeFilters = Object.entries(query).reduce<Record<string, string[]>>(
    (filters, [key, raw]) => {
      if (key === 'page' || key === 'q') return filters

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

  setResponseHeader(
    event,
    'Cache-Control',
    'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
  )

  return {
    items: filtered.slice(start, start + perPage),
    total,
  }
})
