import { defineEventHandler, createError, getRouterParam } from 'h3'
import { ofetch } from 'ofetch'

/** Адаптация ответа бэка к нашему типу Product (минимально необходимое) */
function adaptToProduct(api: any) {
  // TODO: при необходимости — дополни маппинг под точную схему бэка
  return {
    product_id: api.id ?? api.product_id ?? api.uuid,
    slug: api.slug,
    title: api.title ?? api.name,
    subtitle: api.subtitle ?? '',
    shortDescription: api.short_description ?? api.shortDescription ?? '',
    price: Number(api.price) || 0,
    originalPrice: Number(api.original_price ?? api.originalPrice ?? api.price) || 0,
    discount: api.discount ?? undefined,
    image: api.image ?? api.cover ?? '',
    images: (api.gallery ?? api.images ?? []).map((src: string) => ({ src, alt: api.title ?? api.name })),
    properties: api.properties ?? {},
    descriptionSections: api.descriptionSections ?? [],
    faq: api.faq ?? undefined,
    usageInstructions: api.usageInstructions ?? undefined,
    productionSection: api.productionSection ?? undefined,
    actionPrinciple: api.actionPrinciple ?? undefined,
    effect: api.effect ?? undefined,
    effectCombo: api.effectCombo ?? undefined,
    usage: api.usage ?? undefined,
    // добавь недостающее из своего типа Product при необходимости
  }
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const { daigoApiBase } = useRuntimeConfig().public
  const url = `${daigoApiBase}/v1/shop/products/${encodeURIComponent(slug)}/card`

  try {
    // Можно включить простой кеш на сервере (десять минут)
    // @ts-ignore
    event.node.res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')

    const apiResp = await ofetch(url, {
      // headers: { Authorization: `Bearer ${token}` }, // если потребуется
      retry: 1,
      timeout: 10_000
    })

    if (!apiResp) throw new Error('Empty response')

    const product = adaptToProduct(apiResp)
    return product
  } catch (e: any) {
    // Если бэк вернул 404 — пробрасываем на фронт
    if (e?.status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }
    throw createError({ statusCode: 502, statusMessage: `Upstream error: ${e?.message || e}` })
  }
})
