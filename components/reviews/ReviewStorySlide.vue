<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Review } from '~/types/content'

const props = defineProps<{
  review: Review
  active: boolean
}>()

const emit = defineEmits<{ (e: 'next'): void }>()

const currentSlideIndex = ref(0)
const progress = ref(0)                 // 0..100
const isMuted = ref(true)               // звук выключен по умолчанию (для автоплея)
const videoRef = ref<HTMLVideoElement | null>(null)
const imgTimer = ref<ReturnType<typeof setInterval> | null>(null)

const SLIDE_IMG_MS = 5000

const slides = computed(() => props.review.mediaStory ?? [])
const currentSlide = computed(() => slides.value?.[currentSlideIndex.value])

function isVideo(url?: string) {
  if (!url) return false
  return url.endsWith('.mp4') || url.includes('.mp4')
}

function clearImgTimer() {
  if (imgTimer.value) { clearInterval(imgTimer.value); imgTimer.value = null }
}

/* ---- Видео: прогресс, автоплей, окончание ---- */
function attachVideoEvents(v: HTMLVideoElement) {
  v.onloadedmetadata = () => {
    // если активен — стартуем прогресс от времени
    if (props.active) {
      try { v.play().catch(() => {}) } catch {}
    }
  }
  v.ontimeupdate = () => {
    if (!v.duration || isNaN(v.duration)) return
    progress.value = Math.min(100, (v.currentTime / v.duration) * 100)
  }
  v.onended = () => nextSlide()
}

function detachVideoEvents(v?: HTMLVideoElement | null) {
  if (!v) return
  v.onloadedmetadata = null
  v.ontimeupdate = null
  v.onended = null
}

function playActiveVideo() {
  const v = videoRef.value
  if (!v) return
  try { v.play().catch(() => {}) } catch {}
}

function pauseVideo() {
  const v = videoRef.value
  if (!v) return
  try { v.pause() } catch {}
}

/* ---- Картинка: таймер ---- */
function startImageProgress() {
  clearImgTimer()
  progress.value = 0
  const stepMs = 50
  const step = 100 / (SLIDE_IMG_MS / stepMs)
  imgTimer.value = setInterval(() => {
    progress.value += step
    if (progress.value >= 100) {
      clearImgTimer()
      nextSlide()
    }
  }, stepMs)
}

/* ---- Переключения ---- */
function nextSlide() {
  const lastIdx = (slides.value?.length || 0) - 1
  if (currentSlideIndex.value < lastIdx) {
    currentSlideIndex.value++
    setupSlide()
  } else {
    emit('next')
  }
}

function setupSlide() {
  progress.value = 0
  clearImgTimer()
  pauseVideo()

  if (!props.active) return

  nextTick(() => {
    if (isVideo(currentSlide.value)) {
      const v = videoRef.value
      if (!v) return
      detachVideoEvents(v)       // на всякий випадок
      attachVideoEvents(v)
      // пробуем запустить (на iOS/Android автоплей только с muted)
      try { v.play().catch(() => {}) } catch {}
    } else {
      startImageProgress()
    }
  })
}

/* ---- Реакция на активность компонента ---- */
watch(() => props.active, (active) => {
  if (active) {
    currentSlideIndex.value = 0
    setupSlide()
  } else {
    pauseVideo()
    clearImgTimer()
  }
})

/* ---- Реакция на смену самого слайда ---- */
watch(currentSlide, () => {
  if (!props.active) return
  setupSlide()
})

onMounted(() => {
  if (props.active) setupSlide()
})

onUnmounted(() => {
  pauseVideo()
  clearImgTimer()
  detachVideoEvents(videoRef.value || undefined)
})

/* ---- Управление звуком ---- */
function toggleMute(e?: Event) {
  e?.stopPropagation()
  isMuted.value = !isMuted.value
  // гарантируем проигрывание после взаимодействия
  playActiveVideo()
}
</script>

<template>
  <div class="w-full h-[80vh] relative bg-black rounded-xl overflow-hidden">
    <!-- Прогресс -->
    <div class="absolute top-0 left-0 right-0 px-4 pt-2 flex gap-1 z-10">
      <div
        v-for="(_, i) in slides"
        :key="i"
        class="flex-1 h-1 bg-white/30 rounded overflow-hidden"
      >
        <div
          class="h-full bg-white transition-all duration-150"
          :style="{
            width:
              i < currentSlideIndex
                ? '100%'
                : i === currentSlideIndex
                  ? progress + '%'
                  : '0%'
          }"
        />
      </div>
    </div>

    <!-- Кнопка звука для видео -->
    <button
      v-if="active && isVideo(currentSlide)"
      class="absolute top-3 right-3 z-20 text-white bg-black/40 px-3 py-1 rounded text-xs"
      @click.stop="toggleMute"
    >
      {{ isMuted ? 'Звук выкл.' : 'Звук вкл.' }}
    </button>

    <!-- Контент -->
    <div class="w-full h-full cursor-pointer" @click="nextSlide">
      <!-- Видео монтируем ТОЛЬКО на активном слайде -->
      <video
        v-if="active && isVideo(currentSlide)"
        ref="videoRef"
        :src="currentSlide!"
        class="w-full h-full object-contain"
        :muted="isMuted"
        playsinline
        autoplay
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
