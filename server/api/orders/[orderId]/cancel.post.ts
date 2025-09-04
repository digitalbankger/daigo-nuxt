export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.daigoApiBase
  const orderId = getRouterParam(event, 'orderId')!
  const auth = getHeader(event, 'authorization') || ''

  const res = await $fetch(`${base}/v1/shop/order/${orderId}/cancel/`, {
    method: 'POST',
    headers: { ...(auth ? { Authorization: auth } : {}) }
  })

  return res
})
