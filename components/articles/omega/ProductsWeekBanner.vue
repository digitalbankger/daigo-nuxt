<script setup lang="ts">
import type { ArticleProductMini } from '~/types/articles'
import OmegaProductCard from './OmegaProductCard.vue'

withDefaults(defineProps<{
  products: ArticleProductMini[]
  title?: string
}>(), {
  title: 'Продукты недели'
})
</script>

<template>
  <section v-if="products.length" class="bg-primary rounded-[20px] px-4 py-6 md:px-8 md:py-8">
    <h2 class="text-white font-medium text-3xl md:text-5xl mb-6 md:mb-8">{{ title }}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <OmegaProductCard v-for="p in products" :key="p.product_id" :product="p" variant="banner" />
    </div>
  </section>
</template>
