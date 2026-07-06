import { createError, defineEventHandler, getHeader, readBody, readMultipartFormData } from 'h3'
import { ofetch } from 'ofetch'

function throwUpstreamError(error: any): never {
  const statusCode = Number(error?.response?.status || error?.statusCode || error?.status || 500)
  const message = error?.data?.message || error?.data?.error || error?.response?._data?.message || error?.response?._data?.error || error?.statusMessage || 'Не удалось отправить отзыв по заказу'
  throw createError({ statusCode, statusMessage: String(message), data: error?.data || error?.response?._data })
}

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const authorization = getHeader(event, 'authorization')
  const contentType = String(getHeader(event, 'content-type') || '').toLowerCase()

  if (!authorization) throw createError({ statusCode: 401, statusMessage: 'Authorization is required' })

  const url = `${base}/v1/shop/reviews/order`

  if (contentType.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Multipart form is empty' })

    const formData = new FormData()
    const fields: Record<string, string> = {}

    for (const part of parts) {
      if (!part.name) continue
      if (part.filename) {
        const blob = new Blob([part.data as any], { type: part.type || 'application/octet-stream' })
        ;(formData as any).append(part.name, blob, part.filename)
      } else {
        const value = part.data.toString('utf8')
        fields[part.name] = value
        formData.append(part.name, value)
      }
    }

    if (!fields.daigo_id) throw createError({ statusCode: 400, statusMessage: 'daigo_id is required' })
    if (!fields.order_id) throw createError({ statusCode: 400, statusMessage: 'order_id is required' })
    if (!fields.author || !fields.text || !fields.rating) throw createError({ statusCode: 400, statusMessage: 'Review fields are required' })

    try {
      return await ofetch(url, {
        method: 'POST',
        headers: { Authorization: authorization },
        body: formData,
        retry: 0,
        timeout: 120000,
      })
    } catch (error: any) {
      throwUpstreamError(error)
    }
  }

  const body = await readBody<any>(event)
  if (!body?.daigo_id) throw createError({ statusCode: 400, statusMessage: 'daigo_id is required' })
  if (!body?.order_id) throw createError({ statusCode: 400, statusMessage: 'order_id is required' })
  if (!body?.author || !body?.text || !body?.rating) throw createError({ statusCode: 400, statusMessage: 'Review fields are required' })

  try {
    return await ofetch(url, {
      method: 'POST',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body,
      retry: 0,
      timeout: 10000,
    })
  } catch (error: any) {
    throwUpstreamError(error)
  }
})
