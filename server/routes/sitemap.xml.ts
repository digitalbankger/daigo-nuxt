import { defineEventHandler, setResponseHeader } from 'h3'
import { $fetch } from 'ofetch'
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'

type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?: Changefreq
  priority?: number
}

type ProductLike = {
  slug?: string
  price?: number | string
  properties?: Record<string, unknown>
  updated_at?: string
  updatedAt?: string
}

type FilterGroup = {
  label: string
  slug: string
  options: Array<{ label: string; value: string }>
}

const SITE_URL = 'https://daigo.ru'
const PRODUCT_PAGE_SIZE = 9999

const STATIC_ROUTES: SitemapEntry[] = [
  { loc: '/', changefreq: 'daily', priority: 1 },
  { loc: '/catalog', changefreq: 'daily', priority: 0.95 },
  { loc: '/articles', changefreq: 'weekly', priority: 0.85 },
  { loc: '/researches', changefreq: 'weekly', priority: 0.8 },
  { loc: '/about', changefreq: 'monthly', priority: 0.75 },
  { loc: '/akcii', changefreq: 'weekly', priority: 0.8 },
  { loc: '/aminobiotics', changefreq: 'monthly', priority: 0.7 },
  { loc: '/plasmalogens', changefreq: 'monthly', priority: 0.7 },
  { loc: '/quality-and-safety', changefreq: 'monthly', priority: 0.75 },
  { loc: '/certificates', changefreq: 'monthly', priority: 0.7 },
  { loc: '/otzyvy', changefreq: 'weekly', priority: 0.75 },
  { loc: '/otzyvy/type/daigo-video', changefreq: 'weekly', priority: 0.68 },
  { loc: '/otzyvy/type/daigo-audio', changefreq: 'weekly', priority: 0.65 },
  { loc: '/otzyvy/type/daigo-text', changefreq: 'weekly', priority: 0.65 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.7 },
  { loc: '/dostavka', changefreq: 'monthly', priority: 0.7 },
  { loc: '/oplata', changefreq: 'monthly', priority: 0.7 },
  { loc: '/contacts', changefreq: 'monthly', priority: 0.65 },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.35 },
  { loc: '/user-agreement', changefreq: 'yearly', priority: 0.35 },
  { loc: '/terms-sale', changefreq: 'yearly', priority: 0.35 },
  { loc: '/usloviya-dostavki', changefreq: 'yearly', priority: 0.35 },
  { loc: '/usloviya-vozvrata-i-obmena', changefreq: 'yearly', priority: 0.35 },
  { loc: '/soglasie-na-obrabotku-personalnykh-dannykh', changefreq: 'yearly', priority: 0.3 },
  { loc: '/soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok', changefreq: 'yearly', priority: 0.3 },
]

const STATIC_ARTICLE_ROUTES: SitemapEntry[] = [
  {
    loc: '/articles/kak-mikroflora-sozdaet-garmoniyu-v-otnosheniyah-i-pochemu-ey-nuzhna-zabota',
    changefreq: 'monthly',
    priority: 0.72,
  },
]

const RESEARCH_CATEGORIES = ['metabiotiki', 'plazmogeny']

/**
 * Не включаем `produkty`, потому что такие страницы дублируют карточки товара.
 * Не включаем `sostav`, потому что это может дать много тонких низкочастотных страниц.
 * Оставляем только фильтры, которые выглядят как SEO-посадочные страницы каталога.
 */
const INDEXABLE_CATALOG_FILTERS = new Set([
  'napravlennost',
  'pomogaet-pri',
  'klass-produkta',
  'podarochnye',
])

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeBaseUrl(value?: string) {
  return String(value || SITE_URL).replace(/\/+$/, '')
}

