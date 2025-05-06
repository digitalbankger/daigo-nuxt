<script setup lang="ts">
import { useContentStore } from '~/store/contentStore'

const content = useContentStore()
</script>

<template>
  <section v-if="content.banner" class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-20 rounded-xl bg-cover bg-center text-white"
      :style="{ backgroundImage: `url(${content.banner.image})`, height: '500px' }"
    >
      <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
        <h1
          v-if="content.banner.title"
          class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)]"
        >
          {{ content.banner.title }}
        </h1>
        <div
          v-html="content.banner.html"
          class="mb-6 text-[clamp(1rem,6vw,1.5rem)] flex flex-col gap-4 font-normal max-w-[90%] sm:max-w-[80%] lg:max-w-[550px]"
        />
        <NuxtLink
          :to="content.banner.buttonLink"
          class="inline-flex items-center gap-2 py-3 text-2xl font-normal transition duration-300 group"
        >
          {{ content.banner.buttonText }}
          <img
            src="/icons/arrow.svg"
            alt="→"
            class="w-5 h-5 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>

    </div>
  </section>
</template>
