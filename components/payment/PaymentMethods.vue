<script setup lang="ts">
type PaymentMethodCard = {
  name: string
  logo: string
  description: string
  badge?: string
}

const paymentMethods: PaymentMethodCard[] = [
  { 
    name: 'СБП', 
    logo: '/images/oplata/sbp.png?height=60&width=120',
    description: 'Система быстрых платежей'
  },
  { 
    name: 'QR СБП от Т-Банка', 
    logo: '/images/oplata/tbank.png?height=60&width=120',
    description: 'Оплата по QR от Т-Банка',
    badge: 'Самый удобный'
  },
  { 
    name: 'Банковской картой Т-Банк', 
    logo: '/images/oplata/tbank.png?height=60&width=120',
    description: 'Оплата картой онлайн через Т-Банк'
  },
  { 
    name: 'Банковской картой онлайн', 
    logo: '/images/oplata/bankcard.png?height=60&width=120',
    description: 'Visa, MasterCard, МИР'
  },
  { 
    name: 'Наличными курьеру', 
    logo: '/images/oplata/couriercash.png?height=60&width=120',
    description: 'Только для Москвы'
  },
  { 
    name: 'Банковской картой курьеру', 
    logo: '/images/oplata/couriercard.png?height=60&width=120',
    description: 'Терминал курьера'
  },
  { 
    name: 'Долями', 
    logo: '/images/oplata/dolyame.png?height=60&width=120',
    description: 'Оплата частями от 3 000 ₽'
  },
  { 
    name: 'Т-Банк', 
    logo: '/images/oplata/tbank.png?height=60&width=120',
    description: 'Рассрочка от 30 000 ₽'
  },
]
</script>

<template>
  <section class="w-full py-8">
    <h2 class="text-3xl font-medium mb-6 text-left">
      Способы оплаты
    </h2>
    
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
      <div 
        v-for="method in paymentMethods" 
        :key="method.name"
        class="relative flex flex-col items-center justify-center gap-2 bg-white rounded-2xl p-6 hover:shadow-sm transition-shadow border border-black/10 text-center"
      >
        <span
          v-if="method.badge"
          class="absolute left-3 right-3 top-3 rounded-full bg-cgreen px-2 py-1 text-[10px] font-medium leading-none text-white"
        >
          {{ method.badge }}
        </span>
        <img 
          :src="method.logo" 
          :alt="method.name"
          class="w-full object-contain m-auto"
          :class="method.badge ? 'mt-5' : ''"
          loading="lazy"
        />
        <div class="text-xs font-medium leading-tight text-black">{{ method.name }}</div>
      </div>
    </div>
  </section>
</template>
