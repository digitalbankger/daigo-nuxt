import { defineStore } from 'pinia'
import type { Banner, Review, Story } from '~/types/content'

export const useContentStore = defineStore('content', () => {
  const banners = ref<Banner[]>([])
  const stories = ref<Story[]>([])
  const reviews = ref<Review[]>([])
  const isLoaded = ref(false)

  async function load() {
    if (isLoaded.value) return

    const [bannersRes, storiesRes, reviewsRes] = await Promise.all([
      useFetch<Banner[]>('/api/content/banner', {
        server: true,
        lazy: false,
        default: () => [],
      }),
      useFetch<Story[]>('/api/content/stories', {
        server: true,
        lazy: true,
        default: () => [],
      }),
      useFetch<Review[]>('/api/content/reviews', {
        server: true,
        lazy: false,
        default: () => [],
      })
    ])

    banners.value = bannersRes.data.value || []
    stories.value = storiesRes.data.value || []
    reviews.value = reviewsRes.data.value || []
    isLoaded.value = true
  }

  return { banners, stories, reviews, load, isLoaded }
})
