<script setup lang="ts">
definePageMeta({ layout: 'main' })

usePageCanonical('/otzyvy')

import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useHead } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ReviewCard from '~/components/reviews/ReviewCard.vue'
import { useReviewsStore } from '~/stores/reviewsStore'
import type { Review } from '~/types/content'
import ReviewFormModal from '~/components/reviews/ReviewFormModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useCatalogStore } from '~/stores/catalogStore'
import { createProductReview } from '~/services/reviewService'

// Ленивая модалка полного текстового отзыва
const ReviewTextModal = defineAsyncComponent(
  () => import('@/components/reviews/ReviewFullModal.vue')
)

const reviewsStore = useReviewsStore()
const authStore = useAuthStore()
const catalogStore = useCatalogStore()

// Состояния загрузки
const isLoading = ref(true)
const loadError = ref<unknown>(null)

// Загрузка данных
onMounted(async () => {
  try {
    await Promise.allSettled([reviewsStore.loadAllReviews(), catalogStore.ensureAllLoaded?.()])
  } catch (e) {
    loadError.value = e
    console.error('[otzyvy] load error', e)
  } finally {
    isLoading.value = false
  }
})

// Данные
const reviews = computed<Review[]>(() => reviewsStore.allReviews ?? [])
// Модалка: полный текст отзыва
const selectedTextReview = ref<Review | null>(null)
const isTextModalOpen = computed(() => !!selectedTextReview.value)
function openText(review: Review) { selectedTextReview.value = review }
function closeText() { selectedTextReview.value = null }


const isReviewFormOpen = ref(false)
const reviewSubmitting = ref(false)
const reviewError = ref('')
const reviewFormRef = ref<InstanceType<typeof ReviewFormModal> | null>(null)
const productOptions = computed(() => (catalogStore.allProducts || []).filter((p: any) => p?.slug || p?.product_id || p?.id))

function openReviewForm() {
  if (!authStore.isAuthenticated || !authStore.userId) {
    authStore.openAuth('/otzyvy')
    return
  }
  reviewError.value = ''
  isReviewFormOpen.value = true
}

async function submitSiteReview(payload: any) {
  if (!authStore.userId) {
    authStore.openAuth('/otzyvy')
    return
  }
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    const product = payload.product
    const slug = String(product?.slug || '').trim()
    if (!slug) throw new Error('Выберите товар для отзыва')

    const formData = payload.formData instanceof FormData ? payload.formData : new FormData()
    formData.set('daigo_id', String(authStore.userId))
    await createProductReview(slug, formData)

    reviewFormRef.value?.markSent()
  } catch (e: any) {
    reviewError.value = e?.data?.message || e?.statusMessage || e?.message || 'Не удалось отправить отзыв'
  } finally {
    reviewSubmitting.value = false
  }
}

// SEO мета
useHead(() => {
  const title = 'Отзывы о Daigo — видео, аудио и тексты'
  const description = 'Живые отзывы пользователей и известных людей о Daigo: видео, аудио и текстовые впечатления. Сопутствующие товары и полезные истории.'
  const url = 'https://daigo.ru/otzyvy'
  return {
    title,
    link: [{ key: 'canonical', rel: 'canonical', href: url }],
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
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-10">
        <h1 class="text-[clamp(2.4rem,6vw,4rem)] font-medium">Отзывы</h1>
        <button type="button" class="h-12 rounded-lg bg-primary px-5 text-sm md:text-base font-medium text-white hover:bg-hoverbtn hover:text-black transition" @click="openReviewForm">Оставить отзыв</button>
      </div>

      <!-- Скелет / состояния -->
      <p v-if="isLoading" class="text-center text-gray-500">Отзывы загружаются...</p>
      <p v-else-if="loadError" class="text-center text-red-500">Не удалось загрузить отзывы</p>

      <template v-else-if="reviews.length">
        <!-- Видео отзывы --> 
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Видео отзывы
          </h2>
          <NuxtLink to="/otzyvy/type/daigo-video" class="flex items-center gap-3 text-lg md:text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-4 md:w-5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'video')"
            :key="review.id"
            :review="review"
          />
        </div>

        <!-- Аудио отзывы -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Аудио отзывы
          </h2>
          <NuxtLink to="/otzyvy/type/daigo-audio" class="flex items-center gap-3 text-lg md:text-2xl">
            Все <img src="/icons/arrow-right-b.svg" alt="arrow" class="w-4 md:w-5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          <ReviewCard
            v-for="review in reviews.filter(r => r.type === 'audio')"
            :key="review.id"
            :review="review"
          />
        </div>

        <!-- Текстовые отзывы -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-medium text-[clamp(1.6rem,6vw,3.2rem)] leading-tight">
            Текстовые отзывы
          </h2>
          <NuxtLink to="/otzyvy/type/daigo-text" class="flex items-center gap-3 text-lg md:text-2xl">
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

      <ClientOnly>
        <ReviewFormModal
          ref="reviewFormRef"
          :show="isReviewFormOpen"
          title="Оставить отзыв о Daigo"
          :products="productOptions"
          :submitting="reviewSubmitting"
          :error="reviewError"
          @close="isReviewFormOpen = false"
          @submit="submitSiteReview"
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
