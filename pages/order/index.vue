<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { defineAsyncComponent } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useHead } from '#imports'
import { useCartOrderStore } from '~/stores/cartOrderStore'
import OrderItemsStrip from '@/components/checkout/OrderItemsStrip.vue'

const cart = useCartOrderStore()
// Загрузить товары для оформления заказа. Если корзина пуста,
// запрашиваем актуальные данные с сервера. Ранее здесь вызывался
// несуществующий метод `loadMock()`, что приводило к ошибке 500.
// Метод `loadCart()` загружает реальные данные корзины через API.
if (!cart.state.items.length) {
  await cart.loadCart()
}

definePageMeta({ layout: 'main' })

const RecipientForm = defineAsyncComponent(() => import('@/components/checkout/RecipientForm.vue'))
const DeliverySelector = defineAsyncComponent(() => import('@/components/checkout/DeliverySelector.vue'))
const PaymentSelector = defineAsyncComponent(() => import('@/components/checkout/PaymentSelector.vue'))
const SummaryCard = defineAsyncComponent(() => import('@/components/checkout/SummaryCard.vue'))

const store = useCheckoutStore()
await store.loadOptions()

useHead({
  title: 'Оформление заказа — Daigo',
  meta: [
    { name: 'description', content: 'Получатель, доставка, оплата, итог — Daigo' },
    { property: 'og:title', content: 'Оформление заказа — Daigo' },
    { property: 'og:description', content: 'Страница оформления заказа на сайте Daigo' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CheckoutPage',
        name: 'Оформление заказа — Daigo',
      })
    }
  ]
})

async function submit() {
  const res = await store.submit()
  navigateTo(`/thanks?order=${res.order_id}`)
}

// function submit() {
//   cart.submitOrder().then(res => navigateTo(`/thanks?order=${res.order_id}`))
// }

</script>

<template>
  <BaseContainer>
    <section class="py-8">
      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg"><img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> Вернуться назад</NuxtLink>

      <div class="w-full flex felx-row items-center justify-between gap-8 mb-6">
        <h1 class="text-[clamp(2.8rem,6vw,4.8rem)] font-medium">Оформление заказа</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-10 md:w-10/12">
          <OrderItemsStrip :items="cart.state.items" />
          <RecipientForm />
          <DeliverySelector />
        </div>

        <div class="lg:col-span-1 md:sticky top-8">
          <!-- В режиме checkout SummaryCard отрисовывает кнопку оформления заказа
               внутри себя и эмитит событие cta. Отдельная кнопка здесь больше не нужна. -->
          <SummaryCard mode="checkout" @cta="submit"/>
        </div>
      </div>
      <PaymentSelector />
    </section>
  </BaseContainer>
</template>
