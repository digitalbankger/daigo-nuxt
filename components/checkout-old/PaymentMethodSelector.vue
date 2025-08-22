<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { PaymentMethod } from '~/types/checkout'

const props = defineProps<{ modelValue: PaymentMethod }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: PaymentMethod): void }>()

const methods = [
  { value: 'sbp', label: 'СБП', icon: '/icons/sbp.svg', description: 'Оплата через СБП' },
  { value: 'installment', label: 'Оплата частями', icon: '/icons/installment.svg', description: 'Оплата покупок частями' },
  { value: 'tbank', label: 'Т‑банк', icon: '/icons/tbank.svg', description: 'Рассрочка' },
  { value: 'card', label: 'Банковская карта', icon: '/icons/card.svg', description: 'Оплата картой онлайн' },
  { value: 'courier_card', label: 'Картой курьеру', icon: '/icons/courier_card.svg', description: 'Оплата картой при получении' },
  { value: 'cash', label: 'Наличными курьеру', icon: '/icons/cash.svg', description: 'Оплата наличными' },
]

function select(value: PaymentMethod) {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="mt-8">
    <h2 class="text-xl font-semibold mb-4">Способ оплаты</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="m in methods"
        :key="m.value"
        type="button"
        @click="select(m.value)"
        :class="[
          'flex flex-col items-center justify-center p-4 border rounded-lg text-center transition',
          props.modelValue === m.value ? 'ring-2 ring-blue-600' : 'hover:bg-gray-50'
        ]"
      >
        <NuxtImg :src="m.icon" :alt="m.label" class="h-10 mb-2" loading="lazy" />
        <span class="font-medium">{{ m.label }}</span>
        <span class="text-xs text-gray-500 mt-1">{{ m.description }}</span>
      </button>
    </div>
  </section>
</template>
