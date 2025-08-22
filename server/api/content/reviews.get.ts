import type { Review } from '~/types/content'

export default defineEventHandler((): Review[] => {
  return [
    {
      id: 1,
      type: 'video',
      author: 'Алика Смехова',
      author_role: 'Актриса театра и кино, певица, ведущая',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-anna.png'],
      file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
    {
      id: 2,
      type: 'video',
      author: 'Алика Смехова',
      author_role: 'Актриса театра и кино, певица, ведущая',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['http://localhost:3000/images/mock/review/review-anna.png'],
      file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
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
