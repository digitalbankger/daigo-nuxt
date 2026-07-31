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

function normalizeImages(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((rawImage: any, index) => {
      const imageUrl = String(
        rawImage?.image_url ??
        rawImage?.url ??
        rawImage?.src ??
        rawImage?.path ??
        '',
      ).trim()

      if (!imageUrl) return null

      return {
        ...rawImage,
        image_url: imageUrl,
        is_primary: rawImage?.is_primary === true || index === 0,
        display_order: Number(rawImage?.display_order ?? index),
      }
    })
    .filter(Boolean)
}

function normalizeVariants(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((rawVariant: any, index) => {
      const variantId = String(rawVariant?.variant_id ?? rawVariant?.id ?? '').trim()
      if (!variantId) return null

      const price = normalizeNumber(rawVariant?.price) ?? 0
      const originalPrice = normalizeNumber(
        rawVariant?.original_price ??
        rawVariant?.originalPrice ??
        rawVariant?.old_price ??
        rawVariant?.oldPrice,
      )

      const items = Array.isArray(rawVariant?.items)
        ? rawVariant.items
          .map((rawItem: any) => {
            const componentProductId = String(
              rawItem?.component_product_id ??
              rawItem?.product_id ??
              rawItem?.id ??
              '',
            ).trim()

            if (!componentProductId) return null

            return {
              ...rawItem,
              component_product_id: componentProductId,
              quantity: Math.max(1, Number(rawItem?.quantity ?? 1)),
            }
          })
          .filter(Boolean)
        : []

      return {
        ...rawVariant,
        variant_id: variantId,
        label: String(rawVariant?.label || `Вариант ${index + 1}`),
        price,
        originalPrice:
          originalPrice !== undefined && originalPrice > price
            ? originalPrice
            : undefined,
        oldPrice:
          originalPrice !== undefined && originalPrice > price
            ? originalPrice
            : undefined,
        is_default: rawVariant?.is_default === true,
        sort_order: Number(rawVariant?.sort_order ?? index),
        items,
      }
    })
    .filter(Boolean)
}

/**
 * Нормализует реальную карточку Go API в формат детальной страницы Nuxt.
 * Никакие product_id, цены или варианты здесь не создаются.
 */
function adaptToProductCard(response: any) {
  const api = pickPayload(response) || {}
  const details = api.details || api.detail || {}

  const price = normalizeNumber(api.price ?? details.price) ?? 0
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
  const shortDescription = String(
    api.short_description ??
    api.shortDescription ??
    details.short_description ??
    details.shortDescription ??
    '',
  )
  const effectiveOldPrice =
    oldPrice !== undefined && oldPrice > price
      ? oldPrice
      : undefined

  const rawVariants = Array.isArray(api.variants)
    ? api.variants
    : details.variants

  return {
    ...details,
    ...api,
    product_id: api.product_id ?? api.id ?? api.uuid ?? details.product_id,
    slug: String(api.slug ?? details.slug ?? ''),
    title: String(
      api.title ??
      api.name_ru ??
      api.name ??
      details.title ??
      details.name_ru ??
      details.name ??
      '',
    ),
    subtitle: String(api.subtitle ?? details.subtitle ?? ''),
    shortDescription,
    fullDescription: String(
      api.full_description ??
      api.fullDescription ??
      details.full_description ??
      details.fullDescription ??
      shortDescription,
    ),
    price,
    oldPrice: effectiveOldPrice,
    originalPrice: effectiveOldPrice,
    sort: Number(api.sort_order ?? api.sort ?? details.sort_order ?? details.sort ?? 0),
    category: String(api.category ?? details.category ?? 'bundle'),
    isActive: Boolean(api.is_active ?? api.isActive ?? details.is_active ?? true),
    actionMechanism:
      api.action_mechanism ??
      api.actionMechanism ??
      details.action_mechanism ??
      details.actionMechanism,
    productionDetails:
      api.production_details ??
      api.productionDetails ??
      details.production_details ??
      details.productionDetails,
    videoUrl:
      api.video_url ??
      api.videoUrl ??
      details.video_url ??
      details.videoUrl,
    videoPoster:
      api.video_poster_url ??
      api.videoPoster ??
      details.video_poster_url ??
      details.videoPoster,
    images: normalizeImages(api.images ?? details.images),
    variants: normalizeVariants(rawVariants),
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

    return adaptToProductCard(apiResp)
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
