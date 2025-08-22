<script setup lang="ts">
import type { Story } from '~/types/content'

const props = defineProps<{
  story: Story
  active: boolean
}>()

const emit = defineEmits<{ (e: 'next'): void }>()

const currentSlideIndex = ref(0)
const progress = ref(0)
const videoRef = ref<HTMLVideoElement | null>(null)

const currentSlide = computed(() => props.story.slides[currentSlideIndex.value])

let timer: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  if (currentSlideIndex.value < props.story.slides.length - 1) {
    currentSlideIndex.value++
    startProgress()
  } else {
    emit('next')
  }
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

function onVideoReady() {
  if (videoRef.value && props.active) {
    const durationMs = videoRef.value.duration * 1000
    startProgress(durationMs)
  }
}

watch(() => props.active, (val) => {
  if (val) {
    currentSlideIndex.value = 0
    startProgress()
  } else {
    clearInterval(timer!)
  }
})

onMounted(() => {
  if (props.active) {
    currentSlideIndex.value = 0
    startProgress()
  }
})

onBeforeUnmount(() => clearInterval(timer!))
</script>

<template>
  <div
    class="relative h-[80vh] max-w-none rounded-xl shadow-xl overflow-hidden sm:w-full"
  >
    <div class="w-full absolute top-0 left-0 right-0 px-4 pt-2 z-20 flex gap-1 shadow-lg">
      <div
        v-for="(_, i) in story.slides"
        :key="i"
        class="flex-1 h-1 bg-white/30 rounded overflow-hidden"
      >
        <div
          class="bg-white h-full transition-all duration-300"
          :style="{ width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? progress + '%' : '0%' }"
        ></div>
      </div>
    </div>

    <div class="w-full h-full cursor-pointer" @click="nextSlide">
      <video
        v-if="currentSlide?.endsWith('.mp4')"
        :src="currentSlide"
        class="w-full h-full object-cover"
        autoplay
        muted
        playsinline
        ref="videoRef"
        @loadedmetadata="onVideoReady"
        @ended="nextSlide"
      />

      <img
        v-else
        :src="currentSlide"
        class="w-full h-full object-cover"
        alt="story"
        @load="() => props.active && startProgress(5000)"
      />

    </div>

    <div class="absolute bottom-0 left-0 right-0 z-20">
      <div class="bg-gradient-to-t from-black/60 to-transparent px-4 py-4">
        <p class="text-white text-lg">{{ story.title }}</p>
      </div>
    </div>
  </div>

</template>
