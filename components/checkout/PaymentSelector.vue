<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import type { PaymentMethod } from '~/stores/checkoutStore'

const store = useCheckoutStore()

type UiValue =
  | 'sbp'
  | 'tpay_card'
  | 'installments'
  | 'credit'
  | 'card_online'
  | 'card_courier'
  | 'cash_courier'

type MethodCard = {
  value: UiValue
  label: string
  description?: string
  img?: string
  layout?: 'logo-only' | 'text'
  badge?: string
}

const UI_TO_STORE: Record<UiValue, PaymentMethod> = {
  sbp: 'sbp',
  tpay_card: 'tpay_card',
  installments: 'dolyame',
  credit: 'tbank',
  card_online: 'bank_card',
  card_courier: 'courier_card',
  cash_courier: 'cash',
}

/**
 * Partial используется специально:
 * PaymentMethod может всё ещё содержать tpay_qr,
 * но в интерфейсе этот способ оплаты больше не показывается.
 */
const STORE_TO_UI: Partial<Record<PaymentMethod, UiValue>> = {
  sbp: 'sbp',
  tpay_card: 'tpay_card',
  dolyame: 'installments',
  tbank: 'credit',
  bank_card: 'card_online',
  courier_card: 'card_courier',
  cash: 'cash_courier',
}

const defaultPaymentUiValue: UiValue = 'sbp'

const paymentImagesBase = import.meta.dev
  ? '/images/oplata'
  : 'https://daigo.ru/images/oplata'

const methods: MethodCard[] = [
  {
    value: 'sbp',
    label: 'СБП',
    description: 'Система быстрых платежей',
    img: `${paymentImagesBase}/sbp-pay.png`,
    layout: 'logo-only',
  },
  {
    value: 'tpay_card',
    label: 'Картой Т-Банк',
    description: 'Банковской картой онлайн',
    img: `${paymentImagesBase}/t-pay.png`,
    layout: 'text',
  },
  {
    value: 'card_online',
    label: 'Банковская карта',
    description: 'Оплата картой онлайн',
    img: `${paymentImagesBase}/card-online.svg`,
    layout: 'text',
  },
  {
    value: 'card_courier',
    label: 'Картой курьеру',
    description: 'Оплата картой при получении',
    img: `${paymentImagesBase}/bank-card.svg`,
    layout: 'text',
  },
  {
    value: 'cash_courier',
    label: 'Наличными курьеру',
    description: 'Оплата наличными',
    img: `${paymentImagesBase}/cash-in-hand.svg`,
    layout: 'text',
  },
  {
    value: 'installments',
    label: 'Долями',
    description: 'Оплата частями',
    img: `${paymentImagesBase}/dolyame-pay.png`,
    layout: 'text',
  },
  {
    value: 'credit',
    label: 'Т-Банк рассрочка',
    description: 'Рассрочка',
    img: `${paymentImagesBase}/t-pay.png`,
    layout: 'text',
  },
]

const activeUiValue = computed<UiValue>(() => {
  const paymentMethod = store.state.paymentMethod

  if (!paymentMethod) {
    return defaultPaymentUiValue
  }

  return STORE_TO_UI[paymentMethod] ?? defaultPaymentUiValue
})

onMounted(() => {
  const paymentMethod = store.state.paymentMethod
  const currentUiValue = paymentMethod
    ? STORE_TO_UI[paymentMethod]
    : undefined

  /**
   * Сбрасываем старый tpay_qr или другое значение,
   * для которого больше нет карточки в интерфейсе.
   */
  if (!currentUiValue) {
    store.state.paymentMethod = UI_TO_STORE[defaultPaymentUiValue]
  }
})

function select(value: UiValue) {
  store.state.paymentMethod = UI_TO_STORE[value]
}

function isActive(value: UiValue) {
  return activeUiValue.value === value
}

function imageClass(method: MethodCard) {
  return [
    'h-8 shrink-0 object-contain object-left',
    method.value === 'installments' && 'w-auto',
    method.value === 'credit' && 'w-auto',
    method.value === 'sbp' && 'w-auto',
    method.value === 'tpay_card' && 'w-auto',
    ['card_online', 'card_courier', 'cash_courier'].includes(method.value) && 'w-auto',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-[clamp(24px,4vw,36px)] font-medium">
      Способ оплаты
    </h3>

    <div
      class="space-y-3"
      role="radiogroup"
      aria-label="Способ оплаты"
    >
      <button
        v-for="method in methods"
        :key="method.value"
        type="button"
        class="flex min-h-[54px] w-full items-center gap-3 overflow-hidden rounded-lg border px-4 py-2.5 text-left transition-colors duration-200 sm:px-5"
        :class="isActive(method.value)
          ? 'border-primary bg-[#EEF4FF]'
          : 'border-[#D1D5DB] bg-white hover:border-primary/60'"
        role="radio"
        :aria-checked="isActive(method.value)"
        @click="select(method.value)"
      >
        <span
          class="flex size-[17px] shrink-0 items-center justify-center rounded-full border"
          :class="isActive(method.value) ? 'border-primary' : 'border-black/20'"
          aria-hidden="true"
        >
          <span
            v-if="isActive(method.value)"
            class="size-[9px] rounded-full bg-primary"
          />
        </span>

        <img
          v-if="method.img"
          :src="method.img"
          :alt="method.label"
          width="112"
          height="32"
          :class="imageClass(method)"
          loading="lazy"
          decoding="async"
        >

        <span class="min-w-0 flex-1 text-base font-normal leading-tight sm:text-lg">
          {{ method.label }}
        </span>

        <span
          v-if="method.description"
          class="shrink-0 text-sm text-black/45"
          :class="method.value === 'installments'
            ? 'block'
            : 'hidden md:block'"
        >
          {{ method.description }}
        </span>
      </button>
    </div>
  </div>
</template>
