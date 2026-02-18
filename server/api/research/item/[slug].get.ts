import { getRouterParams, createError } from 'h3'
import type { ArticleDetail } from '~/types/articles'
import { getResearchDetailBySlug } from '~/server/utils/researchContent'

export default defineEventHandler((event) => {
  const { slug } = getRouterParams(event)

  const item = getResearchDetailBySlug(String(slug))
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Исследование не найдено' })
  }

  return item as ArticleDetail
})
