<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  items: {
    type: Array as PropType<{
      price: number
      quantity: number
    }[]>,
    required: true
  }
})

const total = computed(() =>
  props.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
)
const discount = computed(() => Math.round(total.value * 0.15))
</script>

<template>
  <div class="bg-white rounded-xl border shadow-productcard p-6 w-full lg:w-[340px]">
    <h3 class="text-xl font-semibold mb-4">Детали заказа</h3>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span>Стоимость продуктов</span>
        <span>{{ total }} ₽</span>
      </div>
      <div class="flex justify-between">
        <span>Доставка</span>
        <span>Бесплатно</span>
      </div>
      <div class="flex justify-between text-pink-500">
        <span>Скидка</span>
        <span>−{{ discount }} ₽</span>
      </div>
      <div class="flex justify-between font-semibold border-t pt-2">
        <span>Итого</span>
        <span>{{ total - discount }} ₽</span>
      </div>
      <div class="text-xs text-gray-500">Бонусов к начислению: 100</div>
    </div>
    <NuxtLink
      to="/checkout"
      class="block mt-6 w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition"
    >
      Перейти к оформлению
    </NuxtLink>
  </div>
</template>
