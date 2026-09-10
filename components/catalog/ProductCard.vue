<template>
  <NuxtLink :to="`/catalog/${product.slug}`" custom v-slot="{ navigate }">
    <article
      class="relative transition rounded-xl md:rounded-2xl shadow-pc cursor-pointer h-full flex flex-col overflow-hidden bg-white"
      :class="isWeeklyVariant ? 'rounded-[14px] md:rounded-[14px]' : ''"
      role="link"
      tabindex="0"
      @click="onOpen(navigate)"
      @keydown.enter.space="onOpen(navigate)"
      aria-label="Открыть страницу товара"
    >
      <div
        class="w-full overflow-hidden rounded-xl"
        :class="isWeeklyVariant ? 'mb-1.5' : 'mb-2 md:mb-4'"
      >
        <div
          class="relative w-full bg-hoverbtn overflow-hidden rounded-xl"
          :class="isWeeklyVariant ? 'h-[160px] sm:h-[280px]' : 'h-[160px] sm:h-[280px]'"
          @click.stop="onOpen(navigate)"
        >
          <div class="w-full h-full flex items-center justify-center select-none">
            <CatalogCardImage
              :src="primaryImageSource"
              :alt="product.name"
              :width="560"
              :height="560"
              :class="cardImageClass"
              :eager="priority"
            />
          </div>

          <span
            v-if="isWeeklyVariant && discountPercent > 0"
            class="absolute bottom-2 left-2 inline-flex items-center rounded-md bg-cgreen px-2 py-1 text-[11px] font-medium leading-none text-white sm:text-xs"
          >
            Выгода {{ discountPercent }}%
          </span>
        </div>
      </div>

      <div
        class="flex flex-1 flex-col"
        :class="isWeeklyVariant ? 'p-2.5 sm:p-3' : 'p-2 md:p-4'"
      >
        <h3
          class="font-normal md:font-medium leading-tight mb-0.5 sm:mb-2 text-sm sm:text-base
                 md:text-[1.6rem]
                 line-clamp-3 sm:line-clamp-2 xs-max:min-h-[3.2rem] min-h-[3rem] md:min-h-[3.2rem]"
          :class="isWeeklyVariant ? '!text-base sm:!text-xl !min-h-[2.5rem] sm:!min-h-[3rem]' : ''"
        >
          {{ product.name }}
        </h3>

        <p
          v-if="!isWeeklyVariant && product.subtitle"
          class="block text-[clamp(0.8rem,3.2vw,1rem)] mb-4 text-black/70 line-clamp-2 min-h-[3rem] whitespace-pre-line"
        >
          {{ product.subtitle }}
        </p>

        <div
          class="mt-auto flex w-full flex-col items-start"
          :class="isWeeklyVariant ? 'gap-2.5' : 'gap-4'"
        >


          <div class="flex flex-row sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mt-1 sm:mt-0">
            <span v-if="product.originalPrice > product.price" class="text-primary line-through text-[clamp(0.8rem,3.4vw,0.98rem)] font-light">
              {{ product.originalPrice.toLocaleString() }} ₽
            </span>
            <span class="text-black text-[clamp(0.9rem,4.4vw,1.5rem)] font-medium">
              {{ product.price.toLocaleString() }} ₽
            </span>
          </div>

          <div v-if="preorderRule" class="w-full flex flex-col gap-2">
            <a
              :href="preorderRule.phoneHref"
              class="text-xs sm:text-sm text-black/50 w-fit"
              aria-label="Позвонить для предзаказа"
            >
              {{ preorderRule.phoneLabel }}
            </a>

            <div
              class="bg-hoverbtn text-black w-full h-10 sm:h-12 flex items-center justify-center
                     xs-max:text-xs text-sm sm:text-base px-2 md:px-4
                     rounded-lg whitespace-nowrap select-none cursor-default"
              :aria-label="preorderRule.ctaLabel"
            >
              {{ preorderRule.ctaLabel }}
            </div>
          </div>

          <div
            v-else-if="quantityInCart === 0"
            class="group/evolution-add relative w-full"
            @click.stop
          >
            <button
              type="button"
              :disabled="evolutionSingleBlocked"
              @click.stop="addToCartHandler"
              aria-label="В корзину"
              :aria-describedby="showEvolutionSingleHint ? `evolution-catalog-hint-${product.product_id}` : undefined"
              class="bg-primary hover:bg-hoverbtn hover:text-black w-full h-10 sm:h-12 flex items-center justify-center
                     xs-max:text-xs text-sm sm:text-base text-white px-2 md:px-4
                     rounded-lg whitespace-nowrap relative overflow-hidden disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-primary disabled:hover:text-white"
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
              v-if="showEvolutionSingleHint"
              :id="`evolution-catalog-hint-${product.product_id}`"
              role="tooltip"
              class="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-40 w-[240px] -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-center text-[11px] leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/evolution-add:opacity-100 group-focus-within/evolution-add:opacity-100"
            >
              {{ evolutionSingleDeliveryMessage }}
              <span class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-black" />
            </div>
          </div>

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
              :disabled="evolutionSingleBlocked"
              :title="showEvolutionSingleHint ? evolutionSingleDeliveryMessage : undefined"
              @click.stop="incrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full disabled:cursor-not-allowed disabled:opacity-40"
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
import { computed } from 'vue'
import { useYtm } from '@/composables/useYtm'
import { useRoute } from '#imports'
import CatalogCardImage from '~/components/catalog/CatalogCardImage.vue'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'
import { getPreorderRule } from '~/constants/preorderProducts'
import {
  EVOLUTION_SINGLE_DELIVERY_MESSAGE,
  canAddEvolutionSingle,
  isEvolutionSingleProduct,
} from '~/utils/evolutionCart'

