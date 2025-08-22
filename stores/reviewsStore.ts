import { defineStore } from 'pinia'
import type { Review } from '~/types/content'

export const useReviewsStore = defineStore('content', () => {
  const allReviews = ref<Review[]>([])    
  const isLoaded = ref(false)
  
  async function loadAllReviews() {
    if (isLoaded.value) return

    const { data } = await useFetch<Review[]>('/api/content/reviews/all', {
      key: 'all-reviews',
      server: true,
      lazy: false,
      default: () => [],
    })

    allReviews.value = data.value || []
    isLoaded.value = true
  }

  return { loadAllReviews, allReviews, isLoaded }
})
