<template>
  <NuxtLink :to="`/research/${category.slug}`" class="block group">
    <div class="relative overflow-hidden rounded-xl aspect-square mb-4">
      <img
        :src="category.image"
        :alt="category.title"
        class="object-cover w-full h-full transition group-hover:scale-105"
      />
    </div>
    <h2 class="text-lg font-semibold mb-1">{{ category.title }}</h2>
    <p class="text-sm text-gray-500">{{ category.count }} исследований</p>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ResearchCategory } from '~/types/research'

defineProps<{ category: ResearchCategory }>()
</script>
