<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { Product, ProductVariant, ProductVariantItem } from '~/types/product'
import Button from '~/components/ui/Button.vue'
import ProductGallery from '~/components/product/ProductGallery.vue'
import { useCartStore } from '~/stores/cartStore'
import { isOmegaBundleSlug, OMEGA_BUNDLE_UI } from '~/constants/omegaBundles'

const props = defineProps<{
  product: Product
  name?: string
}>()
const cartStore = useCartStore()

const variants = computed(() =>
  [...(props.product.variants || [])].sort(
    (left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0),
  ),
)

const selectedVariantId = ref('')
const adding = ref(false)

const resolveDefaultVariantId = () =>
  variants.value.find((variant) => variant.is_default)?.variant_id ||
  variants.value[0]?.variant_id ||
  ''

watch(
  variants,
  (nextVariants) => {
    const selectedStillExists = nextVariants.some(
      (variant) => variant.variant_id === selectedVariantId.value,
    )

    if (!selectedStillExists) {
      selectedVariantId.value = resolveDefaultVariantId()
    }
  },
  { immediate: true },
)

const selectedVariant = computed<ProductVariant | null>(
  () =>
    variants.value.find(
      (variant) => variant.variant_id === selectedVariantId.value,
    ) || null,
)

const productId = computed(() => String(props.product.product_id || ''))
const selectedPrice = computed(() =>
  Number(selectedVariant.value?.price ?? props.product.price ?? 0),
)
const selectedOriginalPrice = computed(() => {
  const variant = selectedVariant.value
  const value = Number(
    variant?.originalPrice ??
      variant?.oldPrice ??
      props.product.originalPrice ??
      props.product.oldPrice ??
      0,
  )

  return value > selectedPrice.value ? value : 0
})

const discountPercent = computed(() => {
  if (!selectedOriginalPrice.value) return 0
  return Math.round(
    ((selectedOriginalPrice.value - selectedPrice.value) /
      selectedOriginalPrice.value) *
      100,
  )
})

const variantDiscountPercent = (variant: ProductVariant) => {
  const price = Number(variant.price || 0)
  const originalPrice = Number(variant.originalPrice || variant.oldPrice || 0)
  if (!originalPrice || originalPrice <= price) return 0

  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)

const itemName = (item: ProductVariantItem) =>
  String(item.name || '').trim()

const bundleUi = computed(() =>
  isOmegaBundleSlug(props.product.slug) ? OMEGA_BUNDLE_UI[props.product.slug] : null,
)

const omegaQuantity = (variant: ProductVariant) => {
  const omegaItem = (variant.items || []).find((item) =>
    /(?:омега|omega)/i.test(itemName(item)),
  )
  if (omegaItem) return Math.max(1, Number(omegaItem.quantity || 1))

  const variantText = `${variant.title || ''} ${variant.label || ''}`
  return /(?:^|\D)2\s*[xх×]|2\s*(?:упаков|омег)/i.test(variantText) ? 2 : 1
}

const variantImage = (variant: ProductVariant) => {
  if (!bundleUi.value) return variant.image || coverImage.value
  return omegaQuantity(variant) >= 2 ? bundleUi.value.twoImage : bundleUi.value.oneImage
}

const coverImage = computed(() => {
  const images = [...(props.product.images || [])].sort((left, right) => {
    if (left.is_primary) return -1
    if (right.is_primary) return 1
    return Number(left.display_order || 0) - Number(right.display_order || 0)
  })

  return images[0]?.image_url || ''
})

async function ensureCartLoadedOnce() {
  if (cartStore.items.length === 0) {
    try {
      await cartStore.loadCart()
    } catch {
      // Ошибка будет обработана стандартным сценарием addToCart.
    }
  }
}

