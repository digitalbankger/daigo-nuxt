import axios, { AxiosError } from 'axios'
import { unref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: process.env.NUXT_PUBLIC_API_BASE || 'https://api.daigo.ru',
  headers: { 'Content-Type': 'application/json' }
})

function getTokenSafe(auth: any): string | null {
  // pinia может отдавать unwrapped значение, но иногда тут оказывается ref
  const raw = auth?.token
  const v = typeof raw === 'string' ? raw : unref(raw)
  return typeof v === 'string' && v.length ? v : null
}

function getRefreshSafe(auth: any): string | null {
  const raw = auth?.refreshToken
  const v = typeof raw === 'string' ? raw : unref(raw)
  return typeof v === 'string' && v.length ? v : null
}

let refreshInFlight: Promise<boolean> | null = null

api.interceptors.request.use((config) => {
  if (process.client) {
    const auth = useAuthStore()
    const token = getTokenSafe(auth)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (!process.client) return Promise.reject(error)

    const auth = useAuthStore()
    const original = error.config

    const refresh = getRefreshSafe(auth)

    if (error.response?.status === 401 && refresh && original && !(original as any).__isRetry) {
      ;(original as any).__isRetry = true

      // дедупликация одновременных 401
      if (!refreshInFlight) {
        refreshInFlight = auth.tryRefresh().finally(() => {
          refreshInFlight = null
        })
      }
      const ok = await refreshInFlight

      if (ok) {
        original.headers = original.headers || {}
        const token = getTokenSafe(auth)
        if (token) (original.headers as any).Authorization = `Bearer ${token}`
        return api(original)
      } else {
        auth.logout()
      }
    }
    return Promise.reject(error)
  }
)
