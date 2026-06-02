<template>
  <section v-if="resolvedProducts.length" class="py-4 md:py-8">
    <div class="container">
      <h2 class="text-3xl md:text-product font-medium mb-6 sm:mb-12">
        {{ title }}
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        <ProductCardComponent
          v-for="(p, i) in resolvedProducts"
          :key="p.product_id || p.id || i"
          :product="p"
          :global-index="i"
          image-class="article-product-image w-full h-[190px] sm:h-[300px] object-contain pointer-events-none scale-125"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ProductCard } from '~/types/product'
import { useProductsByIds } from '~/composables/useProductsByIds'
import ProductCardComponent from '~/components/catalog/ProductCard.vue'

const props = defineProps({
  title: { type: String, default: 'Рекомендуемые товары' },
  productIds: { type: Array as PropType<(string | number)[]>, default: () => [] },
  fallback: { type: Array as PropType<ProductCard[]>, default: () => [] },
})

const { items: itemsByIds } = useProductsByIds(computed(() => props.productIds))

const resolvedProducts = computed<ProductCard[]>(() => {
  if (itemsByIds.value?.length) return itemsByIds.value
  return props.fallback || []
})
</script>

<style scoped>
:deep(.article-product-image) {
  transform-origin: center;
}
</style>
