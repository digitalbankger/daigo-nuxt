<template>
  <button
    type="button"
    class="relative w-full bg-hoverbtn rounded-xl md:rounded-2xl p-3 sm:p-4 h-[150px] sm:h-[180px] lg:h-[210px] flex items-center justify-center text-left overflow-hidden transition hover:shadow-pc focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    :aria-label="`Открыть описание награды: ${reward.name}`"
    @click="$emit('open', reward)"
  >
    <span class="sr-only">{{ reward.name }}</span>

    <img
      v-if="reward.image"
      :src="reward.image"
      :alt="reward.name"
      class="w-full h-full max-w-full max-h-full object-contain rounded-lg"
      loading="lazy"
    />
  </button>
</template>

<script setup lang="ts">
export type Reward = {
  image?: string
  name: string
  about: string
  description: string
  logo?: string
}

defineProps<{ reward: Reward }>()
defineEmits<{ (e: 'open', reward: Reward): void }>()
</script>
