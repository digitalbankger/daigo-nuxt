<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductCard from '~/components/catalog/ProductCard.vue'
import type { Product } from '~/types/product'

const products = ref<Product[]>([])
const isLoading = ref(true)

const bundles = [
  {
    id: 101,
    name: 'Курсовой набор',
    subtitle: 'Усиленный курс кишечник/мозг (2 Тамоцу и Дайго Люкс)',
    image: '/placeholder.svg?height=315&width=315',
    price: 227500,
    originalPrice: 284375,
    discount: 20,
    properties: {}
  },
  {
    id: 102,
    name: 'Курсовой набор',
    subtitle: 'Курс: 6 месяцев приема Daigo 5 мл (18 коробок)',
    image: '/placeholder.svg?height=315&width=315',
    price: 268200,
    originalPrice: 335250,
    discount: 20,
    properties: {}
  },
  {
    id: 103,
    name: 'Курсовой набор',
    subtitle: 'Полгода здоровья от Дайго (курс 6 месяцев)',
    image: '/placeholder.svg?height=315&width=315',
    price: 613600,
    originalPrice: 767000,
    discount: 20,
    properties: {}
  },
  {
    id: 104,
    name: 'Курсовой набор',
    subtitle: 'Курс: 1 месяц приема Daigo 5 мл (3 коробки)',
    image: '/placeholder.svg?height=315&width=315',
    price: 44700,
    originalPrice: 55875,
    discount: 20,
    properties: {}
  }
]

onMounted(async () => {
  // Имитируем загрузку данных
  await new Promise(resolve => setTimeout(resolve, 500))
  products.value = bundles
  isLoading.value = false
})
</script>

<template>
  <section class="w-full py-8">
    <h2 class="text-slider font-medium mb-6">Наборы по выгодным ценам</h2>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="relative"
      >
        <!-- Бейдж скидки -->
        <div 
          v-if="product.discount"
          class="absolute top-4 left-4 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium"
        >
          -{{ product.discount }}%
        </div>
        
        <div class="relative transition rounded-2xl shadow-pc bg-white">
          <div class="w-full h-[315px] bg-hoverbtn flex items-center justify-center gap-4 overflow-hidden mb-4 rounded-xl">
            <img
              :src="product.image"
              :alt="product.name"
              class="object-contain w-full h-full"
            />
          </div>

          <div class="p-4">
            <h3 class="font-medium leading-tight mb-2 text-[clamp(1rem,6vw,1.4rem)]">
              {{ product.name }}
            </h3>
            <p class="text-[clamp(0.9rem,6vw,1rem)] mb-4 text-black/70">
              {{ product.subtitle }}
            </p>

            <div class="flex flex-col items-start gap-4">
              <div class="flex flex-col">
                <p class="font-medium leading-tight text-[clamp(1rem,6vw,1.4rem)]">
                  {{ product.price.toLocaleString() }} ₽
                </p>
                <p 
                  v-if="product.originalPrice" 
                  class="text-sm text-gray-500 line-through"
                >
                  {{ product.originalPrice.toLocaleString() }} ₽
                </p>
              </div>

              <button
                class="w-full flex items-center justify-center bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
