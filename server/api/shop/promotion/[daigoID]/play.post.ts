import { createError, defineEventHandler, getHeader, getRouterParam, readBody } from 'h3'
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
    'Не удалось сохранить результат игры'
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
  const daigoID = getRouterParam(event, 'daigoID')
  const base = normalizeBase(useRuntimeConfig(event).public.daigoApiBase)
  const authorization = getHeader(event, 'authorization')
  const body = await readBody<{ phone_number?: number | string; filling?: number }>(event)

  if (!authorization) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization is required' })
  }

  if (!daigoID) {
    throw createError({ statusCode: 400, statusMessage: 'daigoID is required' })
  }

  const phoneNumber = String(body?.phone_number || '').replace(/\D/g, '')
  const filling = Number(body?.filling ?? 0)

  if (phoneNumber.length < 11) {
    throw createError({ statusCode: 400, statusMessage: 'phone_number is required' })
  }

  try {
    return await ofetch(`${base}/v1/shop/promotion/${encodeURIComponent(String(daigoID))}/play`, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: {
        phone_number: Number(phoneNumber),
        filling: Math.max(0, Math.min(15, Math.round(filling))),
      },
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    throwUpstreamError(error)
  }
})
