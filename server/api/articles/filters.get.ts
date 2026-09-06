import { defineEventHandler, setResponseHeader } from 'h3'
import { getArticleFilterGroups } from '~/server/utils/articleFilters'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
  return getArticleFilterGroups()
})
