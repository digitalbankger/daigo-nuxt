import { defineEventHandler, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'
import { getEvolutionUpstreamSlug } from '~/constants/evolution'

function toArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : []
}

function toStringSafe(value: any, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function normalizeMedia(item: any, baseId: string) {
  const media: Array<{ id: string; type: 'image' | 'video'; thumb: string; src?: string }> = []

  const photos = [
    ...toArray<string>(item?.photo_urls),
    ...toArray<string>(item?.photos),
    ...toArray<string>(item?.images),
  ].filter(Boolean)

  photos.forEach((url, index) => {
    media.push({
      id: `${baseId}-img-${index}`,
      type: 'image',
      thumb: String(url),
      src: String(url),
    })
  })

  const videoUrl = item?.video_url || item?.videoUrl || item?.video?.url || ''
  if (videoUrl) {
    const videoThumb = item?.video_thumb || item?.videoThumb || photos[0] || String(videoUrl)
    media.unshift({
      id: `${baseId}-video`,
      type: 'video',
      thumb: String(videoThumb),
      src: String(videoUrl),
    })
  }

  return media.length ? media : undefined
}

function normalizeItem(item: any, index: number) {
  const id = toStringSafe(item?.id || item?.review_id || item?.uuid || `review-${index}`)
  const text =
    item?.text ||
    item?.review_text ||
    item?.feedback_preview ||
    item?.preview ||
    item?.description ||
    ''

  if (!text) return null

  return {
    id,
    author: toStringSafe(item?.author || item?.author_name || item?.name, 'Не указано'),
    rating: Number(item?.rating ?? item?.stars ?? item?.score ?? 5) || 5,
    date: item?.date || item?.created_at || item?.published_at || undefined,
    title: item?.title || item?.headline || undefined,
    text: String(text),
    source: item?.source || undefined,
    verified: Boolean(item?.verified ?? item?.is_verified),
    tags: Array.isArray(item?.tags) ? item.tags.filter(Boolean).map((tag: any) => String(tag)) : undefined,
    media: normalizeMedia(item, id),
    i18n: item?.i18n || undefined,
  }
}

function normalizePayload(raw: any) {
  const root = raw?.reviews || raw?.data || raw || {}
  const itemsSource =
    toArray(root?.items).length ? root.items :
    toArray(root?.reviews).length ? root.reviews :
    toArray(root?.results).length ? root.results :
    (Array.isArray(root) ? root : [])

  const items = itemsSource
    .map((item: any, index: number) => normalizeItem(item, index))
    .filter(Boolean)

  const ratingAvgRaw = root?.ratingAvg ?? root?.rating_avg ?? root?.average_rating
  const countRaw = root?.count ?? root?.total ?? root?.total_count

  return {
    ratingAvg: Number.isFinite(Number(ratingAvgRaw)) ? Number(ratingAvgRaw) : undefined,
    count: Number.isFinite(Number(countRaw)) ? Number(countRaw) : items.length,
    source: root?.source || root?.source_name || undefined,
    items,
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')

  if (!slug) {
    return { items: [] }
  }

  try {
    // @ts-ignore
    event.node.res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')

    const upstreamSlug = getEvolutionUpstreamSlug(slug)
    const response = await ofetch(`${base}/v1/shop/reviews/${encodeURIComponent(upstreamSlug)}`, {
      retry: 1,
      timeout: 10000,
    })

    return normalizePayload(response)
  } catch {
    return { items: [] }
  }
})
