<script setup lang="ts">
import type { Story } from '~/types/content'
import { useIntersectionObserver } from '@vueuse/core'

const stories = ref<Story[]>([])
const target = ref<HTMLElement | null>(null)
const loaded = ref(false)

const emit = defineEmits<{
  (e: 'open', story: Story): void
}>()

const fetchStories = async () => {
  const { data } = await useFetch<Story[]>('/api/content/stories', { server: false })
  if (data.value) stories.value = data.value
}

useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !loaded.value) {
      loaded.value = true
      fetchStories()
    }
  },
  { threshold: 0.1 }
)
</script>

<template>
  <div ref="target" class="flex gap-7 overflow-x-auto px-4 py-2 mx-auto">
    <div
      v-for="story in stories"
      :key="story.id"
      class="gradient-border w-[104px] h-[104px] rounded-full p-[2px] flex items-center justify-center shrink-0 cursor-pointer"
      @click="emit('opening', story)"
    >
      <NuxtImg
        :src="story.thumbnail"
        :alt="story.title"
        class="w-[100px] h-[100px] object-cover rounded-full transition-transform duration-300 hover:scale-105"
        format="webp"
        loading="lazy"
      />
    </div>
  </div>
</template>

<style scoped>
.gradient-border {
  background: conic-gradient(
    #e14283,
    #ffe158,
    #3bc041,
    #4f8eff,
    #e14283
  );
}
</style>