<template>
  <div class="relative py-10">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-slider font-medium">Знаменитости о Дайго</h2>
      <div class="flex gap-2">
        <button class="swiper-button-prev">
          <img src="/icons/arrow-left.svg" alt="prev" class="w-full" />
        </button>
        <button class="swiper-button-next">
          <img src="/icons/arrow-right.svg" alt="next" class="w-full" />
        </button>
      </div>
    </div>

    <Swiper
      ref="swiperRef"
      :modules="[Navigation]"
      :slides-per-view="'auto'"
      :space-between="32"
      :centered-slides="true"
      :centered-slides-bounds="true"
      :initial-slide="1"
      :loop="true"
      :looped-slides="reviews.length"
      :speed="500"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      } as NavigationOptions"
      lazy
      class="overflow-visible"
    >
      <SwiperSlide
        v-for="review in reviews"
        :key="review.id"
        class="md:!w-[80%]"
      >
        <ReviewCard :review="review" />
      </SwiperSlide>
    </Swiper>

  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import type { Review } from '~/types/content'
import ReviewCard from '~/components/ReviewCard.vue'
import type { NavigationOptions } from 'swiper/types'
defineProps<{ reviews: Review[] }>()

const swiperRef = ref()

onMounted(() => {
  nextTick(() => {
    swiperRef.value?.swiper?.update()
  })
})

</script>

<style scoped>
.swiper-button-next::after,
.swiper-button-prev::after {
  display: none !important;
  content: none !important;
}
.swiper-button-prev, .swiper-button-next {
  top: 84px;
  justify-content: flex-end;
}
.swiper-button-prev {
  left: auto;
  right: 40px;
}
.swiper-button-next {
  right: 0;
}
.swiper-slide-active {
  width: 80% !important;
}
</style>