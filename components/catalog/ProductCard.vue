<template>
  <NuxtLink :to="`/catalog/${product.slug}`" custom v-slot="{ navigate }">
    <article
      class="relative transition rounded-xl md:rounded-2xl shadow-pc cursor-pointer h-full flex flex-col"
      role="link"
      tabindex="0"
      @click="onOpen(navigate)"
      @keydown.enter.space="onOpen(navigate)"
      aria-label="Открыть страницу товара"
    >
      <div class="w-full overflow-hidden mb-2 md:mb-4 rounded-xl">
        <div class="w-full h-[160px] sm:h-[315px] bg-hoverbtn overflow-hidden rounded-xl" @click.stop="onOpen(navigate)">
          <template v-if="hasGallery">
            <Swiper
              class="product-card-swiper h-full"
              :slides-per-view="1"
              :space-between="0"
              :allow-touch-move="true"
              :simulate-touch="true"
              :grab-cursor="true"
              :resistance-ratio="0.85"
              :threshold="6"
              :prevent-clicks="true"
              :prevent-clicks-propagation="true"
              @swiper="onSwiper"
              @slideChange="onSlideChange"
            >
              <SwiperSlide
                v-for="(image, imageIndex) in galleryImages"
                :key="`${product.product_id}-${imageIndex}`"
                class="h-full"
              >
                <div class="w-full h-full flex items-center justify-center select-none">
                  <CatalogCardImage
                    v-if="shouldRenderImage(imageIndex)"
                    :src="image"
                    :alt="`${product.name} ${imageIndex + 1}`"
                    :width="560"
                    :height="560"
                    :class="cardImageClass"
                    :eager="priority && imageIndex === 0"
                  />
                  <div
                    v-else
                    class="h-[140px] sm:h-[280px] w-full"
                    aria-hidden="true"
                  />
                </div>
              </SwiperSlide>
            </Swiper>
          </template>

          <template v-else>
            <div class="w-full h-full flex items-center justify-center select-none">
              <CatalogCardImage
                :src="galleryImages[0] || product.image"
                :alt="product.name"
                :width="560"
                :height="560"
                :class="cardImageClass"
                :eager="priority"
              />
            </div>
          </template>
        </div>

        <div
          v-if="hasGallery"
          class="flex items-center justify-center gap-1.5 mt-2 px-2 sm:px-4"
          @click.stop
        >
          <button
            v-for="(_, imageIndex) in galleryImages"
            :key="`dot-${product.product_id}-${imageIndex}`"
            type="button"
            class="product-card-dot"
            :class="{ 'is-active': currentSlide === imageIndex }"
            :aria-label="`Показать изображение ${imageIndex + 1}`"
            @click.stop="setSlide(imageIndex)"
          />
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

        <div class="mt-auto flex flex-col items-start gap-4">
          <div class="flex flex-row sm:flex-row gap-2 sm:gap-3 items-start sm:items-center mt-2 sm:mt-0">
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
import { computed, ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import { useYtm } from '@/composables/useYtm'
import { useRoute } from '#imports'
import CatalogCardImage from '~/components/catalog/CatalogCardImage.vue'

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

const cartStore = useCartStore()

const PREORDER_IDS = new Set<string>([''])
const isPreorder = computed(() => PREORDER_IDS.has(String(product.product_id)))

const galleryImages = computed(() => {
  const seen = new Set<string>()
  const raw = [product.image, ...(product.detailImages || [])]

  return raw
    .map((image) => String(image || '').trim())
    .filter(Boolean)
    .filter((image) => {
      if (seen.has(image)) return false
      seen.add(image)
      return true
    })
})

const hasGallery = computed(() => galleryImages.value.length > 1)
const currentSlide = ref(0)
const swiperRef = ref<SwiperClass | null>(null)
const renderedIndexes = ref<number[]>([0])

watch(galleryImages, (images) => {
  renderedIndexes.value = [0]

  if (!images.length || !hasGallery.value) {
    currentSlide.value = 0
    swiperRef.value?.slideTo(0, 0)
    return
  }

  if (currentSlide.value > images.length - 1) {
    currentSlide.value = 0
    swiperRef.value?.slideTo(0, 0)
  }
}, { immediate: true })

function markSlideRendered(index: number) {
  if (!renderedIndexes.value.includes(index)) {
    renderedIndexes.value = [...renderedIndexes.value, index]
  }
}

function shouldRenderImage(index: number) {
  return renderedIndexes.value.includes(index)
}

function onSwiper(swiper: SwiperClass) {
  swiperRef.value = swiper
  currentSlide.value = swiper.activeIndex || 0
  markSlideRendered(currentSlide.value)
}

function onSlideChange(swiper: SwiperClass) {
  currentSlide.value = swiper.activeIndex || 0
  markSlideRendered(currentSlide.value)
}

function setSlide(index: number) {
  currentSlide.value = index
  markSlideRendered(index)
  swiperRef.value?.slideTo(index)
}

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
    image: product.image,
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
    image_url: product.image
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
      image_url: product.image,
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
.product-card-dot {
  width: 80%;
  height: 4px;
  border-radius: 9999px;
  background: #36486929;
  transition: all 0.2s ease;
}

.product-card-dot.is-active {
  width: 80%;
  background: #4f8eff;
}

:deep(.product-card-swiper .swiper-wrapper) {
  height: 100%;
}

:deep(.product-card-swiper .swiper-slide) {
  height: 100%;
}
</style>
