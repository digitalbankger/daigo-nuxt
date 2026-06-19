import { computed, onMounted, onUnmounted, ref } from 'vue'

export const SUMMER_PROMO_END_AT = '2026-06-19T23:59:59+03:00'

const promoEndAtMs = new Date(SUMMER_PROMO_END_AT).getTime()
const nowTs = ref(Date.now())

let timer: ReturnType<typeof setInterval> | null = null
let subscribers = 0

function startTimer() {
  if (timer || !import.meta.client) return

  timer = window.setInterval(() => {
    nowTs.value = Date.now()
  }, 1000)
}

function stopTimer() {
  if (!timer || subscribers > 0) return
  window.clearInterval(timer)
  timer = null
}

function pad(value: number, min = 2) {
  return String(Math.max(0, value)).padStart(min, '0')
}

export function useSummerPromoCountdown() {
  const remainingMs = computed(() => Math.max(0, promoEndAtMs - nowTs.value))

  const totalSeconds = computed(() => Math.floor(remainingMs.value / 1000))
  const totalHours = computed(() => Math.floor(totalSeconds.value / 3600))
  const minutes = computed(() => Math.floor((totalSeconds.value % 3600) / 60))
  const seconds = computed(() => totalSeconds.value % 60)

  const label = computed(() => `${pad(totalHours.value)}ч ${pad(minutes.value)}м ${pad(seconds.value)}с`)
  const compactLabel = computed(() => `${pad(totalHours.value)}:${pad(minutes.value)}:${pad(seconds.value)}`)
  const isFinished = computed(() => remainingMs.value <= 0)

  onMounted(() => {
    subscribers += 1
    nowTs.value = Date.now()
    startTimer()
  })

  onUnmounted(() => {
    subscribers = Math.max(0, subscribers - 1)
    stopTimer()
  })

  return {
    remainingMs,
    totalHours,
    minutes,
    seconds,
    label,
    compactLabel,
    isFinished,
  }
}
