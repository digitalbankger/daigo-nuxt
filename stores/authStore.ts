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
  // ui state (открытие/закрытие модалки)
  const isAuthModalOpen = ref(false)

  // auth state. Достаём токен/refresh и daigo_id из localStorage,
  // если срок годности не истёк (4 часа).
  let initialToken: string | null = null
  let initialRefresh: string | null = null
  let initialUserId: number | null = null
  if (process.client) {
    const expires = Number(localStorage.getItem('auth_expires_at')) || 0
    if (expires && Date.now() < expires) {
      initialToken = localStorage.getItem('token') || null
      initialRefresh = localStorage.getItem('refresh_token') || null
      const uid = localStorage.getItem('daigo_id')
      initialUserId = uid ? Number(uid) : null
    } else {
      // токен просрочен — очищаем
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('daigo_id')
      localStorage.removeItem('auth_expires_at')
    }
  }
  const token = ref<string | null>(initialToken)
  const refreshToken = ref<string | null>(initialRefresh)
  const userId = ref<number | null>(initialUserId)

  const isAuthenticated = computed(() => !!token.value)

  log(
    '[auth:init]',
    'token=',
    mask(token.value),
    'refresh=',
    mask(refreshToken.value),
    'uid=',
    userId.value
  )

  function openAuth() {
    isAuthModalOpen.value = true
    log('[auth] open modal')
  }
  function closeAuth() {
    isAuthModalOpen.value = false
    log('[auth] close modal')
  }

  function setAuthData(data: TokensResponse) {
    log(
      '[auth] setAuthData',
      'uid=',
      data.daigo_id,
      'token=',
      mask(data.access_token)
    )
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    userId.value = data.daigo_id

    if (process.client) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('daigo_id', String(data.daigo_id))
      // срок действия токена — 4 часа
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

  /** Авторизация или регистрация пользователя */
  async function loginOrRegister(opts: {
    phone: string
    name?: string
    isRegister: boolean
  }) {
    const phone_number = opts.phone.replace(/\D/g, '')
    const first_name = opts.isRegister ? (opts.name || '').trim() : undefined

    log('[auth] loginOrRegister:start', {
      phone_number,
      first_name,
      mode: opts.isRegister ? 'register' : 'login'
    })

    const deadline = Date.now() + 2 * 60 * 1000 // 2 минуты
    let res = await startAuth(phone_number, first_name)

    // опрашиваем бэкенд, пока статус pending
    while ((res as any).status === 'pending' && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 2000))
      res = await startAuth(phone_number, first_name)
    }

    if ('access_token' in res && 'refresh_token' in res) {
      setAuthData(res as TokensResponse)

      // Мигрируем гостевую корзину в пользовательскую, если есть
      // если была гостевая корзина, переносим её
      const sid = localStorage.getItem('guest_session_id')
      if (sid) {
        await cartService.migrateGuestToUser(sid, (res as TokensResponse).daigo_id)
        localStorage.removeItem('guest_session_id')
      }

      // Подгружаем профиль и переходим в профиль
      const user = useUserStore()
      await user.loadProfile()
      closeAuth()
      navigateTo('/profile')
      return true
    } else {
      log('[auth] no tokens in response', res)
      throw new Error(
        ('message' in res && (res as any).message) ||
          'Авторизация не подтверждена'
      )
    }
  }

  function logout() {
    log('[auth] logout')
    clearAuth()
    const user = useUserStore()
    user.clear()
    navigateTo('/')
  }

  // Следим за изменениями токена, refresh и userId
  watch([token, refreshToken, userId], () => {
    log(
      '[auth] changed',
      'token=',
      mask(token.value),
      'refresh=',
      mask(refreshToken.value),
      'uid=',
      userId.value
    )
  })

  return {
    // состояние
    isAuthModalOpen,
    token: skipHydrate(token),
    refreshToken: skipHydrate(refreshToken),
    userId: skipHydrate(userId),
    isAuthenticated,

    // ui
    openAuth,
    closeAuth,

    // действия
    loginOrRegister,
    tryRefresh,
    logout
  }
})
