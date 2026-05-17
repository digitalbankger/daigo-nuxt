<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  src?: string | null
  poster?: string | null
  title?: string
  playLabel?: string
  autoplay?: boolean
}>(), {
  title: 'Видео',
  playLabel: 'Смотреть видео',
  autoplay: true,
})

const isPlaying = ref(false)

const videoSrc = computed(() => String(props.src || '').trim())
const posterSrc = computed(() => String(props.poster || '').trim())

const isEmbedVideo = computed(() => {
  const src = videoSrc.value.toLowerCase()
  return /youtube\.com|youtu\.be|rutube\.ru|player\.vimeo\.com|vk\.com\/video_ext|vkvideo\.ru/.test(src)
})

function getYoutubeId(url: URL) {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.replace(/^\/+/, '').split('/')[0]
  }

  if (url.pathname.includes('/embed/')) {
    return url.pathname.split('/embed/')[1]?.split('/')[0]
  }

  return url.searchParams.get('v')
}

const iframeSrc = computed(() => {
  const raw = videoSrc.value
  if (!raw) return ''

  try {
    const url = new URL(raw, process.client ? window.location.origin : 'https://daigo.ru')

    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      const id = getYoutubeId(url)
      if (id) {
        const embed = new URL(`https://www.youtube.com/embed/${id}`)
        embed.searchParams.set('rel', '0')
        if (props.autoplay) embed.searchParams.set('autoplay', '1')
        return embed.toString()
      }
    }

    if (props.autoplay) {
      url.searchParams.set('autoplay', '1')
    }

    return url.toString()
  } catch {
    const separator = raw.includes('?') ? '&' : '?'
    return props.autoplay ? `${raw}${separator}autoplay=1` : raw
  }
})

function play() {
  if (!videoSrc.value) return
  isPlaying.value = true
}

watch(videoSrc, () => {
  isPlaying.value = false
})
</script>

<template>
  <div class="relative overflow-hidden bg-black">
    <template v-if="isPlaying && videoSrc">
      <iframe
        v-if="isEmbedVideo"
        :src="iframeSrc"
        :title="title"
        class="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      />

      <video
        v-else
        :src="videoSrc"
        :poster="posterSrc || undefined"
        class="absolute inset-0 h-full w-full bg-black object-contain"
        controls
        :autoplay="autoplay"
        playsinline
        preload="metadata"
      />
    </template>

    <template v-else>
      <img
        v-if="posterSrc"
        :src="posterSrc"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <video
        v-else-if="videoSrc && !isEmbedVideo"
        :src="videoSrc"
        class="absolute inset-0 h-full w-full bg-black object-cover"
        muted
        playsinline
        preload="metadata"
      />

      <div v-else class="absolute inset-0 bg-hoverbtn" />

      <button
        v-if="videoSrc"
        type="button"
        class="absolute inset-0 z-10 flex items-center justify-center bg-black/10 transition hover:bg-black/20"
        :aria-label="playLabel"
        @click.stop="play"
      >
        <span class="grid h-14 w-14 place-items-center rounded-full bg-white/90 shadow-lg transition hover:scale-105 sm:h-20 sm:w-20">
          <svg viewBox="0 0 20 20" class="ml-1 h-8 w-8 text-[#111] sm:h-10 sm:w-10" fill="currentColor" aria-hidden="true">
            <path d="M8 5v10l8-5-8-5z" />
          </svg>
        </span>
      </button>
    </template>
  </div>
</template>
