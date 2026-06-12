// server/api/feedback/callback.post.ts
import { defineEventHandler, readBody } from 'h3'

type CallbackReq = { fio: string; phone_number: string; message: string; roistat?: string }
type GoResp = { success: boolean; lead_id?: number; message?: string }

export default defineEventHandler(async (event) => {
  const body = await readBody<CallbackReq>(event)
  if (!body?.fio || !body?.phone_number || !body?.message) {
    event.node.res.statusCode = 400
    return { success: false, message: 'Все поля обязательны' }
  }

  // ⬅️ БЕРЁМ ИЗ public
  const { public: { daigoApiBase } } = useRuntimeConfig()

  try {
    const res = await $fetch<GoResp>('/v1/shop/feedback/callback', {
      baseURL: daigoApiBase, // например https://api.daigo.ru
      method: 'POST',
      body
    })
    return res
  } catch (e: any) {
    event.node.res.statusCode = 502
    return { success: false, message: e?.message || 'Gateway error' }
  }
})
