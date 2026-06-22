<script setup lang="ts">
import { computed } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import type { PaymentMethod } from '~/stores/checkoutStore'

const store = useCheckoutStore()

// Значения в UI (как у тебя в массиве methods)
type UiValue =
  | 'sbp'
  // | 'tpay_qr'
  // | 'tpay_card'
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

// Соответствие UI → значениям, которые ждёт стор/бэкенд
const UI_TO_STORE: Record<UiValue, PaymentMethod> = {
  sbp: 'sbp',
  // tpay_qr: 'tpay_qr',
  // tpay_card: 'tpay_card',
  installments: 'dolyame',
  credit: 'tbank',
  card_online: 'bank_card',
  card_courier: 'courier_card',
  cash_courier: 'cash',
}

// Обратное соответствие (для удобной проверки активной карточки)
const STORE_TO_UI: Record<PaymentMethod, UiValue> = {
  sbp: 'sbp',
  // tpay_qr: 'tpay_qr',
  // tpay_card: 'tpay_card',
  dolyame: 'installments',
  tbank: 'credit',
  bank_card: 'card_online',
  courier_card: 'card_courier',
  cash: 'cash_courier',
}

const methods: MethodCard[] = [
  {
    value: 'sbp',
    label: 'СБП',
    description: 'Система быстрых платежей',
    img: 'https://daigo.ru/images/oplata/sbp.png',
    layout: 'logo-only',
  },
  // {
  //   value: 'tpay_qr',
  //   label: 'QR СБП Т-Банк',
  //   description: 'Оплата по QR от Т-Банка',
  //   img: 'https://daigo.ru/images/oplata/tbank.png',
  //   layout: 'text',
  //   badge: 'Самый удобный',
  // },
  // {
  //   value: 'tpay_card',
  //   label: 'Картой Т-Банк',
  //   description: 'Банковской картой онлайн',
  //   img: 'https://daigo.ru/images/oplata/tbank.png',
  //   layout: 'text',
  // },
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

// Текущее выбранное значение в терминах UI
const activeUiValue = computed<UiValue>(() => {
  const curr = store.state.paymentMethod
  return STORE_TO_UI[curr] ?? 'sbp'
})

function select(v: UiValue) {
  store.state.paymentMethod = UI_TO_STORE[v]
}

function isActive(v: UiValue) {
  return activeUiValue.value === v
}

function cardClass(active: boolean) {
  return [
    'relative overflow-hidden rounded-2xl border transition min-h-[112px] sm:min-h-[136px] px-3 sm:px-4 py-3',
    'bg-white flex flex-col items-center justify-center gap-2 text-center',
    active
      ? 'border-primary ring-1 ring-primary ring-offset-0'
      : 'border-black/15 hover:border-primary/60',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-slider font-medium">Способ оплаты</h3>

    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      <button
        v-for="m in methods"
        :key="m.value"
        type="button"
        :class="cardClass(isActive(m.value))"
        @click="select(m.value)"
        @keyup.enter.space="select(m.value)"
        role="radio"
        :aria-checked="isActive(m.value)"
      >
        <span
          v-if="m.badge"
          class="absolute left-2 right-2 top-2 rounded-full bg-cgreen px-2 py-1 text-[10px] font-medium leading-none text-white"
        >
          {{ m.badge }}
        </span>

        <div class="w-full flex flex-col items-center justify-center gap-2" :class="m.badge ? 'pt-5' : ''">
          <img
            v-if="m.img"
            :src="m.img"
            :alt="m.label"
            width="140"
            height="64"
            class="object-contain max-h-8 sm:max-h-11 mx-auto"
            loading="lazy"
            decoding="async"
          />
          <div class="space-y-0.5">
            <div class="text-xs sm:text-sm font-medium leading-tight text-black">{{ m.label }}</div>
            <div v-if="m.description" class="hidden sm:block text-[11px] leading-tight text-black/50">
              {{ m.description }}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
