<script setup lang="ts">
import StorySlide from './StorySlide.vue'
import type { Product } from '~/types/product'
import { useContentStore } from '~/stores/contentStore'

const props = defineProps<{
  isOpen: boolean
  /** как и раньше: очередь сторисов (лайт-объекты из списка) */
  slides: any[]   // [{ id, thumbnail, ... }]; детали подгружаем лениво
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
const store = useContentStore()

const showProducts = ref(false)
const relatedProducts = ref<Product[]>([])
const currentStoryIndex = ref(0)

const rail = ref<HTMLDivElement | null>(null) // лента товаров

/** текущий сторис */
const currentStory = computed(() => props.slides[currentStoryIndex.value])

/** 3 карточки в «стеке» */
const visibleStories = computed(() => {
  return props.slides.slice(currentStoryIndex.value, currentStoryIndex.value + 3)
})

function close() {
  emit('close')
  currentStoryIndex.value = 0
  showProducts.value = false
  relatedProducts.value = []
}

function nextStory() {
  if (currentStoryIndex.value < props.slides.length - 1) {
    currentStoryIndex.value++
  } else {
    close()
  }
}

/** лениво дотягиваем детали сториса */
async function ensureStoryLoaded(story: any) {
  if (!story || (story.slides && story.productIds)) return
  try {
    const detail = await store.fetchStory(story.id) // /api/content/story → { slides: string[], products: string[] }
    story.slides = detail.slides || []
    story.media  = story.media || story.slides
    story.productIds = detail.products || []
  } catch {}
}

/** товары для нижнего блока */
async function loadRelatedProducts() {
  const ids: string[] = currentStory.value?.productIds || []
  if (!ids.length) {
    relatedProducts.value = []
    return
  }
  const { data } = await useFetch<{ items: Product[] }>('/api/shop/products', {
    query: { product_ids: ids.join(',') }
  })

  relatedProducts.value = (data.value?.items || [])
    .filter(p => (p?.price ?? 0) > 0) // ← строго исключаем 0
}

/** при смене сториса — дотянуть детали и (если есть) товары */
watch(currentStory, async (story) => {
  showProducts.value = false
  relatedProducts.value = []
  if (!story) return
  await ensureStoryLoaded(story)
  if (story.productIds?.length) {
    // showProducts.value = true  // ← если нужен автопоказ — раскомментируй
    await loadRelatedProducts()
  }
})

/** показать/скрыть товары */
async function toggleProducts() {
  showProducts.value = !showProducts.value
  if (showProducts.value) await loadRelatedProducts()
}

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[990] bg-black/90 flex items-center justify-center">
    <div class="relative flex h-full md:h-[90vh] w-full max-w-5xl overflow-visible">
      <button class="absolute top-3 md:top-4 right-4 md:right-4 text-white z-50" @click="close">✕</button>

      <div class="relative w-full flex items-center justify-center">
        <div
          v-for="(story, i) in visibleStories"
          :key="story.id"
          class="w-full md:w-[40vw] absolute transition-all duration-500 ease-in-out"
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
          @click="toggleProducts"
          class="absolute top-3 md:top-2 left-2 z-50 text-white bg-black/40 px-3 py-1 rounded text-xs"
        >
          {{ showProducts ? 'Скрыть товары' : 'Показать товары' }}
        </button>

        <!-- нижний «шит» с горизонтальной лентой товаров -->
        <transition name="fade">
          <div
            v-if="showProducts && relatedProducts.length"
            class="w-full absolute bottom-0 left-0 right-0 bg-white p-4 z-40 max-h-[50vh] md:max-h-[44vh] rounded-t-xl shadow-xl"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm text-black/70">
                Сопутствующие товары · {{ relatedProducts.length }}
              </div>
              <button class="text-sm text-primary hover:underline" @click="toggleProducts">Свернуть</button>
            </div>

            <div
              ref="rail"
              class="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 pr-1
                    select-none cursor-grab active:cursor-grabbing"
              aria-roledescription="карусель"
            >

              <NuxtLink
                v-for="p in relatedProducts"
                :key="p.id"
                :to="`/catalog/${p.slug}`"
                class="snap-start shrink-0 w-[220px] bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop
              >
                <SmartImg
                  :src="p.image"
                  :alt="p.name"
                  width="400"
                  height="400"
                  class="w-full h-36 object-contain mb-3 bg-hoverbtn rounded-lg"
                  loading="lazy"
                  decoding="async"
                />
                <div class="text-sm font-medium line-clamp-2 mb-1">{{ p.name }}</div>
                <div class="text-xs text-black/60 line-clamp-1 mb-2">{{ p.subtitle }}</div>
                <div class="text-sm font-semibold">
                  {{ (p.price ?? 0).toLocaleString('ru-RU') }} ₽
                </div>
              </NuxtLink>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
