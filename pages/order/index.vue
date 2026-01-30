<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch, ref, onUnmounted, computed } from 'vue'
import { navigateTo } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useCartOrderStore } from '~/stores/cartOrderStore'
import OrderItemsStrip from '@/components/checkout/OrderItemsStrip.vue'
import { useYtm } from '@/composables/useYtm'

definePageMeta({ layout: 'main', ssr: false })

// --- сторы и аналитика ---
const ytm = useYtm()
const cart = useCartOrderStore()
const store = useCheckoutStore()

// грузим данные корзины и опционы чекаута
if (!cart.state.items.length) {
  await cart.loadCart()
}
await store.loadOptions()

// best practice: если корзина пуста — нечего оформлять
if (process.client && !cart.state.items.length) {
  await navigateTo('/cart')
}


// begin_checkout — при заходе на страницу
onMounted(() => {
  const products = cart.state.items.map(i => ({
    id: i.id,
    name: i.title,
    price: i.price,
    quantity: i.qty,
    category: i.tag ? [i.tag] : undefined,
    url: `/catalog/${i.id}`,
    image_url: i.img || undefined
  }))

  ytm.beginCheckout({
    step: 1,
    option: 'checkout_phone_validate',
    products,
    value: cart.total,
    currency: 'RUB'
  })
})


// шаг 2 — выбор доставки
watch(() => store.state.deliveryId, (v) => {
  if (!v) return
  ytm.checkoutProgress({
    step: 2,
    option: `delivery:${String(v)}`
  })
})

// шаг 3 — выбор оплаты
watch(() => store.state.paymentMethod, (v) => {
  if (!v) return
  ytm.checkoutProgress({
    step: 3,
    option: `payment:${String(v)}`
  })
})

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
const createdOrderId = ref<string | null>(null)
const paySecondsLeft = ref(5)
let payTimer: ReturnType<typeof setInterval> | null = null

function startPaymentTimer() {
  paySecondsLeft.value = 5

  if (payTimer) {
    clearInterval(payTimer)
    payTimer = null
  }

  // 🔥 моментальная попытка авто-редиректа
  if (paymentUrl.value && process.client) {
    window.location.href = paymentUrl.value
  }

  // таймер только для отображения секунд
  payTimer = setInterval(() => {
    paySecondsLeft.value -= 1

    if (paySecondsLeft.value <= 0) {
      clearInterval(payTimer!)
      payTimer = null
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
  if (!res) {
    // Если ошибка из-за незаполненных/некорректных полей — скроллим к первому проблемному полю
    if (process.client) {
      const hasFieldErrors = Object.values(store.errors.recipient).some(Boolean)
        || Object.values(store.errors.address).some(Boolean)
        || Object.values(store.errors.other).some(Boolean)
        || Boolean(store.errors.payment)

      if (hasFieldErrors) {
        const el = document.querySelector('[aria-invalid="true"]') as HTMLElement | null
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          ;(el as any).focus?.()
        }
      }
    }
    return
  }

  // ожидаем, что checkoutStore.submit() вернёт order_id и (опционально) confirmationUrl
  const orderId = (res as any)?.order_id ? String((res as any).order_id) : null
  if (orderId) {
    createdOrderId.value = orderId
    // сохраняем «квитанцию» для страницы спасибо (на случай, если история заказов ещё не подтянулась)
    if (process.client) {
      try {
        const receipt = {
          orderId,
          createdAt: new Date().toISOString(),
          total: cart.total,
          currency: 'RUB',
          items: cart.state.items.map(i => ({
            id: String(i.id),
            name: i.title,
            price: Number(i.price ?? 0),
            quantity: Number((i as any).qty ?? (i as any).quantity ?? 1),
            image: i.img || null
          }))
        }
        sessionStorage.setItem(`order_receipt_${orderId}`, JSON.stringify(receipt))
      } catch {
        // ignore
      }
    }
  }

  // confirmationUrl — если нужна внешняя оплата
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

  // если заказ создан без внешней оплаты — ведём на страницу спасибо
  if (orderId) {
    return navigateTo(`/thanks/${orderId}`)
  }

  return navigateTo('/profile')
}

const validationIssues = computed(() => {
  const list: string[] = []
  const r = store.errors.recipient
  const a = store.errors.address
  const o = store.errors.other

  if (r.first_name) list.push('Имя')
  if (r.last_name) list.push('Фамилия')
  if (r.phone_number) list.push('Телефон')
  if (r.email) list.push('Email')
  if (r.city) list.push('Город')

  if (a.street) list.push('Улица')
  if (a.house) list.push('Дом')
  if (a.pvzAddress || a.pickupAddress) list.push('Адрес получения')

  if (o.name) list.push('ФИО другого получателя')
  if (o.phone) list.push('Телефон другого получателя')
  if (o.email) list.push('Email другого получателя')

  if (store.errors.payment) list.push('Способ оплаты')

  // уникализируем
  return Array.from(new Set(list))
})

const isValidationError = computed(() => validationIssues.value.length > 0)
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
            class="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3"
          >
            <template v-if="isValidationError">
              <div class="font-medium mb-1">Заполните обязательные поля:</div>
              <ul class="list-disc pl-5 text-sm">
                <li v-for="(x, i) in validationIssues" :key="i">{{ x }}</li>
              </ul>
            </template>
            <template v-else>
              Что-то пошло не так, свяжитесь с менеджером магазина
            </template>
          </div>
        </div>
      </div>

      <PaymentSelector class="hidden lg:block" />

      <PaymentModal
        :show="showPaymentModal"
        :seconds-left="paySecondsLeft"
        :order-id="createdOrderId"
        :overlay-closable="false"
        @close="closePaymentModal"
        @pay="goToPayment"
      />

    </section>
  </BaseContainer>
</template>
