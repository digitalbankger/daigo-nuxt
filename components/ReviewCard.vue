<template>
  <div class="relative h-[465px] md:px-14 md:py-12 rounded-3xl bg-hoverbtn flex flex-col md:flex-row gap-4">
    <div class="flex flex-col justify-starttext-center md:w-1/2 md:text-left">
      <p class="leading-tight mb-4 text-[clamp(2rem,6vw,2.8rem)]">{{ review.author }}</p>
      <p class="leading-tight my-4 text-xl text-black/70">{{ review.author_role }}</p>
      <div class="flex flex-row gap-3 mt-3">
        <img
          src="/icons/ps-dark.svg"
          alt="→"
          class="w-6 h-6 pt-0.5"
        />
        <p class="text-xl">{{ review.feedback_preview }}</p>
        <img
          src="/icons/ps-dark.svg"
          alt="→"
          class="w-6 h-6 pt-0.5 rotate-180 mt-auto"
        />
      </div>
      <!-- <NuxtLink
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
      </NuxtLink> -->
    </div>

    <div class="relative w-1/2">
      <NuxtImg
        v-if="review.photo_urls[0]"
        :src="review.photo_urls[0]"
        alt="Фото автора"
        class="md:w-auto md:h-full mx-auto"
        format="webp"
        sizes="(max-width: 390px)"
        loading="lazy"
        placeholder
      />
      <div v-if="review.type === 'video'" class="absolute inset-0 flex items-center justify-center">
        <img
          src="/icons/play-white.svg"
          class="w-18 h-18 cursor-pointer"
          alt="play"
          @click.stop="emit('open-review', review)"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types/content'

defineProps<{ review: Review }>()

const emit = defineEmits<{
  (e: 'open-review', review: Review): void
}>()

</script>
