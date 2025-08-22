<template>
  <div 
    v-if="videoPoster || videoUrl" 
    class="mt-12"
  >
    <!-- Постер с кнопкой Play -->
    <div
      v-if="videoPoster"
      class="relative w-full aspect-video rounded-3xl overflow-hidden h-[600px] bg-hoverbtn cursor-pointer shadow-productcard"
      @click="openVideoModal"
    >
      <img
        :src="videoPoster"
        class="w-full h-[600px] object-cover"
        alt="Видео постер"
      />
      <!-- <div class="absolute inset-0 flex items-center justify-center">
        <div class="bg-white bg-opacity-80 rounded-full p-4 shadow">
          <img src="/icons/play.svg" class="w-10 h-10" />
        </div>
      </div> -->
    </div>

    <!-- Если постера нет, просто кнопка -->
    <div
      v-else
      class="w-full aspect-video rounded-3xl bg-hoverbtn h-[600px] flex items-center justify-center cursor-pointer shadow-productcard"
      @click="openVideoModal"
    >
      <!-- <div class="bg-white bg-opacity-80 rounded-full p-4 shadow">
        <img src="/icons/play.svg" class="w-10 h-10" />
      </div> -->
    </div>

    <!-- Медиа-модалка -->
    <MediaModal
      v-if="videoUrl"
      :show="showVideo"
      type="video"
      :src="videoUrl"
      :onClose="() => (showVideo = false)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MediaModal from '../reviews/MediaModal.vue'
import type { Product } from '~/types/product'

defineProps<{
  videoUrl?: string
  videoPoster?: string
}>()

const showVideo = ref(false)
const openVideoModal = () => {
  showVideo.value = true
}
</script>
