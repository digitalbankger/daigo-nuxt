<script setup lang="ts">
type FaqItem = { q: string; a: string }
const props = defineProps<{ items: FaqItem[] }>()
</script>

<template>
  <div class="space-y-3">
    <details
      v-for="(x, i) in props.items"
      :key="i"
      class="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
    >
      <summary class="cursor-pointer font-medium text-base sm:text-lg">
        {{ x.q }}
      </summary>
      <div class="mt-3 text-sm sm:text-base text-black/70 whitespace-pre-line">
        {{ x.a }}
      </div>
    </details>
  </div>
</template>