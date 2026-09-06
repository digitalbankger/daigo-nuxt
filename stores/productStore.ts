import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, ProductVariant, ProductVariantItem } from '~/types/product'
import {
  isOmegaBundleSlug,
  type OmegaBundleSlug,
} from '~/constants/omegaBundles'
import { getOmegaBundlePageContent } from '~/data/omegaBundlePageContent'

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

function mergeVariantItems(
  baseItems: ProductVariantItem[] = [],
  backendItems: unknown,
): ProductVariantItem[] {
  if (!Array.isArray(backendItems)) return baseItems

  return backendItems
    .map((rawItem: any) => {
      const componentProductId = String(
        rawItem?.component_product_id ?? rawItem?.product_id ?? rawItem?.id ?? '',
      )
      if (!componentProductId) return null

      const baseItem = baseItems.find(
        (item) => String(item.component_product_id) === componentProductId,
      )

      return {
        ...baseItem,
        ...rawItem,
        component_product_id: componentProductId,
        quantity: Math.max(1, Number(rawItem?.quantity ?? baseItem?.quantity ?? 1)),
      } satisfies ProductVariantItem
    })
    .filter((item): item is ProductVariantItem => Boolean(item))
}

function mergeProductVariants(
  baseVariants: ProductVariant[] = [],
  backendVariants: unknown,
): ProductVariant[] {
  if (!Array.isArray(backendVariants) || backendVariants.length === 0) {
    return baseVariants
  }

  return backendVariants
    .map((rawVariant: any, index) => {
      const backendVariantId = String(rawVariant?.variant_id ?? rawVariant?.id ?? '')
      const backendSortOrder = Number(rawVariant?.sort_order ?? index)

      const baseVariant =
        baseVariants.find(
          (variant) =>
            backendVariantId &&
            String(variant.variant_id) === backendVariantId,
        ) ||
        baseVariants.find(
          (variant) => Number(variant.sort_order) === backendSortOrder,
        ) ||
        baseVariants[index]

      const variantId = backendVariantId || baseVariant?.variant_id || ''
      if (!variantId) return null

      const price =
        normalizeNumber(rawVariant?.price) ??
        normalizeNumber(baseVariant?.price) ??
        0

      const originalPrice = normalizeNumber(
        rawVariant?.originalPrice ??
          rawVariant?.original_price ??
          rawVariant?.oldPrice ??
          rawVariant?.old_price ??
          baseVariant?.originalPrice ??
          baseVariant?.oldPrice,
      )

      return {
        ...baseVariant,
        ...rawVariant,
        variant_id: variantId,
        label: String(rawVariant?.label || baseVariant?.label || `Вариант ${index + 1}`),
        price,
        originalPrice:
          originalPrice !== undefined && originalPrice > price
            ? originalPrice
            : undefined,
        oldPrice:
          originalPrice !== undefined && originalPrice > price
            ? originalPrice
            : undefined,
        is_default:
          typeof rawVariant?.is_default === 'boolean'
            ? rawVariant.is_default
            : Boolean(baseVariant?.is_default ?? index === 0),
        sort_order: backendSortOrder,
        items: mergeVariantItems(baseVariant?.items, rawVariant?.items),
      } satisfies ProductVariant
    })
    .filter((variant): variant is ProductVariant => Boolean(variant))
}

function mergeProductWithBackendCard(baseProduct: Product | null, backendCard: ProductPriceCard | null): Product | null {
  if (!backendCard) return baseProduct

  const merged: any = { ...(baseProduct || {}) }
  const mergedVariants = mergeProductVariants(
    baseProduct?.variants,
    backendCard.variants,
  )
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

  const backendProductId = String(backendCard.product_id ?? '').trim()
  const baseProductId = String(baseProduct?.product_id ?? '').trim()
  const isDifferentBackendProduct = Boolean(
    backendProductId && baseProductId && backendProductId !== baseProductId,
  )
  const fallbackOldPrice = isDifferentBackendProduct
    ? undefined
    : normalizeNumber(merged.oldPrice ?? merged.originalPrice)

  if (backendPrice !== undefined) {
    merged.price = backendPrice
  }

  if (mergedVariants.length) {
    merged.variants = mergedVariants

    if (backendPrice === undefined) {
      const defaultVariant =
        mergedVariants.find((variant) => variant.is_default) ||
        mergedVariants[0]

      if (defaultVariant) {
        merged.price = defaultVariant.price
      }
    }
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

function buildOmegaBundleProduct(
  backendCard: ProductPriceCard,
  slug: OmegaBundleSlug,
): Product | null {
  const productId = backendCard.product_id
  if (productId === null || productId === undefined || productId === '') {
    return null
  }

  const variants = mergeProductVariants([], backendCard.variants)
  const defaultVariant =
    variants.find((variant) => variant.is_default) ||
    variants[0]
  const price =
    normalizeNumber(backendCard.price) ??
    normalizeNumber(defaultVariant?.price) ??
    0
  const oldPrice = normalizeNumber(
    backendCard.oldPrice ??
    backendCard.old_price ??
    backendCard.originalPrice ??
    backendCard.original_price ??
    backendCard.details?.oldPrice ??
    backendCard.details?.old_price ??
    backendCard.details?.originalPrice ??
    backendCard.details?.original_price,
  )
  const effectiveOldPrice =
    oldPrice !== undefined && oldPrice > price
      ? oldPrice
      : undefined
  const pageContent = getOmegaBundlePageContent(slug)

  return {
    ...backendCard,
    product_id: productId,
    slug,
    title: String(backendCard.title || backendCard.name || ''),
    subtitle: String(backendCard.subtitle || ''),
    shortDescription: String(
      backendCard.shortDescription || pageContent.fallbackShortDescription,
    ),
    fullDescription: String(
      backendCard.fullDescription ||
      backendCard.shortDescription ||
      pageContent.fallbackFullDescription,
    ),
    price,
    oldPrice: effectiveOldPrice,
    originalPrice: effectiveOldPrice,
    sort: Number(backendCard.sort || 0),
    category: String(backendCard.category || 'bundle'),
    isActive: backendCard.isActive !== false,
    // Для специальных страниц наборов галерея полностью локальная.
    // Так карточка не зависит от доступности внешних URL изображений Go API.
    images: pageContent.galleryImages,
    variants,
    bundleSections: pageContent.bundleSections,
    faq: pageContent.faq,
  }
}

export const useProductStore = defineStore('product', () => {
  const product = ref<Product | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const errorStatusCode = ref<number | null>(null)

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
    errorStatusCode.value = null

    try {
      if (isOmegaBundleSlug(normalizedSlug)) {
        const backendResult = await useFetch<ProductPriceCard>(
          `/api/shop/products/${encodeURIComponent(normalizedSlug)}/card`,
          {
            key: `omega-bundle-card:${normalizedSlug}`,
            server: true,
          },
        )

        if (backendResult.error.value) {
          throw backendResult.error.value
        }

        const backendProduct = backendResult.data.value
          ? buildOmegaBundleProduct(backendResult.data.value, normalizedSlug)
          : null

        if (!backendProduct) {
          throw new Error('Бэкенд не вернул карточку товара')
        }

        product.value = backendProduct
        return
      }

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
      errorStatusCode.value = Number(
        e?.statusCode || e?.status || e?.response?.status || e?.data?.statusCode || 0,
      ) || null
      error.value = e?.message || e?.statusMessage || 'Ошибка загрузки товара'
      product.value = null
    } finally {
      pending.value = false
    }
  }

  return { product, pending, error, errorStatusCode, loadProduct }
})
