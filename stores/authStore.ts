// stores/authStore.ts
import { defineStore, skipHydrate } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  sendAuthFc,
  sendAuthVoice,
  verifyAuthCode,
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
  function openAuth(to?: string)  { isAuthModalOpen.value = true; redirectAfterAuth.value = to ?? null; log('[auth] open modal', to) }
  function closeAuth() { isAuthModalOpen.value = false; log('[auth] close modal') }

  // ==== Инициализация из localStorage ====
  let initialToken: string | null = null
  let initialRefresh: string | null = null
  let initialUserId: number | null = null

  if (process.client) {
    const expires = Number(localStorage.getItem('auth_expires_at')) || 0
    const now = Date.now()
    if (expires && now < expires) {
      initialToken = localStorage.getItem('token')
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('auth_expires_at')
    }
    initialRefresh = localStorage.getItem('refresh_token')
    const uid = localStorage.getItem('daigo_id')
    initialUserId  = uid ? Number(uid) : null
  }

  // ==== State ====
  const token        = ref<string | null>(initialToken)
  const refreshToken = ref<string | null>(initialRefresh)
  const userId       = ref<number | null>(initialUserId)
  const isAuthenticated = computed(() => !!token.value)

  // === Кодовая авторизация ===
  const pendingPhone   = ref<string | null>(null)   // телефон без маски
  const pendingName    = ref<string | null>(null)   // для UX при регистрации
  const isRegisterMode = ref<boolean>(false)
  const isCodeSent     = ref(false)
  const redirectAfterAuth = ref<string | null>(null)

  // resend-блокировка (отсчёт 30 секунд)
  const resendLeft = ref(0) // сек до повторной отправки, 0 — можно отправлять
  
  const resendCount = ref(0) // сколько раз пользователь нажимал «отправить код повторно»
  const lastSendMethod = ref<'call' | 'voice'>('call')

  log('[auth:init]', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)

  let resendTimer: any = null
  function startResendTimer(seconds = 30) {
    if (resendTimer) clearInterval(resendTimer)
    resendLeft.value = seconds
    resendTimer = setInterval(() => {
      resendLeft.value = Math.max(0, resendLeft.value - 1)
      if (resendLeft.value === 0) {
        clearInterval(resendTimer)
        resendTimer = null
      }
    }, 1000)
  }

  async function requestCode(opts: { phone: string; name?: string; isRegister?: boolean }) {
    const phone_number = opts.phone.replace(/\D/g, '')
    if (phone_number.length < 11) throw new Error('Введите телефон полностью')

    pendingPhone.value   = phone_number
    pendingName.value    = (opts.name ?? '').trim() || null
    isRegisterMode.value = Boolean(opts.isRegister)

    resendCount.value = 0

    // Первая отправка — звонок
    await sendAuthFc(phone_number)

    lastSendMethod.value = 'call'
    isCodeSent.value = true
    startResendTimer(30)
  }

  async function resendCode() {
    if (!pendingPhone.value || resendLeft.value > 0) return

    // Повторная отправка — голосовой звонок: робот диктует код
    await sendAuthVoice(pendingPhone.value)

    lastSendMethod.value = 'voice'
    resendCount.value += 1
    startResendTimer(30)
  }

  async function confirmCode(code: string, redirectTo?: string) {
    if (!pendingPhone.value) throw new Error('Телефон не указан')
    const clean = String(code).replace(/\D/g, '')
    if (clean.length !== 4) throw new Error('Код должен быть из 4 цифр')

    const tokens = await verifyAuthCode({
      phone_number: pendingPhone.value,
      code: clean,
      project_name: 'daigo_web'
    })
    setAuthData(tokens)

    // миграция гостевой корзины
    const sid = process.client ? localStorage.getItem('guest_session_id') : null
    if (sid) {
      try {
        await cartService.migrateGuestToUser(sid, tokens.daigo_id)
        localStorage.removeItem('guest_session_id')
      } catch (e) {
        console.warn('[auth] migrateGuestToUser failed', e)
      }
    }

    // очистка временных полей
    pendingPhone.value   = null
    pendingName.value    = null
    isRegisterMode.value = false
    isCodeSent.value     = false
    resendLeft.value     = 0
    resendCount.value    = 0
    lastSendMethod.value = 'call'
    
    closeAuth()
    const target = redirectTo ?? redirectAfterAuth.value
    if (target) await navigateTo(target)
    redirectAfterAuth.value = null
  }

    async function loginWithTelegramTokens(tokens: TokensResponse, redirectTo?: string) {
    setAuthData(tokens)

    const sid = process.client ? localStorage.getItem('guest_session_id') : null
    if (sid) {
      try {
        await cartService.migrateGuestToUser(sid, tokens.daigo_id)
        localStorage.removeItem('guest_session_id')
      } catch (e) {
        console.warn('[auth] migrateGuestToUser failed', e)
      }
    }

    pendingPhone.value   = null
    pendingName.value    = null
    isRegisterMode.value = false
    isCodeSent.value     = false
    resendLeft.value     = 0
    resendCount.value    = 0
    lastSendMethod.value = 'call'

    closeAuth()

    const target = redirectTo ?? redirectAfterAuth.value
    if (target) await navigateTo(target)
    redirectAfterAuth.value = null
  }

  function setAuthData(data: TokensResponse) {
    token.value        = data.access_token
    refreshToken.value = data.refresh_token
    userId.value       = (data as any).daigo_id ?? null

    if (process.client) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      if (userId.value != null) localStorage.setItem('daigo_id', String(userId.value))
      // TTL access: берём exp из JWT (если есть), иначе fallback 24ч
      const jwtExpMs = (() => {
        try {
          const part = data.access_token.split('.')[1]
          if (!part) return null
          const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')))
          const exp = Number(json?.exp)
          if (!exp) return null
          return exp * 1000
        } catch {
          return null
        }
      })()
      const expiresAt = jwtExpMs ?? (Date.now() + 24 * 60 * 60 * 1000)
      localStorage.setItem('auth_expires_at', String(expiresAt))
    }
  }

  function clearAuth() {
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
      const data = await refreshAuthToken(refreshToken.value)
      setAuthData(data)
      return true
    } catch (e) {
      clearAuth()
      return false
    }
  }

  async function softLogout(to: string = '/') {
    clearAuth()
    const user = useUserStore()
    user.clear?.()
    try {
      const route = useRoute()
      if (route.fullPath !== to) {
        await navigateTo(to, { replace: true })
      }
    } catch {}
  }

  async function logout() {
    await softLogout('/')
  }


  const deliveryHint = computed(() => {
    if (lastSendMethod.value === 'voice') {
      return 'Сейчас поступит звонок. Робот продиктует код подтверждения.'
    }

    return 'Сейчас поступит звонок. Введите последние 4 цифры входящего номера.'
  })

  watch([token, refreshToken, userId], () => {
    log('[auth] changed', 'token=', mask(token.value), 'refresh=', mask(refreshToken.value), 'uid=', userId.value)
  })

  return {
    // code auth
    pendingPhone, pendingName, isRegisterMode, isCodeSent, redirectAfterAuth,
    resendLeft,
    resendCount,
    lastSendMethod,
    deliveryHint,
    requestCode, resendCode, confirmCode,

    loginWithTelegramTokens,

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
    tryRefresh,
    softLogout,
    logout
  }
})
