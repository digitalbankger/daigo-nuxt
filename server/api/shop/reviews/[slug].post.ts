import { createError, defineEventHandler, getHeader, getRouterParam, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const authorization = getHeader(event, 'authorization')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Product slug is required' })
  }

  if (!authorization) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization is required' })
  }

  const body = await readBody<{
    author?: string
    rating?: number
    title?: string
    text?: string
    tags?: string[]
    media?: Array<{ type: 'image' | 'video'; thumb?: string; src?: string }>
    daigo_id?: number | string
  }>(event)

  if (!body?.daigo_id) {
    throw createError({ statusCode: 400, statusMessage: 'daigo_id is required' })
  }

  if (!body?.author || !body?.text || !body?.rating) {
    throw createError({ statusCode: 400, statusMessage: 'Review fields are required' })
  }

  try {
    return await ofetch(`${base}/v1/shop/reviews/${encodeURIComponent(String(slug))}`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body,
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)
    const message =
      error?.data?.message ||
      error?.data?.error ||
      error?.response?._data?.message ||
      error?.response?._data?.error ||
      error?.statusMessage ||
      'Не удалось отправить отзыв'

    throw createError({
      statusCode,
      statusMessage: String(message),
      data: error?.data || error?.response?._data,
    })
  }
})
