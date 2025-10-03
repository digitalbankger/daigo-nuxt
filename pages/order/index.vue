<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { defineAsyncComponent } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useCartOrderStore } from '~/stores/cartOrderStore'
import OrderItemsStrip from '@/components/checkout/OrderItemsStrip.vue'

const cart = useCartOrderStore()
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

async function submit() {
  const res = await store.submit()
  if (!res) {
    // ошибка уже в store.lastError — просто остаёмся на странице
    return
  }
  // если пришёл order_id — ведём на спасибо
  if ((res as any).order_id) {
    // return navigateTo(`/thanks?order=${(res as any).order_id}`)
    return navigateTo(`/orders`)
  }
  // иначе на профиль, если без оплаты
  return navigateTo('/profile')
}
</script>

<template>
  <BaseContainer>
    <section class="py-8">

      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg">
        <img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> Вернуться назад
      </NuxtLink>

      <div class="w-full flex items-center justify-between gap-8 mb-6">
        <h1 class="text-[clamp(1.8rem,6vw,4.8rem)] font-medium">Оформление заказа</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div class="lg:col-span-2 space-y-10 md:w-10/12">
          <OrderItemsStrip :items="cart.state.items" />
          <RecipientForm />
          <DeliverySelector />
          <PaymentSelector class="block lg:hidden"/>
        </div>

        <div class="lg:col-span-1">
          <SummaryCard mode="checkout" @cta="submit" class="lg:sticky top-8"/>
          <!-- баннер ошибки, если что-то пошло не так -->
          <div v-if="store.lastError" class="mt-4 rounded-lg text-center border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            <!-- {{ store.lastError }} -->
              Что-то пошло не так, свяжитесь с менеджером магазина
          </div>
        </div>
      </div>
      <PaymentSelector class="hidden lg:block"/>

    </section>
  </BaseContainer>
</template>
