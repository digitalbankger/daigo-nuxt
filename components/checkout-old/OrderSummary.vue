<script setup lang="ts">
import { computed } from 'vue'
import type { CartItem } from '~/types/checkout'
const props = defineProps<{
  items: CartItem[]
  discount: number
  deliveryCost: number
}>()

// Вычисляемые значения
const itemsTotal = computed(() => props.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
const itemsCount = computed(() => props.items.reduce((sum, item) => sum + item.quantity, 0))
const discountAmount = computed(() => (itemsTotal.value * props.discount) / 100)
const total = computed(() => itemsTotal.value - discountAmount.value + props.deliveryCost)

function placeOrder() {
  // Здесь должна быть логика отправки заказа на сервер (Go‑backend)
  alert('Заказ оформлен!')
}
</script>

<template>
  <aside class="w-full lg:w-80 lg:sticky lg:top-20 bg-white border rounded-xl p-6 space-y-3">
    <h3 class="text-lg font-semibold mb-4">Детали заказа</h3>
    <div class="flex justify-between text-sm">
      <span>Товаров в корзине</span><span>{{ itemsCount }} шт</span>
    </div>
    <div class="flex justify-between text-sm">
      <span>Стоимость продуктов</span><span>{{ itemsTotal.toLocaleString('ru-RU') }} ₽</span>
    </div>
    <div class="flex justify-between text-sm">
      <span>Доставка</span><span>{{ props.deliveryCost === 0 ? 'Бесплатно' : props.deliveryCost.toLocaleString('ru-RU') + ' ₽' }}</span>
    </div>
    <div class="flex justify-between text-sm text-green-600">
      <span>Скидка</span><span>{{ props.discount }} %</span>
    </div>
    <div class="flex justify-between text-sm text-blue-600">
      <span>Бонусов к начислению</span><span>100</span>
    </div>
    <hr />
    <div class="flex justify-between font-semibold text-lg">
      <span>Итого</span><span>{{ total.toLocaleString('ru-RU') }} ₽</span>
    </div>
    <button
      type="button"
      @click="placeOrder"
      class="w-full mt-4 py-3 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      Оформить заказ
    </button>
  </aside>
</template>
