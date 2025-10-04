<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useHead } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ReviewCard from '~/components/reviews/ReviewCard.vue'
import MediaModal from '~/components/reviews/MediaModal.vue'
import ReviewStoryModal from '~/components/reviews/ReviewStoryModal.vue'
import { useReviewsStore } from '~/stores/reviewsStore'
import type { Review } from '~/types/content'

// Ленивая модалка полного текстового отзыва
const ReviewTextModal = defineAsyncComponent(
  () => import('@/components/reviews/ReviewFullModal.vue')
)

const reviewsStore = useReviewsStore()

// Состояния загрузки
const isLoading = ref(true)
const loadError = ref<unknown>(null)

// Загрузка данных
onMounted(async () => {
  try {
    await Promise.allSettled([reviewsStore.loadAllReviews()])
  } catch (e) {
    loadError.value = e
    console.error('[otzyvy] load error', e)
  } finally {
    isLoading.value = false
  }
})

// Данные
const reviews = computed<Review[]>(() => reviewsStore.allReviews ?? [])
const celebrityReviews = computed(() => reviews.value.filter(r => r.type === 'celebrity'))

// Модалки: сторис «известных»
const isCelebModalOpen = ref(false)
const modalReviews = ref<Review[]>([])

function openStory(review: Review) {
  const list = celebrityReviews.value
  const index = list.findIndex(r => r.id === review.id)
  if (index !== -1) {
    modalReviews.value = [...list.slice(index), ...list.slice(0, index)]
    isCelebModalOpen.value = true
  }
}

// Модалка: видео/аудио карточек (не «сторис»)
const selectedStory = ref<Review | null>(null)

// Модалка: полный текст отзыва
const selectedTextReview = ref<Review | null>(null)
const isTextModalOpen = computed(() => !!selectedTextReview.value)
function openText(review: Review) { selectedTextReview.value = review }
function closeText() { selectedTextReview.value = null }

// SEO мета
useHead(() => {
  const title = 'Отзывы о Daigo — видео, аудио и тексты'
  const description = 'Живые отзывы пользователей и известных людей о Daigo: видео, аудио и текстовые впечатления. Сопутствующие товары и полезные истории.'
  const url = 'https://your-domain/otzyvy'
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description
        })
      }
    ]
  }
})
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <h1 class="text-[clamp(2.4rem,6vw,4rem)] font-medium mb-4 md:mb-10">Отзывы</h1>

      <!-- Скелет / состояния -->
      <p v-if="isLoading" class="text-center text-gray-500">Отзывы загружаются...</p>
      <p v-else-if="loadError" class="text-center text-red-500">Не удалось загрузить отзывы</p>

      <template v-else-if="reviews.length">
        <!-- Сторис от известных людей -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium text-[clamp(1.2rem,4vw,2.8rem)] leading-tight">
            Отзывы от известных людей
          </h2>
        </div>

        <div class="overflow-x-auto scrollbar-hidden mb-10 md:mb-16 py-6 border-b border-black/20">
          <div class="flex gap-4 md:gap-8 min-w-full">
            <ReviewCard
              v-for="review in celebrityReviews"
              :key="review.id"
              :review="review"
              @open-story="openStory(review)"
            />
          </div>
        </div>

        <!-- Видео отзывы --> 
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Видео отзывы
          </h2>
          <NuxtLink to="/otzyvy/daigo-video" class="flex items-center gap-3 text-lg md:text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-4 md:w-5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'video')"
            :key="review.id"
            :review="review"
            @open-story="() => (selectedStory = review)"
          />
        </div>

        <!-- Аудио отзывы -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Аудио отзывы
          </h2>
          <NuxtLink to="/otzyvy/daigo-audio" class="flex items-center gap-3 text-lg md:text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-4 md:w-5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'audio')"
            :key="review.id"
            :review="review"
            @open-story="() => (selectedStory = review)"
          />
        </div>

        <!-- Текстовые отзывы -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Текстовые отзывы
          </h2>
          <NuxtLink to="/otzyvy/daigo-text" class="flex items-center gap-3 text-lg md:text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-4 md:w-5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'text')"
            :key="review.id"
            :review="review"
            @open-text="openText"
          />
        </div>
      </template>

      <p v-else class="text-center text-gray-500">Пока нет отзывов.</p>

      <!-- Модалка сторис «известных» -->
      <ClientOnly>
        <ReviewStoryModal
          :isOpen="isCelebModalOpen"
          :reviews="modalReviews"
          @close="isCelebModalOpen = false"
        />
      </ClientOnly>

      <!-- Модалка видео/аудио -->
      <ClientOnly>
        <MediaModal
          v-if="selectedStory"
          :show="!!selectedStory"
          :type="selectedStory.video_url ? 'video' : selectedStory.file_url ? 'audio' : 'image'"
          :src="selectedStory.video_url || selectedStory.file_url || selectedStory.preview"
          :onClose="() => (selectedStory = null)"
        />
      </ClientOnly>

      <!-- Модалка полного текста -->
      <ClientOnly>
        <ReviewTextModal
          :show="isTextModalOpen"
          :review="selectedTextReview"
          :onClose="closeText"
        />
      </ClientOnly>
    </section>
  </BaseContainer>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar { display: none; }
.scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
</style>
