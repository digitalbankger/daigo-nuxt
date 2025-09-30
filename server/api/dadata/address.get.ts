import { defineEventHandler, getQuery, createError } from 'h3'
import { dadataFetch, simplify } from './_utils'

export default defineEventHandler(async (event) => {
  const { q = '', fias = '', limit = '10' } = getQuery(event)
  const token = useRuntimeConfig(event).dadataToken
  if (!token) throw createError({ statusCode: 500, statusMessage: 'DaData token not configured' })
  if (!q) return []

  // Если знаем FIAS города — сузим выдачу
  const locations = fias
    ? [{ city_fias_id: String(fias) }, { settlement_fias_id: String(fias) }, { fias_id: String(fias) }]
    : undefined

  const body = {
    query: String(q),
    count: Math.min(Number(limit) || 10, 20),
    from_bound: { value: 'street' },   // начиная с улицы
    to_bound:   { value: 'house' },    // до дома
    restrict_value: false,
    locations
  }

  const resp = await dadataFetch<any>('suggest/address', body, token)
  return simplify(resp)
})
