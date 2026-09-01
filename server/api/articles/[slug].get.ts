import { defineEventHandler, getRouterParams, createError, setResponseHeader } from 'h3'
import { readArticle } from '~/server/utils/articlesFs'

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

  const data = await readArticle(slug)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

  // JSON статьи меняется только вместе с деплоем. Для SPA-переходов держим API горячим.
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')
  setResponseHeader(event, 'X-Articles-Source', 'build-content')
  return data
})
