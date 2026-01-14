<script setup lang="ts">
import type { Story } from '~/types/content'
import { useIntersectionObserver } from '@vueuse/core'

const modelStories = defineModel<Story[]>('stories')
const target = ref<HTMLElement | null>(null)
const loaded = ref(false)

const emit = defineEmits<{
  (e: 'open', story: Story): void
}>()

const fetchStories = async () => {
  const { data } = await useFetch<Story[]>('/api/content/stories', { server: false })
  if (data.value) modelStories.value = data.value
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
  <div ref="target" class="w-full flex items-center justify-start sm:justify-center gap-4 overflow-x-auto no-scrollbar scroll-touch px-4 py-2 mx-auto">
    <div
      v-for="story in modelStories"
      :key="story.id"
      class="gradient-border w-[70px] sm:w-[94px] lg:w-[104px] h-[70px] sm:h-[95px] lg:h-[104px] rounded-full p-[4px] flex items-center justify-center shrink-0 cursor-pointer"
      @click="emit('open', story)"
    >
      <NuxtImg
        :src="story.thumbnail"
        :alt="story.title"
        class="aspect-[1/1] w-[74px] sm:w-[90px] lg:w-[100px] h-[64px] sm:h-[90px] lg:h-[99px] object-cover rounded-full transition-transform duration-300 hover:scale-105"
        format="webp"
        loading="lazy"
        width="100"
        height="100"
      />
    </div>
  </div>
</template>

<style scoped>
.gradient-border {
  background: conic-gradient(#E10D11, #1c1c1c, #E10D11);
}
</style>
