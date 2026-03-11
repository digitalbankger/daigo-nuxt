// services/authService.ts
import { api } from './api'

export interface TokensResponse {
  access_token: string
  refresh_token: string
  daigo_id: number
}

/** Отправка кода на номер (SMS) */
export const sendAuthCode = async (phone_number: string) => {
  const { data } = await api.post<{ message: string }>('/v1/auth/send-code', { phone_number })
  return data
}


/** Отправка кода через звонок */
export const sendAuthFc = async (phone_number: string) => {
  const { data } = await api.post<{ message: string }>('/v1/auth/send-fc', { phone_number })
  return data
}

/** Проверка кода (4 цифры) */
export const verifyAuthCode = async (params: {
  phone_number: string
  code: string
  project_name?: string
}) => {
  const { data } = await api.post<TokensResponse>('/v1/auth/verify-code', {
    phone_number: params.phone_number,
    project_name: params.project_name ?? 'daigo_web',
    code: params.code
  })
  return data
}

export const refreshAuthToken = async (refresh_token: string) => {
  const { data } = await api.post<TokensResponse>('/v1/auth/refresh', { refresh_token })
  return data
}
