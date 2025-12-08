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
