// plugins/auth-init.client.ts
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { log, time, timeEnd } from '@/utils/debug'
import { watch } from 'vue'

// защита от повторного запуска плагина (HMR/повторные инициализации)
let started = false

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const user = useUserStore()

  log('[plugin:auth-init] token?', Boolean(auth.token), 'userId=', auth.userId)

  async function loadUserProfileOnce() {
    if (!auth.token || !auth.userId) {
      log('[plugin:auth-init] skip load: no token or userId')
      return
    }
    if (user.isLoaded) {
      log('[plugin:auth-init] skip load: already loaded')
      return
    }

    time('loadProfile@plugin')
    try {
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
  }

  if (!started) {
    started = true

    // 1) При старте:
    // - если access уже есть → грузим профиль
    // - если access нет, но refresh есть → пробуем обновить сессию, затем грузим профиль
    ;(async () => {
      if (!auth.token && auth.refreshToken) {
        try {
          await auth.tryRefresh()
        } catch {}
      }
      await loadUserProfileOnce()
    })()

    // 2) Следим за изменением авторизации
    watch(
      () => auth.isAuthenticated,
      (authed) => {
        if (authed) {
          // только что залогинились → подгружаем профиль
          loadUserProfileOnce()
        } else {
          // разлогинились → очищаем профиль
          if (user.isLoaded || user.profile) {
            user.clear()
          }
        }
      },
      { immediate: false }
    )
  }

  if (process.client) {
    // удобно смотреть сторы в консоли: window.stores.auth / window.stores.user
    // @ts-ignore
    window.stores = { auth, user }
  }
})
