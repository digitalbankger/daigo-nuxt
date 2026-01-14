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
  
      <!-- изображение -->
      <div class="relative w-full h-[160px] sm:h-[315px] bg-hoverbtn flex items-center justify-center overflow-hidden mb-2 md:mb-4 rounded-xl">
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
        <img v-if="product.originalPrice > product.price" src="/icons/element.svg" class="absolute right-0 top-0 z-10 w-14 sm:w-20" />
        <div
  v-if="discountPercent !== null"
  class="absolute top-1 right-2 sm:right-3 sm:top-2 text-xs sm:text-base text-white z-20"
>
  -{{ discountPercent }}%
</div>

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
          <div class="flex flex-row gap-2 sm:gap-3 items-center">
            <span v-if="product.originalPrice > product.price" class="text-[#FB0C2A] line-through text-[clamp(0.8rem,3.8vw,1.2rem)] font-light">
              {{ product.originalPrice.toLocaleString() }} ₽
            </span>
            <span class="text-black text-[clamp(0.9rem,4.6vw,1.5rem)] font-medium">
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
            class="flex items-center gap-2 bg-[#242325] hover:bg-[#242325]/80 px-2 rounded-lg w-full justify-between h-11 md:h-12"
          >
            <button
              type="button"
              @click.stop="decrementHandler"
              class="w-8 h-8 flex items-center justify-center bg-[#242325] text-white rounded-full"
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
              class="w-8 h-8 flex items-center justify-center bg-[#242325] text-white rounded-full"
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
const ytm = useYtm()

const hasDiscount = computed(() => product.oldPrice && product.oldPrice > product.price)

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

const discountPercent = computed(() => {
  const orig = product.originalPrice
  const price = product.price

  if (!orig || orig <= price) return null

  const percent = ((orig - price) / orig) * 100

  return Math.round(percent) // округление до целого числа
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
  ytm.productClick({
    id: product.product_id ?? product.product_id,
    name: product.name,
    price: Number(product.price) || 0,
    category: product.tag
  }, 'catalog')
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
.btn-cart {
  position: relative;
  overflow: hidden;
  color: #fff;

  /* узкий блик + много чёрного по краям */
  background: linear-gradient(
    60deg,
    #242325 0%,
    #242325 30%,
    #642e36 42%,
    #bc1429 50%,   /* яркий узкий блик */
    #670307 56%,   /* узкая тёмно-красная зона */
    #242325 70%,
    #242325 100%
  );

  /* делаем полотно чуть шире для движения */
  background-size: 160% 100%;

  /* СТАРТ: ближе к ПРАВОЙ части */
  background-position: 20% 50%;

  transition:
    background-position 0.45s ease-out,
    transform 0.2s ease-out;
}

/* ХОВЕР: двигаем полотно ВЛЕВО */
.btn-cart:hover {
  /* меньше X → реальное движение влево */
  background-position: -35% -50%;
  transform: translateY(-1px);
}



</style>