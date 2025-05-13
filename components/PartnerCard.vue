<template>
  <div class="border border-[#EBEBEB] rounded-2xl p-5 bg-white h-full flex flex-col items-center justify-start">
    <img :src="logo" :alt="name" class="mb-4 max-h-[60px] object-contain" />
    <h3 class="text-center text-xl font-medium mb-2">{{ name }}</h3>
    <p class="text-center text-sm">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logo: string
  name: string
  description: string
}>()
</script>
