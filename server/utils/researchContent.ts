import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ArticleDetail } from '~/types/articles'
import type { ResearchItem } from '~/types/research'

type CategorySlug = 'metabiotiki' | 'plazmogeny'

let _all: ArticleDetail[] | null = null

function getContentDir(): string {
  // В dev обычно cwd = корень проекта.
  // В prod иногда cwd может быть внутри .output — держим fallback на уровень выше.
  const a = join(process.cwd(), 'content', 'researches-json')
  if (existsSync(a)) return a
  const b = join(process.cwd(), '..', 'content', 'researches-json')
  if (existsSync(b)) return b
  return a
}

function safeJsonParse<T>(raw: string, filename: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(`[researchContent] Failed to parse ${filename}:`, e)
    return null
  }
}

function loadAll(): ArticleDetail[] {
  if (_all) return _all

  const dir = getContentDir()
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))

  const items: ArticleDetail[] = []
  for (const file of files) {
    const raw = readFileSync(join(dir, file), 'utf-8')
    const parsed = safeJsonParse<ArticleDetail>(raw, file)
    if (parsed?.slug) items.push(parsed)
  }

  // сортировка: новые сверху (по дате), затем по id
  items.sort((a, b) => {
    const da = Date.parse(a.date || '') || 0
    const db = Date.parse(b.date || '') || 0
    if (db !== da) return db - da
    return (b.id || 0) - (a.id || 0)
  })

  _all = items
  return items
}

function toText(d: ArticleDetail): string {
  return `${d.title || ''} ${d.preview || ''} ${d.description || ''}`.toLowerCase()
}

export function detectCategory(d: ArticleDetail): CategorySlug {
  const direct = String((d as any)?.category || '').toLowerCase()
  if (direct === 'metabiotiki' || direct === 'plazmogeny') return direct as CategorySlug

  const s = toText(d)
  const tags = (d.tags || []).map(t => String(t.slug || '').toLowerCase())

  if (
    tags.includes('tamotsu') ||
    s.includes('плазмалог') ||
    s.includes('plasmalogen') ||
    s.includes('plazmalogen') ||
    s.includes('тамоцу')
  ) return 'plazmogeny'

  return 'metabiotiki'
}


export function getResearchDetailBySlug(slug: string): ArticleDetail | null {
  const all = loadAll()
  return all.find(i => i.slug === slug) || null
}

export function getResearchItemsByCategory(category: CategorySlug): ResearchItem[] {
  const all = loadAll()
    .filter(d => detectCategory(d) === category)

  // featured: топ-3 по просмотрам (если нет просмотров — по свежести)
  const byViews = [...all].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
  const featuredSlugs = new Set(byViews.slice(0, 3).map(i => i.slug))

  return all.map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    image: d.image,
    date: d.date,
    category,
    isFeatured: featuredSlugs.has(d.slug),
  }))
}

export function getPopularItemsByCategory(category: CategorySlug, limit = 6): ResearchItem[] {
  const all = loadAll()
    .filter(d => detectCategory(d) === category)
    .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))

  return all.slice(0, limit).map((d) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    image: d.image,
    date: d.date,
    category,
  }))
}

export function getCategoryCounts(): Record<CategorySlug, number> {
  const all = loadAll()
  const counts: Record<CategorySlug, number> = { metabiotiki: 0, plazmogeny: 0 }
  for (const d of all) counts[detectCategory(d)]++
  return counts
}
