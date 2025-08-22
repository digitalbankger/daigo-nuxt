<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import CartItem from '~/components/cart/CartItem.vue'
import OrderSummary from '~/components/checkout/SummaryCard.vue'

import { useCartStore } from '~/stores/cartStore'
import { useCartOrderStore, type CartItem as OrderItem } from '~/stores/cartOrderStore'

definePageMeta({ layout: 'main' })

const cartStore = useCartStore()
const orderStore = useCartOrderStore()

await cartStore.loadCart()

// Маппим товары из cartStore -> cartOrderStore
function syncOrderStore() {
  const items: OrderItem[] = cartStore.items.map(i => ({
    id: String(i.id),
    title: i.title,
    price: i.price,          // цена за единицу
    qty: i.quantity,         // кол-во
    img: i.image || '',      // если есть
    tag: i.tag,
  }))
  orderStore.state.items = items
  // при необходимости скидку/бонусы тоже сюда:
  // orderStore.state.discountPercent = cartStore.discountPercent ?? 0
  // orderStore.state.bonusesAccrue = cartStore.bonuses ?? 0
}
syncOrderStore()

// если корзина меняется — синхронизируем ещё раз
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
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ShoppingCart',
      name: 'Корзина | Daigo',
      potentialAction: { '@type': 'CheckoutAction', target: 'https://daigo.ru/checkout' },
      itemListElement: cartStore.items.map((item: any, index: number) => ({
        '@type': 'ListItem', position: index + 1,
        item: { '@type': 'Product', name: item.title, image: item.image, offers: { '@type': 'Offer', priceCurrency: 'RUB', price: item.price, availability: 'https://schema.org/InStock' } }
      })),
      totalPrice: cartStore.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    })
  }]
})

// Клик по CTA из summary
function goToCheckout() {
  navigateTo('/checkout')
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg">
        <img src="/icons/back.svg" class="w-6" /> Вернуться назад
      </NuxtLink>
      <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-medium mb-8">Корзина</h1>

      <div class="flex flex-col lg:flex-row gap-10">
        <!-- Акция -->
        <div
          v-if="cartStore.promoNotice"
          class="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 text-sm mb-6"
        >
          <div class="flex items-center gap-1 text-white bg-green-500 rounded px-2 py-1 text-xs">
            <span v-if="cartStore.promoNotice && ['discount', 'code'].includes(cartStore.promoNotice.type || '')">
              -{{ cartStore.promoNotice.discount }}%
            </span>
            <span v-if="cartStore.promoNotice?.type === '2+1'">2+1</span>
            <span>На {{ cartStore.promoNotice.productName }}</span>
          </div>
          <span class="text-gray-800">Акция скоро закончится, успейте оформить заказ!</span>
          <div v-if="cartStore.daysLeft" class="flex items-center gap-1 bg-green-500 text-white text-xs rounded px-2 py-1">
            <img src="/icons/fire.svg" class="w-4 h-4" alt="🔥" /> {{ cartStore.daysLeft }} дня
          </div>
        </div>

        <!-- Список товаров -->
        <div class="flex-1 flex flex-col gap-6">
          <CartItem
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
            @update="cartStore.updateItem"
            @remove="cartStore.removeItem"
          />
          <CartGift v-for="gift in cartStore.gifts" :key="gift.id" :gift="gift" />
        </div>

        <!-- Универсальное summary для корзины -->
        <OrderSummary mode="cart" @cta="goToCheckout" />
      </div>
    </section>
  </BaseContainer>
</template>
