export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = config.public.daigoApiBase
  const daigoId = getRouterParam(event, 'daigoId')!
  const auth = getHeader(event, 'authorization') || ''

  const res = await $fetch(`${base}/v1/shop/order/history/${daigoId}`, {
    headers: { ...(auth ? { Authorization: auth } : {}) }
  })

  return res
})
