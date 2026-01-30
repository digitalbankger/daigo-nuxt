// services/userService.ts
import { api } from './api'

export interface UserProfile {
  /**
   * В проекте исторически встречаются оба варианта:
   * - id (иногда == daigo_id)
   * - daigo_id (публичный идентификатор пользователя)
   */
  id: string | number
  daigo_id?: string | number

  first_name: string
  last_name: string
  email: string | null
  phone_number: string
  birth_day?: string | null
  loyalty_status: string | null
  recipient?: string
  addresses: any[] | null
  cards: any[] | null
  bonuses: {
    valid: { value: number }
    expiring: { value: number; date_end?: string | null }
    expired: { value: number }
  }
}

export const fetchUser = async (daigoId: number | string) => {
  const id = encodeURIComponent(String(daigoId))
  const { data } = await api.get<UserProfile>(`/v1/auth/user/${id}`)
  return data
}

export const updateUser = async (daigoId: number | string, patch: Partial<UserProfile>) => {
  const id = encodeURIComponent(String(daigoId))
  const { data } = await api.patch<UserProfile>(
    `/v1/auth/user/${id}/update`,
    patch,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  return data
}
