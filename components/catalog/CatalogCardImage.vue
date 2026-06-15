<template>
  <img
    :src="normalizedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    :class="class"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const normalizedSrc = computed(() =>
  String(props.src || '').trim() || '/images/placeholder-product.png'
)
</script>