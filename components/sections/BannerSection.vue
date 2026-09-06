<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import { ref, computed } from 'vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type { Banner } from '~/types/content'

const props = defineProps<{ banners: Banner[] }>()

const activeIndex = ref(0)
const swiperRef = ref<SwiperInstance | null>(null)

const setSwiper = (swiper: SwiperInstance) => {
  swiperRef.value = swiper
}

const hasMultiple = computed(() => Array.isArray(props.banners) && props.banners.length > 1)

const goToSlide = (index: number) => {
  if (!swiperRef.value) return

  if (hasMultiple.value) {
    swiperRef.value.slideToLoop(index)
  } else {
    swiperRef.value.slideTo(index)
  }
}

const defaultTagColor = '#E6F4FF'

const hasTags = (banner: Banner) => {
  return Array.isArray(banner?.tags) && banner.tags.length > 0
}

const isImageOnly = (banner: Banner) => {
  return Boolean((banner as any)?.imageOnly)
}

const isExternalBanner = (banner: Banner) => {
  return Boolean((banner as any)?.external || /^https?:\/\//.test(String(banner?.buttonLink || '')))
}

const slideClasses = (banner: Banner) => [
  'banner-slide relative overflow-hidden rounded-xl text-white h-[420px] sm:h-[360px] lg:h-[500px]',
  isImageOnly(banner)
    ? 'banner-slide--image-only block p-0 bg-transparent'
    : 'flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-16 bg-cover bg-right-bottom',
  banner.variant === 'medical' && !isImageOnly(banner) ? 'banner-slide--medical' : ''
]

const slideStyle = (banner: Banner) => {
  if (isImageOnly(banner)) return {}

  return {
    backgroundImage: 'var(--bg-desktop)',
    '--bg-desktop': `url(${banner.imageDesktop ?? banner.image})`,
    '--bg-tablet': `url(${(banner as any).imageTablet ?? banner.imageDesktop ?? banner.image})`,
    '--bg-mobile': `url(${banner.imageMobile ?? banner.image})`,
    backgroundPosition: (banner as any).backgroundPosition || undefined,
  }
}

const imageClass = (banner: Banner) => {
  return (banner as any).imageClass || ''
}

const imageSrc = (banner: Banner) => {
  return banner.imageDesktop || banner.image || banner.imageMobile || ''
}

const imageAlt = (banner: Banner) => {
  return banner.alt || banner.title || banner.buttonText || 'Баннер'
}

const contentClasses = (banner: Banner) => [
  'relative z-10 w-full',
  banner.variant === 'medical'
    ? 'sm:max-w-[64%] lg:max-w-[54%]'
    : 'sm:max-w-[80%] lg:max-w-[60%]'
]

const titleClasses = (banner: Banner) => [
  'banner-title font-bold leading-[1.2] sm:leading-[1.1] mb-4 font-haido',
  banner.variant === 'medical'
    ? 'max-w-[560px]'
    : ''
]

const titleStyle = (banner: Banner) => {
  const custom = banner as any
  const isMedical = banner.variant === 'medical'

  return {
    '--banner-title-mobile': custom.titleSizeMobile || (isMedical ? '2.15rem' : '1.8rem'),
    '--banner-title-tablet': custom.titleSizeTablet || (isMedical ? 'clamp(2.35rem, 5.2vw, 4rem)' : 'clamp(2rem, 6vw, 3.4rem)'),
    '--banner-title-desktop': custom.titleSizeDesktop || (isMedical ? 'clamp(2.35rem, 5.2vw, 4rem)' : 'clamp(2rem, 6vw, 3.4rem)'),
  }
}

const buttonClasses = (banner: Banner) => [
  'w-content border-none justify-center inline-flex items-center gap-2 transition duration-300 group',
  banner.variant === 'medical'
    ? 'bg-[#397D79]/95 hover:bg-[#2F706C] text-white rounded-[999px] px-9 sm:px-11 py-3 sm:py-3.5 text-xl sm:text-2xl font-normal shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur'
    : 'bg-white hover:bg-gray-100 text-black sm:w-72 rounded-md sm:rounded-lg px-5 py-2 sm:py-3 text-sm sm:text-base lg:text-xl font-normal'
]
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
      class="banner-swiper rounded-3xl"
    >
      <SwiperSlide
        v-for="banner in banners"
        :key="banner.id"
        :class="slideClasses(banner)"
        :style="slideStyle(banner)"
      >
        <template v-if="isImageOnly(banner)">
          <a
            v-if="isExternalBanner(banner)"
            :href="banner.buttonLink"
            target="_blank"
            rel="noopener"
            class="banner-image-only block w-full h-full overflow-hidden rounded-xl"
            :aria-label="imageAlt(banner)"
          >
            <img
              :src="imageSrc(banner)"
              :alt="imageAlt(banner)"
              class="block w-full h-full rounded-xl object-cover object-center"
              :class="imageClass(banner)"
              loading="eager"
              fetchpriority="high"
            />
          </a>

          <NuxtLink
            v-else
            :to="banner.buttonLink || '/'"
            class="banner-image-only block w-full h-full overflow-hidden rounded-xl"
            :aria-label="imageAlt(banner)"
          >
            <img
              :src="imageSrc(banner)"
              :alt="imageAlt(banner)"
              class="block w-full h-full rounded-xl object-cover object-center"
              :class="imageClass(banner)"
              loading="eager"
              fetchpriority="high"
            />
          </NuxtLink>
        </template>

        <template v-else>
          <div :class="contentClasses(banner)">
            <div v-if="hasTags(banner)" class="mb-5 flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
              <component
                :is="tag.href ? 'NuxtLink' : 'span'"
                v-for="(tag, i) in banner.tags"
                :key="i"
                :to="tag.href"
                class="px-2 lg:px-3 py-2 rounded-lg xs-max:text-[10px] text-xs sm:text-base lg:text-lg text-black select-none"
                :style="{ backgroundColor: tag.color || defaultTagColor }"
                :aria-label="tag.label"
              >
                {{ tag.label }}
              </component>
            </div>

            <h2
              v-if="banner.title"
              :class="titleClasses(banner)"
              :style="titleStyle(banner)"
              v-html="banner.title"
            />

            <div
              v-if="banner.html"
              v-html="banner.html"
              class="mb-4 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-[1.2rem] lg:text-[clamp(0.875rem,4vw,1.5rem)] flex flex-col gap-4 font-light max-w-[90%] sm:max-w-[80%] lg:max-w-[560px]"
            />

            <a
              v-if="banner.buttonLink && isExternalBanner(banner)"
              :href="banner.buttonLink"
              target="_blank"
              rel="noopener"
              :class="buttonClasses(banner)"
            >
              {{ $device?.isMobile ? (banner.mobileButtonText || banner.buttonText) : banner.buttonText }}
            </a>

            <NuxtLink
              v-else-if="banner.buttonLink"
              :to="banner.buttonLink"
              :class="buttonClasses(banner)"
            >
              {{ $device?.isMobile ? (banner.mobileButtonText || banner.buttonText) : banner.buttonText }}
            </NuxtLink>
          </div>
        </template>

        <div v-if="hasMultiple" class="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            v-for="(b, i) in banners"
            :key="b.id ?? i"
            type="button"
            @click="goToSlide(i)"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="[i === activeIndex ? 'bg-white scale-110' : 'bg-white/40']"
            :aria-label="`Перейти к слайду ${i + 1}`"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<style scoped>
.banner-swiper {
  width: 100%;
}

.banner-swiper :deep(.swiper-wrapper),
.banner-swiper :deep(.swiper-slide) {
  height: auto;
}

.banner-title {
  font-size: var(--banner-title-mobile);
}

@media (min-width: 640px) {
  .banner-title {
    font-size: var(--banner-title-tablet);
  }
}

@media (min-width: 1024px) {
  .banner-title {
    font-size: var(--banner-title-desktop);
  }
}

.banner-slide--medical::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(23, 23, 23, 0.72) 0%,
    rgba(23, 23, 23, 0.46) 34%,
    rgba(23, 23, 23, 0.08) 64%,
    rgba(23, 23, 23, 0) 100%
  );
}

@media (max-width: 639px) {
  .banner-slide:not(.banner-slide--image-only) {
    background-image: var(--bg-mobile) !important;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .banner-slide:not(.banner-slide--image-only) {
    background-image: var(--bg-tablet) !important;
  }
}
</style>