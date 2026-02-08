import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listArticlesLite } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const search = String(q.q ?? '').trim().toLowerCase()

  const activeFilters = Object.entries(q).reduce<Record<string, string[]>>((acc, [key, raw]) => {
    if (key === 'page' || key === 'q') return acc
    const values =
      typeof raw === 'string'
        ? raw.split(',').map(v => v.trim()).filter(Boolean)
        : Array.isArray(raw)
          ? raw.flatMap(v => String(v).split(',')).map(v => v.trim()).filter(Boolean)
          : []
    if (values.length) acc[key] = values
    return acc
  }, {})

  const all = await listArticlesLite()

  const count = all.reduce((n, a) => {
    if (search) {
      const hay = `${String(a.title ?? '')} ${String(a.preview ?? '')}`.toLowerCase()
      if (!hay.includes(search)) return n
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      const prop = (a as any)?.properties?.[key]
      if (prop == null) return n
      if (Array.isArray(prop)) {
        if (!prop.some(v => values.includes(String(v)))) return n
      } else {
        if (!values.includes(String(prop))) return n
      }
    }
    return n + 1
  }, 0)

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')
  return { count }
})
