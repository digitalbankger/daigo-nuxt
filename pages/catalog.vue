<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useCatalogStore } from '~/stores/catalog'
import ProductCard from '~/components/catalog/ProductCard.vue'
import CatalogFilters from '~/components/catalog/Filters.vue'

const catalogStore = useCatalogStore()
const { products, fetchProducts } = catalogStore

await fetchProducts()

useHead({
  title: 'Каталог — Daigo',
  meta: [
    { name: 'description', content: 'Каталог биологически активных добавок Daigo — широкий выбор качественных БАДов с доставкой' },
    { property: 'og:title', content: 'Каталог БАДов Daigo' },
    { property: 'og:description', content: 'Выбирайте из ассортимента качественных добавок для здоровья: иммунитет, кожа, кишечник' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://example.com/catalog' },
  ]
})
</script>

<template>
  <section class="px-4 md:px-10 py-6">
    <nav class="text-sm text-gray-500 mb-4">
      <NuxtLink to="/">Главная</NuxtLink> / <span>Каталог</span>
    </nav>

    <h1 class="text-3xl font-bold mb-6">Каталог</h1>

    <div class="bg-gray-100 p-4 rounded-md mb-6">
      <p class="mb-2">Как выбрать правильный товар?</p>
      <NuxtLink to="/articles" class="text-blue-600 underline">Перейти к статьям</NuxtLink>
    </div>

    <CatalogFilters class="mb-6" />

    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <div class="mt-10 text-gray-700 text-sm">
      <h2 class="text-xl font-semibold mb-2">Онлайн магазин БАДов «Дайго»</h2>
      <p>Забота о здоровье становится всё более актуальной темой... (текст из PDF)</p>
    </div>
  </section>
</template>
