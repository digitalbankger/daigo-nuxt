<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :width="width"
    :height="height"
    loading="eager"
    :fetchpriority="fetchPriority"
    decoding="async"
    :class="class"
    @error="handleImageError"
  >
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { normalizeMediaUrlOrFallback } from '~/utils/mediaUrl'

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

const fallbackSrc = '/images/placeholder-product.png'

const normalizedSrc = computed(() =>
  normalizeMediaUrlOrFallback(props.src, fallbackSrc)
)

const currentSrc = ref(normalizedSrc.value)

watch(normalizedSrc, (src) => {
  currentSrc.value = src || fallbackSrc
})

const fetchPriority = computed(() => props.eager ? 'high' : 'auto')

function handleImageError() {
  if (currentSrc.value !== fallbackSrc) {
    currentSrc.value = fallbackSrc
  }
}
</script>
