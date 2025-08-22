<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useReviewsStore } from '~/stores/reviewsStore'
import type { Review } from '~/types/content'
import ReviewCard from '~/components/reviews/ReviewCard.vue'
import StoryModal from '~/components/StoryModal.vue'
import MediaModal from '~/components/reviews/MediaModal.vue'
import { useCatalogStore } from '~/stores/catalogStore'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ReviewStoryModal from '~/components/reviews/ReviewStoryModal.vue'

const isModalOpen = ref(false)
const reviews = computed(() => contentStore.allReviews)
const celebrityReviews = computed(() => reviews.value.filter(r => r.type === 'celebrity'))
const modalReviews = ref<Review[]>([])

const contentStore = useReviewsStore()
await contentStore.loadAllReviews()
const catalogStore = useCatalogStore()
await catalogStore.fetchProducts({})

function openStory(review: Review) {
  const index = celebrityReviews.value.findIndex(r => r.id === review.id)
  if (index !== -1) {
    modalReviews.value = [
      ...celebrityReviews.value.slice(index),
      ...celebrityReviews.value.slice(0, index)
    ]
    isModalOpen.value = true
  }
}

const selectedStory = ref<null | Review>(null)

const currentStoryIndex = computed(() =>
  celebrityReviews.value.findIndex(r => r.id === selectedStory.value?.id)
)

function showNextStory() {
  const next = celebrityReviews.value[currentStoryIndex.value + 1]
  if (next) selectedStory.value = next
}

function showPrevStory() {
  const prev = celebrityReviews.value[currentStoryIndex.value - 1]
  if (prev) selectedStory.value = prev
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full px-5">
      <h1 class="text-[clamp(3rem,6vw,4rem)] font-medium mb-10">Отзывы</h1>

      <template v-if="reviews.length">
        <!-- Сторис от знаменитостей -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium text-[clamp(2rem,6vw,2.8rem)] leading-tight">Отзывы от известных людей</h2>
        </div>
        <div class="overflow-x-auto scrollbar-hidden mb-16 py-6 border-b border-black/20">
          <div class="flex gap-8 min-w-full">
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
          <h2 class="font-medium text-[clamp(2rem,6vw,3.2rem)] leading-tight">Видео отзывы</h2>
          <NuxtLink to="/otzyvy/daigo-video" class="flex items-center gap-3 text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-5" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'video')"
            :key="review.id"
            :review="review"
            @open-story="() => selectedStory = review"
          />
        </div>

        <!-- Аудио отзывы -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-medium text-[clamp(2rem,6vw,3.2rem)] leading-tight">Аудио отзывы</h2>
          <NuxtLink to="/otzyvy/daigo-audio" class="flex items-center gap-3 text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-5" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'audio')"
            :key="review.id"
            :review="review"
            @open-story="() => selectedStory = review"
          />
        </div>

        <!-- Текстовые отзывы -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium text-[clamp(2rem,6vw,2.8rem)] leading-tight">Текстовые отзывы</h2>
          <NuxtLink to="/otzyvy/daigo-text" class="flex items-center gap-3 text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-5" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'text')"
            :key="review.id"
            :review="review"
          />
        </div>
      </template>

      <p v-else class="text-center text-gray-500">Отзывы загружаются...</p>

      <ReviewStoryModal
        :isOpen="isModalOpen"
        :reviews="modalReviews"
        @close="isModalOpen = false"
      />

      <MediaModal
        v-if="selectedStory"
        :show="!!selectedStory"
        :type="selectedStory.video_url ? 'video' : selectedStory.file_url ? 'audio' : 'image'"
        :src="selectedStory.video_url || selectedStory.file_url || selectedStory.preview"
        :onClose="() => selectedStory = null"
      />
    </section>
  </BaseContainer>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
