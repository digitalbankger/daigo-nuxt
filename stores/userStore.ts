import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchUser, updateUser, type UserProfile } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLoaded = ref(false)

  let inFlight: Promise<void> | null = null

  async function loadProfile() {
    if (inFlight) return inFlight
    const auth = useAuthStore()

    inFlight = (async () => {
      if (!auth.userId) {
        isLoaded.value = true
        return
      }

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
      } catch (err: any) {
        const code = err?.response?.status
        if (code === 401 || code === 403) {
          await (auth.softLogout?.('/') ?? auth.logout?.())
        }
      } finally {
        isLoaded.value = true
      }
    })()

    try {
      await inFlight
    } finally {
      inFlight = null
    }
  }

  async function saveProfile(patch: Partial<UserProfile>) {
    const auth = useAuthStore()
    const daigoId =
      auth.userId ??
      (profile.value as any)?.daigo_id ??
      (profile.value as any)?.id ??
      null

    if (!daigoId) return

    const updated = await updateUser(daigoId, patch)
    profile.value = { ...(profile.value as any), ...updated }
    return updated
  }

  function clear() {
    profile.value = null
    isLoaded.value = false
  }

  return { profile, isLoaded, loadProfile, saveProfile, clear, load: loadProfile }
})
