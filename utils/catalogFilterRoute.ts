import {
  CATALOG_SEO_FILTER_KEYS,
  CATALOG_SEO_FILTER_VALUES,
  getCatalogSeoFilterKey,
  isCatalogSeoFilterValue,
  type CatalogSeoFilterKey,
} from '~/constants/catalogSeoFilters'

export type CatalogFilterValues = Record<string, string[]>

const IGNORED_QUERY_KEYS = new Set(['empty', 'page', 'page_size', 'limit', 'no_total', 'for'])
const TRACKING_QUERY_KEYS = new Set(['ysclid', 'yclid', 'gclid', 'fbclid', 'etext', 'ybaip'])
const SEO_KEYS = new Set<string>(CATALOG_SEO_FILTER_KEYS)

export function parseCatalogFilterValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (value == null || value === '') return []

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function uniqueCatalogFilterValues(values: string[]): string[] {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)))
}

export function normalizeCatalogFilters(filters: Record<string, unknown>): CatalogFilterValues {
  const normalized: CatalogFilterValues = {}

  for (const [key, value] of Object.entries(filters || {})) {
    const values = uniqueCatalogFilterValues(parseCatalogFilterValues(value))
    if (values.length) normalized[key] = values
  }

  return normalized
}

export function isCatalogSeoFilterKey(key: string): key is CatalogSeoFilterKey {
  return SEO_KEYS.has(key)
}

export function parseCatalogSeoPathSegments(rawSegments: unknown): CatalogFilterValues {
  const segments = Array.isArray(rawSegments)
    ? rawSegments.map(String)
    : typeof rawSegments === 'string'
      ? rawSegments.split('/')
      : []

  const filters: CatalogFilterValues = {}

  for (const raw of segments) {
    const value = decodeURIComponent(String(raw || '').trim())
    if (!value) continue

    const key = getCatalogSeoFilterKey(value)
    if (!key || !isCatalogSeoFilterValue(key, value)) continue

    filters[key] = uniqueCatalogFilterValues([...(filters[key] || []), value])
  }

  return filters
}

// Legacy /catalog/filter/<key>/<value>/<key>/<value> parser.
export function parseLegacyCatalogFilterSegments(
  rawSegments: unknown,
  allowedSlugs?: Set<string>,
): CatalogFilterValues {
  const segments = Array.isArray(rawSegments)
    ? rawSegments.map(String)
    : typeof rawSegments === 'string'
      ? rawSegments.split('/')
      : []

  const filters: CatalogFilterValues = {}

  for (let i = 0; i < segments.length; i += 2) {
    const key = decodeURIComponent(String(segments[i] || '').trim())
    if (!key || (allowedSlugs && !allowedSlugs.has(key))) continue

    const rawValueSegment = segments[i + 1]
    if (!rawValueSegment) continue

    const values = uniqueCatalogFilterValues(
      String(rawValueSegment)
        .split(',')
        .map((value) => decodeURIComponent(value).trim())
        .filter(Boolean),
    )

    if (values.length) filters[key] = values
  }

  return filters
}

export function isCatalogFilterQueryKey(key: string, allowedSlugs?: Set<string>) {
  if (IGNORED_QUERY_KEYS.has(key)) return false
  if (TRACKING_QUERY_KEYS.has(key)) return false
  if (key.startsWith('utm_')) return false
  if (allowedSlugs && !allowedSlugs.has(key)) return false
  return true
}

export function parseCatalogQueryFilters(
  query: Record<string, unknown>,
  allowedSlugs?: Set<string>,
): CatalogFilterValues {
  const filters: CatalogFilterValues = {}

  for (const [key, value] of Object.entries(query || {})) {
    if (!isCatalogFilterQueryKey(key, allowedSlugs)) continue

    const values = uniqueCatalogFilterValues(parseCatalogFilterValues(value))
    if (values.length) filters[key] = values
  }

  return filters
}

export function mergeCatalogFilters(...sources: CatalogFilterValues[]): CatalogFilterValues {
  const result: CatalogFilterValues = {}

  for (const source of sources) {
    for (const [key, values] of Object.entries(source || {})) {
      result[key] = uniqueCatalogFilterValues([...(result[key] || []), ...(values || [])])
    }
  }

  return result
}

