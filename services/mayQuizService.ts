import { useRuntimeConfig } from '#imports'

type CheckClientResponse = boolean | {
  is_new?: boolean
  isNew?: boolean
  new?: boolean
  data?: boolean | { is_new?: boolean; isNew?: boolean; new?: boolean }
}

function apiBase(): string {
  const { daigoApiBase } = useRuntimeConfig().public as any
  return String(daigoApiBase || 'https://api.daigo.ru').replace(/\/+$/, '')
}

function getJwtToken(token?: string | null): string {
  if (token) return String(token)

  if (process.client) {
    try {
      return localStorage.getItem('token') || ''
    } catch {
      return ''
    }
  }

  return ''
}

function authHeaders(token?: string | null): Record<string, string> {
  const jwt = getJwtToken(token)
  return jwt ? { Authorization: `Bearer ${jwt}` } : {}
}

function requiredAuthHeaders(token?: string | null): Record<string, string> {
  const jwt = getJwtToken(token)
  if (!jwt) throw new Error('Не найден JWT токен для авторизованного запроса')

  return { Authorization: `Bearer ${jwt}` }
}

function normalizePhone(phone?: string | null): string {
  return String(phone || '').replace(/\D/g, '')
}

function normalizeCheckClientResponse(response: CheckClientResponse): boolean {
  if (typeof response === 'boolean') return response

  if (typeof response?.data === 'boolean') return response.data
  if (response?.data && typeof response.data === 'object') {
    if (typeof response.data.is_new === 'boolean') return response.data.is_new
    if (typeof response.data.isNew === 'boolean') return response.data.isNew
    if (typeof response.data.new === 'boolean') return response.data.new
  }

  if (typeof response?.is_new === 'boolean') return response.is_new
  if (typeof response?.isNew === 'boolean') return response.isNew
  if (typeof response?.new === 'boolean') return response.new

  return true
}

export const mayQuizService = {
  async checkIsNewClient(token?: string | null, phone?: string | null): Promise<boolean> {
    const phoneDigits = normalizePhone(phone)
    const response = await $fetch<CheckClientResponse>(`${apiBase()}/v1/shop/check-client/new`, {
      method: 'GET',
      query: phoneDigits ? { phone: phoneDigits } : undefined,
      headers: authHeaders(token),
    })

    return normalizeCheckClientResponse(response)
  },

  async apply2Plus1(body: { product_id: string; uuid: string }, token?: string | null) {
    return await $fetch(`${apiBase()}/v1/shop/2plus1`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        ...requiredAuthHeaders(token),
      },
    })
  },
}
