<script setup lang="ts">
import { useCheckoutStore } from '~/stores/checkoutStore'

const store = useCheckoutStore()

type M = {
  value:
    | 'sbp'
    | 'installments'
    | 'credit'
    | 'card_online'
    | 'card_courier'
    | 'cash_courier'
  label: string
  description?: string
  // путь к логотипу в /public/images/oplata
  img?: string
  // как располагать контент в карточке
  layout?: 'logo-only' | 'text'
}

const methods: M[] = [
  // 1 ряд
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
    label: 'Т‑Банк',
    description: 'Рассрочка',
    img: 'https://nuxt.daigo.ru/images/oplata/tbank.png',
    layout: 'text',
  },
  // 2 ряд
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

function select(v: M['value']) {
  store.state.payment = v as any
}

function cardClass(active: boolean) {
  return [
    'rounded-2xl border transition h-[128px] px-6',
    'bg-white flex items-center justify-center gap-4',
    active
      ? 'border-primary ring-1 ring-primary ring-offset-0'
      : 'border-black/15 hover:border-primary/60',
  ]
}
</script>

<template>
  <div class="mt-12 space-y-4">
    <h3 class="text-slider font-medium">Способ оплаты</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <button
        v-for="m in methods"
        :key="m.value"
        type="button"
        :class="cardClass(store.state.payment === m.value)"
        @click="select(m.value)"
      >
        <!-- Левая часть: логотип -->
        <div class="shrink-0 flex items-center justify-center">
          <!-- NuxtImg даст lazy + правильные размеры; можно и <img> -->
          <NuxtImg
            v-if="m.img"
            :src="m.img"
            :alt="m.label"
            width="140"
            height="64"
            class="object-contain max-h-16 mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>

        
      </button>
    </div>
  </div>
</template>
