// server/api/newsletter/subscribe.post.ts
import { defineEventHandler, readBody } from 'h3'

type SubscribeReq = { email: string }
type GoResp = { success: boolean; message?: string }

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscribeReq>(event)
  const email = (body?.email || '').trim().toLowerCase()

  if (!email) {
    event.node.res.statusCode = 400
    return { success: false, message: 'Email is required' }
  }

  // берем из public-конфига
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    const res = await $fetch<GoResp>('/v1/shop/newsletter/subscribe', {
      baseURL: daigoApiBase,
      method: 'POST',
      body: { email }
    })
    return res // { success: true }
  } catch (e: any) {
    event.node.res.statusCode = 502
    return { success: false, message: e?.message || 'Gateway error' }
  }
})
