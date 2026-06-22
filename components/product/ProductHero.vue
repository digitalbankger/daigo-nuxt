<script setup lang="ts">
import type { Product } from '~/types/product'
import Button from '~/components/ui/Button.vue'
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useSummerPromoCountdown } from '~/composables/useSummerPromoCountdown'

const { product } = defineProps<{ product: Product }>()
const cartStore = useCartStore()

const hasDiscount = computed(() => product.originalPrice && product.originalPrice > product.price)

const discountPercent = computed(() => {
  const current = Number(product.price || 0)
  const original = Number(product.originalPrice || 0)

  if (!original || original <= current) return 0
  return Math.max(1, Math.round(((original - current) / original) * 100))
})

const hasSummerPromo = computed(() => discountPercent.value > 0)
const showSummerDecor = ref(true)
const { label: promoCountdownLabel } = useSummerPromoCountdown()

// ✅ строковый ID (UUID)
const productIdStr = computed(() => {
  const p: any = product
  const id = p?.product_id ?? p?.id ?? p?.uuid ?? p?.productId
  return id ? String(id) : ''
})

/** список товаров с предзаказом (можно расширять) через '3232-3232-2323' */
const PREORDER_IDS = new Set<string>([])
const isPreorder = computed(() => PREORDER_IDS.has(productIdStr.value))

const adding = ref(false)

// Картинка для корзины (primary → display_order)
const coverImageUrl = computed<string | undefined>(() => {
  const imgs = product.images || []
  if (!imgs.length) return undefined
  const sorted = [...imgs].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })
  return sorted[0]?.image_url || undefined
})

/** Кол-во в корзине */
const quantityInCart = computed(() =>
  cartStore.items
    .filter(i => String(i.id) === productIdStr.value)
    .reduce((sum, i) => sum + i.quantity, 0)
)

async function ensureCartLoadedOnce() {
  if (cartStore.items.length === 0) {
    try { await cartStore.loadCart() } catch {}
  }
}

