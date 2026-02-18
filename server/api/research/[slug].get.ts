import { createError } from 'h3'
import type { ResearchCategory } from '~/types/research'
import { getCategoryCounts, getPopularItemsByCategory, getResearchItemsByCategory } from '~/server/utils/researchContent'

type CategorySlug = 'metabiotiki' | 'plazmogeny'

const CATEGORIES_BASE: Record<CategorySlug, Omit<ResearchCategory, 'researchCount'>> = {
  metabiotiki: {
    id: 1,
    slug: 'metabiotiki',
    title: 'Метабиотики',
    image: 'https://daigo.ru/images/mock/researches/cat-1.png',
  },
  plazmogeny: {
    id: 2,
    slug: 'plazmogeny',
    title: 'Плазмалогены',
    image: 'https://daigo.ru/images/mock/researches/cat-2.png',
  },
}

export default defineEventHandler((event) => {
  const { slug } = event.context.params || {}

  const categorySlug: CategorySlug =
    slug === 'plazmogeny' ? 'plazmogeny' :
    slug === 'metabiotiki' ? 'metabiotiki' :
    // совместимость: старые ссылки/ошибки — по умолчанию metabiotiki
    'metabiotiki'

  const counts = getCategoryCounts()
  const base = CATEGORIES_BASE[categorySlug]
  if (!base) throw createError({ statusCode: 404, statusMessage: 'Категория не найдена' })

  const category: ResearchCategory = { ...base, researchCount: counts[categorySlug] }

  const items = getResearchItemsByCategory(categorySlug)
  const popularItems = getPopularItemsByCategory(categorySlug, 6)

  return { category, items, popularItems }
})
