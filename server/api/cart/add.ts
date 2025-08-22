import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для добавления товара в корзину. В реальной
 * реализации нужно будет обновить корзину в базе данных и вернуть
 * актуальное состояние корзины. Сейчас возвращаем статус 200.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Валидация body может быть добавлена здесь
  // TODO: передать body в бизнес-логику для добавления в корзину
  return { success: true }
})