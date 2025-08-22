import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для применения промокода. В реальном сервисе
 * следует проверить промокод, обновить корзину и вернуть новую
 * структуру корзины и promo_notice, если изменились акции или скидки.
 * Этот мок демонстрирует работу: код "WELCOME" даёт скидку 5%.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Если тело запроса отсутствует или поле code пустое — промокод невалиден
  if (!body || !body.code) {
    return { success: false, message: 'Промокод отсутствует' }
  }
  // Эмулируем проверку промокода. Для примера код WELCOME даёт 5% скидку
  if (String(body.code).trim().toUpperCase() === 'WELCOME') {
    return {
      success: true,
      promo_notice: {
        type: 'code',
        discount: 5,
        couponName: 'WELCOME',
        productName: 'Daigo',
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    }
  }
  // Во всех остальных случаях промокод считается недействительным
  return { success: false, message: 'Промокод недействителен' }
})