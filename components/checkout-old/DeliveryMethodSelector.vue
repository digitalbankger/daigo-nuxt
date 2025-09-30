<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { DeliveryMethod } from '~/types/checkout'

const props = defineProps<{ modelValue: DeliveryMethod }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: DeliveryMethod): void }>()

const options: { label: string; value: DeliveryMethod }[] = [
  { label: 'Курьером', value: 'courier' },
  { label: 'ПВЗ', value: 'pickup_point' },
  { label: 'Самовывоз', value: 'self_pickup' },
]

function select(value: DeliveryMethod) {
  emit('update:modelValue', value)
}
</script>

<template>
  <section class="mt-8">
    <h2 class="text-xl font-semibold mb-4">Способ доставки</h2>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'px-4 py-2 border rounded-md',
          option.value === props.modelValue ? 'bg-blue-600 text-white' : 'bg-white'
        ]"
        @click="select(option.value)"
        type="button"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
