<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  content: string
  image: string
  imagePosition?: 'left' | 'right'
}>()
</script>

<template>
  <section
    class="flex flex-col md:flex-row gap-8 items-start"
    :class="imagePosition === 'left' ? 'md:flex-row-reverse' : ''"
  >
    <!-- Изображение -->
    <div class="relative w-full md:w-[42%] h-[528px] aspect-[4/3] bg-hoverbtn rounded-3xl overflow-hidden">
      <img
        :src="image"
        class="absolute inset-0 w-full h-full object-cover"
        alt="product image"
      />
    </div>

    <!-- Текст -->
    <div class="w-full md:w-[58%] space-y-4">
      <h2 class="text-product font-medium">{{ title }}</h2>
      <h3 v-if="subtitle" class="text-xl font-medium">{{ subtitle }}</h3>
      <div class="text-base leading-relaxed space-y-4 w-11/12" v-html="content" />
    </div>
  </section>
</template>
