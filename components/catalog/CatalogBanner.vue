<template>
  <section class="w-full rounded-2xl">
    <div class="relative w-full xs-max:h-40 h-44 sm:h-48 lg:h-60 rounded-2xl overflow-hidden">
      <picture>
        <!-- mobile -->
        <source :srcset="banner.imageMobile" media="(max-width: 767px)" />
        <!-- tablet -->
        <source :srcset="banner.imageTablet" media="(max-width: 1023px)" />
        <!-- desktop -->
        <img
          :src="banner.imageDesktop"
          alt=""
          class="absolute inset-0 w-full h-full object-cover md:object-cover"
          loading="lazy"
          decoding="async"
        />
      </picture>

      <!-- Контент поверх изображения -->
      <div class="relative z-10 px-4 md:px-6 lg:px-10 py-5 lg:py-8 text-[#56462E]">
        <h2 class="font-medium leading-tight xs-max:text-[0.9rem] text-[clamp(1rem,4vw,2rem)] sm:text-3xl lg:text-[clamp(1.1rem,4vw,2rem)] mb-3">
          {{ banner.title_first }}{{ " " }}
          <span v-if="banner.title_second" class="xs-max:ms-0.5 ms-1 rounded-md px-1 md:px-3 py-1 text-black bg-[#c3ff0059] border-2 border-white/40">
            {{ banner.title_second }}
          </span>
        </h2>
        <p class="text-xs sm:text-base lg:text-lg font-light leading-tight max-w-[90%] sm:max-w-[80%] md:max-w-[70%] mb-3">
          {{ banner.text }}
        </p>
        <NuxtLink
          :to="banner.buttonLink"
          class="inline-flex w-[64%] sm:w-[40%] lg:w-[30%] justify-center items-center gap-2 border border-[#56462E] hover:bg-white hover:border-transparent hover:text-black rounded-lg px-2 py-1 md:py-2 xs-max:text-sm text-base md:text-xl tracking-wide transition duration-300"
        >
          {{ banner.buttonText }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CatalogBanner } from '~/types/catalog'
const props = defineProps<{ banner: CatalogBanner }>()
</script>
