<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRequestURL, useSeoMeta, useHead } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useOrderStore } from '@/stores/orderStore'
import { statusLabel } from '@/composables/useOrderStatus'
import { useAnalytics } from '~/composables/useAnalytics'
import { useYtm } from '~/composables/useYtm'

definePageMeta({ layout: 'main', ssr: false })

type ReceiptItem = {
  id: string
  name: string
  price: number
  quantity: number
  image?: string | null
}

type OrderReceipt = {
  orderId: string
  createdAt?: string
  total: number
  currency?: string
  items: ReceiptItem[]
}

const route = useRoute()
const orderId = computed(() => String(route.params.id || ''))

const title = computed(() => `Спасибо за заказ №${orderId.value}`)
const description = 'Подтверждение оформления заказа в Daigo.'

const reqUrl = useRequestURL()
const canonical = computed(() => new URL(`/thanks/${orderId.value}`, reqUrl.origin).toString())

useSeoMeta({
  title: title.value,
  description,
  ogTitle: title.value,
  ogDescription: description,
  ogType: 'website',
  ogImage: '/og-image/thanks.jpg',
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonical.value }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CheckoutPage',
        name: title.value,
        description,
        url: canonical.value,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Daigo'
        }
      })
    }
  ]
}))

const store = useOrderStore()

const receipt = ref<OrderReceipt | null>(null)
const orderFromHistory = ref<any | null>(null)
const isLoading = ref(false)

function fmtPrice(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

const displayItems = computed<ReceiptItem[]>(() => {
  if (receipt.value?.items?.length) return receipt.value.items
  const items = orderFromHistory.value?.items
  if (!Array.isArray(items)) return []
  return items.map((it: any) => ({
    id: String(it.id ?? ''),
    name: String(it.name ?? 'Товар'),
    price: Number(it.price ?? 0),
    quantity: Number(it.quantity ?? 1),
    image: it.image ?? null
  }))
})

const total = computed(() => {
  if (receipt.value) return Number(receipt.value.total ?? 0)
  const t = orderFromHistory.value?.total ?? orderFromHistory.value?.total_amount
  return Number(t ?? 0)
})

const status = computed(() => {
  const s = orderFromHistory.value?.status
  return s ? statusLabel(s) : 'В обработке'
})

const confirmationUrl = computed(() => {
  return (
    orderFromHistory.value?.confirmationUrl ||
    orderFromHistory.value?.confirmation_url ||
    null
  )
})

function tryLoadReceiptFromSession() {
  if (!process.client) return
  try {
    const raw = sessionStorage.getItem(`order_receipt_${orderId.value}`)
    if (!raw) return
    const parsed = JSON.parse(raw) as OrderReceipt
    if (parsed?.orderId === orderId.value) receipt.value = parsed
  } catch {
    // ignore
  }
}

/**
 * ✅ Обычная JS-цель Метрики: thank_page
 * ✅ Без указания counterId (его берёт useAnalytics() из runtimeConfig.public.ymCounterId)
 * ✅ Антидубль: один раз на orderId
 */
function sendThankPageGoalOnce() {
  if (!process.client) return

  const id = orderId.value
  if (!id) return

  const key = `goal_thank_page_sent_${id}`
  try {
    if (localStorage.getItem(key) === '1') return
  } catch {
    // ignore
  }

  try {
    const analytics = useAnalytics()
    analytics.reach('thank_page', { order_id: id })
    localStorage.setItem(key, '1')
  } catch {
    // ignore
  }
}

function ensurePurchaseGoalOnce() {
  // В проекте уже есть дедуп в checkoutStore: purchase_sent_{orderId}.
  // Здесь делаем страховку: если по какой-то причине не улетело на этапе submit,
  // отправим на странице спасибо — но строго один раз на этот orderId.
  if (!process.client) return

  const sentKey = `purchase_sent_${orderId.value}`
  try {
    if (localStorage.getItem(sentKey)) return
  } catch {
    // ignore
  }

  const products = displayItems.value
    .filter(i => i?.id)
    .map(i => ({
      id: String(i.id),
      name: i.name,
      price: Number(i.price ?? 0),
      quantity: Number(i.quantity ?? 1)
    }))

  const revenue = Number.isFinite(total.value) ? total.value : 0

  const analytics = useAnalytics()
  const ytm = useYtm()

  try {
    analytics.purchase({
      id: orderId.value,
      revenue,
      currency: 'RUB',
      products
    })

    ytm.purchase({
      currency: 'RUB',
      id: orderId.value,
      revenue,
      shipping: 0,
      items: products,
      tax: 0
    })

    localStorage.setItem(sentKey, '1')
  } catch {
    // ignore
  }
}

async function loadOrder() {
  isLoading.value = true
  try {
    // 1) пытаемся взять из sessionStorage (быстро)
    tryLoadReceiptFromSession()

    // 2) подтягиваем историю заказов и ищем нужный
    if (!store.orders?.length) {
      await store.loadOrderHistory()
    }

    const found = store.orders.find((o: any) => {
      const id = o.order_id ?? o.id ?? o.number
      return String(id).replace(/^0+/, '') === String(orderId.value).replace(/^0+/, '')
    })

    if (found) orderFromHistory.value = found

    // 3) страховка отправки purchase один раз на orderId
    ensurePurchaseGoalOnce()

    // 4) ✅ JS цель thank_page один раз на orderId
    sendThankPageGoalOnce()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { loadOrder() })
</script>

<template>
  <BaseContainer>
    <section class="py-8">
      <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6 text-lg">
        <img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> На главную
      </NuxtLink>

      <div class="flex flex-col gap-4">
        <h1 class="text-[clamp(2.0rem,6vw,3.8rem)] font-medium">
          Спасибо! Заказ оформлен
        </h1>

        <div class="text-lg text-gray-700">
          Номер заказа: <span class="font-medium">№ {{ orderId }}</span>
        </div>

        <div class="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white">
          <span class="text-gray-600">Статус:</span>
          <span class="text-primary font-medium">{{ status }}</span>
        </div>

        <div v-if="isLoading" class="text-gray-500">Загружаем детали заказа…</div>

        <div v-else class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div class="lg:col-span-2">
            <div v-if="displayItems.length" class="space-y-4">
              <h2 class="text-2xl font-medium">Состав заказа</h2>

              <div class="space-y-3">
                <div
                  v-for="it in displayItems"
                  :key="it.id + '_' + it.name"
                  class="flex gap-4 items-center border-b border-gray-200 py-4"
                >
                  <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      v-if="it.image"
                      :src="it.image"
                      :alt="it.name"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div v-else class="w-full h-full" />
                  </div>

                  <div class="flex-1">
                    <div class="font-medium">{{ it.name }}</div>
                    <div class="text-sm text-gray-600">Кол-во: {{ it.quantity }}</div>
                  </div>

                  <div class="text-right">
                    <div class="font-medium">{{ fmtPrice(it.price) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-gray-500">
              Детали заказа пока недоступны. Вы можете посмотреть историю заказов в профиле.
            </div>
          </div>

          <aside class="lg:col-span-1">
            <div class="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 lg:sticky top-8">
              <div class="text-xl font-medium">Итого</div>
              <div class="text-3xl font-medium">{{ fmtPrice(total) }}</div>

              <a
                v-if="confirmationUrl"
                :href="confirmationUrl"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition"
              >
                Перейти к оплате
              </a>

              <NuxtLink
                to="/orders"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
              >
                Мои заказы
              </NuxtLink>

              <NuxtLink
                to="/profile"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
              >
                Профиль
              </NuxtLink>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </BaseContainer>
</template>
