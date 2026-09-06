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
import { buildOptimizedImageCandidates } from '~/utils/optimizedImage'

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
const optimizedCandidates = computed(() => {
  const targetWidth = Number(props.width) <= 480 ? 480 : 640
  return buildOptimizedImageCandidates(props.src, targetWidth, 'webp')
})

const currentCandidates = computed(() => [
  ...optimizedCandidates.value,
  originalSrc.value,
  placeholderSrc,
].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index))

let candidateIndex = 0
const currentSrc = ref(currentCandidates.value[0] || placeholderSrc)

watch(currentCandidates, (candidates) => {
  candidateIndex = 0
  currentSrc.value = candidates[0] || placeholderSrc
})

const fetchPriority = computed(() => props.eager ? 'high' : 'auto')

function handleImageError() {
  const candidates = currentCandidates.value
  const nextIndex = candidateIndex + 1

  if (nextIndex < candidates.length) {
    candidateIndex = nextIndex
    currentSrc.value = candidates[nextIndex] || placeholderSrc
    return
  }

  currentSrc.value = placeholderSrc
}
</script>
