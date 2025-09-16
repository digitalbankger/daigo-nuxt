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
    class="flex flex-col gap-8 items-start"
    :class="imagePosition === 'left' ? 'sm:flex-row-reverse' : 'lg:flex-row'"
  >
    <!-- Изображение -->
    <div class="relative w-full lg:w-[42%] h-[528px] aspect-[4/3] bg-hoverbtn rounded-3xl overflow-hidden hidden lg:block">
      <img
        :src="image"
        class="absolute inset-0 w-full h-full object-cover"
        alt="product image"
      />
    </div>

    <!-- Текст -->
    <div class="w-full lg:w-[58%] space-y-4">
      <h2 class="text-product font-medium">{{ title }}</h2>
      <div class="relative w-full lg:w-[42%] h-[210px] sm:h-[350px] aspect-[4/3] bg-hoverbtn rounded-2xl overflow-hidden block lg:hidden">
        <img
          :src="image"
          class="absolute inset-0 w-full h-full object-cover"
          alt="product image"
        />
      </div>
      <h3 v-if="subtitle" class="text-lg sm:text-xl font-medium">{{ subtitle }}</h3>
      <div class="text-sm sm:text-base leading-relaxed space-y-4 w-full lg:w-11/12" v-html="content" />
    </div>
  </section>
</template>
