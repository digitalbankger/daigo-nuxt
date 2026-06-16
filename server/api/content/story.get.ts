import { normalizeMediaUrl } from '~/utils/mediaUrl'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const id = String(q.id || '')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Story id is required' })

  const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
  const url  = `${base}/v1/shop/content/story/${encodeURIComponent(id)}`
  const raw: any = await $fetch(url).catch(() => null)
  if (!raw) throw createError({ statusCode: 404, statusMessage: 'Story not found' })

  // slides у бэка может быть объект/массив/строки – аккуратно нормализуем к string[]
  const slides: string[] = Array.isArray(raw.slides)
    ? raw.slides.map((s: any) => normalizeMediaUrl(typeof s === 'string' ? s : (s?.url ?? ''))).filter(Boolean)
    : (raw.slides?.url ? [normalizeMediaUrl(raw.slides.url)] : [])

  return {
    id: raw.id,
    title: raw.title ?? '',
    category: raw.category ?? '',
    thumbnail: normalizeMediaUrl(raw.thumbnail ?? raw.thumbnail_url ?? ''),
    slides,
    // продукты от бэка приходят как массив UUID'ов
    products: Array.isArray(raw.products) ? raw.products.map(String) : [],
  }
})
