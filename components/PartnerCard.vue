<template>
  <div class="relative bg-hoverbtn rounded-3xl px-4 py-6 md:p-8 min-h-[430px] h-full flex flex-col justify-start items-start">
  <img
    v-if="partner.logo"
    :src="partner.logo"
    :alt="partner.name"
    class="max-h-[80px] md:max-h-[92px] mb-4"
  />

  <div class="w-[100%]">
    <h3 class="text-xl md:text-2xl font-medium mb-2">{{ partner.name }}</h3>
    <p class="text-xs md:text-base text-black/70 mb-4">{{ partner.about }}</p>
    <p class="border-l-2 border-black ps-2 md:ps-4 text-sm md:text-base whitespace-pre-line" v-html="partner.description"></p>
  </div>

  <img
    src="/icons/arrow-up-right.svg"
    alt="arrow"
    class="absolute w-10 md:w-8 h-10 md:h-8 top-4 right-4"
  />
</div>
</template>

<script setup lang="ts">
defineProps<{
  partner: {
    name: string
    about: string
    description: string
    logo?: string
  }
}>()
</script>
