<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import { useCartStore } from '~/stores/cartStore'
import { OMEGA_BUNDLE_SLUGS, OMEGA_BUNDLE_UI, type OmegaBundleSlug } from '~/constants/omegaBundles'
import type { ProductVariant } from '~/types/product'

type BundleCard = { product_id: string | number; slug: OmegaBundleSlug; category?: string; variants: ProductVariant[] }
type Direction = { slug: OmegaBundleSlug; label: string }

const props = withDefaults(defineProps<{ mode?: 'all' | 'upgrade'; compact?: boolean }>(), { mode: 'all', compact: false })
const cartStore = useCartStore()
const products = ref<BundleCard[]>([])
const pending = ref(true)
const addingKey = ref('')
const swiper = ref<SwiperInstance | null>(null)
const activeDirection = ref<OmegaBundleSlug>('dvizhenie-mysli')

const directions: Direction[] = [
  { slug: 'dvizhenie-mysli', label: 'Фокус' },
  { slug: 'obnovlenie-kozhi', label: 'Кожа' },
  { slug: 'svoboda-dvizheniya', label: 'Движение' },
]
const formatMoney = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
const omegaQuantity = (variant: ProductVariant) => {
  const item = (variant.items || []).find(({ name }) => /(?:омега|omega)/i.test(String(name || '')))
  if (item) return Math.max(1, Number(item.quantity || 1))
  return /(?:^|\D)2\s*[xх×]|2\s*(?:упаков|омег)/i.test(`${variant.title || ''} ${variant.label || ''}`) ? 2 : 1
}

const offers = computed(() => products.value.flatMap((product) => {
  const ui = OMEGA_BUNDLE_UI[product.slug]
  return [...(product.variants || [])]
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .filter((variant) => props.mode === 'all' || omegaQuantity(variant) >= 2)
    .map((variant) => ({ product, variant, ui, omegaCount: omegaQuantity(variant), image: omegaQuantity(variant) >= 2 ? ui.twoImage : ui.oneImage }))
}))

const setSwiper = (instance: SwiperInstance) => { swiper.value = instance }
const syncDirection = (instance: SwiperInstance) => {
  const offer = offers.value[instance.realIndex]
  if (offer) activeDirection.value = offer.product.slug
}
const selectDirection = async (slug: OmegaBundleSlug) => {
  activeDirection.value = slug
  await nextTick()
  const index = offers.value.findIndex(({ product }) => product.slug === slug)
  if (index >= 0) swiper.value?.slideTo(index)
}

async function loadOffers() {
  pending.value = true
  try {
    const result = await Promise.all(OMEGA_BUNDLE_SLUGS.map(async (slug) => {
      try { return { ...await $fetch<BundleCard>(`/api/shop/products/${slug}/card`), slug } }
      catch { return null }
    }))
    products.value = result.filter((item): item is BundleCard => Boolean(item?.product_id))
  } finally { pending.value = false }
}

async function addOffer(offer: typeof offers.value[number]) {
  const key = `${offer.product.product_id}:${offer.variant.variant_id}`
  if (addingKey.value) return
  addingKey.value = key
  try {
    const price = Number(offer.variant.price || 0)
    const originalPrice = Number(offer.variant.originalPrice || offer.variant.oldPrice || 0)
    await cartStore.addToCart({ id: offer.product.product_id, variantId: offer.variant.variant_id, title: `${offer.ui.title} — ${offer.variant.title || offer.variant.label}`, price, originalPrice: originalPrice > price ? originalPrice : undefined, quantity: 1, image: offer.image, tag: offer.product.category || 'bundle' })
  } finally { addingKey.value = '' }
}

onMounted(loadOffers)
</script>

