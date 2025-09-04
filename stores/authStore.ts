import { defineStore, skipHydrate } from 'pinia'
import { ref, computed, watch } from 'vue'
import { startAuth, refreshAuthToken, type TokensResponse } from '@/services/authService'
import { useUserStore } from '@/stores/userStore'
import { log, mask } from '@/utils/debug'

export const useAuthStore = defineStore('auth', () => {
  // ui state (для слайд-модалки в лейауте)
  const isAuthModalOpen = ref(false)

  // auth state (читаем только на клиенте)
  const token = ref<string | null>(process.client ? localStorage.getItem('token') : null)
  const refreshToken = ref<string | null>(process.client ? localStorage.getItem('refresh_token') : null)
  const userId = ref<number | null>(process.client ? Number(localStorage.getItem('daigo_id') || 0) || null : null)

  const isAuthenticated = computed(() => !!token.value)

  log('[auth:init]', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)

  function openAuth() { isAuthModalOpen.value = true; log('[auth] open modal') }
  function closeAuth() { isAuthModalOpen.value = false; log('[auth] close modal') }

  function setAuthData(data: TokensResponse) {
    log('[auth] setAuthData', 'uid=', data.daigo_id, 'token=', mask(data.access_token))
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    userId.value = data.daigo_id

    if (process.client) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('daigo_id', String(data.daigo_id))
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

  async function loginOrRegister(opts: { phone: string; name?: string; isRegister: boolean }) {
    // стартуем авторизацию; бэкенд держит запрос пока не подтвердят
    const phone_number = opts.phone.replace(/\D/g, '')
    const first_name = opts.isRegister ? (opts.name || '').trim() : undefined

    log('[auth] loginOrRegister:start', { phone_number, first_name, mode: opts.isRegister ? 'register' : 'login' })

    const deadline = Date.now() + 2 * 60 * 1000 // 2 минуты
    let res = await startAuth(phone_number, first_name)

    while ((res as any).status === 'pending' && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 2000))
      res = await startAuth(phone_number, first_name)
    }

    if ('access_token' in res && 'refresh_token' in res) {
      setAuthData(res as TokensResponse)

      // грузим профиль и редиректим
      const user = useUserStore()
      await user.loadProfile()
      closeAuth()
      navigateTo('/profile')
      return true
    } else {
      log('[auth] no tokens in response', res)
      throw new Error(('message' in res && (res as any).message) || 'Авторизация не подтверждена')
    }
  }

  function logout() {
    log('[auth] logout')
    clearAuth()
    const user = useUserStore()
    user.clear()
    navigateTo('/')
  }

  // удобно отслеживать изменения
  watch([token, refreshToken, userId], () => {
    log('[auth] changed', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)
  })

  return {
    // state
    isAuthModalOpen,
    token: skipHydrate(token),            // ⬅ не перетирать значениями с SSR
    refreshToken: skipHydrate(refreshToken),
    userId: skipHydrate(userId),
    isAuthenticated,

    // ui
    openAuth, closeAuth,

    // actions
    loginOrRegister, tryRefresh, logout
  }
})
