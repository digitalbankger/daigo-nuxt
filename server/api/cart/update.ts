import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для обновления количества товара в корзине. В реальном
 * бэкенде нужно будет найти товар по id и обновить количество. Сейчас
 * возвращаем статус 200 без изменений.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // TODO: обновить количество товара с id = body.id до body.quantity
  return { success: true }
})