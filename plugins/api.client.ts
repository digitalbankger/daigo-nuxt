// plugins/api.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useAuthStore } from '@/stores/authStore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const publicCfg = config.public as any

  // просто пробрасываем apiBase, если он нужен где-то ещё
  const apiBase =
    publicCfg.daigoApiBase ||
    publicCfg.apiBase ||
    publicCfg.baseUrl ||
    process.env.NUXT_PUBLIC_API_BASE ||
    ''

  const auth = useAuthStore()

  let refreshInFlight: Promise<boolean> | null = null

  const api = $fetch.create({
    // ВАЖНО: НЕ указываем baseURL здесь, чтобы не ломать
    // внутренние nuxt-запросы типа /_nuxt/builds/meta/dev.json
    onRequest({ options }) {
      const token = auth.token
      if (!token) return

      const current = options.headers

      // Приводим заголовки к Headers
      let headers: Headers

      if (current instanceof Headers) {
        headers = current
      } else if (current) {
        // current: HeadersInit (Record<string,string> | string[][])
        headers = new Headers(current as HeadersInit)
      } else {
        headers = new Headers()
      }

      // сюда кладём наш access-токен
      headers.set('Authorization', `Bearer ${token}`)

      options.headers = headers
    },

    async onResponseError({ request, options, response }) {
      // Глобальный рефреш для всех $fetch запросов (кроме внутренних nuxt-ресурсов)
      // ВАЖНО: работаем только на клиенте и только при 401.
      if (!process.client) return
      if (response.status !== 401) return

      // не делаем рефреш для эндпоинта рефреша/авторизации
      const url = String(request)
      if (url.includes('/v1/auth/refresh') || url.includes('/v1/auth/send-code') || url.includes('/v1/auth/send-fc') || url.includes('/v1/auth/verify-code')) {
        return
      }

      // защита от бесконечного цикла
      if ((options as any).__isRetry) return
      ;(options as any).__isRetry = true

      if (!auth.refreshToken) {
        auth.logout()
        return
      }

      // дедупликация одновременных 401
      if (!refreshInFlight) {
        refreshInFlight = auth.tryRefresh().finally(() => {
          refreshInFlight = null
        })
      }

      const ok = await refreshInFlight
      if (!ok) {
        auth.logout()
        return
      }

      // повторяем запрос с новым access
      const token = auth.token
      if (token) {
        const current = options.headers
        let headers: Headers
        if (current instanceof Headers) headers = current
        else if (current) headers = new Headers(current as HeadersInit)
        else headers = new Headers()
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }

      return api(request as any, options as any)
    }
  })

  // Подменяем глобальный $fetch только на клиенте:
  // теперь ВСЕ $fetch(...) будут с Authorization: Bearer <access>
  if (process.client) {
    ;(globalThis as any).$fetch = api
  }

  return {
    provide: {
      api,
      apiBase
    }
  }
})
