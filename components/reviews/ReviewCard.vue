<script setup lang="ts">
import type { Review } from '~/types/content'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import { playExclusive } from '~/utils/audioController'
import { useCatalogStore } from '~/stores/catalogStore'

const props = defineProps<{ review: Review }>()
const emit = defineEmits(['open-story'])

const mediaSource = computed(() =>
  props.review.mediaUrl || props.review.video_url || props.review.file_url
)

const catalogStore = useCatalogStore()
const relatedProducts = computed(() => {
  const ids = Array.isArray(props.review.productIds)
    ? props.review.productIds
    : props.review.productId
    ? [props.review.productId]
    : []
  return catalogStore.products.filter(p => ids.includes(p.id))
})

// Аудио
const waveformRef = ref<HTMLDivElement | null>(null)
const wavesurfer = ref<WaveSurfer | null>(null)
const duration = ref<string>('00:00')
const isPlaying = ref(false)

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function initWaveSurfer() {
  if (waveformRef.value && mediaSource.value) {
    wavesurfer.value = WaveSurfer.create({
      container: waveformRef.value,
      waveColor: '#4f8effa3',
      progressColor: '#4F8EFF',
      height: 25,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      responsive: true
    })

    wavesurfer.value.load(mediaSource.value)

    wavesurfer.value.on('ready', () => {
      duration.value = formatDuration(wavesurfer.value?.getDuration() || 0)
    })

    wavesurfer.value.on('play', () => {
      isPlaying.value = true
      playExclusive(wavesurfer.value!)
    })

    wavesurfer.value.on('pause', () => {
      isPlaying.value = false
    })
  }
}

function togglePlay() {
  wavesurfer.value?.playPause()
}

onMounted(() => {
  if (props.review.type === 'audio') initWaveSurfer()
})

onUnmounted(() => {
  wavesurfer.value?.destroy()
})
</script>

