<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
// Импортируем компоненты товаров и подарков из поддиректории components/cart.
// Это позволяет проще управлять структурой проекта.
import CartItem from '~/components/cart/CartItem.vue'
import CartGift from '~/components/cart/CartGift.vue'
// Импортируем универсальную карточку итогов заказа. Используем псевдоним
// OrderSummary для совместимости со старыми шаблонами.
import OrderSummary from '~/components/checkout/SummaryCard.vue'

import { useCartStore } from '~/stores/cartStore'
import { useCartOrderStore, type CartItem as OrderItem } from '~/stores/cartOrderStore'
import { onMounted, watch } from 'vue'

definePageMeta({ layout: 'main' })

const cartStore = useCartStore()
const orderStore = useCartOrderStore()

// Загружаем корзину на сервере (для SSR) и на клиенте. В серверном
// рендере await отработает в setup, а в браузере повторим загрузку
// через onMounted для гарантии отображения промо-уведомлений и товаров.
await cartStore.loadCart()
onMounted(() => {
  cartStore.loadCart()
})

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

</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg">
        <img src="/icons/back.svg" class="w-6" /> Вернуться назад
      </NuxtLink>
      <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-medium mb-8 flex items-end gap-8">
        <span>Корзина</span>
        <span v-if="cartStore.items.length" class="text-xl font-light mb-4">{{ cartStore.items.length }} {{ cartStore.items.length === 1 ? 'товар' : 'товара' }}</span>
      </h1>

      <div class="flex flex-col lg:flex-row gap-10">
        <!-- Акция -->

        <!-- Список товаров и подарков -->
        <div class="flex-1 flex flex-col gap-6 md:w-8/12">
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
          <CartItem
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
            @update="cartStore.updateItem"
            @remove="cartStore.removeItem"
          />
          <CartGift
            v-for="gift in cartStore.gifts"
            :key="gift.id"
            :gift="gift"
          />
        </div>

        <!-- Универсальное summary для корзины. Компонент сам занимается
             проверкой формы и переходом к оформлению -->
        <!-- <OrderSummary /> -->
        <div class="md:sticky top-8">
          <OrderSummary
            :mode="'cart'"
            @cta="() => navigateTo('/checkout')"
          />
        </div>
      </div>
    </section>
  </BaseContainer>
</template>