async function addToCartHandler() {
  if (adding.value || !productIdStr.value) return
  adding.value = true
  try {
    await ensureCartLoadedOnce()
    await cartStore.addToCart({
      id: productIdStr.value as unknown as any,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: coverImageUrl.value ?? '',
      // можно передать маркер в корзину, если нужно:
      // meta: { preorder: isPreorder.value }
    })
  } catch (e) {
    console.warn('addToCart failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

async function incrementHandler() {
  if (adding.value || !productIdStr.value) return
  adding.value = true
  try {
    await cartStore.updateItem(
      productIdStr.value as unknown as any,
      (quantityInCart.value || 0) + 1
    )
  } catch (e) {
    console.warn('updateItem(+1) failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

async function decrementHandler() {
  if (adding.value || !productIdStr.value) return
  adding.value = true
  try {
    await cartStore.updateItem(
      productIdStr.value as unknown as any,
      Math.max(0, (quantityInCart.value || 0) - 1)
    )
  } catch (e) {
    console.warn('updateItem(-1) failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

const hasDescription = computed(() => {
  const sections: any[] | undefined = (product as any)?.descriptionSections
  if (!Array.isArray(sections) || sections.length === 0) return false
  return sections.some(s =>
    Array.isArray(s?.cards) &&
    s.cards.some((c: any) =>
      (c?.title && String(c.title).trim()) ||
      (c?.text && String(c.text).replace(/<[^>]+>/g, '').trim()) ||
      (c?.image && String(c.image).trim())
    )
  )
})

const hideBonusBadge = computed(() => {
  const name = (product.title || '').toLowerCase()
  return name.includes('сертификат')
})

onMounted(ensureCartLoadedOnce)
</script>

<template>
  <section class="mb-2 sm:mb-6 xl:mb-10 py-5 sm:py-6 xl:py-10">
    <div class="flex flex-col sm:flex-row sm:gap-6 xl:gap-8 items-start">
      <div class="w-full sm:w-1/2 relative">
        <ProductGallery
          v-if="product.images?.length"
          :images="product.images"
          :has-discount="Boolean(product.oldPrice && product.oldPrice > product.price)"
        />

      </div>

      <!-- Инфо -->
      <div class="w-full sm:w-1/2 flex flex-col gap-4">
        <h1 class="text-2xl sm:text-3xl xl:text-product font-medium !leading-tight mt-4 sm:mt-0 mb-2">
          {{ product.title }}
        </h1>

        <h2 class="text-sm sm:text-lg xl:text-xl font-medium">
          {{ product.subtitle }}
        </h2>

        <p class="text-sm sm:text-base xl:text-lg whitespace-pre-line">
          {{ product.shortDescription }}
        </p>

        <p class="xs-max:text-base text-base sm:text-lg font-medium py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

        <div class="flex gap-1 flex-row">
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
        </div>

        <div class="flex gap-3 sm:gap-4 mt-4">
          <NuxtLink
            v-if="hasDescription"
            to="#description"
            class="text-sm xl:text-base bg-[#EEF4FF] rounded-lg sm:rounded-xl px-2 sm:px-3 xl:px-4 py-2 sm:py-3 xl:py-2 hover:text-white hover:bg-primary transition flex flex-row items-center gap-1 sm:gap-2"
          >
            <span>Описание товара</span>
            <!-- стрелка -->
            <svg
              width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="w-3 sm:w-4 h-3 sm:h-4 transition-colors pt-0.5 sm:pt-0"
            >
              <path
                fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                d="M0.807884 16.943C0.74968 16.885 0.703502 16.816 0.671994 16.7401C0.640486 16.6641 0.624268 16.5827 0.624268 16.5005C0.624268 16.4183 0.640486 16.3369 0.671994 16.261C0.703502 16.1851 0.74968 16.1161 0.807884 16.058L7.86663 9.00053L0.807884 1.94303C0.749775 1.88492 0.703679 1.81594 0.67223 1.74001C0.640781 1.66409 0.624595 1.58271 0.624595 1.50053C0.624595 1.41835 0.640781 1.33698 0.67223 1.26105C0.703679 1.18513 0.749775 1.11614 0.807884 1.05803C0.865994 0.999922 0.934981 0.953825 1.0109 0.922377C1.08683 0.890928 1.1682 0.874743 1.25038 0.874743C1.33256 0.874743 1.41394 0.890928 1.48986 0.922377C1.56579 0.953825 1.63477 0.999922 1.69288 1.05803L9.19288 8.55803C9.25109 8.61609 9.29727 8.68506 9.32877 8.76099C9.36028 8.83692 9.3765 8.91832 9.3765 9.00053C9.3765 9.08274 9.36028 9.16414 9.32877 9.24007C9.29727 9.316 9.25109 9.38497 9.19288 9.44303L1.69288 16.943C1.63483 17.0012 1.56586 17.0474 1.48993 17.0789C1.414 17.1104 1.33259 17.1266 1.25038 17.1266C1.16818 17.1266 1.08677 17.1104 1.01084 17.0789C0.934911 17.0474 0.865942 17.0012 0.807884 16.943Z"
              />
            </svg>
          </NuxtLink>

          <NuxtLink
            to="/otzyvy"
            class="text-sm xl:text-base text-primary border border-primary rounded-lg sm:rounded-xl px-2 sm:px-3 xl:px-4 py-2 sm:py-3 xl:py-2 hover:bg-hoverbtn hover:border-hoverbtn transition flex flex-row items-center gap-1 sm:gap-2"
          >
            <img src="/icons/star-gold.svg" alt="fire" />
            <span>Отзывы</span>
            <img src="/icons/arrow-m-primary.svg" alt="arrow" class="w-3 sm:w-4 h-3 sm:h-4 pt-0.5 sm:pt-0" />
          </NuxtLink>
        </div>

        <!-- <div v-if="hasSummerPromo" class="relative mt-6 w-full">
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

          <div class="summer-ribbon relative hidden sm:block w-full overflow-visible rounded-lg px-4 py-3 mb-1">
            <div class="relative z-[1] flex flex-row gap-x-4 gap-y-1 items-center">
              <span class="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/20 px-2 py-1 text-lg font-medium text-white backdrop-blur-sm">
                -{{ discountPercent }}%
              </span>

              <div class="flex flex-col items-start text-left leading-tight my-auto w-[42%]">
                <span class="text-white/95 text-[16px] uppercase tracking-[0.1em]">
                  Летняя скидка
                </span>

                <span class="text-white/75 text-[14px] uppercase tracking-[0.06em]">
                  сгорит через
                </span>
              </div>

              <div class="summer-ribbon__timer col-span-2 text-right text-2xl font-medium text-white tabular-nums leading-none w-[38%] ms-auto">
                {{ promoCountdownLabel }}
              </div>
            </div>
          </div>

          <div class="summer-ribbon relative block w-full overflow-visible rounded-lg px-2 py-2.5 mb-1 sm:hidden">
            <div class="relative z-[1] flex flex-row gap-x-1 gap-y-1 items-center">
              <span class="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/20 px-2 py-1 text-sm font-medium text-white backdrop-blur-sm">
                -{{ discountPercent }}%
              </span>

              <div class="flex flex-col items-start text-left leading-tight my-auto w-[42%]">
                <span class="text-white/95 text-[9px] uppercase tracking-[0.1em]">
                  Летняя скидка
                </span>

                <span class="text-white/75 text-[10px] uppercase tracking-[0.16em]">
                  сгорит через
                </span>
              </div>

              <div class="summer-ribbon__timer col-span-2 text-right text-sm font-medium text-white tabular-nums leading-none w-[38%]">
                {{ promoCountdownLabel }}
              </div>
            </div>
          </div>
        </div> -->

        <div class="text-2xl mt-4 font-bold flex items-center gap-4">
          <span v-if="hasDiscount" class="text-primary line-through text-base sm:text-2xl xl:text-cardhead font-normal">
            {{ product.originalPrice?.toLocaleString() }} ₽
          </span>
          <span :class="hasDiscount ? 'text-black' : 'text-black'" class="text-2xl sm:text-4xl xl:text-product font-medium">
            {{ product.price.toLocaleString() }} ₽
          </span>
        </div>

        <!-- CTA -->
        <div id="product-cta" class="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 mt-3 sm:mt-6">
          <!-- Если товара нет — большая кнопка -->
          <div v-if="isPreorder" class="w-full sm:w-[50%] flex flex-col gap-2">
            <Button
              disabled
              variant="solid"
              class="w-full disabled:opacity-100 !bg-hoverbtn !text-black cursor-default select-none"
              aria-label="Предзаказ"
            >
              <template #icon>
                <svg class="w-5 h-5 fill-current transition-colors" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                  />
                </svg>
              </template>
              Предзаказ
            </Button>
          </div>

          <Button
            v-else-if="quantityInCart === 0"
            :disabled="adding || !productIdStr"
            variant="solid"
            class="w-full sm:w-[50%] disabled:opacity-60  hover:!bg-hoverbtn"
            @click="addToCartHandler"
            aria-label="В корзину"
          >
            <template #icon>
                <svg class="w-5 h-5 fill-current transition-colors" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                  />
                </svg>
              </template>
            В корзину
          </Button>

          <!-- Если есть в корзине — контрол + / − -->
          <div
            v-else
            class="flex items-center gap-2 bg-primary px-2 rounded-lg w-full sm:w-[50%] justify-between h-11 md:h-12 text-white"
          >
            <button type="button" :disabled="adding" @click="decrementHandler" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 disabled:opacity-60" aria-label="Уменьшить количество">−</button>
            <span class="min-w-[2rem] text-center">{{ quantityInCart }} шт</span>
            <button type="button" :disabled="adding" @click="incrementHandler" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 disabled:opacity-60" aria-label="Увеличить количество">＋</button>
          </div>

          <a href="tel:88005552043" data-ym="header-phone" class="flex w-full sm:w-[50%]">
            <Button variant="outline" class="w-full hover:!text-white hover:!bg-hoverbtn hover:!border-hoverbtn" >
                            <template #icon>
                <svg class="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M5.48171 1.99244C5.39316 1.87853 5.28138 1.78477 5.15381 1.71738C5.02624 1.64999 4.88579 1.61051 4.74178 1.60158C4.59778 1.59264 4.45353 1.61444 4.3186 1.66554C4.18367 1.71664 4.06116 1.79586 3.95921 1.89794L2.40821 3.45044C1.68371 4.17644 1.41671 5.20394 1.73321 6.10544C3.0483 9.83611 5.18494 13.2236 7.98521 16.0174C10.7791 18.8177 14.1665 20.9543 17.8972 22.2694C18.7987 22.5859 19.8262 22.3189 20.5522 21.5944L22.1032 20.0434C22.2053 19.9415 22.2845 19.819 22.3356 19.684C22.3867 19.5491 22.4085 19.4049 22.3996 19.2609C22.3906 19.1169 22.3512 18.9764 22.2838 18.8488C22.2164 18.7213 22.1226 18.6095 22.0087 18.5209L18.5482 15.8299C18.4264 15.7358 18.2849 15.6704 18.1342 15.6387C17.9835 15.607 17.8276 15.6098 17.6782 15.6469L14.3932 16.4674C13.9547 16.5763 13.4955 16.5701 13.0601 16.4495C12.6246 16.3289 12.2277 16.0979 11.9077 15.7789L8.22371 12.0934C7.90448 11.7736 7.67323 11.3767 7.55235 10.9413C7.43147 10.5059 7.42505 10.0466 7.53371 9.60794L8.35571 6.32294C8.39285 6.17352 8.39567 6.01763 8.36398 5.86696C8.33229 5.71628 8.2669 5.57474 8.17271 5.45294L5.48171 1.99244ZM2.82671 0.766942C3.0892 0.504367 3.40455 0.300638 3.75182 0.169284C4.09908 0.0379306 4.47032 -0.0180424 4.84088 0.00508205C5.21144 0.0282065 5.57284 0.129899 5.90108 0.303408C6.22932 0.476916 6.5169 0.71827 6.74471 1.01144L9.43571 4.47044C9.92921 5.10494 10.1032 5.93144 9.90821 6.71144L9.08771 9.99644C9.04558 10.1666 9.04802 10.3447 9.09479 10.5137C9.14156 10.6826 9.23107 10.8367 9.35471 10.9609L13.0402 14.6464C13.1646 14.7703 13.3189 14.86 13.4882 14.9068C13.6574 14.9535 13.8358 14.9558 14.0062 14.9134L17.2897 14.0929C17.6747 13.9973 18.0763 13.9901 18.4645 14.0719C18.8526 14.1537 19.2171 14.3225 19.5307 14.5654L22.9897 17.2564C24.2332 18.2239 24.3472 20.0614 23.2342 21.1729L21.6832 22.7239C20.5732 23.8339 18.9142 24.3214 17.3677 23.7769C13.4087 22.3858 9.81452 20.1196 6.85271 17.1469C3.88026 14.1856 1.61403 10.5919 0.222706 6.63344C-0.320294 5.08844 0.167206 3.42794 1.27721 2.31794L2.82671 0.766942Z"
                  />
                </svg>
              </template>
              Консультация
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>


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
  background-image:
    linear-gradient(115deg, transparent 22%, rgba(255,255,255,0.16) 30%, transparent 40%),
    linear-gradient(180deg, rgba(255,255,255,0.08), transparent 52%);
  opacity: 0.95;
}

.summer-ribbon__timer {
  animation: summer-ribbon-pulse 1.6s ease-in-out infinite;
}

@keyframes summer-ribbon-pulse {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.72; transform: translateY(-1px); }
}

@media (prefers-reduced-motion: reduce) {
  .summer-ribbon__timer {
    animation: none;
  }
}
</style>
