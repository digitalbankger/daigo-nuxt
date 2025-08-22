<script setup lang="ts">
import StorySlide from './StorySlide.vue'
import type { Story } from '~/types/content'
import type { Product } from '~/types/product'

const props = defineProps<{
  isOpen: boolean
  slides: Story[]
}>()

const showProducts = ref(false)
const relatedProducts = ref<Product[]>([])

const currentStory = computed(() => props.slides[currentStoryIndex.value])

async function loadRelatedProducts() {
  const ids = currentStory.value?.productIds
  if (!ids?.length) return
  const { data } = await useFetch<{ items: Product[] }>('/api/shop/products', {
    query: { ids: ids.join(',') }
  })
  relatedProducts.value = data.value?.items || []
}

const emit = defineEmits<{ (e: 'close'): void }>()

const currentStoryIndex = ref(0)

const visibleStories = computed(() => {
  return props.slides.slice(currentStoryIndex.value, currentStoryIndex.value + 3)
})

function close() {
  emit('close')
  currentStoryIndex.value = 0
}

function nextStory() {
  if (currentStoryIndex.value < props.slides.length - 1) {
    currentStoryIndex.value++
  } else {
    close()
  }
}

watch(currentStory, async (story) => {
  showProducts.value = false
  relatedProducts.value = []

  if (story?.productIds?.length) {
    const { data } = await useFetch<{ items: Product[] }>('/api/shop/products', {
      query: { ids: story.productIds.join(',') }
    })
    relatedProducts.value = data.value?.items || []
    // автопоказ товаров
    // showProducts.value = true
  }
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
    <div class="relative flex h-[90vh] w-full max-w-5xl overflow-visible">
      <button class="absolute top-4 right-4 text-white z-50" @click="close">✕</button>

      <div class="relative w-full flex items-center justify-center">
        <div
          v-for="(story, i) in visibleStories"
          :key="story.id"
          class="w-[40vw] absolute transition-all duration-500 ease-in-out"
          :class="[
            i === 0 ? 'z-30 scale-100 opacity-100' : '',
            i === 1 ? 'z-20 scale-75 opacity-50 translate-x-[70%]' : '',
            i === 2 ? 'z-10 scale-50 opacity-30 translate-x-[140%]' : ''
          ]"
        >
          <StorySlide
            :story="story"
            :active="i === 0"
            @next="nextStory"
          />
        </div>
        <button
          @click="() => { showProducts = !showProducts; if (showProducts) loadRelatedProducts() }"
          class="absolute top-2 left-2 z-50 text-white bg-black/40 px-3 py-1 rounded text-xs"
        >
          {{ showProducts ? 'Скрыть товары' : 'Показать товары' }}
        </button>

        <transition name="fade">
          <div
            v-if="showProducts && relatedProducts.length"
            class="w-full absolute bottom-0 left-0 right-0 bg-white p-4 z-40 max-h-[36vh] rounded-t-lg shadow-xl"
          >
            <div class="flex flex-row flex-wrap gap-4 justify-start mx-auto">
              <div
                v-for="product in relatedProducts"
                :key="product.id"
                class="w-1/4 min-w-[200px] flex-shrink-0"
              >
                <NuxtImg
                  :src="product.image"
                  :alt="product.name"
                  width="500"
                  height="500"
                  class="w-full h-36 object-contain mb-3 bg-hoverbtn rounded-lg"
                />
                <div class="text-lg font-medium mb-2">{{ product.name }}</div>
                <div class="text-xs text-gray-600 mb-2">{{ product.subtitle }}</div>
                <div class="text-sm font-medium text-black">{{ product.price }} ₽</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
