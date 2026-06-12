import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.daigoApiBase
  const body = await readBody(event)
  if (body && typeof body === 'object' && !body.roistat) {
    body.roistat = getCookie(event, 'roistat_visit') || 'nocookie'
  }
  const auth = getHeader(event, 'authorization') || ''

  const res = await $fetch(`${base}/v1/shop/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body
  })

  return res
})
