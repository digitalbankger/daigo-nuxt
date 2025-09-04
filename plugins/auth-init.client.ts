import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { log, time, timeEnd } from '@/utils/debug'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const user = useUserStore()

  log('[plugin:auth-init] token?', Boolean(auth.token), 'userId=', auth.userId)
  if (auth.token && auth.userId && !user.isLoaded) {
    time('loadProfile@plugin')
    try {
      await user.load()
      log('[plugin:auth-init] profile loaded:', Boolean(user.profile))
    } catch (e) {
      log('[plugin:auth-init] load error', e)
    } finally {
      timeEnd('loadProfile@plugin')
    }
  }

  if (process.client) {
    // удобно смотреть сторы в консоли: window.stores.auth / window.stores.user
    // @ts-ignore
    window.stores = { auth, user }
  }
})