function normalizePath(value: string) {
  if (!value) return '/'
  if (/^https?:\/\//i.test(value)) return value

  const [pathname, query = ''] = value.split('?', 2)
  const cleanPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`
  return query ? `${cleanPath}?${query}` : cleanPath
}

function toAbsoluteUrl(baseUrl: string, loc: string) {
  const normalized = normalizePath(loc)
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${baseUrl}${normalized}`
}

function addEntry(target: Map<string, SitemapEntry>, entry: SitemapEntry) {
  const loc = normalizePath(entry.loc)
  target.set(loc, { ...entry, loc })
}

function toIsoDate(value?: string) {
  if (!value) return undefined
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return undefined
  return new Date(time).toISOString()
}

function extractArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.products)) return raw.products
  if (Array.isArray(raw?.items)) return raw.items
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw?.results)) return raw.results
  return []
}

function productIsIndexable(product: ProductLike) {
  if (!product?.slug) return false
  if (product.price == null || product.price === '') return true
  return Number(product.price) > 0
}

function getPropValues(product: ProductLike, key: string): string[] {
  const raw = product.properties?.[key]
  if (raw == null) return []
  if (Array.isArray(raw)) return raw.map(String).map(v => v.trim()).filter(Boolean)

  return String(raw)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
}

function getContentDir(...parts: string[]) {
  return [
    resolve(process.cwd(), ...parts),
    resolve(process.cwd(), '..', ...parts),
    resolve(process.cwd(), '..', '..', ...parts),
  ]
}

async function readJsonFilesFromDirs<T = any>(dirs: string[]): Promise<T[]> {
  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir)
      const jsonFiles = files.filter(file => file.endsWith('.json'))
      const result: T[] = []

      await Promise.all(jsonFiles.map(async (file) => {
        try {
          const raw = await fs.readFile(join(dir, file), 'utf8')
          const parsed = JSON.parse(raw)
          if (!parsed.slug) parsed.slug = file.replace(/\.json$/, '')
          result.push(parsed)
        } catch (error) {
          console.warn(`[sitemap] Failed to read JSON file ${join(dir, file)}:`, error)
        }
      }))

      return result
    } catch {}
  }

  return []
}

async function fetchProducts(apiBase: string): Promise<ProductLike[]> {
  try {
    const raw = await $fetch<any>(`${apiBase}/v1/shop/products`, {
      query: {
        page: 1,
        page_size: PRODUCT_PAGE_SIZE,
      },
      timeout: 12_000,
    })

    return extractArray(raw)
      .map((p: any) => ({
        slug: String(p.slug || '').trim(),
        price: p.price,
        properties: p.properties || {},
        updated_at: p.updated_at,
        updatedAt: p.updatedAt,
      }))
      .filter(productIsIndexable)
  } catch (error) {
    console.warn('[sitemap] Product list fetch failed:', error)
    return []
  }
}

async function fetchFilters(apiBase: string): Promise<FilterGroup[]> {
  try {
    const raw = await $fetch<any>(`${apiBase}/v1/shop/filters`, { timeout: 8_000 })
    if (!Array.isArray(raw)) return []

    return raw
      .filter((group: any) => group?.slug && Array.isArray(group.options))
      .map((group: any) => ({
        label: String(group.label || group.slug),
        slug: String(group.slug),
        options: group.options
          .map((option: any) => ({
            label: String(option?.label || option?.value || ''),
            value: String(option?.value || '').trim(),
          }))
          .filter((option: { value: string }) => option.value),
      }))
  } catch (error) {
    console.warn('[sitemap] Filter list fetch failed:', error)
    return []
  }
}

function addCatalogPagination(target: Map<string, SitemapEntry>, path: string, totalItems: number, priority: number) {
  if (totalItems <= 0) return

  addEntry(target, {
    loc: path,
    changefreq: 'daily',
    priority,
  })
}

