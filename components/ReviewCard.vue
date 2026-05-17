<script setup lang="ts">
import { computed } from 'vue'
import type { Review } from '~/types/content'
import InlineVideoPlayer from '~/components/ui/InlineVideoPlayer.vue'

const props = defineProps<{ review: Review }>()

const mediaSource = computed(() =>
  props.review.mediaUrl || props.review.video_url || props.review.file_url || ''
)

const posterSource = computed(() =>
  props.review.preview || props.review.photo_urls?.[0] || ''
)
</script>

<template>
  <div class="relative min-h-[520px] md:min-h-[340px] lg:min-h-[465px] md:h-[340px] lg:h-[465px] md:px-10 lg:px-14 md:py-12 rounded-2xl md:rounded-3xl bg-hoverbtn flex flex-col md:flex-row gap-4">
    <div class="flex flex-col justify-start md:w-1/2 text-left order-2 md:order-1 px-4 pb-6 md:px-0 md:py-0">
      <p class="leading-tight mb-2 lg:mb-4 text-[clamp(1.6rem,6vw,2.8rem)] md:text-3xl lg:text-[clamp(1.6rem,6vw,2.8rem)]">{{ review.author }}</p>
      <p class="leading-tight mt-2 md:my-4 text-xs md:text-base lg:text-xl text-black/70">{{ review.author_role }}</p>
      <div class="flex flex-row gap-3 mt-3">
        <img
          src="/icons/ps-dark.svg"
          alt="→"
          class="w-4 md:w-6 h-4 md:h-6 pt-0.5"
        />
        <p class="text-sm md:text-sm lg:text-xl">{{ review.feedback_preview }}</p>
        <img
          src="/icons/ps-dark.svg"
          alt="→"
          class="w-4 md:w-6 h-4 md:h-6 pt-0.5 rotate-180 mt-auto"
        />
      </div>
    </div>

    <div class="relative w-full md:w-1/2 order-1 md:order-2">
      <InlineVideoPlayer
        v-if="review.type === 'video' && mediaSource"
        :src="mediaSource"
        :poster="posterSource"
        :title="`Видео отзыв ${review.author}`"
        class="w-full h-[296px] md:h-full rounded-2xl md:rounded-3xl"
      />

      <NuxtImg
        v-else-if="review.photo_urls?.[0]"
        :src="review.photo_urls[0]"
        alt="Фото автора"
        class="md:w-auto h-[296px] md:h-auto lg:h-full mx-auto object-cover rounded-2xl md:rounded-3xl"
        format="webp"
        sizes="(max-width: 390px)"
        loading="lazy"
        placeholder
      />
    </div>
  </div>
</template>
