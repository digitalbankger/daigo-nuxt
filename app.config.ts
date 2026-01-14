export default defineAppConfig({
  gamification: {
    wheelSegments: <import('~/types/gamification').WheelSegment[]>[
      { id: 's5', label: 'Скидка 5%', type: 'discount', value: 5 },
      { id: 's10', label: 'Скидка 10%', type: 'discount', value: 10 },
      { id: 'gift', label: 'Подарок', type: 'gift', value: 'sampler' },
      { id: 'none', label: 'Увы', type: 'none' },
      { id: 'coupon', label: 'Купон DAIGO-BF', type: 'coupon', value: 'DAIGO-BF-10' },
    ],
    giftOptions: <import('~/types/gamification').GiftOption[]>[
      { id: 'ship', title: 'Бесплатная доставка', subtitle: 'на заказ сегодня', image: '/img/gifts/ship.webp' },
      { id: 'sampler', title: 'Пробник продукта', subtitle: 'к текущему заказу', image: '/img/gifts/sample.webp' },
      { id: 'next10', title: '-10% на следующий заказ', subtitle: 'купон в профиль', image: '/img/gifts/coupon.webp' },
    ],
    giftTimerSec: 600, // 10 минут
  }
})
