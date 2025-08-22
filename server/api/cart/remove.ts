import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для удаления товара из корзины. В реальном бэкенде
 * необходимо удалить товар и вернуть актуальный состав корзины. Сейчас
 * возвращаем статус 200 без изменений.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // TODO: удалить товар по id = body.id
  return { success: true }
})