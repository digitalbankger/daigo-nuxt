<script setup lang="ts">
import type { Story } from '~/types/content'

const props = defineProps<{
  story: Story & { slides?: string[] }
  active: boolean
}>()

const emit = defineEmits<{ (e: 'next'): void }>()

const currentSlideIndex = ref(0)
const progress = ref(0)
const videoRef = ref<HTMLVideoElement | null>(null)

const slides = computed(() => props.story?.slides ?? [])
const hasSlides = computed(() => slides.value.length > 0)
const currentSlide = computed(() => hasSlides.value ? slides.value[currentSlideIndex.value] : '')

let timer: ReturnType<typeof setInterval> | null = null

function clearTimer() { if (timer) { clearInterval(timer); timer = null } }

function nextSlide() {
  if (!hasSlides.value) return
  if (currentSlideIndex.value < slides.value.length - 1) {
    currentSlideIndex.value++
    startProgress()
  } else {
    emit('next')
  }
}

function startProgress(duration = 5000) {
  if (!props.active) return
  progress.value = 0
  clearTimer()
  const step = 100 / (duration / 50)
  timer = setInterval(() => {
    progress.value += step
    if (progress.value >= 100) nextSlide()
  }, 50)
}

function onVideoReady() {
  if (!props.active || !videoRef.value) return
  const durationMs = Math.max(500, videoRef.value.duration * 1000 || 5000)
  startProgress(durationMs)
}

watch(() => props.active, (val) => {
  if (val) {
    currentSlideIndex.value = 0
    // если слайды уже есть — запускаем, иначе подождём появления slides
    if (hasSlides.value) startProgress()
  } else {
    clearTimer()
  }
})

/** когда впервые прилетели slides — запускаем прогресс */
watch(hasSlides, (ok) => {
  if (ok && props.active) {
    currentSlideIndex.value = 0
    startProgress()
  }
})

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="relative h-[80vh] max-w-none rounded-xl shadow-xl overflow-hidden sm:w-full">
    <!-- прогресс бары -->
    <div class="w-full absolute top-0 left-0 right-0 px-4 pt-2 z-20 flex gap-1 shadow-lg" v-if="hasSlides">
      <div
        v-for="(_, i) in slides"
        :key="i"
        class="flex-1 h-1 bg-white/30 rounded overflow-hidden"
      >
        <div
          class="bg-white h-full transition-all duration-300"
          :style="{ width: i < currentSlideIndex ? '100%' : i === currentSlideIndex ? progress + '%' : '0%' }"
        />
      </div>
    </div>

    <!-- контент -->
    <div class="w-full h-full cursor-pointer" @click="nextSlide">
      <template v-if="hasSlides && currentSlide">
        <video
          v-if="currentSlide.endsWith('.mp4')"
          :src="currentSlide"
          class="w-full h-full object-cover"
          autoplay muted playsinline
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
      </template>

      <!-- скелетон, пока ждём slides -->
      <div v-else class="w-full h-full bg-white/10 animate-pulse" />
    </div>

    <div class="absolute bottom-0 left-0 right-0 z-20">
      <div class="bg-gradient-to-t from-black/60 to-transparent px-4 py-4">
        <p class="text-white text-lg">{{ (props.story as any)?.title || '' }}</p>
      </div>
    </div>
  </div>
</template>
