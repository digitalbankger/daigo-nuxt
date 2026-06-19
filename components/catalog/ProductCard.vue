<template>
  <NuxtLink :to="`/catalog/${product.slug}`" custom v-slot="{ navigate }">
    <article
      class="relative transition rounded-xl md:rounded-2xl shadow-pc cursor-pointer h-full flex flex-col overflow-hidden bg-white"
      role="link"
      tabindex="0"
      @click="onOpen(navigate)"
      @keydown.enter.space="onOpen(navigate)"
      aria-label="Открыть страницу товара"
    >
      <div class="w-full overflow-hidden mb-2 md:mb-4 rounded-xl">
        <div class="w-full h-[160px] sm:h-[280px] bg-hoverbtn overflow-hidden rounded-xl" @click.stop="onOpen(navigate)">
          <div class="w-full h-full flex items-center justify-center select-none">
            <CatalogCardImage
              :src="primaryImage"
              :alt="product.name"
              :width="560"
              :height="560"
              :class="cardImageClass"
              :eager="priority"
            />
          </div>
        </div>
      </div>

      <div class="p-2 md:p-4 flex flex-col flex-1">
        <h3
          class="font-normal md:font-medium leading-tight mb-0.5 sm:mb-2 text-sm sm:text-base
                 md:text-[1.4rem]
                 line-clamp-3 sm:line-clamp-2 xs-max:min-h-[3.2rem] min-h-[3rem] md:min-h-[3.2rem]"
        >
          {{ product.name }}
        </h3>

        <p class="block text-[clamp(0.8rem,3.2vw,1rem)] mb-4 text-black/70 line-clamp-2 min-h-[3rem] whitespace-pre-line">
          {{ product.subtitle }}
        </p>

        <div class="mt-auto flex flex-col items-start gap-4 w-full">
          <div v-if="hasSummerPromo" class="relative">
  <img
    v-if="showSummerDecor"
    src="/images/articles/summer/summer-card-umbrella.png"
    alt=""
    class="pointer-events-none absolute -top-10 right-2 z-[0] hidden w-14 object-contain sm:block sm:w-16"
    @error="showSummerDecor = false"
  >

  <img
    v-if="showSummerDecor"
    src="/images/articles/summer/summer-card-umbrella.png"
    alt=""
    class="pointer-events-none absolute -top-8 right-1 z-[0] block w-12 object-contain sm:hidden"
    @error="showSummerDecor = false"
  >

  <!-- DESKTOP -->
  <div class="summer-ribbon relative hidden w-full overflow-visible rounded-xl sm:px-3 py-2.5 mb-1 sm:block">
    <div class="relative z-[1] flex items-start justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <span class="inline-flex shrink-0 items-center rounded-lg bg-white/20 px-2 py-1 text-xs sm:text-sm font-medium text-white backdrop-blur-sm">
          -{{ discountPercent }}%
        </span>

        <span class="text-white/90 text-[11px] sm:text-xs uppercase tracking-[0.14em] leading-tight">
          Летняя скидка
        </span>
      </div>

      <div class="text-right shrink-0">
        <div class="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-white/75">
          сгорит через
        </div>

        <div class="summer-ribbon__timer text-sm sm:text-base font-semibold text-white tabular-nums">
          {{ promoCountdownLabel }}
        </div>
      </div>
    </div>
  </div>

  <!-- MOBILE -->
  <div class="summer-ribbon relative block w-full overflow-visible rounded-lg px-2 py-2.5 mb-1 sm:hidden">
    <div class="relative z-[1] grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start">
      <span class="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/20 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
        -{{ discountPercent }}%
      </span>

      <div class="flex flex-col items-end text-right leading-tight my-auto">
        <span class="text-white/95 text-[10px] uppercase tracking-[0.1em]">
          Летняя скидка
        </span>

        <span class="text-white/75 text-[10px] uppercase tracking-[0.16em]">
          сгорит через
        </span>
      </div>

      <div class="summer-ribbon__timer col-span-2 text-right text-base font-medium text-white tabular-nums leading-none">
        {{ promoCountdownLabel }}
      </div>
    </div>
  </div>
