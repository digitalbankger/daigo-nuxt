<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProductImage } from '~/types/product'

const { images, hasDiscount } = defineProps<{
  images: ProductImage[]
  hasDiscount: boolean
}>()

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
  <section class="">
    <div class="flex flex-col md:flex-col gap-6">
      <div class="relative flex-1 aspect-[6/5] rounded-3xl flex items-center justify-center overflow-hidden bg-hoverbtn p-10">
        <NuxtImg
          :src="sortedImages[activeIndex]?.image_url"
          :alt="'Изображение ' + (activeIndex + 1)"
          width="640"
          height="480"
          format="webp"
          loading="eager"
          class="max-w-full max-h-full object-contain transition-all duration-300"
        />
        <div
          v-if="hasDiscount"
          class="absolute bottom-5 left-5 bg-cgreen text-white text-2xl px-3 py-1 rounded-xl shadow flex flex-row gap-2 items-center"
        >
          <img src="/icons/fire.svg" alt="fire" />
          <span>Акция</span>
        </div>
      </div>

      <div class="flex md:flex-row gap-3 overflow-x-auto md:overflow-visible">
        <button
          v-for="(img, index) in sortedImages"
          :key="img.image_url"
          class="w-32 h-32 shrink-0 border-2 rounded-xl overflow-hidden bg-hoverbtn"
          :class="index === activeIndex ? 'border-primary' : 'border-transparent'"
          @click="activeIndex = index"
        >
          <NuxtImg
            :src="img.image_url"
            width="80"
            height="80"
            format="webp"
            loading="lazy"
            class="w-full h-full object-contain"
          />
        </button>
      </div>
    </div>
  </section>
</template>
