import { defineStore } from 'pinia'
import type { Banner, Review } from '~/types/content'

type StoryLite = { id: number | string; thumbnail: string; title?: string }
type StoryDetail = { id: number | string; title?: string; slides: string[]; products: string[] }

export const useContentStore = defineStore('content', () => {
  const banners = ref<Banner[]>([])
  const stories = ref<StoryLite[]>([])     // <— теперь только «кружки»
  const reviews = ref<Review[]>([])
  const isLoaded = ref(false)

  async function load() {
    if (isLoaded.value) return

    const [bannersRes, storiesRes, reviewsRes] = await Promise.all([
      useFetch<Banner[]>('/api/content/banner', { server: true, lazy: false, default: () => [] }),
      useFetch<StoryLite[]>('/api/content/stories', { server: true, lazy: false, default: () => [] }),
      useFetch<Review[]>('/api/content/reviews', { server: true, lazy: false, default: () => [] })
    ])

    banners.value = bannersRes.data.value || []
    stories.value = storiesRes.data.value || []
    reviews.value = reviewsRes.data.value || []
    isLoaded.value = true
  }

  async function fetchStory(id: string | number): Promise<StoryDetail> {
    const { data } = await useFetch<StoryDetail>('/api/content/story', { query: { id: String(id) } })
    return (data.value as StoryDetail) || { id, slides: [], products: [] }
  }

  return { banners, stories, reviews, load, isLoaded, fetchStory }
})
