import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для применения промокода. В реальном сервисе
 * следует проверить промокод, обновить корзину и вернуть новую
 * структуру корзины и promo_notice, если изменились акции или скидки.
 * Этот мок демонстрирует работу: код "ЛЕТО10" даёт скидку 10%.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Если тело запроса отсутствует или поле code пустое — промокод невалиден
  if (!body || !body.code) {
    return { success: false, message: 'Промокод отсутствует' }
  }
  // Эмулируем проверку промокода. Для примера код ЛЕТО10 даёт 10% скидку
  if (String(body.code).trim().toUpperCase() === 'ЛЕТО10') {
    return {
      success: true,
      promo_notice: {
        type: 'code',
        discount: 10,
        couponName: 'ЛЕТО10',
        productName: 'Daigo',
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    }
  }
  // Во всех остальных случаях промокод считается недействительным
  return { success: false, message: 'Промокод недействителен' }
})