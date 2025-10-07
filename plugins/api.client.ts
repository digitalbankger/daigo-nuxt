// plugins/api.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useAuthStore } from '@/stores/authStore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = (config.public as any).apiBase || config.public?.baseUrl || process.env.NUXT_PUBLIC_API_BASE || ''
  const auth = useAuthStore()

  const api = $fetch.create({
    baseURL,
    credentials: 'include',
    onRequest({ options }) {
      options.headers = options.headers || {}
      const tok = auth.token
      if (tok) (options.headers as any).Authorization = `Bearer ${tok}`
    },
    async onResponseError({ request, options, response }) {
      if (response?.status === 401 && auth.refreshToken) {
        const ok = await auth.tryRefresh()
        if (ok) {
          options.headers = options.headers || {}
          ;(options.headers as any).Authorization = `Bearer ${auth.token}`
          return await $fetch(request, options)
        } else {
          await auth.logout()
        }
      }
      throw response?._data || new Error('API error')
    }
  })

  return {
    provide: {
      api,
      apiBase: baseURL,
    }
  }
})
