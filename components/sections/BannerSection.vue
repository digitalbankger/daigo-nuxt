<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import { ref, computed } from 'vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type { Banner } from '~/types/content'

const props = defineProps<{ banners: Banner[] }>()

const activeIndex = ref(0)
const swiperRef = ref<SwiperInstance | null>(null)

const setSwiper = (swiper: SwiperInstance) => { swiperRef.value = swiper }
const hasMultiple = computed(() => Array.isArray(props.banners) && props.banners.length > 1)

const goToSlide = (index: number) => {
  if (!swiperRef.value) return
  if (hasMultiple.value) swiperRef.value.slideToLoop(index)
  else swiperRef.value.slideTo(index)
}

const defaultTagColor = '#E6F4FF'
const hasTags = (b: Banner) => Array.isArray(b?.tags) && b.tags.length > 0
</script>

<template>
  <section v-if="Array.isArray(banners) && banners.length" class="relative w-full overflow-hidden">
    <Swiper
      :modules="[Autoplay]"
      :autoplay="hasMultiple ? { delay: 10000 } : false"
      :space-between="20"
      :loop="hasMultiple"
      :allow-touch-move="hasMultiple"
      @swiper="setSwiper"
      @slideChange="(swiper) => activeIndex = swiper.realIndex"
      class="rounded-3xl"
    >
      <SwiperSlide
        v-for="banner in banners"
        :key="banner.id"
        class="banner-slide flex flex-col sm:flex-row items-center justify-between
               px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-16 rounded-xl
               bg-cover bg-right-bottom text-white
               h-[420px] sm:h-[360px] lg:h-[500px]"
        :style="{
          // по умолчанию (>= lg) — десктоп
          backgroundImage: 'var(--bg-desktop)',
          '--bg-desktop': `url(${banner.imageDesktop ?? banner.image})`,
          // планшет (sm..lg)
          '--bg-tablet':  `url(${(banner as any).imageTablet ?? banner.imageDesktop ?? banner.image})`,
          // мобильный (< sm)
          '--bg-mobile':  `url(${banner.imageMobile ?? banner.image})`,
          // высоты (можно задать на уровне данных)
          '--mobileHeight': (banner as any).mobileHeight || 'clamp(420px, 78vh, 720px)',
          '--tabletHeight': (banner as any).tabletHeight || '500px',
        }"
      >
        <div class="w-full sm:max-w-[80%] lg:max-w-[60%]">
          <div v-if="hasTags(banner)" class="mb-5 flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
            <component
              v-for="(tag, i) in banner.tags"
              :key="i"
              :is="tag.href ? 'NuxtLink' : 'span'"
              :to="tag.href"
              class="px-2 lg:px-3 py-2 rounded-lg xs-max:text-[10px] text-xs sm:text-base lg:text-lg text-black select-none"
              :style="{ backgroundColor: tag.color || defaultTagColor }"
              :aria-label="tag.label"
            >
              {{ tag.label }}
            </component>
          </div>

          <h1
            v-if="banner.title"
            class="font-medium leading-[1.2] sm:leading-tight mb-4 xs-max:text-[1.8rem] text-[clamp(2rem,6vw,3.4rem)]"
          >
            {{ banner.title }}
          </h1>

          <div
            v-html="banner.html"
            class="mb-4 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-[1.2rem] lg:text-[clamp(0.875rem,4vw,1.5rem)]
                   flex flex-col gap-4 font-light max-w-[90%] sm:max-w-[80%] lg:max-w-[560px]"
          />

          <NuxtLink
            v-if="banner.buttonLink"
            :to="banner.buttonLink"
            class="w-content border-none bg-white hover:bg-gray-100 text-black sm:w-72
                   justify-center rounded-md sm:rounded-lg inline-flex items-center gap-2
                   px-5 py-2 sm:py-3 text-sm sm:text-base lg:text-xl font-normal
                   transition duration-300 group"
          >
            {{ $device?.isMobile ? (banner.mobileButtonText || banner.buttonText) : banner.buttonText }}
          </NuxtLink>
        </div>

        <!-- Точки показываем только если баннеров > 1 -->
        <div v-if="hasMultiple" class="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            v-for="(b, i) in banners"
            :key="b.id ?? i"
            @click="goToSlide(i)"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="[ i === activeIndex ? 'bg-white scale-110' : 'bg-white/40' ]"
            :aria-label="`Перейти к слайду ${i + 1}`"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped>
/* < sm (до 640px): мобильная */
@media (max-width: 639px) {
  .banner-slide {
    background-image: var(--bg-mobile) !important;
    height: var(--mobileHeight) !important;
  }
}

/* sm..lg (640–1023px): планшетная */
@media (min-width: 640px) and (max-width: 1023px) {
  .banner-slide {
    background-image: var(--bg-tablet) !important;
    height: var(--tabletHeight) !important;
  }
}

/* >= lg (с 1024px): остаётся десктопная (по умолчанию из inline style) */
</style>
