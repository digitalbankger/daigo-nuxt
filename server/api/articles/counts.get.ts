import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { listArticlesLite } from '~/server/utils/articlesFs'
import filtersHandler from '~/server/api/shop/filters.get'

type FilterGroup = { slug: string; options: { value: string }[] }

function matches(a: any, search: string, filters: Record<string, string[]>) {
  if (search) {
    const hay = `${String(a.title ?? '')} ${String(a.preview ?? '')}`.toLowerCase()
    if (!hay.includes(search)) return false
  }
  for (const [key, values] of Object.entries(filters)) {
    const prop = a?.properties?.[key]
    if (prop == null) return false
    if (Array.isArray(prop)) {
      if (!prop.some(v => values.includes(String(v)))) return false
    } else {
      if (!values.includes(String(prop))) return false
    }
  }
  return true
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const search = String(q.q ?? '').trim().toLowerCase()

  const base = Object.entries(q).reduce<Record<string, string[]>>((acc, [key, raw]) => {
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

  const groups = (await (filtersHandler as any)({} as any)) as FilterGroup[]
  const all = await listArticlesLite()

  const counts: Record<string, number> = {}

  for (const g of groups) {
    for (const opt of g.options) {
      const test: Record<string, string[]> = {}
      for (const [k, v] of Object.entries(base)) {
        if (k !== g.slug) test[k] = v
      }
      test[g.slug] = [opt.value]
      const c = all.reduce((n, a) => n + (matches(a, search, test) ? 1 : 0), 0)
      counts[`${g.slug}__${opt.value}`] = c
    }
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')
  return { counts }
})
