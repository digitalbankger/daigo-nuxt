<script setup lang="ts">
import type { ArticleSideProduct } from "~/types/articles";
import LongevityBannerProductCard from "./LongevityBannerProductCard.vue";

defineProps<{ product: ArticleSideProduct; backgroundImage?: string }>();
</script>

<template>
  <div
    class="relative bg-hoverbtn rounded-[25px] overflow-hidden flex items-center justify-center p-6 md:p-8 min-h-[420px]"
  >
    <img
      v-if="backgroundImage"
      :src="backgroundImage"
      alt=""
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      decoding="async"
    />
    <div class="relative z-10 w-full max-w-[304px]">
      <LongevityBannerProductCard :product="product" :subtitle="product.subtitle" />
    </div>
  </div>
</template>
