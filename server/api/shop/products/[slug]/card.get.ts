import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = typeof value === 'string'
    ? value.replace(/\s/g, '').replace(',', '.')
    : value

  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function pickPayload(response: any) {
  return response?.product ?? response?.data?.product ?? response?.data ?? response
}

/**
 * Возвращаем только безопасный минимальный набор для подмешивания в mock-деталку:
 * название и цены должны быть актуальными с Go API, вся остальная богатая структура остаётся из mock.
 */
function adaptToProductPriceCard(response: any) {
  const api = pickPayload(response) || {}
  const details = api.details || api.detail || {}

  const price = normalizeNumber(api.price ?? details.price)
  const oldPrice = normalizeNumber(
    api.old_price ??
    api.oldPrice ??
    api.original_price ??
    api.originalPrice ??
    details.old_price ??
    details.oldPrice ??
    details.original_price ??
    details.originalPrice
  )

  return {
    product_id: api.product_id ?? api.id ?? api.uuid ?? details.product_id,
    slug: api.slug ?? details.slug,
    title: api.title ?? api.name ?? details.title ?? details.name,
    price,
    oldPrice,
    originalPrice: oldPrice,
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const config = useRuntimeConfig(event)
  const apiBase = String(config.public?.daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
  const url = `${apiBase}/v1/shop/products/${encodeURIComponent(slug)}/card`

  try {
    event.node.res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')

    const apiResp = await ofetch(url, {
      method: 'GET',
      retry: 1,
      timeout: 10_000,
    })

    if (!apiResp) throw new Error('Empty response')

    return adaptToProductPriceCard(apiResp)
  } catch (e: any) {
    if (e?.status === 404 || e?.statusCode === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    throw createError({
      statusCode: 502,
      statusMessage: `Upstream error: ${e?.message || e}`,
    })
  }
})
