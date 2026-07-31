<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProductImage } from '~/types/product'

const { images, hasDiscount, fill } = withDefaults(defineProps<{
  images: ProductImage[]
  hasDiscount: boolean
  fill?: boolean
}>(), {
  fill: false,
})

const sortedImages = computed(() =>
  [...images].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })
)

const activeIndex = ref(0)
</script>

<template>
  <section>
    <div class="flex flex-col sm:flex-col gap-4 sm:gap-6">
      <div
        class="relative flex-1 aspect-[1/1] sm:aspect-[6/5] rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden bg-hoverbtn"
        :class="fill ? 'p-0' : 'p-10'"
      >
        <img
          v-if="sortedImages[activeIndex]?.image_url"
          :src="sortedImages[activeIndex]?.image_url"
          :alt="'Изображение ' + (activeIndex + 1)"
          width="640"
          height="640"
          loading="eager"
          fetchpriority="high"
          class="h-full w-full transition-all duration-300"
          :class="fill ? 'object-cover' : 'object-contain'"
        >

        <div
          v-if="hasDiscount"
          class="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 bg-cgreen text-white text-base sm:text-2xl px-3 py-1 rounded-lg sm:rounded-xl shadow flex flex-row gap-2 items-center"
        >
          <img src="/icons/fire.svg" alt="fire">
          <span>Акция</span>
        </div>
      </div>

      <div class="flex sm:flex-row gap-3 overflow-x-auto no-scrollbar scroll-touch px-1 sm:px-0">
        <button
          v-for="(img, index) in sortedImages"
          :key="img.image_url"
          class="w-20 sm:w-32 h-20 sm:h-32 shrink-0 border rounded-lg sm:rounded-xl overflow-hidden bg-hoverbtn"
          :class="index === activeIndex ? 'border-primary' : 'border-transparent'"
          @click="activeIndex = index"
        >
          <img
            v-if="img.image_url"
            :src="img.image_url"
            :alt="'Миниатюра ' + (index + 1)"
            width="128"
            height="128"
            loading="lazy"
            class="h-full w-full"
            :class="fill ? 'object-cover' : 'object-contain'"
          >
        </button>
      </div>
    </div>
  </section>
</template>
