import { api } from './api'

export interface TokensResponse {
  access_token: string
  refresh_token: string
  daigo_id: number
}

export const startAuth = async (phone_number: string, first_name?: string) => {
  // боевой Beeline-эндпоинт: ждём пока пользователь подтвердит пуш
  const { data } = await api.post<TokensResponse | { status: 'pending' | 'error'; message?: string }>(
    '/v1/auth/bilain/auth',
    { phone_number, project_name: 'daigo_app', first_name }
  )
  return data
}

export const refreshAuthToken = async (refresh_token: string) => {
  const { data } = await api.post<TokensResponse>('/v1/auth/refresh-token', { refresh_token })
  return data
}
