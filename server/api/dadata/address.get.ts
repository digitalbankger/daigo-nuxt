import type { H3Event } from 'h3'

interface DadataSuggestion<T = any> {
  value: string
  unrestricted_value: string
  data: T
}
interface DadataResponse<T = any> {
  suggestions: DadataSuggestion<T>[]
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim()
  // Можно передавать fias_id города, чтобы жёстко ограничить поиск
  const fias = String(query.fias || '').trim()

  if (!q) return { suggestions: [] }

  const { dadataToken } = useRuntimeConfig()

  const body: any = {
    query: q,
    from_bound: { value: 'street' },
    to_bound: { value: 'house' },
    restrict_value: false
  }

  if (fias) {
    body.locations = [{ city_fias_id: fias }]
  }

  const res = await $fetch<DadataResponse>(
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${dadataToken}`,
      },
      body
    }
  )

  return {
    suggestions: res.suggestions.map(s => ({
      value: s.value, // улица и дом
      data: {
        street: s.data.street,
        house: s.data.house,
        block: s.data.block,
        geo_lat: s.data.geo_lat,
        geo_lon: s.data.geo_lon,
        postal_code: s.data.postal_code,
      }
    }))
  }
})
