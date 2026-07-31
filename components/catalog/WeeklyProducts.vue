<script setup lang="ts">
import type { ProductCard as ProductCardType } from '~/types/product'
import ProductCard from '~/components/catalog/ProductCard.vue'

defineProps<{
  products: ProductCardType[]
}>()
</script>

<template>
  <section
    class="mb-8 overflow-hidden rounded-[18px] bg-primary p-3 sm:mb-10 sm:p-5 lg:rounded-[22px] lg:p-6"
    aria-labelledby="weekly-products-title"
  >
    <h2
      id="weekly-products-title"
      class="mb-3 text-[clamp(1.7rem,4vw,2.5rem)] font-medium leading-none text-white sm:mb-5"
    >
      Продукты недели
    </h2>

    <div class="weekly-products-scroll -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
      <div
        v-for="(product, index) in products"
        :key="String(product.product_id)"
        class="min-w-[84%] snap-start sm:min-w-[47%] lg:min-w-0"
      >
        <ProductCard
          :product="product"
          :index="index"
          :global-index="index"
          :priority="true"
          variant="weekly"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.weekly-products-scroll {
  scrollbar-width: none;
}

.weekly-products-scroll::-webkit-scrollbar {
  display: none;
}
</style>
