<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="fetchPriority"
    decoding="async"
    :class="class"
    @error="handleImageError"
  >
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'
import { buildOptimizedImageUrl } from '~/utils/optimizedImage'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  class?: string
  eager?: boolean
}>(), {
  width: 560,
  height: 560,
  class: '',
  eager: false,
})

const placeholderSrc = '/images/placeholder-product.png'

const originalSrc = computed(() =>
  normalizeMediaUrlOrFallback(props.src, placeholderSrc)
)

// generate-optimized-images.mjs создаёт только 480/640. Для карточки используем
// один заранее известный WebP. Если скрипт не запускался или конкретное фото
// не смогло сгенерироваться, @error мгновенно откатывается на исходный URL.
const prerenderedSrc = computed(() => {
  const targetWidth = Number(props.width) <= 480 ? 480 : 640
  // ВАЖНО: путь строим из исходного src ровно так же, как build-time скрипт.
  // originalSrc может быть уже переписан в /media-s3/... для браузерного fallback,
  // тогда его hash/path не совпадёт с файлом, созданным из исходного S3 URL.
  return buildOptimizedImageUrl(props.src, targetWidth, 'webp')
})

const currentSrc = ref(prerenderedSrc.value || originalSrc.value)
let fallbackStage = 0

watch([prerenderedSrc, originalSrc], ([optimized, original]) => {
  fallbackStage = 0
  currentSrc.value = optimized || original || placeholderSrc
})

const fetchPriority = computed(() => props.eager ? 'high' : 'auto')

function handleImageError() {
  if (fallbackStage === 0 && currentSrc.value !== originalSrc.value) {
    fallbackStage = 1
    currentSrc.value = originalSrc.value
    return
  }

  if (currentSrc.value !== placeholderSrc) {
    fallbackStage = 2
    currentSrc.value = placeholderSrc
  }
}
</script>
