import { normalizeMediaUrl } from '~/utils/mediaUrl'

export default defineEventHandler(async (event) => {
  const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
  const url = `${base}/v1/shop/content/stories`

  const raw = await $fetch<any[]>(url).catch(() => [])

  // Нормализуем под список «кружков»: id + thumbnail.
  // Если thumbnail пришёл с FirstVDS S3, отдаём его через /media-s3/.
  return (raw || []).map(s => ({
    id: s.id,
    thumbnail: normalizeMediaUrl(s.thumbnail ?? s.thumbnail_url ?? ''),
    title: s.title ?? '',
  }))
})
