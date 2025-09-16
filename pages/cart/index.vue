<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import CartItem from '~/components/cart/CartItem.vue'
import CartGift from '~/components/cart/CartGift.vue'
import OrderSummary from '~/components/checkout/SummaryCard.vue'

import { useCartStore } from '~/stores/cartStore'
import { useCartOrderStore, type CartItem as OrderItem } from '~/stores/cartOrderStore'
import { onMounted, watch } from 'vue'

definePageMeta({ layout: 'main' })

const cartStore = useCartStore()
const orderStore = useCartOrderStore()

// Подтягиваем корзину на клиенте (SSR тоже ок — но на клиенте дублируем для верности)
onMounted(() => {
  cartStore.loadCart()
})

// Синхронизация с cartOrderStore (если используется далее по цепочке)
function syncOrderStore() {
  const items: OrderItem[] = cartStore.items.map(i => ({
    id: String(i.id),           // сохраняем строковый UUID или число как строку
    title: i.title,
    price: i.price,             // цена за единицу
    qty: i.quantity,            // кол-во
    img: i.image || '',
    tag: i.tag,
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

// JSON-LD — берём значения из стора (итоги не считаем на клиенте)
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

// Обработчик CTA из SummaryCard в режиме корзины
function onCartCta() {
  // Если авторизован — сразу на страницу оформления
  // Если нет — SummaryCard сам валидирует форму и вызывает cartStore.preOrder(),
  // а дальнейший редирект после успешной авторизации вы можете сделать в своём auth-потоке.
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
        <!-- Список товаров и подарков -->
        <div class="flex-1 flex flex-col gap-6 lg:w-8/12">
          <!-- Промо-уведомление -->
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

        <!-- Итоги -->
        <div class="lg:sticky top-8 w-full lg:w-auto">
          <OrderSummary
            :mode="'cart'"
            @cta="onCartCta"
          />
        </div>
      </div>
    </section>
  </BaseContainer>
</template>
