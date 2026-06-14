<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import Button from './Button.vue'
import { useYtm } from '@/composables/useYtm'

type PromoType = 'code' | 'discount' | '2plus1' | 'notice' | 'gift' | string
interface Promotion {
  id: number | string
  title: string
  description?: string
  image: string
  coupon?: string | null
  promo_type: PromoType
  link?: string | null
}

const props = withDefaults(defineProps<{
  promotion: Promotion
  isApplied?: boolean
  busy?: boolean
  /** позиция карточки в общем списке (с 0), чтобы отправлять position */
  index?: number
}>(), { isApplied: false, busy: false, index: 0 })

const emit = defineEmits<{
  (e: 'apply', promotion: Promotion): void
  (e: 'cancel', promotion: Promotion): void
}>()

const ytm = useYtm()

const ctaText = computed(() => {
  if (props.promotion.link) return 'Перейти'
  if (props.isApplied) return 'Отменить акцию'
  if (props.promotion.promo_type === 'code') return 'Промокоды временно недоступны'
  if (props.promotion.promo_type === 'gift') return 'Получить подарок'
  return 'Смотреть предложение'
})

function toYtmPromo() {
  return {
    id: String(props.promotion.id),
    name: props.promotion.title,
    creative: 'grid',                   // тот же тип носителя, что и на странице
    position: String((props.index ?? 0) + 1),
  }
}

async function goLinkIfNeed(): Promise<boolean> {
  if (!import.meta.client) return false

  const link = props.promotion.link?.trim?.()
  if (!link) return false
  if (props.busy) return true

  ytm.promoClick([toYtmPromo()])

  if (/^https?:\/\//i.test(link)) await navigateTo(link, { external: true })
  else await navigateTo(link)

  return true
}

async function onPrimaryClick() {
  if (!import.meta.client) return

  if (await goLinkIfNeed()) return
  if (props.busy) return

  // Временно отключено: промокоды не применяем из карточек акций.
  if (props.promotion.promo_type === 'code') return

  ytm.promoClick([toYtmPromo()])

  props.isApplied
    ? emit('cancel', props.promotion)
    : emit('apply', props.promotion)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.onerror = null
  img.src = '/images/placeholder-promo.jpg'
}
</script>

<template>
  <div class="flex flex-col">
    <div class="relative">
      <img
        :src="promotion.image"
        :alt="promotion.title"
        class="w-full h-auto object-contain cursor-pointer rounded-xl sm:rounded-2xl"
        loading="lazy"
        decoding="async"
        @click="onPrimaryClick"
      />
      <div v-if="isApplied" class="absolute top-3 left-3 rounded-lg bg-cgreen text-white text-base sm:text-lg px-2 py-1">
        Активна
      </div>
    </div>

    <div class="mt-4 flex flex-col flex-1">
      <h3 class="text-2xl font-medium mb-2 leading-snug">{{ promotion.title }}</h3>

      <p v-if="promotion.description" class="text-base text-black/70 mb-4" v-html="promotion.description" />

      <!--
        Временно отключено: не показываем и не копируем промокоды в карточках акций.
        <div v-if="promotion.coupon" class="mb-4">
          <div class="text-sm text-black/70">Промокод:</div>
          <div class="mt-1 flex items-center gap-2">
            <span class="font-medium text-base text-primary tracking-wide select-all">{{ promotion.coupon }}</span>
            <button type="button" class="text-xs text-black/60 hover:text-black underline" @click="copyCoupon">Скопировать</button>
          </div>
        </div>
      -->

      <div class="mt-auto">
        <Button
          variant="outline"
          class="w-full"
          :class="isApplied
            ? '!border-red-500 !text-red-500 hover:!bg-red-50 focus:!ring-red-200'
            : ''"
          :disabled="busy || promotion.promo_type === 'code'"
          @click="onPrimaryClick"
        >
          {{ busy ? (promotion.link ? 'Переход…' : (isApplied ? 'Отмена…' : 'Применение…')) : ctaText }}
        </Button>
      </div>
    </div>
  </div>
</template>
