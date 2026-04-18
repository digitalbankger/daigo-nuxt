<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside'

const props = withDefaults(defineProps<{
  src?: string | null
  alt?: string
  width?: number
  height?: number
  sizes?: string
  quality?: number
  fit?: FitMode
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  fetchpriority?: 'high' | 'low' | 'auto'
  imgClass?: string
  legacyFormat?: 'png' | 'jpeg' | 'jpg' | 'webp'
}>(), {
  src: '',
  alt: '',
  width: 560,
  height: 560,
  sizes: '',
  quality: 72,
  fit: 'inside',
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
  imgClass: '',
})

const failed = ref(false)
const $img = useImage()

const normalizedSrc = computed(() => {
  const raw = String(props.src || '').trim()
  if (!raw) return '/images/placeholder-product.png'
  return raw.replace(/^http:\/\//i, 'https://')
})

const sourcePath = computed(() => normalizedSrc.value.split('?')[0].toLowerCase())

const computedLegacyFormat = computed<'png' | 'jpeg' | 'jpg' | 'webp'>(() => {
  if (props.legacyFormat) return props.legacyFormat
  if (/\.(png|webp|gif|svg)$/.test(sourcePath.value)) return 'png'
  return 'jpeg'
})

const canOptimize = computed(() => {
  const src = normalizedSrc.value
  return Boolean(src) && !failed.value && !src.startsWith('data:')
})

const baseModifiers = computed(() => ({
  width: props.width,
  height: props.height,
  quality: props.quality,
  fit: props.fit,
}))

function buildSrc(format?: string) {
  if (!canOptimize.value) return normalizedSrc.value
  return $img(
    normalizedSrc.value,
    format ? { ...baseModifiers.value, format } : baseModifiers.value
  )
}

const avifSrc = computed(() => buildSrc('avif'))
const webpSrc = computed(() => buildSrc('webp'))
const fallbackSrc = computed(() => buildSrc(computedLegacyFormat.value))

function handleError() {
  failed.value = true
}
</script>

<template>
  <picture>
    <source
      v-if="canOptimize"
      :srcset="avifSrc"
      type="image/avif"
    />
    <source
      v-if="canOptimize"
      :srcset="webpSrc"
      type="image/webp"
    />
    <img
      :src="failed ? normalizedSrc : fallbackSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes || undefined"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="fetchpriority"
      :class="imgClass"
      draggable="false"
      @error="handleError"
    />
  </picture>
</template>
