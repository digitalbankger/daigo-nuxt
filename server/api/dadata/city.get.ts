import { defineEventHandler, getQuery, createError } from 'h3'
import { dadataFetch, simplify } from './_utils'

export default defineEventHandler(async (event) => {
  const { q = '', limit = '10' } = getQuery(event)
  const token = useRuntimeConfig(event).dadataToken
  if (!token) throw createError({ statusCode: 500, statusMessage: 'DaData token not configured' })
  if (!q) return []

  // Границы: от city до settlement — вернёт города/поселения
  const body = {
    query: String(q),
    count: Math.min(Number(limit) || 10, 20),
    from_bound: { value: 'city' },
    to_bound:   { value: 'settlement' },
    restrict_value: false
  }

  const resp = await dadataFetch<any>('suggest/address', body, token)
  return simplify(resp)
})
