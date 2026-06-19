<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

const props = withDefaults(defineProps<{
  threshold: number
  currentAmount: number
  giftImage?: string
  giftName?: string
}>(), {
  giftImage: '/media-s3/products/dent/product-1.png',
  giftName: 'Зубная паста Daigo',
})

const { public: { daigoApiBase } } = useRuntimeConfig()

const safeCurrentAmount = computed(() => Math.max(0, Number(props.currentAmount || 0)))
const remainingAmount = computed(() => Math.max(0, props.threshold - safeCurrentAmount.value))
const progressPercent = computed(() => {
  if (!props.threshold) return 0
  return Math.min(100, Math.max(0, Math.round((safeCurrentAmount.value / props.threshold) * 100)))
})
const isReached = computed(() => remainingAmount.value <= 0)

const giftImageSrc = computed(() => {
  const url = normalizeMediaUrl(props.giftImage)

  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/media-s3/') || url.startsWith('/images/') || url.startsWith('/icons/')) return url

  return `${daigoApiBase}${url.startsWith('/') ? url : `/${url}`}`
})

const formattedRemainingAmount = computed(() => remainingAmount.value.toLocaleString('ru-RU'))
const formattedThreshold = computed(() => props.threshold.toLocaleString('ru-RU'))
const formattedCurrentAmount = computed(() => safeCurrentAmount.value.toLocaleString('ru-RU'))
</script>

<template>
  <div class="gift-progress rounded-2xl border border-primary/15 bg-white px-4 py-4 md:px-5 md:py-5 shadow-[0_12px_40px_rgba(21,152,194,0.08)]">
    <div class="flex items-center gap-3 md:gap-4">
      <div class="gift-progress__image-wrap shrink-0">
        <img src="/images/articles/summer/gift-pasta.png" :alt="giftName" class="gift-progress__image">
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            Подарок от {{ formattedThreshold }} ₽
          </span>
          <span class="text-xs text-black/45">{{ giftName }}</span>
        </div>

        <p v-if="!isReached" class="text-sm md:text-base font-medium text-black leading-snug">
          Добавьте еще на сумму
          <span class="text-primary">{{ formattedRemainingAmount }} ₽</span>
        </p>
        <p v-else class="text-sm md:text-base font-medium text-black leading-snug">
          Подарок уже в корзине —
          <span class="text-primary">{{ giftName }}</span>
        </p>

        <div class="gift-progress__bar mt-2" aria-hidden="true">
          <div class="gift-progress__bar-fill" :style="{ width: `${progressPercent}%` }">
            <span class="gift-progress__spark"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gift-progress {
  position: relative;
  overflow: hidden;
}

.gift-progress::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(22,166,211,0.06), transparent 36%, rgba(154,255,159,0.10) 100%);
}

.gift-progress__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(22,166,211,0.10), rgba(22,166,211,0.03));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
}

.gift-progress__image {
  width: 110px;
  height: 110px;
  object-fit: contain;
}

.gift-progress__bar {
  position: relative;
  height: 12px;
  border-radius: 9999px;
  background: rgba(22, 166, 211, 0.12);
  overflow: hidden;
}

.gift-progress__bar-fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(22,166,211,1) 0%, rgba(60,191,230,1) 55%, rgba(154,255,159,1) 100%);
  transition: width .35s ease;
  animation: gift-progress-pulse 2.2s ease-in-out infinite;
}

.gift-progress__spark {
  position: absolute;
  top: 1px;
  right: 2px;
  width: 18px;
  height: calc(100% - 2px);
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.92));
  opacity: .75;
}

@keyframes gift-progress-pulse {
  0%, 100% { filter: saturate(1); }
  50% { filter: saturate(1.1) brightness(1.03); }
}

@media (prefers-reduced-motion: reduce) {
  .gift-progress__bar-fill {
    animation: none;
  }
}
</style>
