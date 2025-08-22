import { readBody, setResponseStatus } from 'h3'
import type { ArticleComment } from '~/types/articles'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ slug: string; message: string; name?: string }>(event)
  if (!body?.slug || !body?.message) {
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  }
  // мок: как будто сохранили
  const comment: ArticleComment = {
    id: Math.floor(Math.random() * 1e6),
    author: { name: body.name || 'Гость' },
    message: body.message,
    createdAt: new Date().toISOString()
  }
  setResponseStatus(event, 201)
  return { ok: true, comment }
})
