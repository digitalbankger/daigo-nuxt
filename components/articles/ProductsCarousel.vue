<template>
  <section v-if="resolvedProducts.length" class="py-6 md:py-8">
    <div class="container">
      <h2 class="text-3xl md:text-product font-medium mb-12">{{ title }}</h2>

      <ClientOnly>
        <Swiper
          :modules="[SwiperNavigation, SwiperPagination]"
          :slides-per-view="2"
          :space-between="16"
          :navigation="{
            prevEl: '.swiper-button-prev-products',
            nextEl: '.swiper-button-next-products'
          }"
          :breakpoints="{
            0:    { slidesPerView: 2, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 24 }
          }"
          class="products-carousel"
        >
          <SwiperSlide v-for="(p, i) in resolvedProducts" :key="p.product_id || p.id || i">
            <!-- карточка каталога (твоя) -->
            <ProductCard
              :product="p"
              :global-index="i"
            />
          </SwiperSlide>
        </Swiper>

        <!-- Кастомные стрелки (только классы для Swiper, без @click) -->
        <div class="flex items-center justify-center gap-6 w-full mt-5">
          <button
            class="swiper-button-prev-products w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Назад"
            type="button"
          >
            <img src="/icons/arrow-left.svg" alt="" class="w-full" />
          </button>
          <button
            class="swiper-button-next-products w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Вперёд"
            type="button"
          >
            <img src="/icons/arrow-right.svg" alt="" class="w-full" />
          </button>
        </div>

        <!-- при желании можно включить точки -->
        <!-- <div class="products-pagination mt-4 flex justify-center"></div> -->
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import { useProductsByIds } from '~/composables/useProductsByIds'

// ВАЖНО: переименовываем модули, чтобы не конфликтовали с локальными константами
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation as SwiperNavigation, Pagination as SwiperPagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import ProductCard from '~/components/catalog/ProductCard.vue'

const props = defineProps({
  title: { type: String, default: 'Рекомендуемые товары' },
  productIds: { type: Array as PropType<(string | number)[]>, default: () => [] },
  // fallback — уже готовые ProductCard на случай, если ids пусты
  fallback: { type: Array as PropType<ProductCard[]>, default: () => [] }
})

// тянем товары как в отзывах
const { items: itemsByIds } = useProductsByIds(computed(() => props.productIds))

// единый источник данных
const resolvedProducts = computed<ProductCard[]>(() => {
  if (itemsByIds.value?.length) return itemsByIds.value
  return props.fallback || []
})
</script>

<style scoped>
.products-carousel { width: 100%; }

/* прячем дефолтные стрелки Swiper */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  display: none;
}

/* 2 карточки на мобиле — ПЕРЕБИВАЕМ правило .swiper-slide-active { width:100%!important } */
.products-carousel :deep(.swiper-slide),
.products-carousel :deep(.swiper-slide-active) {
  width: calc((100% - 16px) / 2) !important;  /* 2 на ряд, с учётом gap=16 */
  flex: 0 0 auto;
}

/* ≥640px — тоже 2 */
@media (min-width: 640px) {
  .products-carousel :deep(.swiper-slide),
  .products-carousel :deep(.swiper-slide-active) {
    width: calc((100% - 16px) / 2) !important;
  }
}

/* ≥1024px — 3 */
@media (min-width: 1024px) {
  .products-carousel :deep(.swiper-slide),
  .products-carousel :deep(.swiper-slide-active) {
    width: calc((100% - 2 * 20px) / 3) !important;
  }
}

/* ≥1280px — 4 */
@media (min-width: 1280px) {
  .products-carousel :deep(.swiper-slide),
  .products-carousel :deep(.swiper-slide-active) {
    width: calc((100% - 3 * 24px) / 4) !important;
  }
}

</style>
