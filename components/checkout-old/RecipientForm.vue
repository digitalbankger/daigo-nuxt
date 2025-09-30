<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { Recipient } from '~/types/checkout'

const props = defineProps<{
  modelValue: Recipient
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: Recipient): void }>()

function updateField(field: keyof Recipient, value: string | boolean) {
  emit('update:modelValue', { ...props.modelValue, [field]: value } as Recipient)
}
</script>

<template>
  <section>
    <h2 class="text-xl font-semibold mb-4">Получатель</h2>
    <div class="space-y-4">
      <input
        type="text"
        v-model="props.modelValue.fullName"
        @input="updateField('fullName', ($event.target as HTMLInputElement).value)"
        placeholder="ФИО"
        class="w-full border rounded px-3 py-2 bg-white"
      />
      <input
        type="tel"
        v-model="props.modelValue.phone"
        @input="updateField('phone', ($event.target as HTMLInputElement).value)"
        placeholder="Телефон"
        class="w-full border rounded px-3 py-2 bg-white"
      />
      <input
        type="email"
        v-model="props.modelValue.email"
        @input="updateField('email', ($event.target as HTMLInputElement).value)"
        placeholder="Email"
        class="w-full border rounded px-3 py-2 bg-white"
      />
      <input
        type="text"
        v-model="props.modelValue.city"
        @input="updateField('city', ($event.target as HTMLInputElement).value)"
        placeholder="Город"
        class="w-full border rounded px-3 py-2 bg-white"
      />
      <label class="inline-flex items-center mt-2">
        <input
          type="checkbox"
          :checked="props.modelValue.anotherPerson"
          @change="updateField('anotherPerson', ($event.target as HTMLInputElement).checked)"
          class="mr-2"
        />
        Заказ заберёт другой человек
      </label>
    </div>
  </section>
</template>
