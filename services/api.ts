import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: process.env.NUXT_PUBLIC_API_BASE || 'https://api.daigo.ru',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  if (process.client) {
    const auth = useAuthStore()
    if (auth.token) config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (!process.client) return Promise.reject(error)

    const auth = useAuthStore()
    const original = error.config

    if (error.response?.status === 401 && auth.refreshToken && original && !('__isRetry' in original)) {
      ;(original as any).__isRetry = true
      const ok = await auth.tryRefresh()
      if (ok) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${auth.token}`
        return api(original)
      } else {
        auth.logout()
      }
    }
    return Promise.reject(error)
  }
)
