<script setup lang="ts">
const paymentMethods = [
  { 
    name: 'СБП', 
    logo: '/images/oplata/sbp.png?height=60&width=120',
    description: 'Система быстрых платежей'
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
    
    <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-6">
      <div 
        v-for="method in paymentMethods" 
        :key="method.name"
        class="flex flex-col items-center justify-center bg-white rounded-2xl p-6 hover:shadow-sm transition-shadow border border-black/10"
      >
        <img 
          :src="method.logo" 
          :alt="method.name"
          class="w-full object-contain m-auto"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>
