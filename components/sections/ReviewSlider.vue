<template>
  <section class="relative py-12 md:py-20">
    <!-- Заголовок + ДЕСКТОП стрелки (реальные для Swiper) -->
    <div class="relative max-w-[1310px] w-full mx-auto flex items-center justify-between mb-6">
      <h2 class="text-slider font-medium leading-tight w-9/12 md:w-full mb-2">
        Знаменитости о Дайго
      </h2>

      <div class="relative hidden md:flex gap-6 justify-center mt-6">
        <button type="button" class="nav-btn" aria-label="Предыдущий" @click="goPrev">
          <img src="/icons/arrow-left.svg" alt="prev" class="w-full" loading="lazy" />
        </button>
        <button type="button" class="nav-btn" aria-label="Следующий" @click="goNext">
          <img src="/icons/arrow-right.svg" alt="next" class="w-full" loading="lazy" />
        </button>
      </div>  
    </div>

    <!-- Слайдер -->
    <ClientOnly>
      <Swiper
        ref="swiperRef"
        :modules="[Navigation]"
        :slides-per-view="'auto'"
        :space-between="32"
        :centered-slides="true"
        :centered-slides-bounds="true"
        :initial-slide="1"
        :loop="true"
        :looped-slides="loopedSlides"
        :speed="500"
        :navigation="{
          // ВАЖНО: привязываем ТОЛЬКО к десктопным кнопкам
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }"
        lazy
        class="overflow-visible"
        @swiper="onSwiper"
      >
        <SwiperSlide
          v-for="review in reviews"
          :key="review.id"
          class="!w-full md:!w-[80%]"
        >
          <ReviewCard
            :review="review"
            @open-review="emit('open-review', review)"
          />
        </SwiperSlide>
      </Swiper>
    </ClientOnly>

    <!-- МОБИЛЬНЫЕ стрелки (прокси) — по центру под слайдером -->
    <div class="relative flex md:hidden gap-6 justify-center mt-6">
      <button type="button" class="nav-btn" aria-label="Предыдущий" @click="goPrev">
        <img src="/icons/arrow-left.svg" alt="prev" class="w-full" loading="lazy" />
      </button>
      <button type="button" class="nav-btn" aria-label="Следующий" @click="goNext">
        <img src="/icons/arrow-right.svg" alt="next" class="w-full" loading="lazy" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import type { Review } from '~/types/content'
import ReviewCard from '~/components/ReviewCard.vue'

const props = defineProps<{ reviews: Review[] }>()
const emit = defineEmits<{ (e: 'open-review', review: Review): void }>()

const swiperRef = ref<any>(null)
const swiper = ref<any>(null)

const loopedSlides = computed(() => Math.min(props.reviews?.length ?? 0, 6))

function onSwiper(instance: any) {
  swiper.value = instance
}

function goPrev() {
  swiper.value?.slidePrev()
}
function goNext() {
  swiper.value?.slideNext()
}
</script>

<style scoped>
/* Прячем дефолтные псевдоэлементы Swiper */
:global(.swiper-button-next)::after,
:global(.swiper-button-prev)::after {
  display: none !important;
}

/* Универсальные стили кастом‑кнопок */
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  user-select: none;
  cursor: pointer;
}
.nav-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
.nav-btn:active { transform: translateY(0); }

/* На мобилке активный слайд — 100% ширины (как у тебя было) */
@media (max-width: 767px) {
  :global(.swiper-slide-active) { width: 100% !important; }
}
</style>
