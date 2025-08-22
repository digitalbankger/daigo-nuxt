import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'

export interface BonusHistory {
  operation_type: 'credit' | 'debit'
  value: number
  date: string
  order_id?: string
  order_price?: number
  description?: string
}

export const useBonusStore = defineStore('bonusStore', () => {
  const history = ref<BonusHistory[]>([])
  const isLoading = ref(false)

  async function loadBonusHistory() {
    const userStore = useUserStore()
    const daigoId = userStore.profile?.id || '123'
    if (!daigoId) return

    isLoading.value = true
    try {
      const { data, error } = await useFetch<BonusHistory[]>(`/api/bonuses`, {
        query: { daigoId },
      })

      if (error.value) throw error.value
      history.value = data.value ?? []
    } catch (err) {
      console.error('[bonusStore] Ошибка при загрузке бонусов:', err)
      history.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    history,
    isLoading,
    loadBonusHistory,
  }
})
