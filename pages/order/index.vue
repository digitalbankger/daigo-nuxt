<script setup lang="ts">
import { defineAsyncComponent, onMounted, watch, ref, onUnmounted, computed } from 'vue'
import { navigateTo } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import Button from '~/components/ui/Button.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import UiIcon from '~/components/ui/UiIcon.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { useCartOrderStore } from '~/stores/cartOrderStore'
import { useYtm } from '@/composables/useYtm'
import { isEvolutionSingleOnlyCart } from '~/utils/evolutionCart'

definePageMeta({ layout: 'main', ssr: false })
useSeoMeta({
  title: 'Оформление заказа — Daigo',
  robots: 'noindex, nofollow',
})

// --- сторы и аналитика ---
const ytm = useYtm()
const cart = useCartOrderStore()
const store = useCheckoutStore()

// грузим данные корзины и опционы чекаута
if (!cart.state.items.length) {
  await cart.loadCart()
}

// Если корзина пуста или в ней осталась только одиночная банка Evolution —
// возвращаемся в корзину. Оформлять такую корзину нельзя по условиям доставки.
if (
  process.client &&
  (!cart.state.items.length || isEvolutionSingleOnlyCart(cart.state.items))
) {
  await navigateTo('/cart')
} else {
  await store.loadOptions()
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
const checkoutConsent = ref(false)
const checkoutConsentError = ref('')
let payTimer: ReturnType<typeof setInterval> | null = null

watch(checkoutConsent, (isChecked) => {
  if (isChecked) checkoutConsentError.value = ''
})

function redirectToPayment(url: string) {
  if (!process.client) return
  // Даём GTM/Метрике/аналитике пару тиков, чтобы успеть обработать ecommerce purchase
  window.setTimeout(() => {
    window.location.href = url
  }, 500)
}

function startPaymentTimer() {
  paySecondsLeft.value = 5

  if (payTimer) {
    clearInterval(payTimer)
    payTimer = null
  }

  // 🔥 моментальная попытка авто-редиректа
  if (paymentUrl.value && process.client) {
    redirectToPayment(paymentUrl.value)
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
    redirectToPayment(paymentUrl.value)
  }
}

onUnmounted(() => {
  if (payTimer) {
    clearInterval(payTimer)
  }
})

// --- отправка заказа ---
async function submit() {
  if (!checkoutConsent.value) {
    checkoutConsentError.value = 'Подтвердите согласие с условиями оформления заказа'
    if (process.client) {
      const consentBlock = Array.from(
        document.querySelectorAll<HTMLElement>('[data-checkout-consent]')
      ).find(element => element.offsetParent !== null)

      consentBlock?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
    return
  }

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

  const orderId = (res as any)?.order_id ? String((res as any).order_id) : null
  if (orderId) {
    createdOrderId.value = orderId
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
    <section class="py-6 lg:py-10">
      <h1 class="sr-only">Оформление заказа</h1>

      <NuxtLink
        to="/cart"
        class="mb-5 inline-flex items-center gap-2 text-base transition-colors hover:text-primary sm:text-lg lg:mb-8"
      >
        <UiIcon name="arrow-left" :size="16" />
        Назад в корзину
      </NuxtLink>

      <div class="mb-8 lg:hidden">
        <SummaryCard mode="checkout" checkout-view="items" />
      </div>

      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,752px)_minmax(0,528px)] lg:gap-8">
        <div class="min-w-0">
          <RecipientForm />
          <DeliverySelector />
          <PaymentSelector />

          <Button
            variant="solid"
            class="mt-8 hidden !h-[54px] w-full !text-lg lg:inline-flex"
            type="button"
            @click="submit"
          >
            Оформить заказ
          </Button>

          <div
            v-if="store.lastError"
            class="mt-4 hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 lg:block"
          >
            <template v-if="isValidationError">
              <div class="mb-1 font-medium">Заполните обязательные поля:</div>
              <ul class="list-disc pl-5 text-sm">
                <li v-for="(x, i) in validationIssues" :key="i">{{ x }}</li>
              </ul>
            </template>
            <template v-else>
              Что-то пошло не так, свяжитесь с менеджером магазина по телефону
              <a
                href="tel:88005552043"
                data-ym="header-phone"
                class="mt-1 inline-flex items-center gap-2 text-black transition duration-300 hover:text-primary"
              >
                8 (800) 555-20-43
              </a>
            </template>
          </div>

          <div class="mt-8 lg:hidden">
            <SummaryCard mode="checkout" checkout-view="summary" />

            <Button
              variant="solid"
              class="mt-5 !h-[54px] w-full !text-base"
              type="button"
              @click="submit"
            >
              Оформить заказ
            </Button>

            <div
              v-if="store.lastError"
              class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              <template v-if="isValidationError">
                <div class="mb-1 font-medium">Заполните обязательные поля:</div>
                <ul class="list-disc pl-5 text-sm">
                  <li v-for="(x, i) in validationIssues" :key="i">{{ x }}</li>
                </ul>
              </template>
              <template v-else>
                Что-то пошло не так, свяжитесь с менеджером магазина по телефону
                <a
                  href="tel:88005552043"
                  data-ym="header-phone"
                  class="mt-1 inline-flex items-center gap-2 text-black transition duration-300 hover:text-primary"
                >
                  8 (800) 555-20-43
                </a>
              </template>
            </div>

            <div
              class="mt-5 space-y-1 border-t border-black/10 pt-5"
              data-checkout-consent
            >
              <BaseCheckbox v-model="checkoutConsent" :error="!!checkoutConsentError">
                <span class="text-xs leading-relaxed text-black/55">
                  Я согласен с
                  <NuxtLink
                    to="/privacy"
                    class="underline hover:text-black"
                    target="_blank"
                    rel="noopener"
                  >
                    политикой конфиденциальности
                  </NuxtLink>
                  и
                  <NuxtLink
                    to="/soglasie-na-obrabotku-personalnykh-dannykh"
                    class="underline hover:text-black"
                    target="_blank"
                    rel="noopener"
                  >
                    обработкой персональных данных
                  </NuxtLink>
                </span>
              </BaseCheckbox>
              <p v-if="checkoutConsentError" class="text-xs text-red-500">
                {{ checkoutConsentError }}
              </p>
            </div>
          </div>
        </div>

        <div class="hidden min-w-0 lg:sticky lg:top-8 lg:block">
          <SummaryCard
            v-model:consent="checkoutConsent"
            mode="checkout"
            :consent-error="checkoutConsentError"
          />
        </div>
      </div>

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
