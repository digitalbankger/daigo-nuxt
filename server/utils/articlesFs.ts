import { normalizeMediaUrl } from '~/utils/mediaUrl'

const CACHE_TTL = 60_000
let cacheList: { ts: number; items: AnyJson[] } | null = null

export type AnyJson = Record<string, any>

function articleStorage() {
  return useStorage('assets:articles')
}

function parseArticle(value: unknown): AnyJson | null {
  if (!value) return null

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' ? parsed as AnyJson : null
    } catch {
      return null
    }
  }

  return typeof value === 'object' ? value as AnyJson : null
}

function normalizeArticleMedia(value: any): any {
  if (typeof value === 'string') return normalizeMediaUrl(value)
  if (Array.isArray(value)) return value.map(normalizeArticleMedia)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeArticleMedia(item)]),
    )
  }
  return value
}

export async function readArticle(slug: string): Promise<AnyJson | null> {
  try {
    const raw = await articleStorage().getItem<AnyJson | string>(`${slug}.json`)
    const data = parseArticle(raw)
    if (!data) return null

    // страховка: если в json нет slug – добавим из имени файла
    if (!data.slug) data.slug = slug
    return normalizeArticleMedia(data)
  } catch {
    return null
  }
}

export async function listSlugs(): Promise<string[]> {
  try {
    const keys = await articleStorage().getKeys()
    return keys
      .filter(key => key.endsWith('.json'))
      .map(key => key.replace(/\.json$/, ''))
  } catch {
    return []
  }
}

export async function listArticlesLite(): Promise<AnyJson[]> {
  if (cacheList && Date.now() - cacheList.ts < CACHE_TTL) return cacheList.items

  const slugs = await listSlugs()
  const items: AnyJson[] = []
  // читаем только «лайт»-поля, чтобы не тащить гигантский HTML
  await Promise.all(slugs.map(async (slug) => {
    const a = await readArticle(slug)
    if (!a) return
    items.push({
      id: a.id, slug: a.slug ?? slug, title: a.title, preview: a.preview,
      image: a.image ?? a.cover, date: a.date, time: a.time, views: a.views ?? 0,
      comments: a.comments ?? 0, properties: a.properties ?? {}
    })
  }))

  // отсортируем по дате убыв.
  items.sort((x, y) => String(y.date).localeCompare(String(x.date)))

  cacheList = { ts: Date.now(), items }
  return items
}
