// import { defineStore, skipHydrate } from 'pinia'
// import { ref, computed, watch } from 'vue'
// import {
//   startAuth,
//   refreshAuthToken,
//   type TokensResponse
// } from '@/services/authService'
// import { useUserStore } from '@/stores/userStore'
// import { log, mask } from '@/utils/debug'
// import { cartService } from '~/services/cartService'

// export const useAuthStore = defineStore('auth', () => {
//   // ui state (открытие/закрытие модалки)
//   const isAuthModalOpen = ref(false)

//   // auth state. Достаём токен/refresh и daigo_id из localStorage,
//   // если срок годности не истёк (4 часа).
//   let initialToken: string | null = null
//   let initialRefresh: string | null = null
//   let initialUserId: number | null = null
//   if (process.client) {
//     const expires = Number(localStorage.getItem('auth_expires_at')) || 0
//     if (expires && Date.now() < expires) {
//       initialToken = localStorage.getItem('token') || null
//       initialRefresh = localStorage.getItem('refresh_token') || null
//       const uid = localStorage.getItem('daigo_id')
//       initialUserId = uid ? Number(uid) : null
//     } else {
//       // токен просрочен — очищаем
//       localStorage.removeItem('token')
//       localStorage.removeItem('refresh_token')
//       localStorage.removeItem('daigo_id')
//       localStorage.removeItem('auth_expires_at')
//     }
//   }
//   const token = ref<string | null>(initialToken)
//   const refreshToken = ref<string | null>(initialRefresh)
//   const userId = ref<number | null>(initialUserId)

//   const isAuthenticated = computed(() => !!token.value)

//   log(
//     '[auth:init]',
//     'token=',
//     mask(token.value),
//     'refresh=',
//     mask(refreshToken.value),
//     'uid=',
//     userId.value
//   )

//   function openAuth() {
//     isAuthModalOpen.value = true
//     log('[auth] open modal')
//   }
//   function closeAuth() {
//     isAuthModalOpen.value = false
//     log('[auth] close modal')
//   }

//   function setAuthData(data: TokensResponse) {
//     log(
//       '[auth] setAuthData',
//       'uid=',
//       data.daigo_id,
//       'token=',
//       mask(data.access_token)
//     )
//     token.value = data.access_token
//     refreshToken.value = data.refresh_token
//     userId.value = data.daigo_id

//     if (process.client) {
//       localStorage.setItem('token', data.access_token)
//       localStorage.setItem('refresh_token', data.refresh_token)
//       localStorage.setItem('daigo_id', String(data.daigo_id))
//       // срок действия токена — 4 часа
//       const expiresAt = Date.now() + 4 * 60 * 60 * 1000
//       localStorage.setItem('auth_expires_at', String(expiresAt))
//     }
//   }

//   function clearAuth() {
//     log('[auth] clearAuth')
//     token.value = null
//     refreshToken.value = null
//     userId.value = null
//     if (process.client) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('refresh_token')
//       localStorage.removeItem('daigo_id')
//       localStorage.removeItem('auth_expires_at')
//     }
//   }

//   async function tryRefresh() {
//     if (!refreshToken.value) return false
//     try {
//       log('[auth] tryRefresh', mask(refreshToken.value))
//       const data = await refreshAuthToken(refreshToken.value)
//       setAuthData(data)
//       return true
//     } catch (e) {
//       log('[auth] tryRefresh error', e)
//       return false
//     }
//   }

//   /** Авторизация или регистрация пользователя */
//   // stores/authStore.ts

// async function loginOrRegister(opts: {
//   phone: string
//   name?: string
//   isRegister: boolean
//   redirectTo?: string        // <— добавили
// }) {
//   const phone_number = opts.phone.replace(/\D/g, '')
//   const first_name = opts.isRegister ? (opts.name || '').trim() : undefined

//   const deadline = Date.now() + 2 * 60 * 1000 // 2 минуты
//   let res = await startAuth(phone_number, first_name)

//   while ((res as any).status === 'pending' && Date.now() < deadline) {
//     await new Promise(r => setTimeout(r, 2000))
//     res = await startAuth(phone_number, first_name)
//   }

//   if ('access_token' in res && 'refresh_token' in res) {
//     setAuthData(res as TokensResponse)

//     // миграция гостевой корзины → пользовательская
//     const sid = process.client ? localStorage.getItem('guest_session_id') : null
//     if (sid) {
//       await cartService.migrateGuestToUser(sid, (res as TokensResponse).daigo_id)
//       if (process.client) localStorage.removeItem('guest_session_id')
//     }

//     const user = useUserStore()
//     await user.loadProfile()
//     closeAuth()

//     // куда отправить после успеха
//     const to = opts.redirectTo || '/profile'
//     navigateTo(to)

//     return true
//   } else {
//     throw new Error(
//       ('message' in res && (res as any).message) || 'Авторизация не подтверждена'
//     )
//   }
// }


//   function logout() {
//     log('[auth] logout')
//     clearAuth()
//     const user = useUserStore()
//     user.clear()
//     navigateTo('/')
//   }

//   // Следим за изменениями токена, refresh и userId
//   watch([token, refreshToken, userId], () => {
//     log(
//       '[auth] changed',
//       'token=',
//       mask(token.value),
//       'refresh=',
//       mask(refreshToken.value),
//       'uid=',
//       userId.value
//     )
//   })

//   return {
//     // состояние
//     isAuthModalOpen,
//     token: skipHydrate(token),
//     refreshToken: skipHydrate(refreshToken),
//     userId: skipHydrate(userId),
//     isAuthenticated,

//     // ui
//     openAuth,
//     closeAuth,

