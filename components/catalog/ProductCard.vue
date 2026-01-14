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
    <img src="/images/new-year/head.png" class="w-16 sm:w-24 absolute -top-5 -right-4 sm:-top-8 sm:-right-6"/>
      <!-- изображение -->
      <div class="w-full h-[160px] sm:h-[315px] bg-hoverbtn flex items-center justify-center overflow-hidden mb-2 md:mb-4 rounded-xl">
        <img
          :src="product.image"
          :alt="product.name"
          :size="500"
          :width="500"
          :height="500"
          class="h-[140px] sm:h-[280px] object-contain"
          loading="lazy"
          decoding="async"
        />
        <img  
          v-if="!hideBonusBadge"
          src="/images/new-year/bonus.svg" class="h-5 sm:h-8 absolute top-8 left-0 "/>
        <p
          v-if="!hideBonusBadge"
          class="absolute top-[33px] sm:top-[34px] left-2 sm:left-4 uppercase text-transparent bg-clip-text text-[12px] sm:text-lg font-nauryz flex flex-row items-center justify-center gap-1 sm:gap-1"
          style="background-image: radial-gradient(circle, #FFED68, #FFB830);"
        >
          <span>{{ (product.price * 0.5).toFixed(0) }}</span>Б
        </p>

      </div>

      <!-- контент -->
      <div class="p-2 md:p-4 flex flex-col flex-1">
        <h3
          class="font-normal md:font-medium leading-tight mb-2 text-sm sm:text-base
                 md:text-[1.4rem]
                 line-clamp-3 sm:line-clamp-2 xs-max:min-h-[3.2rem] min-h-[3rem] md:min-h-[3.2rem]"
        >
          {{ product.name }}
        </h3>

        <p class="hidden md:block text-[clamp(0.9rem,6vw,1rem)] mb-4 text-black/70 line-clamp-2 min-h-[3rem]">
          {{ product.subtitle }}
        </p>

        <!-- низ -->
        <div class="mt-auto flex flex-col items-start gap-4">

          <div class="flex flex-col sm:flex-row gap-0 sm:gap-3 items-start sm:items-center mt-2 sm:mt-0">
            <span v-if="product.originalPrice > product.price" class="text-[#FB0C2A] line-through text-[clamp(0.8rem,3.8vw,1.2rem)] font-light">
              {{ product.originalPrice.toLocaleString() }} ₽
            </span>
            <span class="text-black text-[clamp(0.9rem,4.4vw,1.5rem)] font-medium">
              {{ product.price.toLocaleString() }} ₽
            </span>
          </div>

          <!-- кнопка -->


          <button
  v-if="quantityInCart === 0"
  type="button"
  @click.stop="addToCartHandler"
  :aria-label="isPreorder ? 'Предзаказ' : 'В корзину'"
  class="btn-cart w-full h-10 sm:h-12 flex items-center justify-center
         xs-max:text-xs text-sm sm:text-base text-white px-2 md:px-4
         rounded-lg whitespace-nowrap relative overflow-hidden"
>
  <img
    src="/icons/add-to-cart.svg"
    alt=""
    class="w-4 md:w-5 h-4 md:h-5 mr-2 shrink-0 relative z-10"
  />
  <span class="whitespace-nowrap relative z-10">
    {{ isPreorder ? 'Предзаказ' : 'В корзину' }}
  </span>
</button>

          <!-- плюс/минус -->
          <div
            v-else
            class="flex items-center gap-2 bg-[#AF1701] px-2 rounded-lg w-full justify-between h-11 md:h-12"
          >
            <button
              type="button"
              @click.stop="decrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-[#AF1701] text-white rounded-full"
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
              class="w-8 h-8 flex items-center justify-center bg-[#AF1701] text-white rounded-full"
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

const route = useRoute()
const ytm = useYtm()
const analytics = useAnalytics()

const { product, index, globalIndex, isLast } = defineProps<{
  product: ProductCard
  index?: number
  globalIndex?: number
  isLast?: boolean
}>()

const cartStore = useCartStore()

/** список предзаказных ID */
const PREORDER_IDS = new Set<string>(['old-02417fb2-3a7d-40fd-a2fd-02446eef174f'])
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
    image: product.image,
    tag: product.tag,
    // meta: { preorder: isPreorder.value } // если нужно
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

  // в list_id передаём текущий путь, в list_name — название списка
  ytm.productClick(productObj, route.path, 'Каталог')

  // ✅ Я.Метрика Enhanced Ecommerce (шаг 3 воронки: клик по товару)
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

const hideBonusBadge = computed(() => {
  const name = (product.name || '').toLowerCase()
  return name.includes('сертификат')
})

</script>

<style scoped>
.btn-cart {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: #AF1701; /* базовый цвет кнопки */
  transition: transform 0.2s ease-out, background-color 0.25s ease-out;
}

/* мягкое затемнение на hover (как у тебя) */
.btn-cart:hover {
  background-color: rgba(175, 23, 1, 0.85);
}

/* БЛИК "СТЕКЛО" — циклический, плавный */
.btn-cart::before {
  content: "";
  position: absolute;
  top: -40%;
  left: -35%;
  width: 55%;
  height: 180%;
  pointer-events: none;

  /* стеклянный блик */
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgba(255,255,255,0.0) 25%,
    rgba(255, 255, 255, 0.174) 35%,
    rgba(255,255,255,0.55) 50%,
    rgba(255, 255, 255, 0.237) 65%,
    rgba(255,255,255,0.0) 75%,
    transparent 100%
  );

  /* мягкость */
  filter: blur(1.1px);
  opacity: 0.85;

  /* наклон и старт за пределами */
  transform: translateX(-140%) skewX(-18deg);

  /* цикл */
  animation: btn-shine 3.8s ease-in-out infinite;
}

/* чтобы блик не перекрывал текст/иконки (но он и так pointer-events:none) */
.btn-cart > * {
  position: relative;
  z-index: 1;
}

/* ключевая анимация */
@keyframes btn-shine {
  0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
  10%  { opacity: 0.9; }
  50%  { opacity: 0.9; }
  90%  { opacity: 0.9; }
  100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
}

/* уважение prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .btn-cart::before {
    animation: none;
    opacity: 0;
  }
}

</style>