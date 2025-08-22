import { EventHandler, getQuery } from 'h3'
import type { ArticleComment } from '~/types/articles'

const COMMENTS: Record<string, ArticleComment[]> = {
  'printsip-dejstviya-metabiotikov': [
    {
      id: 1,
      author: { name: 'Андреева Анна' },
      message: 'Текст комментария по теме статьи',
      createdAt: '2025-06-30T10:00:00Z'
    },
    {
      id: 2,
      author: { name: 'Алексеев Евгений' },
      message: 'Спасибо, было полезно!',
      createdAt: '2025-06-30T12:15:00Z'
    }
  ]
}

export default cachedEventHandler(async (event) => {
  const { slug } = getQuery(event)
  return COMMENTS[String(slug)] ?? []
}, { maxAge: 15 }) // комменты кешируем короче