//     // действия
//     loginOrRegister,
//     tryRefresh,
//     logout
//   }
// })










// stores/authStore.ts
import { defineStore, skipHydrate } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  startAuth,
  refreshAuthToken,
  type TokensResponse
} from '@/services/authService'
import { useUserStore } from '@/stores/userStore'
import { log, mask } from '@/utils/debug'
import { cartService } from '~/services/cartService'

export const useAuthStore = defineStore('auth', () => {
  // UI
  const isAuthModalOpen = ref(false)
  function openAuth()  { isAuthModalOpen.value = true;  log('[auth] open modal') }
  function closeAuth() { isAuthModalOpen.value = false; log('[auth] close modal') }

  // Инициализация стейта из localStorage (если токен ещё жив)
  let initialToken: string | null = null
  let initialRefresh: string | null = null
  let initialUserId: number | null = null
  if (process.client) {
    const expires = Number(localStorage.getItem('auth_expires_at')) || 0
    if (expires && Date.now() < expires) {
      initialToken   = localStorage.getItem('token')
      initialRefresh = localStorage.getItem('refresh_token')
      const uid = localStorage.getItem('daigo_id')
      initialUserId  = uid ? Number(uid) : null
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('daigo_id')
      localStorage.removeItem('auth_expires_at')
    }
  }

  // State
  const token        = ref<string | null>(initialToken)
  const refreshToken = ref<string | null>(initialRefresh)
  const userId       = ref<number | null>(initialUserId)

  const isAuthenticated = computed(() => !!token.value)

  log('[auth:init]', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)

  function setAuthData(data: TokensResponse) {
    log('[auth] setAuthData', 'uid=', data.daigo_id, 'token=', mask(data.access_token))
    token.value        = data.access_token
    refreshToken.value = data.refresh_token
    userId.value       = data.daigo_id

    if (process.client) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('daigo_id', String(data.daigo_id))
      // токен живёт 4 часа
      const expiresAt = Date.now() + 4 * 60 * 60 * 1000
      localStorage.setItem('auth_expires_at', String(expiresAt))
    }
  }

  function clearAuth() {
    log('[auth] clearAuth')
    token.value = null
    refreshToken.value = null
    userId.value = null
    if (process.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('daigo_id')
      localStorage.removeItem('auth_expires_at')
    }
  }

  async function tryRefresh() {
    if (!refreshToken.value) return false
    try {
      log('[auth] tryRefresh', mask(refreshToken.value))
      const data = await refreshAuthToken(refreshToken.value)
      setAuthData(data)
      return true
    } catch (e) {
      log('[auth] tryRefresh error', e)
      return false
    }
  }

  /**
   * Авторизация (или регистрация) по телефону.
   * - НИЧЕГО не редиректит сама, если redirectTo не задан — остаёмся на текущей странице.
   * - При успехе: мигрируем гостевую корзину → юзерская (тихо), подгружаем профиль.
   */
  async function loginOrRegister(opts: {
    phone: string
    name?: string
    isRegister: boolean
    redirectTo?: string   // куда перейти после успеха (например, '/order')
  }) {
    const phone_number = opts.phone.replace(/\D/g, '')
    const first_name   = opts.isRegister ? (opts.name || '').trim() : undefined

    log('[auth] loginOrRegister:start', { phone_number, first_name, mode: opts.isRegister ? 'register' : 'login' })

    // 1) Запускаем авторизацию у Beeline и ждём подтверждения
    const deadline = Date.now() + 2 * 60 * 1000 // 2 минуты
    let res = await startAuth(phone_number, first_name)

    while ((res as any)?.status === 'pending' && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 2000))
      res = await startAuth(phone_number, first_name)
    }

    // 2) Разбор результата
    if ((res as any)?.status === 'error') {
      throw new Error((res as any).message || 'Ошибка при запуске авторизации')
    }
    if ((res as any)?.status === 'pending') {
      throw new Error('Время подтверждения истекло. Попробуйте ещё раз.')
    }

    // 3) Успех: у нас есть токены
    if ('access_token' in (res as any) && 'refresh_token' in (res as any)) {
      const tokens = res as TokensResponse
      setAuthData(tokens)

      // 3.1) Миграция гостевой корзины (если есть). Ошибки — тихо в консоль.
      const sid = process.client ? localStorage.getItem('guest_session_id') : null
      if (sid) {
        try {
          // ⚠️ В cartService обязательно используем BODY { daigo_id: ... }
          await cartService.migrateGuestToUser(sid, tokens.daigo_id)
          localStorage.removeItem('guest_session_id')
        } catch (e) {
          console.warn('[auth] migrateGuestToUser failed', e)
        }
      }

      // 3.2) Подтянем профиль, чтобы формы префиллнулись
      const user = useUserStore()
      try { await user.loadProfile() } catch {}

      closeAuth()

      // 3.3) Редирект — только если явно попросили
      if (opts.redirectTo) navigateTo(opts.redirectTo)

      return true
    }

    throw new Error('Не удалось получить токены авторизации')
  }

  function logout() {
    log('[auth] logout')
    clearAuth()
    const user = useUserStore()
    user.clear()
    navigateTo('/')
  }

  // debug
  watch([token, refreshToken, userId], () => {
    log('[auth] changed', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)
  })

  return {
    // state
    isAuthModalOpen,
    token: skipHydrate(token),
    refreshToken: skipHydrate(refreshToken),
    userId: skipHydrate(userId),
    isAuthenticated,

    // ui
    openAuth,
    closeAuth,

    // actions
    loginOrRegister,
    tryRefresh,
    logout
  }
})
