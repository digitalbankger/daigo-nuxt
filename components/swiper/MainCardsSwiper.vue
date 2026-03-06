<script setup lang="ts">
import { Pagination, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import MainCard from '~/components/swiper/MainCard.vue'

import 'swiper/css'
import 'swiper/css/pagination'

type Slide = {
  to: string
  title: string
  subtitle?: string
  image: string
  imageMobile?: string
  variant: 'circle-product' | 'hearts' | 'boxes'
  circleImage?: string
  circleImageMobile?: string
  mobileBreakAfterWord?: string
  contentClass?: string
  titleClass?: string
  subtitleClass?: string
}

const slides: Slide[] = [
  // {
  //   to: '/articles/kak-mikroflora-sozdaet-garmoniyu-v-otnosheniyah-i-pochemu-ey-nuzhna-zabota',
  //   variant: 'circle-product',
  //   title: 'Интимное здоровье мужчин — упущенное звено',
  //   subtitle: 'Узнайте как привнести гармонию в отношения через заботу о своем партнере',
  //   image: '/images/feb/md23-1.jpg',
  //   imageMobile: '/images/feb/mm23-1.jpg',
  //   // circleImage: '/images/love/card-1-circle.png',
  //   // circleImageMobile: '/images/love/card-1-circle.png',
  //   contentClass:
  //     'relative z-[3] flex flex-col items-start justify-start sm:justify-center gap-4 ' +
  //     'h-[420px] sm:h-[360px] lg:h-[500px] w-full sm:w-[600px] ' +
  //     'px-6 md:px-10 py-6 md:py-12 gap-2 ' +
  //     'rounded-2xl sm:rounded-4xl',
  //   titleClass:
  //     'text-white font-haido font-bold leading-[1] ' +
  //     'text-[clamp(1.8rem,4vw,2.6rem)]',

  // },
  {
    to: '/catalog',
    variant: 'hearts',
    title: 'Время заботы о себе',
    subtitle: 'Поддержка внутреннего баланса \nдля вашей устойчивости каждый день.',
    image: '/images/feb/8md.jpg',
    imageMobile: '/images/feb/8mm.jpg',
    contentClass:
      'relative z-[3] flex flex-col items-start justify-end sm:justify-center ' +
      'h-[420px] sm:h-[360px] lg:h-[500px] w-full sm:w-[580px] ' +
      'px-4 md:px-10 py-6 md:py-12 gap-2 ' +
      'rounded-2xl sm:rounded-4xl',
    titleClass:
      'text-white font-haido font-bold leading-[1] ' +
      'text-[clamp(2.2rem,4.4vw,4.2rem)] sm:-mt-4 ',
    subtitleClass:
      'text-white font-haido font-medium leading-snug mb-2 sm:mb-2 w-full sm:w-[580px] mt-2 sm:mt-6 ' +
      'text-[clamp(0.9rem,2.2vw,1.875rem)]',
  },
  {
    to: '/womens-day',
    variant: 'hearts',
    title: '',
    subtitle: '',
    image: '/images/women/8md-2.jpg',
    imageMobile: '/images/women/8mm-2.jpg',
    contentClass:
      'relative z-[3] flex flex-col items-start justify-end sm:justify-center ' +
      'h-[420px] sm:h-[360px] lg:h-[500px] w-full sm:w-[580px] ' +
      'px-4 md:px-10 py-6 md:py-12 gap-2 ' +
      'rounded-2xl sm:rounded-4xl',
    titleClass:
      'text-white font-haido font-bold leading-[1] ' +
      'text-[clamp(2.2rem,4.4vw,4.2rem)] sm:-mt-4 ',
    subtitleClass:
      'text-white font-haido font-medium leading-snug mb-2 sm:mb-2 w-full sm:w-[580px] mt-2 sm:mt-6 ' +
      'text-[clamp(0.9rem,2.2vw,1.875rem)]',
  },
  // {
  //   to: '/catalog?podarochnye=nabory&page=1',
  //   variant: 'boxes',
  //   title: 'Потратьте бонусы на любимых!',
  //   subtitle: 'Премиальные подарочные наборы для самых близких!',
  //   image: '/images/feb/md23-3.jpg',
  //   imageMobile: '/images/feb/mm23-3.jpg',
  //   mobileBreakAfterWord: 'Потратьте ',
  // },
]
</script>

<template>
  <ClientOnly>
    <Swiper
    :modules="[Pagination, Autoplay]"
    :slides-per-view="1"
    :space-between="16"
    :pagination="{ clickable: true }"
    :autoplay="{ delay: 4500, disableOnInteraction: false }"
    :loop="true"

    :speed="1100"              
    :touch-ratio="0.9"        
    :grab-cursor="true"
    :watch-slides-progress="true"
    class="w-full"
    >

      <SwiperSlide v-for="(s, i) in slides" :key="i">
        <MainCard
          :to="s.to"
          :variant="s.variant"
          :title="s.title"
          :subtitle="s.subtitle"
          :image="s.image"
          :imageMobile="s.imageMobile"
          :circleImage="s.circleImage"
          :circleImageMobile="s.circleImageMobile"
          :mobileBreakAfterWord="s.mobileBreakAfterWord"

          :contentClass="s.contentClass"
          :titleClass="s.titleClass"
          :subtitleClass="s.subtitleClass"
        />
      </SwiperSlide>
    </Swiper>
  </ClientOnly>
</template>

<style scoped>
:deep(.swiper-wrapper) {
  transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1) !important;
}

/* опционально: точки пагинации чуть аккуратнее */
:deep(.swiper-pagination-bullet) {
  opacity: 0.25;
}
:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background-color: #fff;
}
</style>
