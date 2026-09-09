<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ReviewCard from '~/components/reviews/ReviewCard.vue'
import type { Review } from '~/types/content'
import { useReviewsStore } from '~/stores/reviewsStore'

/** поддерживаем и ваши текущие "daigo-*" и короткие слаги */
const TYPE_MAP: Record<string, { type: Review['type'], h1: string, seoTitle: string, seoDesc: string }> = {
  // видео
  'video':        { type: 'video',      h1: 'Видео отзывы', seoTitle: 'Видео отзывы Daigo', seoDesc: 'Смотрите видео-отзывы покупателей Daigo.' },
  'daigo-video':  { type: 'video',      h1: 'Видео отзывы', seoTitle: 'Видео отзывы Daigo', seoDesc: 'Смотрите видео-отзывы покупателей Daigo.' },

  // аудио
  'audio':        { type: 'audio',      h1: 'Аудио отзывы', seoTitle: 'Аудио отзывы Daigo', seoDesc: 'Слушайте аудио-отзывы покупателей Daigo.' },
  'daigo-audio':  { type: 'audio',      h1: 'Аудио отзывы', seoTitle: 'Аудио отзывы Daigo', seoDesc: 'Слушайте аудио-отзывы покупателей Daigo.' },

  // текст
  'text':         { type: 'text',       h1: 'Текстовые отзывы', seoTitle: 'Текстовые отзывы Daigo', seoDesc: 'Читайте текстовые отзывы покупателей Daigo.' },
  'daigo-text':   { type: 'text',       h1: 'Текстовые отзывы', seoTitle: 'Текстовые отзывы Daigo', seoDesc: 'Читайте текстовые отзывы покупателей Daigo.' },

  // «сторис» от известных людей (если понадобится отдельная страница)
  'celebrity':    { type: 'celebrity',  h1: 'Отзывы от известных людей', seoTitle: 'Отзывы от известных людей', seoDesc: 'Сторис и отзывы известных людей о Daigo.' },
}

const route = useRoute()
const canonical = usePageCanonical(() => `/otzyvy/type/${String(route.params.slug)}`)
const router = useRouter()
const reviewsStore = useReviewsStore()

const isLoading = ref(true)
const loadError = ref<unknown>(null)

const conf = computed(() => TYPE_MAP[String(route.params.slug)])
if (!conf.value) {
  throw createError({ statusCode: 404, statusMessage: 'Подкатегория отзывов не найдена', fatal: true })
}

/** загрузка данных без блокировки рендера */
onMounted(async () => {
  try {
    if (!reviewsStore.isLoaded) {
      await reviewsStore.loadAllReviews()
    }
  } catch (e) {
    loadError.value = e
  } finally {
    isLoading.value = false
  }
})

/** список по типу */
const list = computed<Review[]>(() =>
  (reviewsStore.allReviews ?? []).filter(r => r.type === conf.value.type)
)

/** ——— Пагинация по query ?page=N ——— */
const PAGE_SIZE = 12
const page = computed<number>(() => {
  const n = Number(route.query.page ?? 1)
  return Number.isFinite(n) && n > 0 ? n : 1
})
const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / PAGE_SIZE)))
const paginated = computed(() =>
  list.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)
watch([list], () => {
  // если после загрузки текущая страница вышла за пределы — вернёмся на 1
  if (page.value > totalPages.value) {
    router.replace({ query: { ...route.query, page: 1 } })
  }
})

function go(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  router.push({ query: { ...route.query, page: p } })
}

/** SEO / OG */
useSeoMeta({
  title: conf.value.seoTitle,
  description: conf.value.seoDesc,
  ogTitle: conf.value.seoTitle,
  ogDescription: conf.value.seoDesc,
  ogType: 'website',
  ogUrl: () => canonical.value,
})
</script>

<template>
  <BaseContainer>
    <section class="relative w-full px-5">
      <h1 class="text-[clamp(2.4rem,6vw,3.4rem)] font-medium mb-8">
        {{ conf.h1 }}
      </h1>

      <div v-if="isLoading" class="text-center text-gray-500">Загружаем…</div>
      <div v-else-if="loadError" class="text-center text-red-500">Не удалось загрузить отзывы</div>

      <template v-else>
        <div v-if="!list.length" class="text-center text-gray-500">Пока нет отзывов.</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReviewCard
            v-for="r in paginated"
            :key="r.id"
            :review="r"
          />
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            class="px-3 py-2 rounded border"
            :disabled="page <= 1"
            @click="go(page - 1)"
          >
            ← Назад
          </button>
          <span class="mx-2">Стр. {{ page }} из {{ totalPages }}</span>
          <button
            class="px-3 py-2 rounded border"
            :disabled="page >= totalPages"
            @click="go(page + 1)"
          >
            Вперёд →
          </button>
        </div>
      </template>


    </section>
  </BaseContainer>
</template>
