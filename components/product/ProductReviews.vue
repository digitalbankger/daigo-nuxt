<script setup lang="ts">
import { computed } from 'vue'

type ReviewItem = {
  id: string
  author: string
  rating: number
  date?: string
  title?: string
  text: string
  source?: string
  verified?: boolean
}

const props = defineProps<{
  reviews?: {
    ratingAvg: number
    count: number
    items: ReviewItem[]
    source?: string
  }
  title?: string
}>()

const safeTitle = computed(() => props.title ?? 'Отзывы')

const items = computed(() => props.reviews?.items ?? [])
const ratingAvg = computed(() => props.reviews?.ratingAvg ?? 0)
const count = computed(() => props.reviews?.count ?? items.value.length)

const formatDate = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    // RU-style date; ok for now because project copy is mostly RU.
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

const clampRating = (r: number) => Math.max(0, Math.min(5, r))
</script>

<template>
  <section v-if="items.length" class="mt-14">
    <div class="mx-auto max-w-[1310px] px-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl sm:text-3xl font-semibold text-[#111]">{{ safeTitle }}</h2>
          <div class="mt-2 flex items-center gap-3">
            <div class="flex items-center gap-1" aria-label="rating">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                :class="i <= Math.round(clampRating(ratingAvg)) ? 'text-[#FFB800]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>
            <div class="text-sm text-[#6B7280]">
              <span class="font-medium text-[#111]">{{ ratingAvg.toFixed(1) }}</span>
              <span class="mx-1">•</span>
              <span>{{ count }} отзыв(ов)</span>
            </div>
          </div>
        </div>

        <div class="text-sm text-[#6B7280]">
          <span v-if="reviews?.source">Источник: {{ reviews.source }}</span>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="r in items"
          :key="r.id"
          class="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-base font-semibold text-[#111]">{{ r.author }}</div>
              <div class="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
                <span v-if="r.verified" class="rounded-full bg-[#EAF7EE] px-2 py-1 text-[#118A3B]">
                  Проверенная покупка
                </span>
                <span v-if="formatDate(r.date)">{{ formatDate(r.date) }}</span>
                <span v-if="r.source">• {{ r.source }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1" aria-label="review rating">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                :class="i <= clampRating(r.rating) ? 'text-[#FFB800]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>
          </div>

          <div v-if="r.title" class="mt-3 text-sm font-semibold text-[#111]">{{ r.title }}</div>
          <p class="mt-3 text-sm leading-6 text-[#111]">{{ r.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