<template>
  <div
    :class="[
      'max-w-md',
      review.type === 'celebrity' ? 'w-[15%] min-w-[140px]' : 'w-full min-w-[220px]'
    ]"
  >
    <!-- Сторис -->
    <template v-if="review.type === 'celebrity'">
      <div
        @click="emit('open-story')"
        class="h-[230px] relative cursor-pointer rounded-xl overflow-hidden transition hover:-translate-y-2 bg-white"
      >
        <NuxtImg :src="review.preview" format="webp" class="w-full h-[230px] object-cover" />

        <div class="absolute top-2 left-1 flex items-center gap-2 text-white rounded-full px-2 py-1 text-xs">
          <div class="gradient-border rounded-full p-[1px]">
            <NuxtImg
              v-if="review.photo_urls"
              :src="review.avatar || review.photo_urls[0]"
              format="webp"
              class="w-8 h-8 rounded-full object-cover bg-hoverbtn p-1"
            />
          </div>
          <span>{{ review.author }}</span>
        </div>
      </div>
    </template>

    <!-- Видео -->
     <template v-if="review.type === 'video'">
      <div
        @click="emit('open-story')"
        class="h-[545px] relative rounded-xl overflow-hidden cursor-pointer transition hover:-translate-y-1 bg-white shadow-md"
      >
        <div class="relative">
          <NuxtImg v-if="review.photo_urls" :src="review.preview || review.photo_urls[0]" format="webp" class="w-full h-[380px] object-cover" />
          <div class="absolute inset-0 flex items-center justify-center">
            <img src="/icons/play.svg" class="w-20 h-20" alt="play" />
          </div>
          <div class="absolute top-3 left-3 text-sm bg-[#EEF4FF] text-primary rounded px-2 py-1">
            Видео
          </div>
          <div v-if="relatedProducts.length" class="absolute bottom-3 left-3 mt-4 flex flex-col w-fit flex-wrap gap-2">
            <div
              v-for="product in relatedProducts"
              :key="product.id"
              class="flex items-center gap-2 bg-[#EEF4FF] text-primary rounded px-2 py-1"
            >
              <NuxtImg :src="product.image" class="w-6 h-6 object-contain" />
              <span class="text-sm">{{ product.name }}</span>
            </div>
          </div>
          <div class="absolute bottom-3 right-3 text-sm bg-[#EEF4FF] text-primary rounded px-2 py-1">
            {{ review.duration || '00:00' }}
          </div>
        </div>

        <div class="p-4">
          <p class="text-2xl">{{ review.author }}</p>
          <p class="text-base mt-3 line-clamp-3">{{ review.feedback_preview }}</p>
        </div>
      </div>
    </template>

    <!-- Аудио -->
    <template v-if="review.type === 'audio'">
      <div class="h-[545px] relative rounded-xl overflow-hidden bg-white shadow-md transition hover:-translate-y-1">
        <div class="relative">
          <NuxtImg v-if="review.photo_urls" :src="review.preview || review.photo_urls[0]" format="webp" class="w-full h-[335px] object-cover" />
          <div class="absolute top-3 left-3 text-sm bg-[#EEF4FF] text-primary rounded px-2 py-1">Аудио</div>

          <div v-if="relatedProducts.length" class="absolute bottom-3 left-3 mt-4 flex flex-col w-fit flex-wrap gap-2">
            <div
              v-for="product in relatedProducts"
              :key="product.id"
              class="flex items-center gap-2 bg-[#EEF4FF] text-primary rounded px-2 py-1"
            >
              <NuxtImg :src="product.image" class="w-6 h-6 object-contain" />
              <span class="text-sm">{{ product.name }}</span>
            </div>
          </div>
        </div>

        <div class="p-4">
          <p class="text-2xl">@{{ review.author }}</p>
          <p class="text-base mt-3 mb-4 line-clamp-4">{{ review.feedback_preview }}</p>

          <div class="flex items-center gap-3 w-2/3">
            <button
              class="w-10 h-10 flex items-center justify-center rounded-full text-primary"
              @click.stop="togglePlay"
            >
              <img
                :src="isPlaying ? '/icons/pause.svg' : '/icons/play-small.svg'"
                alt="toggle"
                class="w-10 h-10"
              />
            </button>
            <div ref="waveformRef" class="w-full" />
          </div>

          <p class="text-sm text-blue-600 mt-2">{{ duration }}</p>

        </div>
      </div>
    </template>

    <!-- Текст -->
    <template v-else-if="review.type === 'text'">
      <article itemscope itemtype="https://schema.org/Review" class="relative flex flex-col h-[300px] bg-white rounded-xl p-4 shadow">

        <div class="flex flex-row items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="gradient-border rounded-full p-[1px]">
              <NuxtImg v-if="review.photo_urls" :src="review.avatar || review.photo_urls[0]" format="webp" class="w-8 h-8 rounded-full object-cover bg-hoverbtn p-1" />
            </div>
            <span class="text-lg font-semibold" itemprop="name">{{ review.author }}</span>
          </div>
          <span class="w-fit top-3 left-3 text-sm bg-[#EEF4FF] text-primary rounded px-2 py-1">Отзыв о Даиго</span>
        </div>

        <p class="text-base mt-3 mb-4 line-clamp-4">{{ review.feedback_preview }}</p>

        <div v-if="relatedProducts.length" class="mt-auto my-4 flex flex-row w-fit flex-wrap gap-2">
          <div
            v-for="product in relatedProducts"
            :key="product.id"
            class="flex items-center gap-2 bg-[#EEF4FF] text-primary rounded px-2 py-1"
          >
            <NuxtImg :src="product.image" class="w-6 h-6 object-contain" />
            <span class="text-sm">{{ product.name }}</span>
          </div>
        </div>
        <NuxtLink
          :to="review.file_url"
          class="inline-flex items-center gap-2 py-3 text-base text-primary font-normal transition duration-300 group"
        >
          Читать полностью 
          <img
            src="/icons/arrow-primary.svg"
            alt="→"
            class="w-4 h-4 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </article>
    </template>
  </div>
</template>

<style scoped>
.gradient-border {
  background: conic-gradient(
    #e14283,
    #ffe158,
    #3bc041,
    #4f8eff,
    #e14283
  );
}
</style>
