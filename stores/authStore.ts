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
import { navigateTo, useRoute } from '#imports'

export const useAuthStore = defineStore('auth', () => {
  // UI
  const isAuthModalOpen = ref(false)
  function openAuth()  { isAuthModalOpen.value = true;  log('[auth] open modal') }
  function closeAuth() { isAuthModalOpen.value = false; log('[auth] close modal') }

  // ==== Инициализация из localStorage ====
  // ВАЖНО: если access просрочен — очищаем ТОЛЬКО access и его TTL,
  // но оставляем refresh_token и daigo_id, чтобы можно было рефрешнуться.
  let initialToken: string | null = null
  let initialRefresh: string | null = null
  let initialUserId: number | null = null

  if (process.client) {
    const expires = Number(localStorage.getItem('auth_expires_at')) || 0
    const now = Date.now()

    if (expires && now < expires) {
      // access ещё жив
      initialToken = localStorage.getItem('token')
    } else {
      // access истёк — чистим только access и TTL
      localStorage.removeItem('token')
      localStorage.removeItem('auth_expires_at')
    }

    // refresh и daigo_id храним независимо от access
    initialRefresh = localStorage.getItem('refresh_token')
    const uid = localStorage.getItem('daigo_id')
    initialUserId  = uid ? Number(uid) : null
  }

  // ==== State ====
  const token        = ref<string | null>(initialToken)
  const refreshToken = ref<string | null>(initialRefresh)
  const userId       = ref<number | null>(initialUserId)

  const isAuthenticated = computed(() => !!token.value)

  log('[auth:init]', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)

  function setAuthData(data: TokensResponse) {
    log('[auth] setAuthData', 'uid=', data.daigo_id, 'token=', mask(data.access_token))
    token.value        = data.access_token
    refreshToken.value = data.refresh_token
    userId.value       = (data as any).daigo_id ?? null

    if (process.client) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      if (userId.value != null) localStorage.setItem('daigo_id', String(userId.value))
      // ❗ TTL access — 24 часа
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000
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

  async function tryRefresh(): Promise<boolean> {
    if (!refreshToken.value) return false
    try {
      log('[auth] tryRefresh', mask(refreshToken.value))
      const data = await refreshAuthToken(refreshToken.value) // POST /v1/auth/refresh
      setAuthData(data)
      return true
    } catch (e) {
      log('[auth] tryRefresh error', e)
      // очищаем только access, чтобы пользователь мог повторно авторизоваться
      if (process.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('auth_expires_at')
      }
      token.value = null
      return false
    }
  }

  /**
   * Авторизация (или регистрация) по телефону.
   * - Ничего не редиректит сама, если redirectTo не задан — остаёмся на текущей странице.
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

    // 1) Запускаем авторизацию/регистрацию и ждём подтверждения (как было)
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
          // ⚠️ cartService ожидает { daigo_id }
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
      if (opts.redirectTo) await navigateTo(opts.redirectTo)

      return true
    }

    throw new Error('Не удалось получить токены авторизации')
  }

  // Мягкий логаут без перезагрузки страницы и без редиректа "на себя"
  async function softLogout(to: string = '/') {
    log('[auth] softLogout')
    clearAuth()

    const user = useUserStore()
    user.clear?.()

    // безопасная навигация: не редиректим на тот же маршрут
    try {
      const route = useRoute()
      if (route.fullPath !== to) {
        await navigateTo(to, { replace: true })
      }
    } catch {
      // если useRoute недоступен — игнорируем
    }
  }

  // Сохранённый метод для обратной совместимости
  async function logout() {
    await softLogout('/')
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
    softLogout,
    logout
  }
})











// // stores/authStore.ts
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
//   // UI
//   const isAuthModalOpen = ref(false)
//   function openAuth()  { isAuthModalOpen.value = true;  log('[auth] open modal') }
//   function closeAuth() { isAuthModalOpen.value = false; log('[auth] close modal') }

//   // Инициализация стейта из localStorage (если токен ещё жив)
//   let initialToken: string | null = null
//   let initialRefresh: string | null = null
//   let initialUserId: number | null = null
//   if (process.client) {
//     const expires = Number(localStorage.getItem('auth_expires_at')) || 0
//     if (expires && Date.now() < expires) {
//       initialToken   = localStorage.getItem('token')
//       initialRefresh = localStorage.getItem('refresh_token')
//       const uid = localStorage.getItem('daigo_id')
//       initialUserId  = uid ? Number(uid) : null
//     } else {
//       localStorage.removeItem('token')
//       localStorage.removeItem('refresh_token')
//       localStorage.removeItem('daigo_id')
//       localStorage.removeItem('auth_expires_at')
//     }
//   }

//   // State
//   const token        = ref<string | null>(initialToken)
//   const refreshToken = ref<string | null>(initialRefresh)
//   const userId       = ref<number | null>(initialUserId)

//   const isAuthenticated = computed(() => !!token.value)

//   log('[auth:init]', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)

//   function setAuthData(data: TokensResponse) {
//     log('[auth] setAuthData', 'uid=', data.daigo_id, 'token=', mask(data.access_token))
//     token.value        = data.access_token
//     refreshToken.value = data.refresh_token
//     userId.value       = data.daigo_id

//     if (process.client) {
//       localStorage.setItem('token', data.access_token)
//       localStorage.setItem('refresh_token', data.refresh_token)
//       localStorage.setItem('daigo_id', String(data.daigo_id))
//       // токен живёт 4 часа
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

//   /**
//    * Авторизация (или регистрация) по телефону.
//    * - НИЧЕГО не редиректит сама, если redirectTo не задан — остаёмся на текущей странице.
//    * - При успехе: мигрируем гостевую корзину → юзерская (тихо), подгружаем профиль.
//    */
//   async function loginOrRegister(opts: {
//     phone: string
//     name?: string
//     isRegister: boolean
//     redirectTo?: string   // куда перейти после успеха (например, '/order')
//   }) {
//     const phone_number = opts.phone.replace(/\D/g, '')
//     const first_name   = opts.isRegister ? (opts.name || '').trim() : undefined

//     log('[auth] loginOrRegister:start', { phone_number, first_name, mode: opts.isRegister ? 'register' : 'login' })

//     // 1) Запускаем авторизацию у Beeline и ждём подтверждения
//     const deadline = Date.now() + 2 * 60 * 1000 // 2 минуты
//     let res = await startAuth(phone_number, first_name)

//     while ((res as any)?.status === 'pending' && Date.now() < deadline) {
//       await new Promise(r => setTimeout(r, 2000))
//       res = await startAuth(phone_number, first_name)
//     }

//     // 2) Разбор результата
//     if ((res as any)?.status === 'error') {
//       throw new Error((res as any).message || 'Ошибка при запуске авторизации')
//     }
//     if ((res as any)?.status === 'pending') {
//       throw new Error('Время подтверждения истекло. Попробуйте ещё раз.')
//     }

//     // 3) Успех: у нас есть токены
//     if ('access_token' in (res as any) && 'refresh_token' in (res as any)) {
//       const tokens = res as TokensResponse
//       setAuthData(tokens)

//       // 3.1) Миграция гостевой корзины (если есть). Ошибки — тихо в консоль.
//       const sid = process.client ? localStorage.getItem('guest_session_id') : null
//       if (sid) {
//         try {
//           // ⚠️ В cartService обязательно используем BODY { daigo_id: ... }
//           await cartService.migrateGuestToUser(sid, tokens.daigo_id)
//           localStorage.removeItem('guest_session_id')
//         } catch (e) {
//           console.warn('[auth] migrateGuestToUser failed', e)
//         }
//       }

//       // 3.2) Подтянем профиль, чтобы формы префиллнулись
//       const user = useUserStore()
//       try { await user.loadProfile() } catch {}

//       closeAuth()

//       // 3.3) Редирект — только если явно попросили
//       if (opts.redirectTo) navigateTo(opts.redirectTo)

//       return true
//     }

//     throw new Error('Не удалось получить токены авторизации')
//   }

//   function logout() {
//     log('[auth] logout')
//     clearAuth()
//     const user = useUserStore()
//     user.clear()
//     navigateTo('/')
//   }

//   // debug
//   watch([token, refreshToken, userId], () => {
//     log('[auth] changed', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)
//   })

//   return {
//     // state
//     isAuthModalOpen,
//     token: skipHydrate(token),
//     refreshToken: skipHydrate(refreshToken),
//     userId: skipHydrate(userId),
//     isAuthenticated,

//     // ui
//     openAuth,
//     closeAuth,

//     // actions
//     loginOrRegister,
//     tryRefresh,
//     logout
//   }
// })

