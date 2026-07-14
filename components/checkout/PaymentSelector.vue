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

const methods: MethodCard[] = [
  {
    value: 'tpay_card',
    label: 'Картой Т-Банк',
    description: 'Банковской картой онлайн',
    img: 'https://daigo.ru/images/oplata/t-bank-card.png',
    layout: 'text',
  },
  {
    value: 'sbp',
    label: 'СБП',
    description: 'Система быстрых платежей',
    img: 'https://daigo.ru/images/oplata/sbp.png',
    layout: 'logo-only',
  },
  {
    value: 'card_online',
    label: 'Банковская карта',
    description: 'Оплата картой онлайн',
    img: 'https://daigo.ru/images/oplata/bankcard.png',
    layout: 'text',
  },
  {
    value: 'card_courier',
    label: 'Картой курьеру',
    description: 'Оплата картой при получении',
    img: 'https://daigo.ru/images/oplata/couriercard.png',
    layout: 'text',
  },
  {
    value: 'cash_courier',
    label: 'Наличными курьеру',
    description: 'Оплата наличными',
    img: 'https://daigo.ru/images/oplata/couriercash.png',
    layout: 'text',
  },
  {
    value: 'installments',
    label: 'Долями',
    description: 'Оплата покупок частями',
    img: 'https://daigo.ru/images/oplata/dolyame.png',
    layout: 'text',
  },
  {
    value: 'credit',
    label: 'Т-Банк',
    description: 'Рассрочка',
    img: 'https://daigo.ru/images/oplata/tbank.png',
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

function cardClass(method: MethodCard) {
  const active = isActive(method.value)

  return [
    'relative overflow-hidden rounded-2xl border transition-all duration-200',
    'text-center',
    'min-h-[64px] sm:min-h-[136px] px-4 py-3',
    'flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2',

    active
      ? [
          'border-primary',
          'bg-primary/5',
          'ring-2',
          'ring-primary',
          'ring-offset-0',
          'shadow-sm',
        ]
      : [
          'border-black/15',
          'bg-white',
          'hover:border-primary/60',
          'hover:shadow-sm',
        ],
  ]
}

function imageClass(method: MethodCard) {
  return [
    'object-contain max-h-12 sm:max-h-11 mx-auto sm:w-auto',

    method.value === 'installments'
      ? 'w-[48%]'
      : method.value === 'tpay_card'
        ? 'w-[80%]'
        : 'w-[80%]',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-slider font-medium">
      Способ оплаты
    </h3>

    <div
      class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4"
      role="radiogroup"
      aria-label="Способ оплаты"
    >
      <button
        v-for="method in methods"
        :key="method.value"
        type="button"
        :class="cardClass(method)"
        role="radio"
        :aria-checked="isActive(method.value)"
        @click="select(method.value)"
      >
        <span
          v-if="method.badge"
          class="absolute left-4 top-2 sm:left-2 sm:right-2 sm:top-2 rounded-full bg-cgreen px-2 py-1 text-[10px] font-medium leading-none text-white"
        >
          {{ method.badge }}
        </span>

        <div
          class="w-full flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2"
        >
          <img
            v-if="method.img"
            :src="method.img"
            :alt="method.label"
            width="140"
            height="64"
            :class="imageClass(method)"
            loading="lazy"
            decoding="async"
          >

          <div class="hidden sm:block space-y-0.5 text-center">
            <div class="text-xs sm:text-sm font-medium leading-tight text-black">
              {{ method.label }}
            </div>

            <div
              v-if="method.description"
              class="text-[11px] leading-tight text-black/50"
            >
              {{ method.description }}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>