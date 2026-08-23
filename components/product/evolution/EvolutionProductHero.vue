<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Product } from '~/types/product'
import Button from '~/components/ui/Button.vue'
import ProductConsultationCard from '~/components/product/ProductConsultationCard.vue'
import { useCartStore } from '~/stores/cartStore'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()

/* =========================================================
   EVOLUTION GALLERY
   ========================================================= */

const gallery = [
  '/images/evolution/hero-main.webp',
  '/images/evolution/gallery-floating.webp',
  '/images/evolution/gallery-three.webp',
  '/images/evolution/gallery-hand.webp',
]

const activeImage = ref(gallery[0])

/* =========================================================
   PRODUCT DATA
   Сохраняем отдельную логику Evolution
   ========================================================= */

const productId = computed(() => {
  const product = props.product as Product & {
    id?: string | number
    uuid?: string
    productId?: string | number
  }

  const id =
    product.product_id ??
    product.id ??
    product.uuid ??
    product.productId

  return id ? String(id) : ''
})

const currentPrice = computed(() => {
  const price = Number(props.product.price)

  return Number.isFinite(price) && price > 0
    ? price
    : 9480
})

const oldPrice = computed(() => {
  const product = props.product as Product & {
    oldPrice?: number
  }

  const value = Number(
    product.originalPrice ??
    product.oldPrice ??
    0,
  )

  if (value > currentPrice.value) {
    return value
  }

  /*
   * Fallback для Evolution, пока цена не пришла с backend.
   */
  return currentPrice.value === 9480
    ? 11880
    : 0
})

const hasDiscount = computed(() => {
  return oldPrice.value > currentPrice.value
})

/*
 * У Evolution описание существует как отдельная
 * статическая секция ниже hero.
 */
const hasDescription = true

/* =========================================================
   CART
   ========================================================= */

const adding = ref(false)

const quantityInCart = computed(() => {
  return cartStore.items
    .filter(
      item =>
        String(item.id) === productId.value,
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0,
    )
})

async function ensureCartLoaded() {
  if (cartStore.items.length) {
    return
  }

  try {
    await cartStore.loadCart()
  } catch (error) {
    console.warn(
      'Evolution: loadCart failed',
      error,
    )
  }
}

async function addToCart() {
  if (
    !productId.value ||
    adding.value
  ) {
    return
  }

  adding.value = true

  try {
    await ensureCartLoaded()

    await cartStore.addToCart({
      id: productId.value as unknown as any,

      title:
        props.product.title ||
        'Метанапиток Daigo Evolution 10 + MG (12 банок)',

      subtitle: props.product.subtitle,

      price: currentPrice.value,

      originalPrice:
        oldPrice.value || undefined,

      quantity: 1,

      image: gallery[0],
    })
  } catch (error) {
    console.warn(
      'Evolution: addToCart failed, syncing cart',
      error,
    )

    try {
      await cartStore.loadCart()
    } catch {}
  } finally {
    adding.value = false
  }
}

async function incrementHandler() {
  if (
    !productId.value ||
    adding.value
  ) {
    return
  }

  adding.value = true

  try {
    await cartStore.updateItem(
      productId.value as unknown as any,
      quantityInCart.value + 1,
    )
  } catch (error) {
    console.warn(
      'Evolution: increment failed, syncing cart',
      error,
    )

    try {
      await cartStore.loadCart()
    } catch {}
  } finally {
    adding.value = false
  }
}

async function decrementHandler() {
  if (
    !productId.value ||
    adding.value
  ) {
    return
  }

  adding.value = true

  try {
    await cartStore.updateItem(
      productId.value as unknown as any,
      Math.max(
        0,
        quantityInCart.value - 1,
      ),
    )
  } catch (error) {
    console.warn(
      'Evolution: decrement failed, syncing cart',
      error,
    )

    try {
      await cartStore.loadCart()
    } catch {}
  } finally {
    adding.value = false
  }
}


onMounted(() => {
  void ensureCartLoaded()
})
</script>

