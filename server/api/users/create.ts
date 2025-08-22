import { defineEventHandler, readBody } from 'h3'

/**
 * Моковый эндпоинт для создания пользователя. Принимает объект
 * { fullName, phone, city } и возвращает статус успеха и id
 * созданного пользователя. В реальном бэкенде здесь должна быть
 * логика регистрации пользователя и сохранения его данных.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // Простая валидация входных данных
  if (!body || !body.fullName || !body.phone || !body.city) {
    return { success: false, message: 'Некорректные данные' }
  }
  // TODO: вызвать реальный сервис создания пользователя и вернуть id
  return { success: true, userId: Date.now() }
})