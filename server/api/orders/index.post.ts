export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.daigoApiBase
  const body = await readBody(event)
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
