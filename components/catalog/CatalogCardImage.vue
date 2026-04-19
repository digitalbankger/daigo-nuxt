<template>
  <OptimizedPicture
    :src="normalizedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :widths="pictureWidths"
    :sizes="sizes"
    :class="class"
    :eager="eager"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OptimizedPicture from '~/components/ui/OptimizedPicture.vue'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
  sizes?: string
  class?: string
  eager?: boolean
}>(), {
  width: 560,
  height: 560,
  sizes: '(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 22vw',
  class: '',
  eager: false,
})

const normalizedSrc = computed(() => String(props.src || '').trim() || '/images/placeholder-product.png')
const pictureWidths = computed(() => [320, 480, 640])
</script>