</div>

          <div class="flex flex-row sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mt-1 sm:mt-0">
            <span v-if="product.originalPrice > product.price" class="text-primary line-through text-[clamp(0.8rem,3.4vw,0.98rem)] font-light">
              {{ product.originalPrice.toLocaleString() }} ₽
            </span>
            <span class="text-black text-[clamp(0.9rem,4.4vw,1.5rem)] font-medium">
              {{ product.price.toLocaleString() }} ₽
            </span>
          </div>

          <div v-if="isPreorder" class="w-full flex flex-col gap-2">
            <a
              href="tel:88005552043"
              class="text-xs sm:text-sm text-black/50 w-fit"
              aria-label="Позвонить для предзаказа"
            >
              8 (800) 555-20-43
            </a>

            <div
              class="bg-hoverbtn text-black w-full h-10 sm:h-12 flex items-center justify-center
                     xs-max:text-xs text-sm sm:text-base px-2 md:px-4
                     rounded-lg whitespace-nowrap select-none cursor-default"
              aria-label="Предзаказ"
            >
              Предзаказ
            </div>
          </div>

          <button
            v-else-if="quantityInCart === 0"
            type="button"
            @click.stop="addToCartHandler"
            aria-label="В корзину"
            class="bg-primary hover:bg-hoverbtn hover:text-black  w-full h-10 sm:h-12 flex items-center justify-center
                   xs-max:text-xs text-sm sm:text-base text-white px-2 md:px-4
                   rounded-lg whitespace-nowrap relative overflow-hidden"
          >
            <img
              src="/icons/add-to-cart.svg"
              alt=""
              class="w-4 md:w-5 h-4 md:h-5 mr-2 shrink-0 relative z-10"
            />
            <span class="whitespace-nowrap relative z-10">
              В корзину
            </span>
          </button>

          <div
            v-else
            class="flex items-center gap-2 bg-primary px-2 rounded-lg w-full justify-between h-11 md:h-12"
          >
            <button
              type="button"
              @click.stop="decrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full"
              aria-label="Уменьшить количество"
            >
              <img src="/icons/decrement.svg" alt="Уменьшить количество" class="w-5 h-5" />
            </button>
            <span class="min-w-[2rem] text-center text-white xs-max:text-xs">
              {{ quantityInCart }} шт
            </span>
            <button
              type="button"
              @click.stop="incrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full"
              aria-label="Увеличить количество"
            >
              <img src="/icons/increment.svg" alt="Увеличить количество" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ProductCard } from '~/types/product'
import { useCartStore } from '~/stores/cartStore'
import { computed, ref } from 'vue'
import { useYtm } from '@/composables/useYtm'
import { useRoute } from '#imports'
import CatalogCardImage from '~/components/catalog/CatalogCardImage.vue'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'
import { useSummerPromoCountdown } from '~/composables/useSummerPromoCountdown'

const route = useRoute()
const ytm = useYtm()
const analytics = useAnalytics()

const { product, index, globalIndex, priority, imageClass } = defineProps<{
  product: ProductCard
  index?: number
  globalIndex?: number
  priority?: boolean
  imageClass?: string
}>()

const cardImageClass = computed(() =>
  imageClass || 'h-[140px] sm:h-[280px] object-contain pointer-events-none'
)

const primaryImage = computed(() => {
  const images = [product.image, ...(product.detailImages || [])]
  const firstImage = images
    .map((image) => String(image || '').trim())
    .find(Boolean)

  return normalizeMediaUrlOrFallback(firstImage, '/images/placeholder-product.png')
})

const discountPercent = computed(() => {
  const current = Number(product.price || 0)
  const original = Number(product.originalPrice || 0)

  if (!original || original <= current) return 0
  return Math.max(1, Math.round(((original - current) / original) * 100))
})

const hasSummerPromo = computed(() => discountPercent.value > 0)
const showSummerDecor = ref(true)

const { label: promoCountdownLabel } = useSummerPromoCountdown()

const cartStore = useCartStore()

const PREORDER_IDS = new Set<string>([''])
const isPreorder = computed(() => PREORDER_IDS.has(String(product.product_id)))

const quantityInCart = computed(() => {
  const item = cartStore.items.find(i => String(i.id) === String(product.product_id))
  return item?.quantity ?? 0
})

function addToCartHandler() {
  cartStore.addToCart({
    id: String(product.product_id),
    title: product.name,
    subtitle: product.subtitle,
    price: product.price,
    oldPrice: product.oldPrice,
    quantity: 1,
    image: primaryImage.value,
    tag: product.tag,
  })
}

function onOpen(navigate: () => void) {
  const productObj = {
    id: product.product_id,
    name: product.name,
    price: Number(product.price) || 0,
    position: (globalIndex ?? index ?? 0) + 1,
    category: product.tag ? [product.tag] : undefined,
    url: `/catalog/${product.slug}`,
    image_url: primaryImage.value
  }

  ytm.productClick(productObj, route.path, 'Каталог')

  analytics.selectItem(
    'Каталог',
    {
      id: product.product_id,
      name: product.name,
      price: Number(product.price) || 0,
      position: (globalIndex ?? index ?? 0) + 1,
      category: product.tag ? String(product.tag) : undefined,
      url: `/catalog/${product.slug}`,
      image_url: primaryImage.value,
      list: 'Каталог'
    },
    route.path
  )
  navigate()
}

function incrementHandler() {
  cartStore.updateItem(String(product.product_id), quantityInCart.value + 1)
}
function decrementHandler() {
  cartStore.updateItem(String(product.product_id), quantityInCart.value - 1)
}
</script>

<style scoped>
.summer-ribbon {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.24), transparent 30%),
    radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(30, 166, 210, 0.96) 0%, rgba(26, 142, 189, 0.97) 62%, rgba(18, 121, 167, 1) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.summer-ribbon::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background-image: linear-gradient(115deg, transparent 22%, rgba(255,255,255,0.16) 30%, transparent 40%),
    linear-gradient(180deg, rgba(255,255,255,0.08), transparent 52%);
  opacity: 0.95;
}

.summer-ribbon__timer {
  animation: summer-ribbon-pulse 1.6s ease-in-out infinite;
}

@keyframes summer-ribbon-pulse {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.62; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .summer-ribbon__timer {
    animation: none;
  }
}
</style>
