import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для отправки заказа. В реальной реализации
 * необходимо передать полученные данные в систему обработки заказов
 * и вернуть уникальный идентификатор созданного заказа. Здесь
 * возвращается order_id, равный текущему времени в миллисекундах.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // TODO: реализовать реальную логику оформления заказа
  return { order_id: Date.now().toString() }
})