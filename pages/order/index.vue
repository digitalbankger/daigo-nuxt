<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch, ref, onUnmounted } from 'vue'
import { navigateTo } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useCartOrderStore } from '~/stores/cartOrderStore'
import OrderItemsStrip from '@/components/checkout/OrderItemsStrip.vue'
import { useYtm } from '@/composables/useYtm'

definePageMeta({ layout: 'main' })

// --- сторы и аналитика ---
const ytm = useYtm()
const cart = useCartOrderStore()
const store = useCheckoutStore()

// грузим данные корзины и опционы чекаута
if (!cart.state.items.length) {
  await cart.loadCart()
}
await store.loadOptions()

// begin_checkout — при заходе на страницу
onMounted(() => {
  ytm.beginCheckout({
    step: 1,
    option: 'begin',
    products: cart.state.items.map(i => ({
      id: i.id,
      name: i.title,
      price: i.price,
      quantity: i.qty
    })),
    value: cart.total,
    currency: 'RUB'
  })
})

// шаг 2 — выбор доставки
watch(
  () => store.state.deliveryId,
  (v) => {
    if (!v) return

    ytm.checkoutProgress({
      step: 2,
      option: `delivery:${String(v)}`,
      products: cart.state.items.map(i => ({
        id: i.id,
        name: i.title,
        price: i.price,
        quantity: i.qty
      })),
      value: cart.total,
      currency: 'RUB'
    })
  }
)

// шаг 3 — выбор оплаты
watch(
  () => store.state.paymentMethod,
  (v) => {
    if (!v) return

    ytm.checkoutProgress({
      step: 3,
      option: `payment:${String(v)}`,
      products: cart.state.items.map(i => ({
        id: i.id,
        name: i.title,
        price: i.price,
        quantity: i.qty
      })),
      value: cart.total,
      currency: 'RUB'
    })
  }
)

// --- компоненты ---
const RecipientForm = defineAsyncComponent(() => import('@/components/checkout/RecipientForm.vue'))
const DeliverySelector = defineAsyncComponent(() => import('@/components/checkout/DeliverySelector.vue'))
const PaymentSelector = defineAsyncComponent(() => import('@/components/checkout/PaymentSelector.vue'))
const SummaryCard = defineAsyncComponent(() => import('@/components/checkout/SummaryCard.vue'))

// 🔹 модалка оплаты (ленивая)
const PaymentModal = defineAsyncComponent(
  () => import('@/components/checkout/PaymentModal.vue')
)

// --- состояние модалки оплаты ---
const showPaymentModal = ref(false)
const paymentUrl = ref<string | null>(null)
const paySecondsLeft = ref(5)
let payTimer: ReturnType<typeof setInterval> | null = null

function startPaymentTimer() {
  paySecondsLeft.value = 5

  if (payTimer) {
    clearInterval(payTimer)
    payTimer = null
  }

  payTimer = setInterval(() => {
    if (paySecondsLeft.value <= 1) {
      if (payTimer) {
        clearInterval(payTimer)
        payTimer = null
      }

      // авто-редирект (может быть заблокирован Safari — на это есть кнопка)
      if (paymentUrl.value && process.client) {
        window.location.href = paymentUrl.value
      }
    } else {
      paySecondsLeft.value -= 1
    }
  }, 1000)
}

function closePaymentModal() {
  showPaymentModal.value = false
  if (payTimer) {
    clearInterval(payTimer)
    payTimer = null
  }
}

function goToPayment() {
  if (!paymentUrl.value) return
  if (payTimer) {
    clearInterval(payTimer)
    payTimer = null
  }
  if (process.client) {
    window.location.href = paymentUrl.value
  }
}

onUnmounted(() => {
  if (payTimer) {
    clearInterval(payTimer)
  }
})

// --- отправка заказа ---
async function submit() {
  const res = await store.submit()
  if (!res) return

  // ожидаем, что checkoutStore.submit() вернёт confirmationUrl
  const confirmationUrl =
    (res as any).confirmationUrl ||
    (res as any)?.confirmation?.confirmation_url ||
    null

  if (confirmationUrl) {
    paymentUrl.value = confirmationUrl
    showPaymentModal.value = true
    startPaymentTimer()
    return
  }

  if ((res as any).order_id) {
    return navigateTo('/orders')
  }

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
          <PaymentSelector class="block lg:hidden" />
        </div>

        <div class="lg:col-span-1">
          <SummaryCard mode="checkout" @cta="submit" class="lg:sticky top-8" />
          <div
            v-if="store.lastError"
            class="mt-4 rounded-lg text-center border border-red-200 bg-red-50 text-red-700 px-4 py-3"
          >
            Что-то пошло не так, свяжитесь с менеджером магазина
          </div>
        </div>
      </div>

      <PaymentSelector class="hidden lg:block" />

      <PaymentModal
        :show="showPaymentModal"
        :seconds-left="paySecondsLeft"
        @close="closePaymentModal"
        @pay="goToPayment"
      />
    </section>
  </BaseContainer>
</template>
