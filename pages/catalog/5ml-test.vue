<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useProductStore } from '~/stores/productStore'
import { useCartStore } from '~/stores/cartStore'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '~/composables/useYtm'
import ProductConsultationCard from '~/components/product/ProductConsultationCard.vue'

const PRODUCT_SLUG = 'metabiotik-daigo'
const EMBED_SOURCE = 'daigo-5ml-embed'
const PARENT_SOURCE = 'daigo-nuxt-5ml'
const EMBED_URL = '/__isolated/5ml-test/index.html'


type ProductReviewItem = {
  id: string
  author: string
  rating: number
  date?: string
  title?: string
  text: string
  source?: string
  verified?: boolean
  tags?: string[]
}

type ProductReviewsData = {
  ratingAvg?: number
  count?: number
  source?: string
  items: ProductReviewItem[]
}

useHead({
  title: 'Daigo 5 мл — тестовая страница',
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'bingbot', content: 'noindex, nofollow, noarchive, nosnippet' },
  ],
  link: [
    { rel: 'canonical', href: 'https://daigo.ru/catalog/metabiotik-daigo' },
  ],
})

// definePageMeta({
//   layout: 'five-ml',
// })

const productStore = useProductStore()
const cartStore = useCartStore()
const analytics = useAnalytics()
const ytm = useYtm()
const frame = ref<HTMLIFrameElement | null>(null)
const consultationCard = ref<InstanceType<typeof ProductConsultationCard> | null>(null)
const bridgeReady = ref(false)
const adding = ref(false)
const errorMessage = ref('')

await productStore.loadProduct(PRODUCT_SLUG)


const { data: productReviewsResponse } = await useFetch<ProductReviewsData>(
  `/api/shop/reviews/${PRODUCT_SLUG}`,
  {
    key: `product-reviews:${PRODUCT_SLUG}`,
    default: () => ({ items: [] }),
  },
)

const productReviews = computed<ProductReviewsData>(() => {
  const value = productReviewsResponse.value
  return value && Array.isArray(value.items) ? value : { items: [] }
})

const product = computed(() => productStore.product)
const coverImage = computed(() => {
  const images = product.value?.images || []
  if (!images.length) return ''

  return [...images]
    .sort((a, b) => {
      if (a.is_primary) return -1
      if (b.is_primary) return 1
      return Number(a.display_order || 0) - Number(b.display_order || 0)
    })[0]?.image_url || ''
})

function postToEmbed(payload: Record<string, unknown>) {
  const target = frame.value?.contentWindow
  if (!target) return
  target.postMessage({ source: PARENT_SOURCE, ...payload }, window.location.origin)
}

function syncProductAndCart() {
  const currentProduct = product.value
  if (!currentProduct) return

  postToEmbed({
    type: 'product-sync',
    productId: String(currentProduct.product_id || ''),
    price: Number(currentProduct.price || 0),
    oldPrice: Number(currentProduct.originalPrice || currentProduct.oldPrice || 0),
    cartCount: Number(cartStore.itemsCount || 0),
  })
}

function syncCart() {
  postToEmbed({
    type: 'cart-sync',
    cartCount: Number(cartStore.itemsCount || 0),
  })
}


function syncReviews() {
  const value = productReviews.value
  const items = Array.isArray(value.items)
    ? value.items.map((item) => ({
        id: String(item.id || ''),
        author: String(item.author || 'Не указано'),
        rating: Number(item.rating || 5),
        date: item.date ? String(item.date) : '',
        title: item.title ? String(item.title) : '',
        text: String(item.text || ''),
        source: item.source ? String(item.source) : '',
        verified: item.verified === true,
        tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
      }))
    : []

  const calculatedRating = items.length
    ? items.reduce((sum, item) => sum + Math.min(5, Math.max(0, Number(item.rating) || 0)), 0) / items.length
    : 0
  const upstreamRating = Number(value.ratingAvg)
  const upstreamCount = Number(value.count)

  postToEmbed({
    type: 'reviews-sync',
    reviews: {
      ratingAvg: Number.isFinite(upstreamRating) && upstreamRating > 0 ? upstreamRating : calculatedRating,
      count: Number.isFinite(upstreamCount) && upstreamCount >= 0 ? upstreamCount : items.length,
      source: value.source ? String(value.source) : '',
      items,
    },
  })
}

