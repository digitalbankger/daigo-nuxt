<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import type { PaymentMethod } from '~/stores/checkoutStore'

const store = useCheckoutStore()

type UiValue =
  | 'sbp'
  | 'tpay_qr'
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
  tpay_qr: 'tpay_qr',
  tpay_card: 'tpay_card',
  installments: 'dolyame',
  credit: 'tbank',
  card_online: 'bank_card',
  card_courier: 'courier_card',
  cash_courier: 'cash',
}

const STORE_TO_UI: Record<PaymentMethod, UiValue> = {
  sbp: 'sbp',
  tpay_qr: 'tpay_qr',
  tpay_card: 'tpay_card',
  dolyame: 'installments',
  tbank: 'credit',
  bank_card: 'card_online',
  courier_card: 'card_courier',
  cash: 'cash_courier',
}

const defaultPaymentUiValue: UiValue = 'tpay_qr'

const methods: MethodCard[] = [
  {
    value: 'tpay_qr',
    label: 'QR СБП Т-Банк',
    description: 'Оплата по QR от Т-Банка',
    img: './images/oplata/t-sbp.png',
    layout: 'text',
    badge: 'Самый удобный',
  },
  {
    value: 'tpay_card',
    label: 'Картой Т-Банк',
    description: 'Банковской картой онлайн',
    img: './images/oplata/t-bank-card.png',
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
  const curr = store.state.paymentMethod
  return STORE_TO_UI[curr] ?? defaultPaymentUiValue
})

onMounted(() => {
  if (!store.state.paymentMethod || store.state.paymentMethod === 'sbp') {
    store.state.paymentMethod = UI_TO_STORE[defaultPaymentUiValue]
  }
})

function select(v: UiValue) {
  store.state.paymentMethod = UI_TO_STORE[v]
}

function isActive(v: UiValue) {
  return activeUiValue.value === v
}

function isTpayQr(v: UiValue) {
  return v === 'tpay_qr'
}

function cardClass(method: MethodCard) {
  const active = isActive(method.value)
  const tpayQr = isTpayQr(method.value)

  return [
    'relative overflow-hidden rounded-2xl border transition',
    'text-center',

    // mobile: одна строка на всю ширину
    // desktop: старая карточка
    'min-h-[64px] sm:min-h-[136px] px-4 sm:px-4 py-3',
    'flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2',

    // tpay_qr на мобильном жёлтый, на desktop как раньше белый
    tpayQr
      ? 'bg-[#ffde25] sm:bg-white'
      : 'bg-white',

    // активность без нижней линии
    active && tpayQr
      ? 'border-transparent shadow-[0_0_0_3px_rgba(194,92,0,0.34),0_8px_22px_rgba(122,60,0,0.24)] sm:border-primary sm:ring-1 sm:ring-primary sm:shadow-none'
      : active
        ? 'border-primary ring-1 ring-primary ring-offset-0'
        : 'border-black/15 hover:border-primary/60',
  ]
}

function imageClass(method: MethodCard) {
  return [
    'object-contain max-h-12 sm:max-h-11 mx-auto sm:w-auto',

    // Т-Банк СБП: было 80%, делаем +20% = 96%
    method.value === 'tpay_qr'
      ? 'w-[96%]'

      // Долями: было 80%, делаем на 40% меньше = 48%
      : method.value === 'installments'
        ? 'w-[48%]'
        : 'w-[80%]',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-slider font-medium">Способ оплаты</h3>

    <div class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
      <button
        v-for="m in methods"
        :key="m.value"
        type="button"
        :class="cardClass(m)"
        role="radio"
        :aria-checked="isActive(m.value)"
        @click="select(m.value)"
        @keyup.enter.space="select(m.value)"
      >
        <span
          v-if="m.badge"
          class="absolute left-4 top-2 sm:left-2 sm:right-2 sm:top-2 rounded-full bg-cgreen px-2 py-1 text-[10px] font-medium leading-none text-white"
        >
          {{ m.badge }}
        </span>

        <div class="w-full flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-2">
          <img
            v-if="m.img"
            :src="m.img"
            :alt="m.label"
            width="140"
            height="64"
            :class="imageClass(m)"
            loading="lazy"
            decoding="async"
          >

          <div class="hidden sm:block space-y-0.5 text-center">
            <div class="text-xs sm:text-sm font-medium leading-tight text-black">
              {{ m.label }}
            </div>

            <div v-if="m.description" class="text-[11px] leading-tight text-black/50">
              {{ m.description }}
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>