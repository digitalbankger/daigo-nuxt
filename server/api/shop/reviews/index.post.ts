import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const authorization = getHeader(event, 'authorization')

  if (!authorization) throw createError({ statusCode: 401, statusMessage: 'Authorization is required' })

  const body = await readBody<any>(event)
  if (!body?.daigo_id) throw createError({ statusCode: 400, statusMessage: 'daigo_id is required' })
  if (!body?.author || !body?.text || !body?.rating) throw createError({ statusCode: 400, statusMessage: 'Review fields are required' })

  try {
    return await ofetch(`${base}/v1/shop/reviews`, {
      method: 'POST',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body,
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)
    const message = error?.data?.message || error?.data?.error || error?.response?._data?.message || error?.response?._data?.error || error?.statusMessage || 'Не удалось отправить отзыв'
    throw createError({ statusCode, statusMessage: String(message), data: error?.data || error?.response?._data })
  }
})
