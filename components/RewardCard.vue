<template>
  <div class="relative w-full bg-hoverbtn rounded-2xl md:rounded-3xl px-4 py-6 md:p-8 min-h-[340px] md:min-h-[430px] h-full flex flex-row gap-2 md:gap-4 items-end md:!items-start">
    <div class="relative overflow-hidden w-[35%] md:w-[45%] order-2 md:order-1">
      <img
        v-if="reward.image"
        :src="reward.image"
        :alt="reward.name"
        class="w-full h-full object-contain mt-auto"
      />
    </div>
    <div class="w-[65%] md:w-[55%] flex flex-col justify-start order-1 md:order-2">
      <img
        v-if="reward.logo"
        :src="reward.logo"
        :alt="reward.name"
        class="max-w-[120px] h-auto mb-4"
      />

      <div class="w-[100%]">
        <h3 class="text-xl md:text-2xl font-medium mb-2">{{ reward.name }}</h3>
        <p class="text-xs md:text-base text-black/70 mb-4">{{ reward.about }}</p>
        <p class="border-l-2 border-black ps-2 md:ps-4 text-sm md:text-base whitespace-pre-line">{{ reward.description }}</p>
      </div>

      <img
        src="/icons/arrow-up-right.svg"
        alt="arrow"
        class="absolute w-10 md:w-8 h-10 md:h-8 top-4 right-4"
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
