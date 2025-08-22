// server/api/promotions/all.get.ts
export default defineEventHandler(() => {
  return [
    {
      id: 1,
      title: 'Скидка 20% на витамины',
      description: 'Получите скидку при покупке от 3000₽',
      image: '/images/mock/akcii/promo-1.png',
      coupon: 'VITAMIN20',
      promo_type: 'code',
    },
    {
      id: 2,
      title: 'Подарок к заказу',
      description: 'Добавим подарок при покупке товара X',
      image: '/images/mock/akcii/promo-2.png',
      promo_type: 'gift',
    },
    {
      id: 3,
      title: 'Скидка 10% на первый заказ',
      description: 'Для новых покупателей',
      image: '/images/mock/akcii/promo-3.png',
      promo_type: 'discount',
    },
    {
      id: 4,
      title: 'Скидка 10% на первый заказ',
      description: 'Для новых покупателей',
      image: '/images/mock/akcii/promo-4.png',
      promo_type: 'discount',
    },
  ]
})
