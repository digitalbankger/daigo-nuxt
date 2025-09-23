// import { defineEventHandler, getQuery, setResponseHeader, createError, type H3Event } from 'h3'

// export type ArticleListItem = {
//   id: number
//   slug: string
//   title: string
//   preview: string
//   image: string
//   date: string         // YYYY-MM-DD
//   time: number         // минуты чтения
//   views: number
//   comments: number
//   properties?: Record<string, any> | null
// }

// type Paged<T> = {
//   items: T[]
//   total: number
//   page: number
//   perPage: number
// }

// const mapItem = (it: any): ArticleListItem => {
//   const d = it?.published_at ? new Date(it.published_at) : null
//   return {
//     id: Number(it?.id),
//     slug: String(it?.slug ?? ''),
//     title: String(it?.title ?? ''),
//     preview: String(it?.meta_description ?? ''), // из API → в твоё preview
//     image: String(
//       it?.image_url ??
//       it?.cover_url ??
//       '/images/placeholders/article.webp'       // временный плейсхолдер
//     ),
//     date: d ? d.toISOString().slice(0, 10) : '',
//     time: Number(it?.reading_time_minutes ?? 0),
//     views: Number(it?.view_count ?? 0),
//     comments: Number(it?.comments_count ?? 0),
//     properties: it?.properties ?? null
//   }
// }

// const handler = async (event: H3Event): Promise<Paged<ArticleListItem>> => {
//   const config = useRuntimeConfig(event)
//   const base = String(config.public.daigoApiBase || '')
//   if (!base) {
//     throw createError({ statusCode: 500, statusMessage: 'Missing runtimeConfig.public.daigoApiBase' })
//   }

//   const url = new URL('/v1/shop/content/articles/', base)

//   // Пробрасываем query как есть
//   const q = getQuery(event) as Record<string, string | string[] | number | null | undefined>
//   for (const [k, v] of Object.entries(q)) {
//     if (v == null) continue
//     if (Array.isArray(v)) {
//       for (const val of v) url.searchParams.append(k, String(val))
//     } else {
//       url.searchParams.set(k, String(v))
//     }
//   }

//   setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')

//   let raw: any
//   try {
//     raw = await $fetch(url.toString(), { headers: { accept: 'application/json' } })
//   } catch (e: any) {
//     console.error('[articles/index] Fetch error:', e?.statusCode, e?.statusMessage || e?.message)
//     throw createError({ statusCode: e?.statusCode || 502, statusMessage: 'Failed to fetch articles' })
//   }

//   // Логи для отладки
//   console.log('[articles/index] Request URL:', url.toString())
//   console.dir(raw, { depth: null })

//   // Учитываем формат { articles, total, page, page_size } + универсальные варианты
//   const rawItems =
//     raw?.items ??
//     raw?.articles ??
//     raw?.data ??
//     (Array.isArray(raw) ? raw : raw?.results ?? [])

//   const mapped = Array.isArray(rawItems) ? rawItems.map(mapItem) : []

//   const total =
//     Number(
//       raw?.total ??
//       raw?.count ??
//       raw?.meta?.total ??
//       mapped.length
//     )

//   const page = Number(q.page ?? raw?.page ?? raw?.meta?.current_page ?? 1)

//   const perPage = Number(
//     q.per_page ?? raw?.per_page ?? raw?.page_size ?? raw?.meta?.per_page ?? 10
//   )

//   return {
//     items: mapped,
//     total,
//     page,
//     perPage
//   }
// }

// export default defineEventHandler(handler)


import { defineEventHandler, getQuery } from 'h3'
import type { ArticleListItem, Paged } from '~/types/articles'

// моковые данные
const ALL: ArticleListItem[] = [
  {
    id: 3,
    slug: 'chto-takoe-metabiotiki',
    title: 'Что такое Метабиотики',
    preview: 'Метабиотики — будущее вашего здоровья: новая эпоха биотехнологий...',
    image: '/images/articles/first.jpg',
    date: '2025-08-05',
    time: 8,
    views: 200,
    comments: 10,
    properties: { napravlennost: 'kishechnik-i-immunitet' }
  },
  {
    id: 2,
    slug: 'po-polochkam-printsip-deystviya-daigo',
    title: '1. По полочкам: принцип действия Daigo',
    preview: 'Причины нарушения баланса микрофлоры...',
    image: 'https://products.s3.firstvds.ru/daigo-5/instructions.png',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 0,
    properties: { napravlennost: 'kishechnik-i-immunitet' }
  },
  {
    id: 1,
    slug: 'na-chto-vliyaet-mikroflora-kishechnika',
    title: '2. На что влияет микрофлора кишечника?',
    preview: 'Главные функции микрофлоры кишечника...',
    image: 'https://s3.firstvds.ru/articles/yhyqpieqe92gcppbxm8cfhwnu87vv79f.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 0,
    properties: { napravlennost: 'kishechnik-i-immunitet' }
  }, 
  {
    id: 4,
    slug: 'antibiotiki-i-mikroflora-kak-vosstanovit-kishechnik-posle-lecheniya',
    title: 'Антибиотики и микрофлора: как восстановить кишечник после лечения?',
    preview: 'Антибиотики — одно из величайших достижений медицины, спасшее миллионы жизней...',
    image: 'https://s3.firstvds.ru/articles/fmgwngk0nmpabku69hwvbfxl3n7bwifz.png',
    date: '2025-05-27',
    time: 5,
    views: 780,
    comments: 0,
    properties: { napravlennost: 'kishechnik-i-immunitet' }
  },
  
  
  
  
  
  
  
  
  // {
  //   id: 2,
  //   slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu',
  //   title: 'Как подготовить кожу к пляжному сезону?',
  //   preview: 'Красота изнутри: как подготовить кожу за пару недель?',
  //   image: '/images/articles/sec.jpg',
  //   date: '2025-06-24',
  //   time: 10,
  //   views: 150,
  //   comments: 4,
  //   properties: { napravlennost: 'kozha-i-volosy' }
  // },
  // {
  //   id: 3,
  //   slug: 'sindrom-puteshestvennika',
  //   title: 'Синдром путешественника',
  //   preview: 'Как перелеты и смена климата влияют на микробиом?',
  //   image: '/images/articles/th.jpg',
  //   date: '2025-05-31',
  //   time: 6,
  //   views: 180,
  //   comments: 2,
  //   properties: { napravlennost: 'mozg-i-nervnaya-sistema' }
  // }
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
