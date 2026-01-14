import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { log, time, timeEnd } from '@/utils/debug'

// защита от повторного запуска плагина (HMR/повторные инициализации)
let started = false

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const user = useUserStore()

  log('[plugin:auth-init] token?', Boolean(auth.token), 'userId=', auth.userId)

  // не блокируем рендер страницы
  if (!started) {
    started = true

    if (auth.token && auth.userId && !user.isLoaded) {
      ;(async () => {
        time('loadProfile@plugin')
        try {
          // поддержка обоих имён метода: loadProfile или load (как в store)
          if (typeof (user as any).loadProfile === 'function') {
            await (user as any).loadProfile()
          } else if (typeof (user as any).load === 'function') {
            await (user as any).load()
          }
          log('[plugin:auth-init] profile loaded:', Boolean(user.profile))
        } catch (e) {
          log('[plugin:auth-init] load error', e)
        } finally {
          timeEnd('loadProfile@plugin')
        }
      })()
    }
  }

  if (process.client) {
    // удобно смотреть сторы в консоли: window.stores.auth / window.stores.user
    // @ts-ignore
    window.stores = { auth, user }
  }
})
