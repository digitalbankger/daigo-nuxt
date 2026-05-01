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

function authHeaders(token?: string | null): Record<string, string> {
  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
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
  async checkIsNewClient(token?: string | null): Promise<boolean> {
    const response = await $fetch<CheckClientResponse>(`${apiBase()}/v1/shop/check-client/new`, {
      method: 'GET',
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
        ...authHeaders(token),
      },
    })
  },
}
