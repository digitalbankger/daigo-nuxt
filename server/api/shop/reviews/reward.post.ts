import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { ofetch } from 'ofetch'

function normalizeBase(value: unknown) {
  return String(value || 'https://api.daigo.ru').replace(/\/+$/, '')
}

function errorMessage(error: any) {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.response?._data?.message ||
    error?.response?._data?.error ||
    error?.statusMessage ||
    'Не удалось получить промокод за отзыв'
  )
}

function throwUpstreamError(error: any): never {
  const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)

  throw createError({
    statusCode,
    statusMessage: String(errorMessage(error)),
    data: error?.data || error?.response?._data,
  })
}

export default defineEventHandler(async (event) => {
  const base = normalizeBase(useRuntimeConfig(event).public.daigoApiBase)
  const authorization = getHeader(event, 'authorization')
  const body = await readBody<{ daigo_id?: number | string; has_video?: boolean }>(event)

  if (!authorization) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization is required' })
  }

  if (!body?.daigo_id) {
    throw createError({ statusCode: 400, statusMessage: 'daigo_id is required' })
  }

  try {
    return await ofetch(`${base}/v1/shop/reviews/reward`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: {
        daigo_id: Number(body.daigo_id),
        has_video: Boolean(body.has_video),
      },
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    throwUpstreamError(error)
  }
})
