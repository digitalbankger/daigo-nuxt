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
  if (!q) return { suggestions: [] }

  const { dadataToken } = useRuntimeConfig()

  const res = await $fetch<DadataResponse>(
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${dadataToken}`,
      },
      body: {
        query: q,
        // Ограничим только города/населённые пункты:
        from_bound: { value: 'city' },
        to_bound: { value: 'settlement' },
        // Можно добавлять locations для РФ:
        // locations: [{ country_iso_code: 'RU' }]
        restrict_value: true
      }
    }
  )

  return {
    suggestions: res.suggestions.map(s => ({
      value: s.value,
      data: {
        city_fias_id: s.data.city_fias_id || s.data.settlement_fias_id,
        city_kladr_id: s.data.city_kladr_id || s.data.settlement_kladr_id,
        city: s.data.city || s.data.settlement || s.data.region_with_type,
        region: s.data.region_with_type,
      }
    }))
  }
})
