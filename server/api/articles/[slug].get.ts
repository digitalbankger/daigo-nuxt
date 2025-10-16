import { defineEventHandler, getRouterParams, createError, setResponseHeader } from 'h3'
import { readArticle } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

  const data = await readArticle(slug)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

  // кэш на минуту
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120')
  return data
})