<template>
  <div class="min-w-0">
    <div v-if="mode === 'all' && !pending" class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Направление набора">
      <button v-for="direction in directions" :key="direction.slug" type="button" role="tab" :aria-selected="activeDirection === direction.slug" class="rounded-md sm:rounded-lg border px-2 py-1 sm:py-2 text-xs transition sm:px-4 sm:text-base" :class="activeDirection === direction.slug ? 'border-primary bg-primary text-white' : 'border-[#D8E3F0] bg-white text-black/65 hover:border-primary hover:text-primary'" @click="selectDirection(direction.slug)">{{ direction.label }}</button>
    </div>

    <div v-if="pending" class="flex gap-3 overflow-hidden" aria-label="Загружаем варианты наборов">
      <div v-for="index in mode === 'upgrade' ? 2 : 2" :key="index" class="h-44 min-w-[82%] animate-pulse rounded-2xl bg-[#F3F6FA] sm:min-w-[48%]" />
    </div>

    <div v-else-if="offers.length" class="relative min-w-0">
      <Swiper :slides-per-view="1.08" :space-between="12" :slides-per-group="1" :breakpoints="{ 640: { slidesPerView: 2, slidesPerGroup: mode === 'all' ? 2 : 1, spaceBetween: 12 } }" @swiper="setSwiper" @slide-change="syncDirection">
        <SwiperSlide v-for="offer in offers" :key="`${offer.product.product_id}:${offer.variant.variant_id}`" class="h-auto">
          <article class="group flex h-full flex-col overflow-hidden rounded-2xl bg-hoverbtn p-3 transition hover:border-primary/50 hover:shadow-[0_12px_28px_rgba(56,107,170,0.10)] sm:p-4">
            <div class="flex min-h-[84px] sm:min-h-[104px] gap-2 sm:gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium leading-tight sm:text-base">{{ offer.ui.title }}</p>
                <div class="mt-2 text-xs leading-snug text-black/65 sm:text-sm"><p>{{ offer.omegaCount }} × Омега-3</p><p>1 × Daigo {{ offer.ui.partnerName }}</p></div>
                <p v-if="offer.omegaCount >= 2" class="mt-2 text-[11px] font-medium text-[#F0182D] sm:text-xs">+ Daigo Dent в подарок</p>
              </div>
              <img :src="offer.image" :alt="`${offer.ui.title}: ${offer.omegaCount} упаковки Омега-3 и ${offer.ui.partnerName}`" class="h-20 w-20 shrink-0 object-contain sm:h-28 sm:w-28" loading="lazy" decoding="async">
            </div>
            <div class="mt-2 flex flex-row items-center justify-center text-sm sm:text-base text-white gap-1.5 bg-[#16B819] rounded-md px-3 py-0.5 w-[fit-content]">
              <img src="/public/icons/fire.svg" />
              <span>Выгода 15%</span>
            </div>
            <div class="mt-1 flex items-end justify-between gap-2">
              <div class="flex flex-col items-start">
                <span v-if="Number(offer.variant.originalPrice || offer.variant.oldPrice || 0) > Number(offer.variant.price || 0)" class="text-xs text-black/40 line-through">{{ formatMoney(Number(offer.variant.originalPrice || offer.variant.oldPrice)) }} ₽</span>
                <span class="text-base font-medium text-cgreen sm:text-lg">{{ formatMoney(Number(offer.variant.price || 0)) }} ₽</span>
              </div>
              <button type="button" class="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-xs text-white transition hover:bg-hoverbtn hover:text-[#222] disabled:cursor-wait disabled:opacity-60 sm:text-sm" :disabled="Boolean(addingKey)" @click="addOffer(offer)">{{ addingKey === `${offer.product.product_id}:${offer.variant.variant_id}` ? 'Добавляем…' : 'Добавить' }}</button>
            </div>
          </article>
        </SwiperSlide>
      </Swiper>

      <div class="flex items-center justify-end gap-2 absolute right-0 top-0 -mt-10 sm:-mt-10" v-if="offers.length > 1">
        <button type="button" class="flex h-5 sm:h-7 w-5 sm:w-7 items-center justify-center rounded-full transition hover:opacity-70" aria-label="Предыдущие наборы" @click="swiper?.slidePrev()"><img src="/icons/arrow-left.svg" alt="" class="h-4 sm:h-6 w-4 sm:w-6"></button>
        <button type="button" class="flex h-5 sm:h-7 w-5 sm:w-7 items-center justify-center rounded-full transition hover:opacity-70" aria-label="Следующие наборы" @click="swiper?.slideNext()"><img src="/icons/arrow-right.svg" alt="" class="h-4 sm:h-6 w-4 sm:w-6"></button>
      </div>
    </div>
  </div>
</template>
