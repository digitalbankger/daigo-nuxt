import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchUser, updateUser, type UserProfile } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { log, time, timeEnd } from '@/utils/debug'

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLoaded = ref(false)

  // Дедупликация, чтобы параллельные вызовы loadProfile() не плодили запросы
  let inFlight: Promise<void> | null = null

  async function loadProfile() {
    if (inFlight) return inFlight
    const auth = useAuthStore()

    inFlight = (async () => {
      log('[user] loadProfile:start uid=', auth.userId)
      if (!auth.userId) {
        isLoaded.value = true
        log('[user] skip: no uid')
        return
      }

      time('fetchUser')
      try {
        const data = await fetchUser(auth.userId)
        profile.value = {
          ...data,
          addresses: data.addresses ?? [],
          cards: data.cards ?? [],
          bonuses: {
            valid: { value: data.bonuses?.valid?.value ?? 0 },
            expiring: {
              value: data.bonuses?.expiring?.value ?? 0,
              date_end: data.bonuses?.expiring?.date_end ?? null
            },
            expired: { value: data.bonuses?.expired?.value ?? 0 }
          }
        }
        log('[user] profile ok:', !!profile.value, 'name=', profile.value?.first_name)
      } catch (err) {
        const code = (err as any)?.response?.status
        log('[user] loadProfile error', code, err)

        // Мягкий выход только при 401/403. Остальные ошибки не разлогинивают.
        if (code === 401 || code === 403) {
          // предпочтительно мягкий логаут (без reload и без редиректа "на себя")
          await (auth.softLogout?.('/') ?? auth.logout?.())
        }
      } finally {
        isLoaded.value = true
        timeEnd('fetchUser')
        log('[user] loadProfile:done isLoaded=', isLoaded.value)
      }
    })()

    try {
      await inFlight
    } finally {
      inFlight = null
    }
  }

  async function saveProfile(patch: Partial<UserProfile>) {
    if (!profile.value?.id) return
    try {
      const updated = await updateUser(profile.value.id, patch)
      profile.value = { ...profile.value, ...updated }
      log('[user] saveProfile ok', Object.keys(patch))
    } catch (e) {
      log('[user] saveProfile error', e)
    }
  }

  function clear() {
    profile.value = null
    isLoaded.value = false
    log('[user] cleared')
  }

  return { profile, isLoaded, loadProfile, saveProfile, clear, load: loadProfile }
})
