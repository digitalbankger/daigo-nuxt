import { Review } from '~/types/content'

export default defineEventHandler((): Review[] => {
  return [
    {
      id: 1,
      userName: 'Анна',
      rating: 5,
      comment: 'Очень понравился сервис и быстрая доставка!',
      avatar: '/images/users/anna.jpg'
    },
    {
      id: 2,
      userName: 'Игорь',
      rating: 4,
      comment: 'Хорошее качество товара, буду заказывать ещё.'
    }
  ]
})