async function addToCart() {
  const variant = selectedVariant.value
  if (adding.value || !productId.value || !variant?.variant_id) return

  adding.value = true

  try {
    await ensureCartLoadedOnce()
    await cartStore.addToCart({
      id: productId.value,
      variantId: variant.variant_id,
      title: `${props.product.title} — ${variant.label}`,
      subtitle: props.product.subtitle,
      price: selectedPrice.value,
      originalPrice: selectedOriginalPrice.value || undefined,
      quantity: 1,
      image: variant.image || coverImage.value,
      tag: props.product.category,
    })
  } catch (error) {
    console.warn('Bundle addToCart failed, syncing cart...', error)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

onMounted(ensureCartLoadedOnce)
</script>

<template>
  <section class="mb-8 py-5 sm:mb-10 sm:py-6 xl:py-10">
    <div class="grid items-start gap-6 md:grid-cols-2 xl:gap-10">
      <div class="min-w-0">
        <ProductGallery
          v-if="product.images?.length"
          :images="product.images"
          :has-discount="discountPercent > 0"
          fill
        />
      </div>

      <div class="flex min-w-0 flex-col">
        <h1 class="mt-2 text-2xl font-medium !leading-[3.1rem] sm:mt-0 sm:text-3xl xl:text-product">
          {{ name || product.title }}
        </h1>
        <h2 v-if="product.subtitle" class="mt-3 text-base font-medium sm:text-xl">
          {{ product.subtitle }}
        </h2>

        <p class="mt-8 whitespace-pre-line text-sm leading-relaxed sm:text-base xl:text-lg font-medium">
          {{ product.shortDescription }}
        </p>

        <p
          v-if="product.fullDescription && product.fullDescription !== product.shortDescription"
          class="mt-3 whitespace-pre-line text-sm leading-relaxed sm:text-base"
        >
          {{ product.fullDescription }}
        </p>

        <p class="w-full py-4 text-sm font-medium xs-max:text-xs">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

        <div class="flex gap-1 flex-row">
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
          <img src="/icons/rating-gold.svg" class="w-5"/>
        </div>

        <div class="flex gap-3 sm:gap-4 mt-4">
          <NuxtLink
            to="#bundle-description"
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

        <fieldset v-if="variants.length" class="mt-6">
          <legend class="text-lg font-medium sm:text-xl">Выберите набор:</legend>

          <div class="mt-3 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <label
              v-for="variant in variants"
              :key="variant.variant_id"
              class="relative min-h-[220px] cursor-pointer overflow-hidden rounded-2xl border-2 bg-[#F7F7F7] p-4 transition sm:min-h-[220px] sm:p-5"
              :class="
                selectedVariantId === variant.variant_id
                  ? 'border-primary shadow-[0_0_0_1px_#4F8EFF]'
                  : 'border-transparent hover:border-primary/35'
              "
            >
              <input
                v-model="selectedVariantId"
                type="radio"
                name="bundle-variant"
                :value="variant.variant_id"
                class="sr-only"
              >

              <span class="block text-xl font-medium leading-tight sm:text-2xl">
                {{ variant.title || `${bundleUi?.title || 'Набор'} ${omegaQuantity(variant)}` }}
              </span>

              <span class="mt-3 block w-[calc(100%-118px)] border-t border-black/15" aria-hidden="true" />

              <span class="mt-3 block min-h-[48px] pr-[112px] text-sm leading-snug sm:text-base">
                <span class="block">{{ omegaQuantity(variant) }} × Омега-3</span>
                <span class="block">1 × Daigo {{ bundleUi?.partnerName }}</span>
              </span>

              <span
                v-if="variant.giftLabel || omegaQuantity(variant) >= 2"
                class="mt-2 block pr-16 text-xs text-red-500"
              >
                {{ variant.giftLabel || '1 × Daigo Dent в подарок' }}
              </span>

              <span
                v-if="variant.benefitLabel || variantDiscountPercent(variant) > 0"
                class="mt-3 inline-flex items-center gap-1 rounded-md bg-[#0DBD27] px-2 py-1 text-xs font-medium text-white sm:text-sm"
              >
                <span aria-hidden="true">🔥</span>
                {{ variant.benefitLabel || `Выгода ${variantDiscountPercent(variant)}%` }}
              </span>
              
              <div class="mt-2 flex flex-col gap-1 absolute bottom-1">
                <div class="mt-2 flex flex-row items-center justify-center text-white gap-1.5 bg-[#16B819] rounded-md px-3 py-0.5">
                  <img src="/public/icons/fire.svg" />
                  <span>Выгода 15%</span>
                </div>
                <span class="flex flex-wrap items-baseline gap-2">
                  <span
                    v-if="Number(variant.originalPrice || variant.oldPrice || 0) > Number(variant.price)"
                    class="text-sm text-black/45 line-through"
                  >
                    {{ formatMoney(Number(variant.originalPrice || variant.oldPrice)) }} ₽
                  </span>
                  <span class="text-lg font-medium text-cgreen">
                    {{ formatMoney(Number(variant.price || 0)) }} ₽
                  </span>
                </span>
              </div>

              <span
                class="pointer-events-none absolute right-2 top-10 flex h-[142px] w-[132px] items-center justify-center sm:right-2 sm:top-11 sm:h-[154px] sm:w-[142px]"
                aria-hidden="true"
              >
                <img
                  :src="variantImage(variant)"
                  :alt="variant.title || variant.label"
                  class="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                >
              </span>
            </label>
          </div>
        </fieldset>

        <p
          v-else
          class="mt-6 rounded-xl bg-[#FFF6E8] px-4 py-3 text-sm text-[#7A4B00]"
        >
          Варианты комплектации пока не получены с сервера.
        </p>

        <div class="mt-7 flex flex-wrap items-baseline gap-3">
          <span
            v-if="selectedOriginalPrice"
            class="text-xl font-normal text-black/45 line-through sm:text-2xl"
          >
            {{ formatMoney(selectedOriginalPrice) }} ₽
          </span>
          <span class="text-3xl font-medium text-cgreen sm:text-4xl xl:text-product">
            {{ formatMoney(selectedPrice) }} ₽
          </span>
        </div>

        <div id="product-cta" class="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="solid"
            class="w-full hover:!bg-hoverbtn"
            :disabled="adding || !selectedVariant"
            @click="addToCart"
          >
            <template #icon>
              <svg class="h-5 w-5 fill-current" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M0 5a1 1 0 0 1 1-1h3a1 1 0 0 1 .97.758L5.78 8H29a1 1 0 0 1 .97 1.242l-3 12A1 1 0 0 1 26 22H8a1 1 0 0 1-.97-.758L3.22 6H1a1 1 0 0 1-1-1Zm6.28 5 2.5 10h16.44l2.5-10H6.28ZM10 26a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm14 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />
              </svg>
            </template>
            {{ adding ? 'Добавляем…' : 'В корзину' }}
          </Button>

          <a href="tel:88005552043" class="flex w-full">
            <Button variant="outline" class="w-full hover:!border-hoverbtn hover:!bg-hoverbtn hover:!text-white">
              Консультация
            </Button>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
