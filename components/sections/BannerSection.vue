<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import { ref } from 'vue'
import type { Swiper as SwiperInstance } from 'swiper'
import type { Banner } from '~/types/content'

defineProps<{
  banners: Banner[]
}>()

const activeIndex = ref(0)
const swiperRef = ref<SwiperInstance | null>(null)

const setSwiper = (swiper: SwiperInstance) => {
  swiperRef.value = swiper
}

const goToSlide = (index: number) => {
  swiperRef.value?.slideToLoop(index)
}

/** Цвет по умолчанию, если с бэка не пришёл */
const defaultTagColor = '#E6F4FF'

/** Хелпер: есть ли теги у баннера */
const hasTags = (b: Banner) => Array.isArray(b?.tags) && b.tags.length > 0
</script>

<template>
  <section v-if="Array.isArray(banners) && banners.length" class="relative w-full overflow-hidden">
    <Swiper
      :modules="[Autoplay]"
      :autoplay="{ delay: 10000 }"
      :space-between="20"
      :loop="true"
      @swiper="setSwiper"
      @slideChange="(swiper) => activeIndex = swiper.realIndex"
      class="!pb-10 rounded-3xl"
    >
      <SwiperSlide
        v-for="banner in banners"
        :key="banner.id"
        class="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-16 rounded-xl bg-cover bg-center text-white"
        :style="{ backgroundImage: `url(${banner.image})`, height: '500px' }"
      >
        <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
          <div v-if="hasTags(banner)" class="mb-4 flex flex-wrap gap-4">
            <component
              v-for="(tag, i) in banner.tags"
              :key="i"
              :is="tag.href ? 'NuxtLink' : 'span'"
              :to="tag.href"
              class="px-3 py-2 rounded-lg text-lg text-black select-none"
              :style="{ backgroundColor: tag.color || defaultTagColor }"
              :aria-label="tag.label"
            >
              {{ tag.label }}
            </component>
          </div>

          <h1
            v-if="banner.title"
            class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.4rem)]"
          >
            {{ banner.title }}
          </h1>

          <div
            v-html="banner.html"
            class="mb-6 text-[clamp(1rem,6vw,1.5rem)] flex flex-col gap-4 font-light max-w-[90%] sm:max-w-[80%] lg:max-w-[560px]"
          />

          <NuxtLink
            v-if="banner.buttonLink && banner.buttonText"
            :to="banner.buttonLink"
            class="border-none bg-white hover:bg-gray-100 text-black w-72 justify-center rounded-lg inline-flex items-center gap-2 py-3 text-xl font-normal transition duration-300 group"
          >
            {{ banner.buttonText }}
            <!-- <img
              src="/icons/arrow.svg"
              alt="→"
              class="w-5 h-5 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
              loading="lazy"
              decoding="async"
            /> -->
          </NuxtLink>
        </div>

        <!-- Точки-пагинация -->
        <div class="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            v-for="(_, i) in banners.length"
            :key="i"
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
