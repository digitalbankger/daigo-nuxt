// services/vipService.ts
import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'

export interface VipActivateResponse {
  is_activated: boolean
  err?: string
}

export async function activateVip(code: string): Promise<VipActivateResponse> {
  const { public: { daigoApiBase } } = useRuntimeConfig()

  const auth = useAuthStore()
  const user = useUserStore()

  const daigoId =
    auth.userId ??
    (user.profile as any)?.daigo_id ??
    (user.profile as any)?.id ??
    null

  if (!daigoId) {
    throw new Error('Пользователь не найден. Войдите в личный кабинет.')
  }

  return await $fetch<VipActivateResponse>(`${daigoApiBase}/v1/auth/user/vip-activate`, {
    method: 'POST',
    headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
    body: {
      daigo_id: daigoId,
      code,
    },
  })
}
