import { defineEventHandler } from 'h3'

/**
 * Моковый эндпоинт для получения корзины. В реальном бэкенде сюда
 * необходимо добавить логику получения корзины текущего пользователя.
 * Если пользователь авторизован, id может браться из JWT или сессии.
 */
export default defineEventHandler(async (event) => {
  // Здесь можно добавить проверку авторизации. Для примера считаем,
  // что пользователь всегда авторизован и отдаём статичную корзину.

  return {
    items: [
      {
        id: 1,
        title: 'Daigo 5 ml',
        subtitle: 'Для кишечника и иммунитета',
        price: 12500,
        oldPrice: 13100,
        quantity: 1,
        image: '/products/daigo5.jpg',
        tag: 'Hit'
      },
      {
        id: 2,
        title: 'Daigo Dent',
        subtitle: 'Зубы и десна',
        price: 3200,
        quantity: 2,
        image: '/products/daigodent.jpg'
      }
    ],
    gifts: [
      {
        id: 101,
        title: 'Пептидные гидрогелевые патчи',
        image: '/gifts/patch.jpg',
        note: 'Подарок за покупку'
      },
      {
        id: 102,
        title: '10 саше Daigo 5 мл',
        image: '/gifts/sashe.jpg'
      }
    ],
    // Пример promo_notice. Бэкенд должен возвращать объект, а не массив.
    promo_notice: {
      type: 'discount',
      discount: 10,
      productName: 'Daigo',
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    }
  }
})