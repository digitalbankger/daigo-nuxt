<script setup lang="ts">
import { computed } from 'vue'
import Button from './Button.vue'

type PromoType = 'code' | 'discount' | '2plus1' | 'notice' | 'gift' | string
interface Promotion {
  id: number | string
  title: string
  description?: string
  image: string
  coupon?: string | null
  promo_type: PromoType
}

const props = withDefaults(defineProps<{
  promotion: Promotion
  /** активна ли акция у пользователя (с бэка is_applied) */
  isApplied?: boolean
  /** идёт применение/отмена именно этой карточки */
  busy?: boolean
}>(), { isApplied: false, busy: false })

const emit = defineEmits<{
  (e: 'apply', promotion: Promotion): void
  (e: 'cancel', promotion: Promotion): void
}>()

const ctaText = computed(() => {
  if (props.isApplied) return 'Отменить акцию'
  if (props.promotion.promo_type === 'code') return 'Применить промокод'
  if (props.promotion.promo_type === 'gift') return 'Получить подарок'
  return 'Смотреть предложение'
})

function onPrimaryClick() {
  if (props.busy) return
  props.isApplied ? emit('cancel', props.promotion) : emit('apply', props.promotion)
}

async function copyCoupon() {
  const code = props.promotion.coupon?.trim()
  if (!code) return
  try { await navigator.clipboard.writeText(code) } catch {}
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.onerror = null // предотвратить бесконечные запросы
  img.src = '/images/placeholder-promo.jpg'
}
</script>

<template>
  <div class="flex flex-col">
    <div class="relative">
      <img
        :src="promotion.image"
        :alt="promotion.title"
        class="w-full h-auto object-contain cursor-pointer"
        loading="lazy"
        decoding="async"
        @click="onPrimaryClick"
        @error="onImgError"
      />
      <div v-if="isApplied" class="absolute top-3 left-3 rounded-lg bg-cgreen text-white text-base sm:text-lg px-2 py-1">
        Активна
      </div>
    </div>

    <div class="mt-4 flex flex-col flex-1">
      <h3 class="text-2xl font-medium mb-2 leading-snug">{{ promotion.title }}</h3>

      <p v-if="promotion.description" class="text-base text-black/70 mb-4" v-html="promotion.description" />

      <div v-if="promotion.coupon" class="mb-4">
        <div class="text-sm text-black/70">Промокод:</div>
        <div class="mt-1 flex items-center gap-2">
          <span class="font-medium text-base text-primary tracking-wide select-all">{{ promotion.coupon }}</span>
          <button type="button" class="text-xs text-black/60 hover:text-black underline" @click="copyCoupon">Скопировать</button>
        </div>
      </div>

      <div class="mt-auto">
        <Button
          variant="outline"
          class="w-full"
          :class="isApplied
            ? '!border-red-500 !text-red-500 hover:!bg-red-50 focus:!ring-red-200'
            : ''"
          :disabled="busy"
          @click="onPrimaryClick"
        >
          {{ busy ? (isApplied ? 'Отмена…' : 'Применение…') : ctaText }}
        </Button>
      </div>
    </div>
  </div>
</template>
