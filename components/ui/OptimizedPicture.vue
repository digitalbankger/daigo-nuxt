<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  buildOptimizedImageSrcSet,
  normalizeOptimizedImageSrc,
} from '~/utils/optimizedImage'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  width?: number
  height?: number
  widths?: number[]
  sizes?: string
  class?: string
  eager?: boolean
}>(), {
  width: 320,
  height: 320,
  widths: () => [320, 640],
  sizes: '100vw',
  class: '',
  eager: false,
})

const failed = ref(false)

const normalizedSrc = computed(() => normalizeOptimizedImageSrc(props.src))
const sortedWidths = computed(() => [...props.widths].map((v) => Math.round(v)).filter(Boolean).sort((a, b) => a - b))
const avifSrcset = computed(() => buildOptimizedImageSrcSet(props.src, sortedWidths.value, 'avif'))
const webpSrcset = computed(() => buildOptimizedImageSrcSet(props.src, sortedWidths.value, 'webp'))

watch(() => props.src, () => {
  failed.value = false
})

function onError() {
  if (!failed.value) {
    failed.value = true
  }
}
</script>

<template>
  <img
    v-if="failed"
    :src="normalizedSrc"
    :alt="alt || ''"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    :fetchpriority="eager ? 'high' : 'auto'"
    :class="class"
  />

  <picture v-else>
    <source
      v-if="avifSrcset"
      type="image/avif"
      :srcset="avifSrcset"
      :sizes="sizes"
    />
    <source
      v-if="webpSrcset"
      type="image/webp"
      :srcset="webpSrcset"
      :sizes="sizes"
    />
    <img
      :src="normalizedSrc"
      :alt="alt || ''"
      :width="width"
      :height="height"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      :fetchpriority="eager ? 'high' : 'auto'"
      :class="class"
      @error="onError"
    />
  </picture>
</template>
