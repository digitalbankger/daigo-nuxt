<script setup lang="ts">
import type { Review } from '~/types/content'
import type { Product } from '~/types/product'
import ReviewStorySlide from './ReviewStorySlide.vue'

// (опционально) мой лёгкий компонент карусели
// import ProductCarousel from '~/components/ui/ProductCarousel.vue'
const props = defineProps<{ isOpen: boolean; reviews: Review[] }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const currentIndex = ref(0)

const showProducts = ref(false)

/** ТОЛЬКО товары из объекта отзыва */
const currentReview = computed(() => props.reviews[currentIndex.value])
const { items: relatedProducts, loading: productsLoading, error: productsError } =
  useProductsByIds(computed(() => currentReview.value?.productIds))


function close() {
  emit('close')
  currentIndex.value = 0
  showProducts.value = false
}

function next() {
  if (currentIndex.value < props.reviews.length - 1) currentIndex.value++
  else close()
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
    <button class="absolute top-4 right-4 text-white z-50" @click="close">✕</button>

    <div class="relative flex h-[90vh] w-full max-w-5xl overflow-visible">
      <!-- Кнопка показать товары -->
      <button
        v-if="productsLoading || relatedProducts.length"
        @click="showProducts = !showProducts"
        class="absolute top-4 left-4 z-50 text-white bg-black/40 px-3 py-1 rounded text-xs"
      >
        <span v-if="productsLoading">Загружаем…</span>
        <span v-else>{{ showProducts ? 'Скрыть товары' : 'Показать товары' }}</span>
      </button>

      <!-- Слайдер сторис -->
      <div class="relative w-full flex items-center justify-center">
        <div
          v-for="(review, i) in props.reviews.slice(currentIndex, currentIndex + 3)"
          :key="review.id + '-' + (i === 0 ? 'active' : i)"
          class="w-full sm:w-[30vw] absolute transition-all duration-500 ease-in-out"
          :class="[
            i === 0 ? 'z-30 scale-100 opacity-100' : '',
            i === 1 ? 'z-20 scale-75 opacity-50 translate-x-[70%]' : '',
            i === 2 ? 'z-10 scale-50 opacity-30 translate-x-[140%]' : ''
          ]"
        >
          <ReviewStorySlide :review="review" :active="i === 0" @next="next" />
        </div>
      </div>

      <!-- Товары: КАРУСЕЛЬ В РЯД -->
      <transition name="fade">
        <div
          v-if="showProducts"
          class="w-full absolute bottom-0 left-0 right-0 bg-white p-4 z-40 max-h-[36vh] rounded-t-lg shadow-xl"
        >
          <div v-if="productsLoading" class="text-sm text-gray-500 px-1 py-2">Загружаем товары…</div>
          <div v-else-if="productsError" class="text-sm text-red-600 px-1 py-2">Не удалось загрузить товары</div>

          <div v-else class="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hidden">
            <div
              v-for="p in relatedProducts"
              :key="p.id"
              class="snap-start flex-shrink-0 w-[min(70vw,240px)] bg-white rounded-xl p-3 shadow"
            >
              <NuxtLink :to="p.slug ? `/catalog/${p.slug}` : `/product/${p.id}`">
                <NuxtImg
                  :src="p.image"
                  :alt="p.name"
                  width="500"
                  height="500"
                  class="w-full h-36 object-contain mb-3 bg-hoverbtn rounded-lg"
                  loading="lazy"
                />
                <div class="text-base font-medium line-clamp-2 mb-1">{{ p.name }}</div>
                <div class="text-xs text-gray-600 mb-1 line-clamp-1">{{ p.subtitle }}</div>
                <div class="text-sm font-semibold">{{ p.price }} ₽</div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar { display: none; }
.scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
</style>
