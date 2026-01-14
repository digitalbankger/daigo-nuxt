// stores/gamification.ts
import { defineStore } from 'pinia'
import { reactive, watch, onBeforeMount } from 'vue'
import { useState } from '#imports'
import type { GamificationState, WheelResult } from '~/types/gamification'

export const useGamificationStore = defineStore('gamification', () => {
  const state = reactive<GamificationState>({
    wheelResult: null,
    wheelSpunAt: null,
    giftSelected: null,
    giftExpiresAt: null,
    giftClaimed: false
  })

  // Персистим состояние (SSR-safe)
  const persisted = useState<GamificationState>('gamification-persist', () => ({} as GamificationState))

  onBeforeMount(() => {
    Object.assign(state, persisted.value || {})
  })

  watch(
    state,
    (v) => {
      persisted.value = { ...v }
    },
    { deep: true }
  )

  // ---- Колесо ----
  function setWheelResult(result: WheelResult) {
    state.wheelResult = result
    state.wheelSpunAt = new Date().toISOString()
  }

  /**
   * Можно ли крутить ещё раз.
   * Сейчас логика самая жёсткая — 1 раз на клиента.
   * Если потом захочешь "1 раз в день" — меняется только здесь.
   */
  function canSpinAgain(): boolean {
    return !state.wheelResult
  }

  // ---- Подарок (для таймера) ----
  function selectGift(giftId: string, expiresAtISO: string) {
    state.giftSelected = giftId
    state.giftExpiresAt = expiresAtISO
    state.giftClaimed = false
  }

  function markGiftClaimed() {
    state.giftClaimed = true
  }

  function giftRemainingSec(): number {
    if (!state.giftExpiresAt) return 0
    const left = Math.floor((new Date(state.giftExpiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, left)
  }

  return {
    state,
    setWheelResult,
    canSpinAgain,
    selectGift,
    markGiftClaimed,
    giftRemainingSec
  }
})
