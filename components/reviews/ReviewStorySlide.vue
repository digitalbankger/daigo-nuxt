<script setup lang="ts">
import type { Review } from '~/types/content'

const props = defineProps<{
  review: Review
  active: boolean
}>()

const emit = defineEmits<{ (e: 'next'): void }>()

const currentSlideIndex = ref(0)
const progress = ref(0)

const currentSlide = computed(() => props.review.mediaStory?.[currentSlideIndex.value])

let timer: ReturnType<typeof setInterval> | null = null

function isVideo(url: string) {
  return url.endsWith('.mp4') || url.includes('.mp4')
}

function startProgress(duration = 5000) {
  progress.value = 0
  clearInterval(timer!)
  const step = 100 / (duration / 50)
  timer = setInterval(() => {
    progress.value += step
    if (progress.value >= 100) nextSlide()
  }, 50)
}

function nextSlide() {
  if (currentSlideIndex.value < (props.review.mediaStory?.length || 0) - 1) {
    currentSlideIndex.value++
    startProgress(isVideo(currentSlide.value!) ? 8000 : 5000)
  } else {
    emit('next')
  }
}

watch(() => props.active, (val) => {
  if (val) {
    currentSlideIndex.value = 0
    if (currentSlide.value) {
      startProgress(isVideo(currentSlide.value) ? 8000 : 5000)
    }
  } else {
    clearInterval(timer!)
  }
})

onMounted(() => {
  if (props.active && currentSlide.value) {
    startProgress(isVideo(currentSlide.value) ? 8000 : 5000)
  }
})


onUnmounted(() => clearInterval(timer!))
</script>

<template>
  <div class="w-full h-[80vh] relative bg-black rounded-xl overflow-hidden">
    <!-- Прогресс по слайдам -->
    <div class="absolute top-0 left-0 right-0 px-4 pt-2 flex gap-1 z-10">
      <div
        v-for="(_, i) in props.review.mediaStory"
        :key="i"
        class="flex-1 h-1 bg-white/30 rounded overflow-hidden"
      >
        <div
          class="h-full bg-white transition-all duration-300"
          :style="{ width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? progress + '%' : '0%' }"
        />
      </div>
    </div>

    <!-- Контент -->
    <div class="w-full h-full cursor-pointer" @click="nextSlide">
      <video
        v-if="currentSlide && isVideo(currentSlide)"
        :src="currentSlide"
        class="w-full h-full object-contain"
        autoplay muted playsinline
      />
      <img
        v-else-if="currentSlide"
        :src="currentSlide"
        class="w-full h-full object-contain"
        alt="slide"
      />
    </div>

    <!-- Автор -->
    <div class="absolute top-4 left-4 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-sm">
      {{ review.author }}
    </div>
  </div>
</template>
