<template>
  <div class="relative py-0">
    <div class="relative max-w-[1310px] w-full mx-auto flex items-center justify-between mb-6">
      <h2 class="text-slider font-medium leading-tight mb-2 md:mb-6">Награды и сертификаты</h2>
      <div class="flex gap-2">
        <button class="swiper-button-prev">
          <img src="/icons/arrow-left.svg" alt="prev" class="w-full" />
        </button>
        <button class="swiper-button-next">
          <img src="/icons/arrow-right.svg" alt="next" class="w-full" />
        </button>
      </div>
    </div>

    <div class="relative !pl-[0%] md:!pl-[8%]">
      <!-- Слайдер -->
      <Swiper
        ref="swiperRef"
        :modules="[Navigation]"
        :space-between="32"
        :loop="false"
        :speed="500"
        :navigation="{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        } as NavigationOptions"
        :breakpoints="{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 1.3 },
          1024: { slidesPerView: 2 },
          1280: { slidesPerView: 2 }
        }"
        class="overflow-visible"
        @slideChange="({ realIndex }) => currentSlide = realIndex"
      >
        <SwiperSlide
          v-for="(reward, index) in rewards"
          :key="index"
          class="h-auto mb-5"
        >
          <RewardCard :reward="reward" />
        </SwiperSlide>
      </Swiper>

      <!-- Пагинация-полоски (как в партнёрах) -->
      <div class="flex gap-2 absolute bottom-0 right-0 md:right-0 z-20">
        <div
          v-for="(_, i) in rewards.length"
          :key="i"
          class="h-[2.5px] md:h-[3px] w-8 md:w-16 rounded-full transition-colors"
          :style="{
            backgroundColor: i === currentSlide ? '#303030CC' : '#3030301A'
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import type { Review } from '~/types/content'
import RewardCard from '~/components/RewardCard.vue'
import type { NavigationOptions } from 'swiper/types'

defineProps<{ reviews: Review[] }>()
const emit = defineEmits<{ (e: 'open-review', review: Review): void }>()

const swiperRef = ref()
const currentSlide = ref(0) // ← добавили

const rewards = [
  {
    image: '/images/sert1.png',
    logo: '/images/sert-logo1.png',
    name: 'Благодарность',
    about: 'АНО ЦПМС «МногоМама» ведет ежедневную и ежечасную работу, помогая многодетным семьям России!',
    description: 'Благодарность за предоставление продукции компании для наших 6000 подопечных'
  },
  {
    image: '/images/sert2.png',
    logo: '/images/sert-logo-2.png',
    name: 'Благодарственное письмо',
    about: 'АВТОНОМНАЯ НЕКОММЕРЧЕСКАЯ ОРГАНИЗАЦИЯ СОЦИАЛЬНОЙ ПОМОЩИ СЕМЬЕ И ДЕТЯМ',
    description: 'Благодарность за участие в акции'
  }
]

onMounted(() => {
  nextTick(() => {
    swiperRef.value?.swiper?.update()
    currentSlide.value = swiperRef.value?.swiper?.realIndex ?? 0 // стартовое значение, как в партнёрах
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
  top: 50px;
  justify-content: flex-end;
}
.swiper-button-prev {
  left: auto;
  right: 40px;
}
.swiper-button-next {
  right: 0;
}
</style>
