import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '~/types/product'

type ProductPriceCard = Partial<Product> & {
  name?: string
  old_price?: number | string | null
  original_price?: number | string | null
  details?: {
    old_price?: number | string | null
    oldPrice?: number | string | null
    original_price?: number | string | null
    originalPrice?: number | string | null
  }
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined

  const normalized = typeof value === 'string'
    ? value.replace(/\s/g, '').replace(',', '.')
    : value

  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function mergeProductWithBackendCard(baseProduct: Product | null, backendCard: ProductPriceCard | null): Product | null {
  if (!backendCard) return baseProduct

  const merged: any = { ...(baseProduct || {}) }
  const backendTitle = String(backendCard.title || backendCard.name || '').trim()
  const backendPrice = normalizeNumber(backendCard.price)
  const backendOldPrice = normalizeNumber(
    backendCard.oldPrice ??
    backendCard.old_price ??
    backendCard.originalPrice ??
    backendCard.original_price ??
    backendCard.details?.oldPrice ??
    backendCard.details?.old_price ??
    backendCard.details?.originalPrice ??
    backendCard.details?.original_price
  )

  if (backendCard.product_id) merged.product_id = backendCard.product_id
  if (backendCard.slug) merged.slug = backendCard.slug
  if (backendTitle) merged.title = backendTitle

  const fallbackOldPrice = normalizeNumber(merged.oldPrice ?? merged.originalPrice)

  if (backendPrice !== undefined) {
    merged.price = backendPrice
  }

  const currentPrice = backendPrice ?? normalizeNumber(merged.price) ?? 0

  // Название и актуальную цену берём с Go API.
  // Старую цену берём с Go API, если она пришла валидной.
  // Если Go API старую цену не отдаёт, оставляем старую цену из mock-деталки,
  // чтобы на странице товара не пропадала зачёркнутая цена и бейдж скидки.
  const effectiveOldPrice = backendOldPrice !== undefined
    ? backendOldPrice
    : fallbackOldPrice

  if (effectiveOldPrice !== undefined && effectiveOldPrice > currentPrice) {
    merged.originalPrice = effectiveOldPrice
    merged.oldPrice = effectiveOldPrice
  } else {
    merged.originalPrice = undefined
    merged.oldPrice = undefined
  }

  return merged as Product
}

export const useProductStore = defineStore('product', () => {
  const product = ref<Product | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  const loadProduct = async (slug: string) => {
    const normalizedSlug = String(slug || '').trim()
    if (!normalizedSlug) {
      product.value = null
      error.value = 'Не передан slug товара'
      return
    }

    if (product.value?.slug === normalizedSlug) return

    pending.value = true
    error.value = null

    try {
      const [mockResult, backendCardResult] = await Promise.allSettled([
        useFetch<Product>(`/api/shop/${encodeURIComponent(normalizedSlug)}`, {
          key: `product-detail-mock:${normalizedSlug}`,
          server: true,
        }),
        useFetch<ProductPriceCard>(`/api/shop/products/${encodeURIComponent(normalizedSlug)}/card`, {
          key: `product-price-card:${normalizedSlug}`,
          server: true,
        }),
      ])

      const mockData = mockResult.status === 'fulfilled' ? mockResult.value.data.value : null
      const mockError = mockResult.status === 'fulfilled' ? mockResult.value.error.value : mockResult.reason
      const backendCard = backendCardResult.status === 'fulfilled' && !backendCardResult.value.error.value
        ? backendCardResult.value.data.value
        : null

      if (!mockData && mockError) {
        throw mockError
      }

      product.value = mergeProductWithBackendCard(mockData || null, backendCard || null)
    } catch (e: any) {
      error.value = e?.message || e?.statusMessage || 'Ошибка загрузки товара'
      product.value = null
    } finally {
      pending.value = false
    }
  }

  return { product, pending, error, loadProduct }
})
