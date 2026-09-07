import { createError, getQuery, type H3Event } from 'h3'
import type { ArticleListItem } from '~/types/articles'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

const DEFAULT_PAGE_SIZE = 15
const ARTICLES_PATH = '/v1/shop/articles'

type QueryValue = string | string[] | number | null | undefined

type ExtractedItems = {
  items: any[]
  recognized: boolean
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toIsoDate(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  // Go обычно отдаёт RFC3339. Для уже нормализованной YYYY-MM-DD
  // не создаём Date лишний раз и не зависим от timezone.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function normalizeProperties(value: unknown): Record<string, string | string[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item != null)
      .map(([key, item]) => {
        if (Array.isArray(item)) return [key, item.map(value => String(value))]
        return [key, String(item)]
      }),
  )
}

export function mapGoArticleListItem(item: any): ArticleListItem {
  const image = normalizeMediaUrl(
    item?.image_url ??
    item?.cover_url ??
    item?.image ??
    item?.cover ??
    '',
  )

  return {
    id: toFiniteNumber(item?.id),
    slug: String(item?.slug ?? ''),
    title: String(item?.title ?? ''),
    preview: String(
      item?.meta_description ??
      item?.preview ??
      item?.description ??
      '',
    ),
    image,
    date: toIsoDate(item?.published_at ?? item?.date ?? item?.created_at),
    time: toFiniteNumber(item?.reading_time_minutes ?? item?.time),
    views: toFiniteNumber(item?.view_count ?? item?.views),
    comments: toFiniteNumber(item?.comments_count ?? item?.comments),
    properties: normalizeProperties(item?.properties),
  }
}

function extractItems(raw: any): ExtractedItems {
  if (Array.isArray(raw)) return { items: raw, recognized: true }

  const candidates = [
    raw?.items,
    raw?.articles,
    raw?.results,
    raw?.data,
    raw?.data?.items,
    raw?.data?.articles,
    raw?.data?.results,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return { items: candidate, recognized: true }
  }

  return { items: [], recognized: false }
}

function appendQuery(url: URL, query: Record<string, QueryValue>) {
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') continue

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== '') url.searchParams.append(key, String(item))
      }
      continue
    }

    url.searchParams.set(key, String(value))
  }
}

export async function fetchArticlesFromGo(event: H3Event) {
  const config = useRuntimeConfig(event)
  const base = String(config.public?.daigoApiBase || '').trim().replace(/\/+$/, '')

  if (!base) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing runtimeConfig.public.daigoApiBase',
    })
  }

  const query = getQuery(event) as Record<string, QueryValue>
  const url = new URL(ARTICLES_PATH, `${base}/`)
  appendQuery(url, query)

  // Стор и Pagination рассчитаны на 15 статей на страницу. Если фронт
  // явно не передал размер страницы — фиксируем его для Go API.
  if (!url.searchParams.has('page_size') && !url.searchParams.has('per_page')) {
    url.searchParams.set('page_size', String(DEFAULT_PAGE_SIZE))
  }

  const response = await $fetch.raw<any>(url.toString(), {
    headers: { accept: 'application/json' },
    timeout: 10_000,
    retry: 0,
  })
  const raw = response._data

  const extracted = extractItems(raw)
  if (!extracted.recognized) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unexpected articles response from Go API',
    })
  }

  const items = extracted.items
    .map(mapGoArticleListItem)
    .filter(article => article.slug && article.title)

  const headerTotal = toFiniteNumber(response.headers.get('x-total-count'), 0)
  const total = toFiniteNumber(
    raw?.total ??
    raw?.count ??
    raw?.meta?.total ??
    raw?.data?.total ??
    raw?.data?.count ??
    raw?.data?.meta?.total ??
    (headerTotal > 0 ? headerTotal : undefined),
    items.length,
  )

  return {
    items,
    total,
    page: toFiniteNumber(query.page ?? raw?.page ?? raw?.meta?.current_page, 1),
    perPage: toFiniteNumber(
      query.page_size ??
      query.per_page ??
      raw?.page_size ??
      raw?.per_page ??
      raw?.meta?.per_page,
      DEFAULT_PAGE_SIZE,
    ),
  }
}
