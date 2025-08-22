<script setup lang="ts">
defineProps<{ items: { q: string; a: string }[] }>()
const open = ref<number | null>(null)
const toggle = (i: number) => open.value = open.value === i ? null : i
</script>

<template>
  <div class="mt-4 divide-y">
    <div v-for="(f,i) in items" :key="i" class="py-3">
      <button
        class="w-full text-left font-medium flex justify-between items-center"
        :aria-expanded="open === i"
        :aria-controls="`faq-${i}`"
        @click="toggle(i)"
      >
        <span>{{ f.q }}</span>
        <span aria-hidden="true">{{ open === i ? '−' : '+' }}</span>
      </button>
      <div
        class="mt-2 text-gray-600"
        :id="`faq-${i}`"
        role="region"
        v-show="open === i"
      >
        {{ f.a }}
      </div>
    </div>
  </div>
</template>
