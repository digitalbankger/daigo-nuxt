export type CatalogFilterValues = Record<string, string[]>

const FILTER_PATH_PREFIX = '/catalog/filter'
const IGNORED_QUERY_KEYS = new Set(['empty', 'page', 'page_size', 'limit'])
const TRACKING_QUERY_KEYS = new Set(['ysclid', 'yclid', 'gclid', 'fbclid'])

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

export function filterPathIsCatalogFilter(path: string) {
  return path === FILTER_PATH_PREFIX || path.startsWith(`${FILTER_PATH_PREFIX}/`)
}

export function parseCatalogFilterSegments(
  rawSegments: unknown,
  allowedSlugs?: Set<string>
): CatalogFilterValues {
  const segments = Array.isArray(rawSegments)
    ? rawSegments.map(String)
    : typeof rawSegments === 'string'
      ? rawSegments.split('/')
      : []

  const filters: CatalogFilterValues = {}

  for (let i = 0; i < segments.length; i += 2) {
    const key = decodeURIComponent(String(segments[i] || '').trim())
    if (!key || allowedSlugs && !allowedSlugs.has(key)) continue

    const rawValueSegment = segments[i + 1]
    if (!rawValueSegment) continue

    const values = uniqueCatalogFilterValues(
      String(rawValueSegment)
        .split(',')
        .map((value) => decodeURIComponent(value).trim())
        .filter(Boolean)
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
  allowedSlugs?: Set<string>
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

export function buildCatalogFilterPath(
  filters: CatalogFilterValues,
  filterOrder: string[] = []
) {
  const normalized = normalizeCatalogFilters(filters)
  const orderMap = new Map(filterOrder.map((key, index) => [key, index]))

  const keys = Object.keys(normalized).sort((a, b) => {
    const aOrder = orderMap.get(a) ?? Number.MAX_SAFE_INTEGER
    const bOrder = orderMap.get(b) ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.localeCompare(b)
  })

  if (!keys.length) return '/catalog'

  const segments = keys.flatMap((key) => [
    encodeURIComponent(key),
    normalized[key].map((value) => encodeURIComponent(value)).join(','),
  ])

  return `${FILTER_PATH_PREFIX}/${segments.join('/')}`
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
