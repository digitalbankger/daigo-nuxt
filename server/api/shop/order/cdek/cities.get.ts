import { createError, defineEventHandler, getQuery } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const city = String(getQuery(event).city || '').trim()

  if (city.length < 2) return []

  try {
    return await ofetch(`${base}/v1/shop/order/cdek/cities`, {
      query: { city },
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)
    const message = error?.data?.message || error?.data?.error || error?.response?._data?.message || error?.response?._data?.error || error?.statusMessage || 'Не удалось загрузить города СДЭК'
    throw createError({ statusCode, statusMessage: String(message), data: error?.data || error?.response?._data })
  }
})
