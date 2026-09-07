<template>
  <OptimizedPicture
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :widths="[320, 640]"
    :sizes="sizes"
    :eager="eager"
    :class="class"
  />
</template>

<script setup lang="ts">
import OptimizedPicture from '~/components/ui/OptimizedPicture.vue'

withDefaults(defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  class?: string
  eager?: boolean
  sizes?: string
}>(), {
  width: 560,
  height: 560,
  class: '',
  eager: false,
  sizes: '(max-width: 1023px) calc(50vw - 24px), 26vw',
})
</script>
