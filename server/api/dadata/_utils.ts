import { ofetch } from 'ofetch'

export interface DaDataSuggestion<T> { value: string; unrestricted_value: string; data: T }
export interface DaDataResponse<T> { suggestions: Array<DaDataSuggestion<T>> }

const { dadataToken } = useRuntimeConfig()

export function dadataFetch<T = unknown>(path: string, body: any, token: string) {
  return ofetch<DaDataResponse<T>>(`https://suggestions.dadata.ru/suggestions/api/4_1/rs/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${dadataToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body
  })
}

export function simplify<T extends Record<string, any>>(resp: DaDataResponse<T>) {
  return resp.suggestions.map(s => ({
    value: s.value,                                // строка для отображения (короткая)
    full: s.unrestricted_value,                    // полная строка
    fias_id: s.data.fias_id ?? s.data.city_fias_id ?? s.data.settlement_fias_id ?? null,
    kladr_id: s.data.kladr_id ?? null,
    region: s.data.region ?? s.data.region_with_type ?? null,
    city: s.data.city ?? s.data.settlement ?? s.data.area ?? null,
    city_with_type: s.data.city_with_type ?? s.data.settlement_with_type ?? null,
    geo_lat: s.data.geo_lat ? Number(s.data.geo_lat) : null,
    geo_lon: s.data.geo_lon ? Number(s.data.geo_lon) : null,
    postal_code: s.data.postal_code ?? null,
    // для адресов:
    street: s.data.street ?? null,
    house: s.data.house ?? null,
    block: s.data.block ?? null,
    flat: s.data.flat ?? null
  }))
}
