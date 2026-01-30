export default defineEventHandler(async (event) => {
  const { daigoApiBase } = useRuntimeConfig()

  const path = getRouterParam(event, 'path') || ''
  const target = `${daigoApiBase}/${path}`

  const method = event.method || 'GET'
  const query = getQuery(event)

  // Тело читаем только если метод не GET/HEAD
  const body = (method === 'GET' || method === 'HEAD') ? undefined : await readBody(event)

  // Пробрасываем важные заголовки
  const headers = new Headers()
  const incoming = getRequestHeaders(event)

  // content-type если есть
  if (incoming['content-type']) headers.set('content-type', incoming['content-type'])

  // auth если используешь
  if (incoming['authorization']) headers.set('authorization', incoming['authorization'])

  // cookies/сессии — если нужно прокидывать
  if (incoming['cookie']) headers.set('cookie', incoming['cookie'])

  return await $fetch(target, {
    method,
    query,
    body,
    headers,
  })
})
