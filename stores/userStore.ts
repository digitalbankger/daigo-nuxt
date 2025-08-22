import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/user'
import { $fetch } from 'ofetch'

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLoaded = ref(false)

  async function load() {
    console.log('[userStore] load() вызван')

    if (isLoaded.value) return

    try {
      const data = await $fetch<UserProfile>('/api/auth/user/profile')
      console.log('[userStore] данные загружены:', data)

      profile.value = data
      isLoaded.value = true
    } catch (error) {
      console.error('[userStore] Ошибка загрузки профиля:', error)
    }
  }

  async function saveProfile(updatedData: Partial<UserProfile>) {
    if (!profile.value?.id) {
      console.warn('[userStore] Нет ID пользователя — нельзя обновить профиль')
      return
    }

    try {
      const updatedProfile = await $fetch<UserProfile>(`/api/auth/user/${profile.value.id}/update`, {
        method: 'PATCH',
        body: updatedData,
      })

      profile.value = {
        ...profile.value,
        ...updatedProfile,
      }
    } catch (error) {
      console.error('[userStore] Ошибка обновления профиля:', error)
    }
  }

  function clear() {
    profile.value = null
    isLoaded.value = false
  }

  return {
    profile,
    load,
    saveProfile,
    isLoaded,
    clear,
  }
})
