import { api } from './api'

export interface UserProfile {
  id: string | number
  first_name: string
  last_name: string
  email: string | null
  phone_number: string
  birth_day?: string | null
  loyalty_status: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'
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
  const { data } = await api.get<UserProfile>(`/v1/auth/user/${daigoId}`)
  return data
}

export const updateUser = async (daigoId: number | string, patch: Partial<UserProfile>) => {
  const { data } = await api.patch<UserProfile>(`/v1/auth/user/${daigoId}/update`, patch)
  return data
}
