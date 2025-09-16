<script setup lang="ts">
import { computed, onMounted } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'

const store = useCheckoutStore()

onMounted(async () => {
  if (typeof store.loadOptions === 'function') {
    try { await store.loadOptions() } catch {}
  }
})

/** ФИО в одну строку (first_name + last_name) */
const fullName = computed({
  get: () => {
    const { first_name, last_name } = store.state.recipient
    return [first_name, last_name].filter(Boolean).join(' ').trim()
  },
  set: (val: string) => {
    const parts = val.trim().split(/\s+/)
    store.state.recipient.first_name = parts.shift() || ''
    store.state.recipient.last_name = parts.join(' ') || ''
  }
})

/** Прокси-поля */
const phone = computed({
  get: () => store.state.recipient.phone_number,
  set: (v: string) => (store.state.recipient.phone_number = v)
})
const email = computed({
  get: () => store.state.recipient.email,
  set: (v: string) => (store.state.recipient.email = v)
})
const city = computed({
  get: () => store.state.address.city || '',
  set: (v: string) => store.setAddress({ city: v })
})

/** Другой получатель — храним в store.state */
const otherFullName = computed({
  get: () => store.state.otherRecipientName,
  set: (v: string) => (store.state.otherRecipientName = v)
})
const otherPhone = computed({
  get: () => store.state.otherRecipientPhone,
  set: (v: string) => (store.state.otherRecipientPhone = v)
})
const otherEmail = computed({
  get: () => store.state.otherRecipientEmail,
  set: (v: string) => (store.state.otherRecipientEmail = v)
})
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-slider font-medium">Получатель</h3>

    <!-- Основные данные получателя -->
    <UiInput
      v-model="fullName"
      placeholder="ФИО"
      :error="store.errors.recipient.first_name || store.errors.recipient.last_name"
      background="bg-white"
    />
    <UiInput
      v-model="phone"
      type="tel"
      inputmode="tel"
      mask="ru-phone"
      placeholder="Телефон"
      :error="store.errors.recipient.phone_number"
      background="bg-white"
    />
    <UiInput
      v-model="email"
      type="email"
      placeholder="Email"
      :error="store.errors.recipient.email"
      background="bg-white"
    />
    <UiInput
      v-model="city"
      placeholder="Город"
      :error="store.errors.recipient.city"
      background="bg-white"
    />

    <!-- Переключатель для оформления на другого человека -->
    <div class="pt-4">
      <BaseCheckbox v-model="store.state.orderForAnotherPerson">
        Заказ заберет другой человек
      </BaseCheckbox>
    </div>

    <!-- Форма альтернативного получателя -->
    <div v-if="store.state.orderForAnotherPerson" class="space-y-3">
      <UiInput
        v-model="otherFullName"
        placeholder="ФИО другого получателя"
        :error="store.errors.other.name"
        background="bg-white"
      />
      <UiInput
        v-model="otherPhone"
        type="tel"
        inputmode="tel"
        mask="ru-phone"
        placeholder="Телефон другого получателя"
        :error="store.errors.other.phone"
        background="bg-white"
      />
      <UiInput
        v-model="otherEmail"
        type="email"
        placeholder="Email другого получателя (необязательно)"
        :error="store.errors.other.email"
        background="bg-white"
      />
    </div>
  </div>
</template>
