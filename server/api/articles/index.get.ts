import { defineEventHandler, getQuery } from 'h3'
import type { ArticleListItem, Paged } from '~/types/articles'

// моковые данные
const ALL: ArticleListItem[] = [
  {
    id: 1,
    slug: 'printsip-dejstviya-metabiotikov',
    title: 'Принцип действия метабиотиков',
    preview: 'Секреторные выделения лактобактерий активизируют действие родных лактобактерий кишечника...',
    image: '/images/articles/first.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 10,
    properties: { napravlennost: 'kishechnik-i-immunitet' }
  },
  {
    id: 2,
    slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu',
    title: 'Как подготовить кожу к пляжному сезону?',
    preview: 'Красота изнутри: как подготовить кожу за пару недель?',
    image: '/images/articles/sec.jpg',
    date: '2025-06-24',
    time: 10,
    views: 150,
    comments: 4,
    properties: { napravlennost: 'kozha-i-volosy' }
  },
  {
    id: 3,
    slug: 'sindrom-puteshestvennika',
    title: 'Синдром путешественника',
    preview: 'Как перелеты и смена климата влияют на микробиом?',
    image: '/images/articles/th.jpg',
    date: '2025-05-31',
    time: 6,
    views: 180,
    comments: 2,
    properties: { napravlennost: 'mozg-i-nervnaya-sistema' }
  }
]

// какие ключи из query считаем “фильтрами” (можно расширять по твоим группам фильтров)
const FILTER_KEYS = new Set([
  'napravlennost', 'pomogaet-pri', 'klass-produkta', 'produkty',
  'dlya-kogo', 'sostav', 'forma-vypuska', 'strana-proizvoditel'
])

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const perPage = 6

  // нормализуем: берём только разрешённые ключи фильтров, отбрасываем пустые значения
  const activeFilters = Object.entries(query).reduce<Record<string, string[]>>((acc, [key, raw]) => {
    if (key === 'page') return acc
    if (!FILTER_KEYS.has(key)) return acc // игнорируем все “левые” ключи
    const values = Array.isArray(raw)
      ? raw.flatMap(v => String(v).split(','))
      : String(raw || '').split(',')
    const cleaned = values.map(v => v.trim()).filter(Boolean)
    if (cleaned.length) acc[key] = cleaned
    return acc
  }, {})

  const hasFilters = Object.keys(activeFilters).length > 0

  const filtered = ALL.filter(article => {
    if (!hasFilters) return true // нет фильтров — показываем всё
    // каждый активный ключ должен матчиться хотя бы по одному значению
    return Object.entries(activeFilters).every(([key, values]) => {
      const articleValue = article.properties?.[key]
      return articleValue ? values.includes(articleValue) : false
    })
  })

  const total = filtered.length
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const payload: Paged<ArticleListItem> = { items: paginated, total }
  return payload
})