function getCatalogFilterGroups(filters: FilterGroup[], products: ProductLike[]): FilterGroup[] {
  const groupsBySlug = new Map<string, FilterGroup>()

  for (const group of filters) {
    if (!INDEXABLE_CATALOG_FILTERS.has(group.slug)) continue
    groupsBySlug.set(group.slug, group)
  }

  // Fallback: если backend не отдаёт /v1/shop/filters, строим варианты фильтров из properties товаров.
  for (const slug of INDEXABLE_CATALOG_FILTERS) {
    if (groupsBySlug.has(slug)) continue

    const values = new Set<string>()
    for (const product of products) {
      for (const value of getPropValues(product, slug)) values.add(value)
    }

    if (values.size) {
      groupsBySlug.set(slug, {
        label: slug,
        slug,
        options: [...values].sort().map(value => ({ label: value, value })),
      })
    }
  }

  return [...groupsBySlug.values()]
}

function addCatalogUrls(target: Map<string, SitemapEntry>, products: ProductLike[], filters: FilterGroup[]) {
  addCatalogPagination(target, '/catalog', products.length, 0.95)

  const groups = getCatalogFilterGroups(filters, products)

  for (const group of groups) {
    if (!INDEXABLE_CATALOG_FILTERS.has(group.slug)) continue

    for (const option of group.options) {
      const value = String(option.value || '').trim()
      if (!value) continue

      const count = products.filter(product => getPropValues(product, group.slug).includes(value)).length
      if (count <= 0) continue

      const params = new URLSearchParams({ [group.slug]: value })
      addCatalogPagination(target, `/catalog?${params.toString()}`, count, 0.72)
    }
  }
}

async function addArticleUrls(target: Map<string, SitemapEntry>) {
  const articles = await readJsonFilesFromDirs<any>(getContentDir('content', 'articles-json'))

  for (const article of articles) {
    if (!article?.slug) continue

    addEntry(target, {
      loc: `/articles/${article.slug}`,
      lastmod: toIsoDate(article.updated_at || article.updatedAt || article.date),
      changefreq: 'monthly',
      priority: 0.72,
    })
  }

  for (const article of STATIC_ARTICLE_ROUTES) {
    addEntry(target, article)
  }
}

async function addResearchUrls(target: Map<string, SitemapEntry>) {
  for (const slug of RESEARCH_CATEGORIES) {
    addEntry(target, {
      loc: `/researches/${slug}`,
      changefreq: 'monthly',
      priority: 0.7,
    })
  }

  const researches = await readJsonFilesFromDirs<any>(getContentDir('content', 'researches-json'))

  for (const item of researches) {
    if (!item?.slug) continue

    addEntry(target, {
      loc: `/researches/item/${item.slug}`,
      lastmod: toIsoDate(item.updated_at || item.updatedAt || item.date),
      changefreq: 'monthly',
      priority: 0.68,
    })
  }
}

function buildXml(baseUrl: string, entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const loc = xmlEscape(toAbsoluteUrl(baseUrl, entry.loc))
      const lastmod = entry.lastmod ? `\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : ''
      const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''
      const priority = typeof entry.priority === 'number' ? `\n    <priority>${entry.priority.toFixed(2)}</priority>` : ''

      return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const baseUrl = normalizeBaseUrl(config.public?.siteUrl || config.public?.appUrl || SITE_URL)
  const apiBase = normalizeBaseUrl(config.public?.daigoApiBase || 'https://api.daigo.ru')

  const entries = new Map<string, SitemapEntry>()

  for (const route of STATIC_ROUTES) {
    addEntry(entries, route)
  }

  const [products, filters] = await Promise.all([
    fetchProducts(apiBase),
    fetchFilters(apiBase),
  ])

  for (const product of products) {
    if (!product.slug) continue

    addEntry(entries, {
      loc: `/catalog/${product.slug}`,
      lastmod: toIsoDate(product.updated_at || product.updatedAt),
      changefreq: 'weekly',
      priority: 0.9,
    })
  }

  addCatalogUrls(entries, products, filters)

  await Promise.all([
    addArticleUrls(entries),
    addResearchUrls(entries),
  ])

  const sortedEntries = [...entries.values()].sort((a, b) => a.loc.localeCompare(b.loc, 'ru'))
  const sitemap = buildXml(baseUrl, sortedEntries)

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=UTF-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=900, s-maxage=3600, stale-while-revalidate=86400')

  return sitemap
})
