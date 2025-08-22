import { defineStore } from 'pinia'
import type { ArticleDetail } from '~/types/articles'
import type { ResearchCategory, ResearchItem } from '~/types/research'

export const useResearchStore = defineStore('research', () => {
  const categories = ref<ResearchCategory[]>([])
  const researches = ref<ResearchItem[]>([])
  const popular = ref<ResearchItem[]>([])
  const currentCategory = ref<ResearchCategory | null>(null)
  const currentResearch = ref<ArticleDetail | null>(null)

  const fetchCategories = async () => {
    categories.value = await $fetch('/api/research')
  }

  const fetchCategoryItems = async (slug: string) => {
    const { category, items, popularItems } = await $fetch(`/api/research/${slug}`)
    currentCategory.value = category
    researches.value = items
    popular.value = popularItems
  }

  const fetchResearchBySlug = async (slug: string) => {
    currentResearch.value = await $fetch(`/api/research/item/${slug}`)
  }

  // для совместимости
  const fetchResearchById = async (idOrSlug: string) => fetchResearchBySlug(String(idOrSlug)) 
  
  return {
    categories,
    researches,
    popular,
    currentCategory,
    currentResearch,
    fetchCategories,
    fetchCategoryItems,
    fetchResearchById,
    fetchResearchBySlug,
  }
})
