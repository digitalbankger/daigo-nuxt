<template>
  <div class="relative w-full bg-hoverbtn rounded-3xl p-8 min-h-[430px] h-full flex flex-row gap-4 !items-start">
    <div class="relative overflow-hidden w-[45%]">
      <img
        v-if="reward.image"
        :src="reward.image"
        :alt="reward.name"
        class="w-full h-full object-contain"
      />
    </div>
    <div class="w-[55%] flex flex-col justify-start">
    <img
      v-if="reward.logo"
      :src="reward.logo"
      :alt="reward.name"
      class="max-w-[120px] h-auto mb-4"
    />

    <div class="w-[100%]">
      <h3 class="text-2xl font-medium mb-2">{{ reward.name }}</h3>
      <p class="text-base text-black/70 mb-4">{{ reward.about }}</p>
      <p class="border-l-2 border-black ps-4 text-base whitespace-pre-line">{{ reward.description }}</p>
    </div>

    <img
      src="/icons/arrow-up-right.svg"
      alt="arrow"
      class="absolute w-8 h-8 top-4 right-4"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reward: {
    image?: string
    name: string
    about: string
    description: string
    logo?: string
  }
}>()
</script>
