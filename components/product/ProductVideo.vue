<script setup lang="ts">
import InlineVideoPlayer from '~/components/ui/InlineVideoPlayer.vue'

defineProps<{
  videoUrl?: string
  videoPoster?: string
}>()
</script>

<template>
  <div
    v-if="videoPoster || videoUrl"
    class="mt-12"
  >
    <InlineVideoPlayer
      v-if="videoUrl"
      :src="videoUrl"
      :poster="videoPoster"
      title="Видео о продукте"
      class="w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden h-[210px] sm:h-[350px] lg:h-[600px] bg-hoverbtn shadow-productcard"
    />

    <div
      v-else-if="videoPoster"
      class="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden h-[210px] sm:h-[350px] lg:h-[600px] bg-hoverbtn shadow-productcard"
    >
      <img
        :src="videoPoster"
        class="w-full h-full object-cover"
        alt="Видео постер"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>
