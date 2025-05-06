import { defineStore } from 'pinia'
import type { Banner, Review, Story } from '~/types/content'
import { fetchBanner, fetchReviews, fetchStories } from '~/services/contentService'

export const useContentStore = defineStore('content', () => {
  const banner = ref<Banner | null>(null)
  const stories = ref<Story[]>([])
  const reviews = ref<Review[]>([])
  const isLoaded = ref(false)

  async function load() {
    if (isLoaded.value) return
    banner.value = await fetchBanner()
    stories.value = await fetchStories()
    reviews.value = await fetchReviews()
    isLoaded.value = true
  }

  return { banner, stories, reviews, load }
})
