<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  show: boolean
  type: 'video' | 'audio' | 'image'
  src: string
  onClose: () => void
}>()

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') props.onClose()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
    <div class="relative w-full max-w-2xl mx-auto bg-white rounded-lg overflow-hidden">
      <button
        @click="onClose"
        class="absolute top-3 right-3 z-10 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center shadow"
      >
        ✕
      </button>

      <div class="w-full">
        <video
          v-if="type === 'video'"
          :src="src"
          class="w-full max-h-[80vh] object-contain"
          controls
          autoplay
        />
        <audio
          v-else-if="type === 'audio'"
          :src="src"
          class="w-full p-4"
          controls
        />
        <img
          v-else-if="type === 'image'"
          :src="src"
          class="w-full max-h-[80vh] object-contain"
          alt="Медиа"
        />
      </div>
    </div>
  </div>
</template>
