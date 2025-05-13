<template>
  <div class="relative h-[465px] md:px-14 md:py-12 rounded-3xl bg-hoverbtn flex flex-col md:flex-row gap-4">
    <div class="flex flex-col justify-starttext-center md:w-[55%] md:text-left">
      <p class="leading-tight mb-4 text-[clamp(2rem,6vw,2.8rem)]">{{ review.author }}</p>
      <div class="flex flex-row gap-3 mt-3">
        <img
          src="/icons/ps.svg"
          alt="→"
          class="w-6 h-6 pt-0.5"
        />
        <p class="text-2xl">{{ review.feedback_preview }}</p>
        <img
          src="/icons/ps.svg"
          alt="→"
          class="w-6 h-6 pt-0.5 rotate-180 mt-auto"
        />
      </div>
      <NuxtLink
        :to="review.file_url"
        v-if="review.file_url"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2 py-3 mt-3 ml-9 text-2xl text-primary font-normal transition duration-300 group"
      >
        Читать весь отзыв
        <img
          src="/icons/arrow.svg"
          alt="→"
          class="w-5 h-5 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
        />
      </NuxtLink>
    </div>

    <NuxtImg
      v-if="review.photo_urls[0]"
      :src="review.photo_urls[0]"
      alt="Фото автора"
      class="absolute bottom-0 right-20 w-1/3 object-cover mx-auto md:mx-0"
      format="webp"
      sizes="(max-width: 390px) 590px, 695px"
      loading="lazy"
      placeholder
    />
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types/content'

defineProps<{ review: Review }>()
</script>
