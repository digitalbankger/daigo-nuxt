<template>
  <NuxtLink :to="`/catalog/${product.slug}`" custom v-slot="{ navigate }">
    <article
      class="relative transition rounded-xl md:rounded-2xl shadow-pc cursor-pointer
             h-full flex flex-col" 
      role="link"
      tabindex="0"
      @click="navigate"
      @keydown.enter.space="navigate"
      aria-label="Открыть страницу товара"
    >
      <!-- изображение -->
      <div
        class="w-full h-[160px] sm:h-[315px] bg-hoverbtn flex items-center justify-center overflow-hidden mb-2 md:mb-4 rounded-xl"
      >
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

        <p
          class="hidden md:block text-[clamp(0.9rem,6vw,1rem)] mb-4 text-black/70
                 line-clamp-2 min-h-[3rem]"
        >
          {{ product.subtitle }}
        </p>

        <div class="mt-auto flex flex-col items-start gap-4">
          <p class="font-medium leading-tight text-[clamp(1rem,5vw,1.4rem)]">
            {{ product.price.toLocaleString() }} ₽
          </p>

          <!-- КНОПКА ПРЕДЗАКАЗА ДЛЯ КОНКРЕТНОГО ТОВАРА -->
          <button
            v-if="isPreorder"
            type="button"
            @click.stop="preorderHandler"
            class="w-full h-10 sm:h-12 flex items-center justify-center bg-primary xs-max:text-xs text-sm sm:text-base text-white px-2 md:px-4 rounded-lg whitespace-nowrap"
          >
            <img src="/icons/add-to-cart.svg" alt="" class="w-4 md:w-5 h-4 md:h-5 mr-2 shrink-0" />
            <span class="whitespace-nowrap">Предзаказ</span>
          </button>

          <!-- если товара нет в корзине – обычная кнопка -->
          <button
            v-else-if="quantityInCart === 0"
            type="button"
            @click.stop="addToCartHandler"
            class="w-full h-10 sm:h-12 flex items-center justify-center bg-primary xs-max:text-xs text-sm sm:text-base text-white px-2 md:px-4 rounded-lg whitespace-nowrap"
          >
            <img src="/icons/add-to-cart.svg" alt="" class="w-4 md:w-5 h-4 md:h-5 mr-2 shrink-0" />
            <span class="whitespace-nowrap">В корзину</span>
          </button>

          <!-- если товар уже есть – блок с плюс/минус -->
          <div
            v-else
            class="flex items-center gap-2 bg-primary px-2 rounded-lg w-full justify-between h-11 md:h-12"
          >
            <button
              type="button"
              @click.stop="decrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
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
              class="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
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
import { navigateTo } from '#imports'

const { product, index, globalIndex, isLast } = defineProps<{
  product: ProductCard
  index?: number
  globalIndex?: number
  isLast?: boolean
}>()

const PREORDER_ID = '02417fb2-3a7d-40fd-a2fd-02446eef174f'
const isPreorder = computed(() => String(product.product_id) === PREORDER_ID)

const cartStore = useCartStore()

const quantityInCart = computed(() => {
  const item = cartStore.items.find(i => String(i.id) === String(product.product_id))
  return item?.quantity ?? 0
})

function preorderHandler() {
  navigateTo({ path: '/preorder', query: { product: String(product.product_id) } })
}

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

function incrementHandler() {
  cartStore.updateItem(String(product.product_id), quantityInCart.value + 1)
}

function decrementHandler() {
  cartStore.updateItem(String(product.product_id), quantityInCart.value - 1)
}
</script>
