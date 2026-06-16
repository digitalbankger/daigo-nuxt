<script setup lang="ts">
import { computed } from 'vue'
import OptimizedPicture from '~/components/ui/OptimizedPicture.vue'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  size?: number
  class?: string
}>(), { size: 500 })

const normalizedSrc = computed(() => normalizeMediaUrl(props.src))
const widths = computed(() => {
  const size = Math.max(1, Number(props.size) || 500)
  return Array.from(new Set([size, size * 2])).sort((a, b) => a - b)
})
</script>

<template>
  <OptimizedPicture
    :src="normalizedSrc"
    :alt="alt || ''"
    :width="size"
    :height="size"
    :widths="widths"
    sizes="100vw"
    :class="class"
  />
</template>