<template>
  <section
    class="
      evolution-hero
      mb-2
      py-5
      sm:mb-6
      sm:py-6
      xl:mb-10
      xl:py-10
    "
  >
    <div
      class="
        flex
        flex-col
        items-start
        sm:flex-row
        sm:gap-6
        xl:gap-8
      "
    >
      <!-- ===================================================
           GALLERY
           =================================================== -->

      <div
        class="
          relative
          w-full
          sm:w-1/2
        "
      >
        <div
          class="
            overflow-hidden
            rounded-2xl
            bg-[#edf6ff]
            sm:rounded-[28px]
          "
        >
          <img
            :src="activeImage"
            alt="Daigo Evolution 10 + Mg"
            class="
              aspect-square
              w-full
              object-cover
            "
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </div>

        <div
          class="
            mt-3
            grid
            grid-cols-4
            gap-2
            sm:gap-3
          "
        >
          <button
            v-for="image in gallery"
            :key="image"
            type="button"
            class="
              overflow-hidden
              rounded-xl
              border-2
              bg-[#edf6ff]
              transition
              sm:rounded-2xl
            "
            :class="
              activeImage === image
                ? 'border-primary'
                : 'border-transparent hover:border-black/15'
            "
            @click="activeImage = image"
          >
            <img
              :src="image"
              alt=""
              class="
                aspect-[1.12/1]
                w-full
                object-cover
              "
              loading="eager"
              decoding="async"
            />
          </button>
        </div>
      </div>

      <!-- ===================================================
           PRODUCT INFO
           =================================================== -->

      <div
        class="
          flex
          w-full
          flex-col
          gap-4
          sm:w-1/2
        "
      >
        <!-- TITLE -->

        <h1
          class="
            mt-4
            mb-2
            text-2xl
            font-medium
            !leading-tight
            sm:mt-0
            sm:text-3xl
            xl:text-product
          "
        >
          Метанапиток Daigo Evolution
          10 + MG (12 банок)
        </h1>

        <!-- SUBTITLE -->

        <h2
          class="
            text-sm
            font-medium
            sm:text-lg
            xl:text-xl
          "
        >
          Функциональная поддержка до и во время насыщенного дня
        </h2>

        <!-- DESCRIPTION -->

        <p
          class="
            text-sm
            whitespace-pre-line
            sm:text-base
            xl:text-lg
          "
        >
          Когда вы знаете, что впереди интенсивный день, высокая интеллектуальная или повседневная нагрузка, организм можно поддержать заранее.
        </p>

        <p
          class="
            text-sm
            whitespace-pre-line
            sm:text-base
            xl:text-lg
          "
        >
          Evolution 10 + Mg — комплексная формула на метабиотической основе Daigo с магнием, L-теанином и витаминами B6, B9, B12 и K2. Она создана для поддержки нервной системы, энергетического обмена и внутренней среды организма в периоды повышенной нагрузки.
        </p>

        <!-- BAD NOTICE -->

        <p
          class="
            w-full
            py-4
            text-base
            font-medium
            xs-max:text-base
            sm:text-lg
          "
        >
          БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ
        </p>

        <!-- RATING -->

        <div
          class="
            flex
            flex-row
            gap-1
          "
        >
          <img
            v-for="index in 5"
            :key="index"
            src="/icons/rating-gold.svg"
            alt=""
            class="w-5"
          />
        </div>

        <!-- DESCRIPTION / REVIEWS -->

        <div
          class="
            mt-4
            flex
            gap-3
            sm:gap-4
          "
        >
          <NuxtLink
            v-if="hasDescription"
            to="#description"
            class="
              flex
              flex-row
              items-center
              gap-1
              rounded-lg
              bg-[#EEF4FF]
              px-2
              py-2
              text-sm
              transition

              hover:bg-primary
              hover:text-white

              sm:gap-2
              sm:rounded-xl
              sm:px-3
              sm:py-3

              xl:px-4
              xl:py-2
              xl:text-base
            "
          >
            <span>
              Описание товара
            </span>

            <svg
              width="10"
              height="18"
              viewBox="0 0 10 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="
                h-3
                w-3
                pt-0.5
                transition-colors
                sm:h-4
                sm:w-4
                sm:pt-0
              "
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.807884 16.943C0.74968 16.885 0.703502 16.816 0.671994 16.7401C0.640486 16.6641 0.624268 16.5827 0.624268 16.5005C0.624268 16.4183 0.640486 16.3369 0.671994 16.261C0.703502 16.1851 0.74968 16.1161 0.807884 16.058L7.86663 9.00053L0.807884 1.94303C0.749775 1.88492 0.703679 1.81594 0.67223 1.74001C0.640781 1.66409 0.624595 1.58271 0.624595 1.50053C0.624595 1.41835 0.640781 1.33698 0.67223 1.26105C0.703679 1.18513 0.749775 1.11614 0.807884 1.05803C0.865994 0.999922 0.934981 0.953825 1.0109 0.922377C1.08683 0.890928 1.1682 0.874743 1.25038 0.874743C1.33256 0.874743 1.41394 0.890928 1.48986 0.922377C1.56579 0.953825 1.63477 0.999922 1.69288 1.05803L9.19288 8.55803C9.25109 8.61609 9.29727 8.68506 9.32877 8.76099C9.36028 8.83692 9.3765 8.91832 9.3765 9.00053C9.3765 9.08274 9.36028 9.16414 9.32877 9.24007C9.29727 9.316 9.25109 9.38497 9.19288 9.44303L1.69288 16.943C1.63483 17.0012 1.56586 17.0474 1.48993 17.0789C1.414 17.1104 1.33259 17.1266 1.25038 17.1266C1.16818 17.1266 1.08677 17.1104 1.01084 17.0789C0.934911 17.0474 0.865942 17.0012 0.807884 16.943Z"
              />
            </svg>
          </NuxtLink>

          <NuxtLink
            to="/otzyvy"
            class="
              flex
              flex-row
              items-center
              gap-1
              rounded-lg
              border
              border-primary
              px-2
              py-2
              text-sm
              text-primary
              transition

              hover:border-hoverbtn
              hover:bg-hoverbtn

              sm:gap-2
              sm:rounded-xl
              sm:px-3
              sm:py-3

              xl:px-4
              xl:py-2
              xl:text-base
            "
          >
            <img
              src="/icons/star-gold.svg"
              alt=""
            />

            <span>
              Отзывы
            </span>

            <img
              src="/icons/arrow-m-primary.svg"
              alt=""
              class="
                h-3
                w-3
                pt-0.5
                sm:h-4
                sm:w-4
                sm:pt-0
              "
            />
          </NuxtLink>
        </div>

        <!-- =================================================
             PRICE
             ================================================= -->

        <div
          class="
            mt-4
            flex
            items-center
            gap-4
            text-2xl
            font-bold
          "
        >
          <span
            v-if="hasDiscount"
            class="
              text-base
              font-normal
              text-primary
              line-through
              sm:text-2xl
              xl:text-cardhead
            "
          >
            {{ oldPrice.toLocaleString('ru-RU') }} ₽
          </span>

          <span
            class="
              text-2xl
              font-medium
              text-black
              sm:text-4xl
              xl:text-product
            "
          >
            {{ currentPrice.toLocaleString('ru-RU') }} ₽
          </span>
        </div>

        <!-- =================================================
             CTA
             ================================================= -->

        <div
          id="product-cta"
          class="
            mt-3
            flex
            flex-col
            justify-between
            gap-4

            sm:mt-6
            sm:flex-row
            sm:gap-6
          "
        >
          <!-- ADD TO CART -->

          <Button
            v-if="quantityInCart === 0"
            :disabled="
              adding ||
              !productId
            "
            variant="solid"
            class="
              w-full
              disabled:opacity-60
              sm:w-[50%]
            "
            aria-label="В корзину"
            @click="addToCart"
          >
            <template #icon>
              <svg
                class="
                  h-5
                  w-5
                  fill-current
                  transition-colors
                "
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                />
              </svg>
            </template>

            {{
              adding
                ? 'Добавляем…'
                : 'В корзину'
            }}
          </Button>

          <!-- QUANTITY -->

          <div
            v-else
            class="
              flex
              h-11
              w-full
              items-center
              justify-between
              gap-2
              rounded-lg
              bg-primary
              px-2
              text-white

              sm:w-[50%]
              md:h-12
            "
          >
            <button
              type="button"
              :disabled="adding"
              class="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white/20
                disabled:opacity-60
              "
              aria-label="Уменьшить количество"
              @click="decrementHandler"
            >
              −
            </button>

            <span
              class="
                min-w-[2rem]
                text-center
              "
            >
              {{ quantityInCart }} шт
            </span>

            <button
              type="button"
              :disabled="adding"
              class="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white/20
                disabled:opacity-60
              "
              aria-label="Увеличить количество"
              @click="incrementHandler"
            >
              ＋
            </button>
          </div>
        </div>

        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <ProductConsultationCard
            :product-id="productId"
            :product-title="props.product.title || 'Метанапиток Daigo Evolution 10 + MG (12 банок)'"
          />
          <!-- Второй слот оставлен под будущий баннер с тестом. -->
        </div>
      </div>
    </div>
  </section>
</template>