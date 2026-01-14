<script setup lang="ts">
import type { GiftOption } from '~/types/gamification'
import { useGamificationStore } from '~/stores/gamification'

const props = defineProps<{
  options: GiftOption[]
  durationSec: number
}>()

const store = useGamificationStore()
const selected = ref<string | null>(store.state.giftSelected ?? null)
const left = ref<number>(store.giftRemainingSec())
let interval: number | null = null

function startTimer() {
  const expiresAt = new Date(Date.now() + props.durationSec * 1000).toISOString()
  if (!selected.value) return
  store.selectGift(selected.value, expiresAt)
  left.value = store.giftRemainingSec()
  tick()
  if (interval) clearInterval(interval)
  interval = window.setInterval(tick, 1000)
}
function tick() {
  left.value = store.giftRemainingSec()
  if (left.value <= 0 && interval) { clearInterval(interval); interval = null }
}
onMounted(() => { if (left.value > 0) { interval = window.setInterval(tick, 1000) }})
onUnmounted(() => { if (interval) clearInterval(interval) })

const mm = computed(() => String(Math.floor(left.value / 60)).padStart(2, '0'))
const ss = computed(() => String(left.value % 60).padStart(2, '0'))

async function claimGift() {
  if (!store.state.giftSelected || store.giftRemainingSec() <= 0) return
  // TODO: вызвать Go-бэк для фиксации приза
  // await $fetch('/api/gift/claim', { method: 'POST', body: { giftId: store.state.giftSelected } })
  store.markGiftClaimed()
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button v-for="g in props.options" :key="g.id"
              class="p-3 rounded-2xl border hover:shadow flex flex-col items-center gap-2"
              :class="g.id === selected ? 'border-black' : 'border-neutral-200'"
              @click="selected = g.id">
        <img v-if="g.image" :src="g.image" loading="lazy" class="w-24 h-24 object-contain" :alt="g.title" />
        <div class="text-sm font-medium text-center">{{ g.title }}</div>
        <div class="text-xs text-neutral-500 text-center">{{ g.subtitle }}</div>
      </button>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm">
        <span v-if="left > 0">Успей забрать за <b>{{ mm }}:{{ ss }}</b></span>
        <span v-else>Таймер не активен</span>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 rounded-xl border" @click="startTimer" :disabled="!selected">
          Запустить таймер
        </button>
        <button class="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                :disabled="left<=0 || !selected"
                @click="claimGift">
          Забрать подарок
        </button>
      </div>
    </div>

    <p v-if="store.state.giftClaimed" class="text-green-600 text-sm">
      Подарок закреплён 🎁 — проверь корзину/профиль
    </p>
  </div>
</template>
