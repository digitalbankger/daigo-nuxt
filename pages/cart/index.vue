<script setup lang="ts">
import { defineAsyncComponent, watch } from 'vue'
import { useSeoMeta, useHead, navigateTo } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'

import { useCartStore } from '~/stores/cartStore'
import { useCartOrderStore, type CartItem as OrderItem } from '~/stores/cartOrderStore'
import { onMounted } from 'vue'
import { useYtm } from '@/composables/useYtm'
const ytm = useYtm()


definePageMeta({
  layout: 'main',
  ssr: false
})

/* Ленивые компоненты (ускоряет первоначальный рендер) */
const CartItem = defineAsyncComponent(() => import('~/components/cart/CartItem.vue'))
const CartGift = defineAsyncComponent(() => import('~/components/cart/CartGift.vue'))
const OrderSummary = defineAsyncComponent(() => import('~/components/checkout/SummaryCard.vue'))

const cartStore = useCartStore()
const orderStore = useCartOrderStore()

/* Мгновенно триггерим запрос корзины на клиенте, без ожидания mounted */
if (import.meta.client) {
  void cartStore.loadCart()

  onMounted(async () => {
  await cartStore.ensureLoaded?.()
    ytm.viewCart({
      products: cartStore.items.map(i => ({
        id: i.id, name: i.title, price: i.price, quantity: i.quantity, category: i.tag
      })),
      value: cartStore.total ?? cartStore.subtotal ?? 0,
      currency: 'RUB'
    })
  })

}

/* Синхронизация с cartOrderStore */
function syncOrderStore() {
  const items: OrderItem[] = cartStore.items.map(i => ({
    id: String(i.id),
    title: i.title,
    price: i.price,
    qty: i.quantity,
    img: i.image || '',
    tag: i.tag
  }))
  orderStore.state.items = items
}
syncOrderStore()
watch(() => cartStore.items, syncOrderStore, { deep: true })

useSeoMeta({
  title: 'Корзина | Daigo',
  ogTitle: 'Корзина товаров – Оформите заказ в Daigo',
  description: 'Оформите заказ на Daigo – только лучшие товары для здоровья.',
  ogDescription: 'Оформите заказ на Daigo – только лучшие товары для здоровья.',
  ogType: 'website',
  ogUrl: 'https://daigo.ru/cart',
  ogImage: 'https://daigo.ru/og/cart-preview.jpg'
})

useHead({
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ShoppingCart',
      name: 'Корзина | Daigo',
      potentialAction: { '@type': 'CheckoutAction', target: 'https://daigo.ru/order' },
      itemListElement: cartStore.items.map((item: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.title,
          image: item.image,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'RUB',
            price: item.price,
            availability: 'https://schema.org/InStock'
          }
        }
      })),
      totalPrice: cartStore.total ?? 0
    })
  }]
})

function onCartCta() {
  navigateTo('/order')
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <NuxtLink to="/" class="inline-flex gap-2 mb-2 md:mb-4 text-sm md:text-lg">
        <img src="/icons/back.svg" class="w-5 md:w-6" alt="" /> Вернуться назад
      </NuxtLink>

      <h1 class="text-[clamp(2rem,6vw,4rem)] font-medium mb-8 flex items-end gap-4 md:gap-8">
        <span>Корзина</span>
        <span
          v-if="cartStore.items.length"
          class="text-sm md:text-xl font-light mb-2 md:mb-4"
        >
          {{ cartStore.items.length }} {{ cartStore.items.length === 1 ? 'товар' : 'товара' }}
        </span>
      </h1>

      <div class="flex flex-col lg:flex-row gap-10">
        <div class="flex-1 flex flex-col gap-6 lg:w-8/12">
          <div
            v-if="cartStore.promoNotice"
            class="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 text-sm mb-6"
          >
            <div class="flex items-center gap-1 text-white bg-green-500 rounded px-2 py-1 text-xs">
              <span v-if="cartStore.promoNotice && ['discount','code'].includes(cartStore.promoNotice.type || '')">
                -{{ cartStore.promoNotice.discount }}%
              </span>
              <span v-else-if="cartStore.promoNotice?.type === '2+1'">2+1</span>
              <span>На {{ cartStore.promoNotice.productName }}</span>
            </div>
            <span class="text-gray-800">Акция скоро закончится, успейте оформить заказ!</span>
            <div v-if="cartStore.daysLeft" class="flex items-center gap-1 bg-green-500 text-white text-xs rounded px-2 py-1">
              <img src="/icons/fire.svg" class="w-4 h-4" alt="🔥" /> {{ cartStore.daysLeft }} дня
            </div>
          </div>

          <CartItem
            v-for="item in cartStore.items"
            :key="String(item.id)"
            :item="item"
            @update="cartStore.updateItem"
            @remove="cartStore.removeItem"
          />

          <CartGift
            v-for="gift in cartStore.gifts"
            :key="String(gift.id)"
            :gift="gift"
          />
        </div>

        <div class="lg:sticky top-8 w-full lg:w-auto">
          <OrderSummary :mode="'cart'" @cta="onCartCta" />
        </div>
      </div>
    </section>
  </BaseContainer>
</template>