async function addRealProduct(quantityRaw: unknown) {
  const currentProduct = product.value
  if (!currentProduct || adding.value) return

  const quantity = Math.min(24, Math.max(1, Math.round(Number(quantityRaw) || 1)))
  const productId = String(currentProduct.product_id || '')
  const price = Number(currentProduct.price || 0)

  if (!productId || price <= 0) {
    errorMessage.value = 'Не удалось получить актуальную цену товара.'
    postToEmbed({ type: 'add-result', ok: false, message: errorMessage.value })
    return
  }

  adding.value = true
  errorMessage.value = ''

  try {
    await cartStore.ensureLoaded()
    await cartStore.addToCart({
      id: productId,
      title: currentProduct.title,
      subtitle: currentProduct.subtitle,
      price,
      originalPrice: currentProduct.originalPrice,
      oldPrice: currentProduct.oldPrice,
      quantity,
      image: coverImage.value,
      tag: currentProduct.category,
    })

    syncCart()
    postToEmbed({ type: 'add-result', ok: true })
  } catch (error: any) {
    errorMessage.value = error?.message || 'Не удалось добавить товар в корзину.'
    try {
      await cartStore.loadCart()
    } catch {}
    syncCart()
    postToEmbed({ type: 'add-result', ok: false, message: errorMessage.value })
  } finally {
    adding.value = false
  }
}

function onFrameMessage(event: MessageEvent) {
  if (event.source !== frame.value?.contentWindow) return
  if (event.origin !== window.location.origin) return

  const data = event.data && typeof event.data === 'object' ? event.data : null
  if (!data || data.source !== EMBED_SOURCE) return

  if (data.type === 'ready') {
    bridgeReady.value = true
    syncProductAndCart()
    syncReviews()
    return
  }

  if (data.type === 'add-to-cart') {
    void addRealProduct(data.quantity)
    return
  }

  if (data.type === 'open-consultation') {
    consultationCard.value?.openModal()
  }
}

function onFrameLoad() {
  bridgeReady.value = true
  syncProductAndCart()
  syncReviews()
}

onMounted(async () => {
  window.addEventListener('message', onFrameMessage)

  if (!cartStore.isLoaded) {
    try {
      await cartStore.loadCart()
    } catch {}
  }

  await nextTick()
  syncProductAndCart()
  syncReviews()

  const currentProduct = product.value
  if (currentProduct) {
    analytics.viewItem({
      id: currentProduct.product_id,
      name: currentProduct.title,
      price: Number(currentProduct.price) || 0,
      url: '/catalog/5ml-test',
      image_url: coverImage.value,
      brand: 'Daigo',
    })

    ytm.viewDetail({
      currency: 'RUB',
      brand: 'Daigo',
      items: [{
        id: currentProduct.product_id,
        name: currentProduct.title,
        price: Number(currentProduct.price) || 0,
        image_url: coverImage.value,
      }],
    })
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('message', onFrameMessage)
  }
})

watch(
  () => [product.value?.price, product.value?.originalPrice, cartStore.itemsCount],
  () => {
    if (bridgeReady.value) syncProductAndCart()
  },
)

watch(
  () => productReviewsResponse.value,
  () => {
    if (bridgeReady.value) syncReviews()
  },
  { deep: true },
)

</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-white">
    <iframe
      ref="frame"
      :src="EMBED_URL"
      title="Daigo 5 мл"
      class="block h-full w-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
      allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
      @load="onFrameLoad"
    />

    <div
      v-if="!product && productStore.error"
      class="absolute inset-x-4 top-4 z-20 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-lg sm:left-1/2 sm:max-w-xl sm:-translate-x-1/2"
    >
      {{ productStore.error }}
    </div>

    <div
      v-if="errorMessage"
      class="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[calc(100%-32px)] max-w-xl -translate-x-1/2 rounded-xl bg-black px-4 py-3 text-center text-sm text-white shadow-xl"
    >
      {{ errorMessage }}
    </div>

    <ProductConsultationCard
      v-if="product"
      ref="consultationCard"
      :product-id="product.product_id"
      :product-title="product.title"
      :show-banner="false"
    />
  </div>
</template>
