<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  size?: number
  class?: string
}>(), { size: 500 })

const failed = ref(false)
const normalized = computed(() => props.src?.replace(/^http:\/\//i, 'https://') || '')
const s = computed(() => props.size)
const ipx1x = computed(() => `/_ipx/s_${s.value}x${s.value}/${normalized.value}`)
const ipx2x = computed(() => `/_ipx/s_${s.value*2}x${s.value*2}/${normalized.value}`)

const outSrc    = computed(() => failed.value ? normalized.value : ipx1x.value)
const outSrcset = computed(() => failed.value ? undefined : `${ipx1x.value} 1x, ${ipx2x.value} 2x`)
</script>

<template>
  <img
    :src="outSrc"
    :srcset="outSrcset"
    :alt="alt || ''"
    :width="size"
    :height="size"
    loading="lazy"
    decoding="async"
    :class="class"
    @error="failed = true"
  />
</template>
