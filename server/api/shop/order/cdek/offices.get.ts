import { createError, defineEventHandler, getQuery } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const cityCode = Number(getQuery(event).city_code)

  if (!Number.isFinite(cityCode) || cityCode <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'city_code is required' })
  }

  try {
    return await ofetch(`${base}/v1/shop/order/cdek/offices`, {
      query: { city_code: cityCode },
      retry: 0,
      timeout: 20000,
    })
  } catch (error: any) {
    const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)
    const message = error?.data?.message || error?.data?.error || error?.response?._data?.message || error?.response?._data?.error || error?.statusMessage || 'Не удалось загрузить ПВЗ СДЭК'
    throw createError({ statusCode, statusMessage: String(message), data: error?.data || error?.response?._data })
  }
})
