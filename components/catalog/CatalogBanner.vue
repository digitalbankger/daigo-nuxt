<script setup lang="ts">
import type { CatalogBanner } from '~/types/catalog'
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '~/stores/deviceStore'

const props = defineProps<{ banner: CatalogBanner }>()

const { isMobile, isTablet } = storeToRefs(useDeviceStore())

const backgroundImage = computed(() => {
  if (isMobile.value) return `url(${props.banner.imageMobile})`
  if (isTablet.value) return `url(${props.banner.imageTablet})`
  return `url(${props.banner.imageDesktop})`
})
</script>

<template>
  <section
    class="w-full flex items-center justify-center rounded-2xl h-60 bg-cover bg-center bg-no-repeat px-6 md:px-6 lg:px-10 py-8 md:py-8 text-white"
    :style="{ backgroundImage }"
  >
    <div class="md:w-full flex flex-col gap-4 items-start justify-center my-auto">
      <h2 class="font-medium leading-tight text-[clamp(1.6rem,6vw,2rem)]">
        {{ banner.title_first }}<span v-if="banner.title_second" class="ms-1 rounded-md px-3 py-1 text-black bg-[#C3FF00]"> {{ banner.title_second }}</span>
      </h2>
      <p class="text-base md:text-lg leading-10 text-left max-w-[90%] md:max-w-[70%] mb-1">
        {{ banner.text }}
      </p>
      <NuxtLink
        :to="banner.buttonLink"
        class="inline-flex w-[30%] justify-center items-center gap-2 border border-white hover:bg-white hover:text-black rounded-lg py-2 text-xl tracking-wide transition duration-300"
      >
        {{ banner.buttonText }}
      </NuxtLink>
    </div>
  </section>
</template>