export function catalogFiltersToApiQuery(filters: CatalogFilterValues): Record<string, string> {
  const query: Record<string, string> = {}

  for (const [key, values] of Object.entries(normalizeCatalogFilters(filters))) {
    if (values.length) query[key] = values.join(',')
  }

  return query
}

export type CatalogPrimarySeoSelection = {
  key: CatalogSeoFilterKey
  value: string
}

// В каталоге индексируем только ОДИН SEO-сегмент после /catalog.
// Приоритет: «Направления» → «Помогает при». Если одновременно выбраны
// несколько SEO-фильтров, только первый становится ЧПУ, остальные остаются query.
// Это гарантирует максимальную глубину: /catalog/<slug>.
export function getCatalogPrimarySeoSelection(
  filters: CatalogFilterValues,
): CatalogPrimarySeoSelection | null {
  const normalized = normalizeCatalogFilters(filters)

  for (const key of CATALOG_SEO_FILTER_KEYS) {
    const selected = new Set(normalized[key] || [])

    for (const value of CATALOG_SEO_FILTER_VALUES[key]) {
      if (selected.has(value)) return { key, value }
    }
  }

  return null
}

export function buildCatalogSeoPath(filters: CatalogFilterValues): string {
  const primary = getCatalogPrimarySeoSelection(filters)
  return primary ? `/catalog/${encodeURIComponent(primary.value)}` : '/catalog'
}

export function buildCatalogFilterLocation(filters: CatalogFilterValues): {
  path: string
  query: Record<string, string>
} {
  const normalized = normalizeCatalogFilters(filters)
  const primary = getCatalogPrimarySeoSelection(normalized)
  const query: Record<string, string> = {}

  for (const [key, values] of Object.entries(normalized)) {
    const queryValues = primary && key === primary.key
      ? values.filter((value) => value !== primary.value)
      : values

    if (queryValues.length) query[key] = queryValues.join(',')
  }

  return {
    path: primary ? `/catalog/${encodeURIComponent(primary.value)}` : '/catalog',
    query,
  }
}

// Любая комбинация поверх одного SEO-сегмента остаётся параметрами и noindex.
// Canonical всегда указывает максимум на /catalog/<один-seo-slug>.
export function buildCatalogCanonicalPath(filters: CatalogFilterValues): string {
  return buildCatalogSeoPath(filters)
}

export function stableCatalogFiltersKey(filters: CatalogFilterValues) {
  const normalized = normalizeCatalogFilters(filters)
  const sorted = Object.keys(normalized)
    .sort()
    .reduce((acc, key) => {
      acc[key] = [...normalized[key]].sort()
      return acc
    }, {} as CatalogFilterValues)

  return JSON.stringify(sorted)
}

export function catalogFiltersAreEqual(a: CatalogFilterValues, b: CatalogFilterValues) {
  return stableCatalogFiltersKey(a) === stableCatalogFiltersKey(b)
}

export function getCatalogTrackingQuery(query: Record<string, unknown>) {
  const result: Record<string, string | string[]> = {}

  for (const [key, raw] of Object.entries(query || {})) {
    if (!TRACKING_QUERY_KEYS.has(key) && !key.startsWith('utm_')) continue
    if (raw == null) continue

    if (Array.isArray(raw)) {
      const values = raw.map(String).filter(Boolean)
      if (values.length) result[key] = values
    } else {
      const value = String(raw)
      if (value) result[key] = value
    }
  }

  return result
}

// Backward-compatible exports for the older CatalogListingPage component.
// New catalog pages use the SEO path helpers above.
export function parseCatalogFilterSegments(rawSegments: unknown, allowedSlugs?: Set<string>) {
  return parseLegacyCatalogFilterSegments(rawSegments, allowedSlugs)
}

export function filterPathIsCatalogFilter(path: string) {
  return path === '/catalog/filter' || path.startsWith('/catalog/filter/')
}

export function buildCatalogFilterPath(filters: CatalogFilterValues, _filterOrder: string[] = []) {
  return buildCatalogFilterLocation(filters).path
}
