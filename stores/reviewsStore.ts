import { defineStore } from 'pinia'
import type { Review } from '~/types/content'

export const useReviewsStore = defineStore('reviews', () => {
  const allReviews = ref<Review[]>([])
  const isLoaded = ref(false)

  async function loadAllReviews() {
    if (isLoaded.value) return

    try {
      const data = await $fetch<Review[]>('/api/content/reviews/all')
      allReviews.value = data ?? []
    } catch (e) {
      console.error('[reviewsStore] loadAllReviews error', e)
      allReviews.value = []
    } finally {
      isLoaded.value = true
    }
  }

  return { loadAllReviews, allReviews, isLoaded }
})
