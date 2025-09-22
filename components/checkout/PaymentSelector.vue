<script setup lang="ts">
import { computed } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import type { PaymentMethod } from '~/stores/checkoutStore'

const store = useCheckoutStore()

// Значения в UI (как у тебя в массиве methods)
type UiValue =
  | 'sbp'
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
}

// Соответствие UI → значениям, которые ждёт стор/бэкенд
const UI_TO_STORE: Record<UiValue, PaymentMethod> = {
  sbp: 'sbp',
  installments: 'dolyame',
  credit: 'tbank',
  card_online: 'bank_card',
  card_courier: 'courier_card',
  cash_courier: 'cash',
}

// Обратное соответствие (для удобной проверки активной карточки)
const STORE_TO_UI: Record<PaymentMethod, UiValue> = {
  sbp: 'sbp',
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
    img: 'https://nuxt.daigo.ru/images/oplata/sbp.png',
    layout: 'logo-only',
  },
  {
    value: 'installments',
    label: 'Долями',
    description: 'Оплата покупок частями',
    img: 'https://nuxt.daigo.ru/images/oplata/dolyame.png',
    layout: 'text',
  },
  {
    value: 'credit',
    label: 'Т-Банк',
    description: 'Рассрочка',
    img: 'https://nuxt.daigo.ru/images/oplata/tbank.png',
    layout: 'text',
  },
  {
    value: 'card_online',
    label: 'Банковская карта',
    description: 'Оплата картой онлайн',
    img: 'https://nuxt.daigo.ru/images/oplata/bankcard.png',
    layout: 'text',
  },
  {
    value: 'card_courier',
    label: 'Картой курьеру',
    description: 'Оплата картой при получении',
    img: 'https://nuxt.daigo.ru/images/oplata/couriercard.png',
    layout: 'text',
  },
  {
    value: 'cash_courier',
    label: 'Наличными курьеру',
    description: 'Оплата наличными',
    img: 'https://nuxt.daigo.ru/images/oplata/couriercash.png',
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
    'rounded-2xl border transition h-[100px] sm:h-[128px] px-4 sm:px-6',
    'bg-white flex items-center justify-center gap-4 text-left',
    active
      ? 'border-primary ring-1 ring-primary ring-offset-0'
      : 'border-black/15 hover:border-primary/60',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-slider font-medium">Способ оплаты</h3>

    <div class="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
        <div class="w-full flex items-center justify-center gap-3">
          <!-- Логотип -->
          <img
            v-if="m.img"
            :src="m.img"
            :alt="m.label"
            width="140"
            height="64"
            class="object-contain max-h-10 sm:max-h-16 mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </button>
    </div>
  </div>
</template>
