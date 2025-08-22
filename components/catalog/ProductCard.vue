<template>
  <NuxtLink :to="`/catalog/${product.slug}`" custom v-slot="{ navigate }">
    <article
      class="relative transition rounded-2xl shadow-pc cursor-pointer"
      role="link"
      tabindex="0"
      @click="navigate"
      @keydown.enter.space="navigate"
      aria-label="Открыть страницу товара"
    >
      <!-- изображение с lazyloading -->
      <div
        class="w-full h-[315px] bg-hoverbtn flex items-center justify-center overflow-hidden mb-4 rounded-xl"
        :class="{ 'h-[462px]': globalIndex === 0 || isLast }"
      >
        <NuxtImg
          :src="product.image"
          :alt="product.name"
          width="500"
          height="500"
          class="object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="p-4">
        <h3
          class="font-medium leading-tight mb-2 text-[clamp(1rem,6vw,1.4rem)]"
          :class="{ 'text-[clamp(2rem,6vw,2.8rem)]': globalIndex === 0 || isLast }"
        >
          {{ product.name }}
        </h3>
        <p
          class="text-[clamp(0.9rem,6vw,1rem)] mb-4 text-black/70"
          :class="{ 'text-[clamp(1rem,6vw,1.25rem)]': globalIndex === 0 || isLast }"
        >
          {{ product.subtitle }}
        </p>

        <div class="flex flex-col items-start gap-4">
          <p class="font-medium leading-tight text-[clamp(1rem,6vw,1.4rem)]">
            {{ product.price.toLocaleString() }} ₽
          </p>

          <!-- если товара нет в корзине – обычная кнопка -->
          <button
            v-if="quantityInCart === 0"
            type="button"
            @click.stop="addToCartHandler"
            class="w-full flex items-center justify-center bg-primary text-white px-4 py-3 rounded-lg"
          >
            <img src="/icons/add-to-cart.svg" alt="" class="w-5 h-5 mr-2" />
            В корзину
          </button>

          <!-- если товар уже есть – блок с плюс/минус -->
          <div v-else class="flex items-center gap-2 bg-primary p-2 rounded-lg w-full justify-between">
            <button
              type="button"
              @click.stop="decrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
              aria-label="Уменьшить количество"
            >
              <img src="/icons/decrement.svg" alt="Уменьшить количество" class="w-5 h-5" />
            </button>
            <span class="min-w-[2rem] text-center text-white">
              {{ quantityInCart }}
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

// Получаем пропсы и сразу деструктурируем product, чтобы он был в области видимости
const { product, index, globalIndex, isLast } = defineProps<{
  product: ProductCard
  index?: number
  globalIndex?: number
  isLast?: boolean
}>()

const cartStore = useCartStore()

// вычисляем, сколько этого товара уже в корзине
const quantityInCart = computed(() => {
  const item = cartStore.items.find(i => i.id === product.id)
  return item?.quantity ?? 0
})

// добавить товар (первое нажатие)
function addToCartHandler() {
  cartStore.addToCart({
    id: product.id,
    title: product.name,
    subtitle: product.subtitle,
    price: product.price,
    oldPrice: product.oldPrice,
    quantity: 1,
    image: product.image,
    tag: product.tag,
  })
}

// увеличить количество
function incrementHandler() {
  cartStore.updateItem(product.id, quantityInCart.value + 1)
}

// уменьшить количество (если станет 0 – товар будет удалён)
function decrementHandler() {
  cartStore.updateItem(product.id, quantityInCart.value - 1)
}
</script>
