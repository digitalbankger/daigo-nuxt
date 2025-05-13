import type { Review } from '~/types/content'

export default defineEventHandler((): Review[] => {
  return [
    {
      id: 1,
      author: '@alika_smekhova',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-avatar.webp'],
      file_url: 'https://example.com/review-1.pdf'
    },
    {
      id: 2,
      author: 'Анна Смирнова',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-avatar.webp'],
      file_url: 'https://example.com/review-1.pdf'
    },
    {
      id: 3,
      author: 'Анна Смирнова',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-avatar.webp'],
      file_url: 'https://example.com/review-1.pdf'
    },
    {
      id: 4,
      author: '@alika_smekhova',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-avatar.webp'],
      file_url: 'https://example.com/review-1.pdf'
    },
    {
      id: 5,
      author: '@alika_smekhova',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-avatar.webp'],
      file_url: 'https://example.com/review-1.pdf'
    },
  ]
})
