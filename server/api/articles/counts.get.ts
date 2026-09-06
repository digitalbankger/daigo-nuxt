import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { ARTICLE_CARDS } from '~/content/articles-json/articles.cards'
import { getArticleFilterGroups } from '~/server/utils/articleFilters'

function normalizeValues(raw: unknown): string[] {
  if (typeof raw === 'string') return raw.split(',').map(v => v.trim()).filter(Boolean)
  if (Array.isArray(raw)) return raw.flatMap(v => String(v).split(',')).map(v => v.trim()).filter(Boolean)
  return []
}

function matches(article: any, search: string, filters: Record<string, string[]>) {
  if (search) {
    const haystack = `${String(article.title ?? '')} ${String(article.preview ?? '')}`.toLowerCase()
    if (!haystack.includes(search)) return false
  }

  for (const [key, values] of Object.entries(filters)) {
    const property = article?.properties?.[key]
    if (property == null) return false
    const articleValues = Array.isArray(property) ? property.map(String) : [String(property)]
    if (!articleValues.some(value => values.includes(value))) return false
  }

  return true
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = String(query.q ?? '').trim().toLowerCase()
  const groups = getArticleFilterGroups()
  const allowed = new Set(groups.map(group => group.slug))

  const base = Object.entries(query).reduce<Record<string, string[]>>((acc, [key, raw]) => {
    if (!allowed.has(key)) return acc
    const values = normalizeValues(raw)
    if (values.length) acc[key] = values
    return acc
  }, {})

  const counts: Record<string, number> = {}

  for (const group of groups) {
    for (const option of group.options) {
      const test: Record<string, string[]> = {}
      for (const [key, values] of Object.entries(base)) {
        if (key !== group.slug) test[key] = values
      }
      test[group.slug] = [option.value]
      counts[`${group.slug}__${option.value}`] = (ARTICLE_CARDS as any[])
        .reduce((total, article) => total + (matches(article, search, test) ? 1 : 0), 0)
    }
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400')
  return { counts }
})