const route = useRoute()
const ytm = useYtm()
const analytics = useAnalytics()

const { product, index, globalIndex, priority, imageClass, variant } = defineProps<{
  product: ProductCard
  index?: number
  globalIndex?: number
  priority?: boolean
  imageClass?: string
  variant?: 'default' | 'weekly'
}>()

const isWeeklyVariant = computed(() => variant === 'weekly')

const cardImageClass = computed(() =>
  imageClass || (
    isWeeklyVariant.value
      ? 'h-full w-full object-cover pointer-events-none'
      : 'h-[140px] sm:h-auto aspect-[1/1] object-cover pointer-events-none'
  )
)

// Для optimized-файла важно сохранить именно исходный URL из API.
// generate-optimized-images.mjs строит директорию из исходного host/path,
// а normalizeMediaUrl() сводит разные FirstVDS URL к одному /media-s3/...
// и тем самым теряет информацию, необходимую для точного совпадения пути.
const primaryImageSource = computed(() => {
  const images = [
    product.imageSource,
    ...(product.detailImageSources || []),
    product.image,
    ...(product.detailImages || []),
  ]

  return images
    .map((image) => String(image || '').trim())
    .find(Boolean) || '/images/placeholder-product.png'
})

const primaryImage = computed(() =>
  normalizeMediaUrlOrFallback(primaryImageSource.value, '/images/placeholder-product.png')
)

const discountPercent = computed(() => {
  const current = Number(product.price || 0)
  const original = Number(product.originalPrice || 0)

  if (!original || original <= current) return 0
  return Math.max(1, Math.round(((original - current) / original) * 100))
})


const cartStore = useCartStore()

const preorderRule = computed(() => getPreorderRule(product))

const isEvolutionSingle = computed(() => isEvolutionSingleProduct(product))
const evolutionSingleBlocked = computed(() =>
  isEvolutionSingle.value &&
  (!cartStore.isLoaded || !canAddEvolutionSingle(cartStore.items)),
)
const showEvolutionSingleHint = computed(() =>
  isEvolutionSingle.value && cartStore.isLoaded && !canAddEvolutionSingle(cartStore.items),
)
const evolutionSingleDeliveryMessage = EVOLUTION_SINGLE_DELIVERY_MESSAGE

const quantityInCart = computed(() => {
  const item = cartStore.items.find(i => String(i.id) === String(product.product_id))
  return item?.quantity ?? 0
})

async function addToCartHandler() {
  await cartStore.ensureLoaded?.()
  if (isEvolutionSingle.value && !canAddEvolutionSingle(cartStore.items)) return

  await cartStore.addToCart({
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

async function incrementHandler() {
  await cartStore.ensureLoaded?.()
  if (isEvolutionSingle.value && !canAddEvolutionSingle(cartStore.items)) return
  await cartStore.updateItem(String(product.product_id), quantityInCart.value + 1)
}
function decrementHandler() {
  cartStore.updateItem(String(product.product_id), quantityInCart.value - 1)
}
</script>
