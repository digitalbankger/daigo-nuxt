<script setup lang="ts">
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import { computed, reactive } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'

const store = useCheckoutStore()

// Связываем ФИО в одну строку. Разбиваем и сохраняем в first_name/last_name.
const fullName = computed({
  get: () => {
    const { first_name, last_name } = store.state.recipient
    return [first_name, last_name].filter(Boolean).join(' ').trim()
  },
  set: (val: string) => {
    const parts = val.trim().split(/\s+/)
    store.state.recipient.first_name = parts.shift() || ''
    store.state.recipient.last_name = parts.join(' ') || ''
  },
})

// Прокси для телефона, email и города
const phone = computed({
  get: () => store.state.recipient.phone_number,
  set: (v: string) => (store.state.recipient.phone_number = v),
})
const email = computed({
  get: () => store.state.recipient.email,
  set: (v: string) => (store.state.recipient.email = v),
})
// Город хранится в address. Связываем его через computed.
const city = computed({
  get: () => store.state.address.city,
  set: (v: string) => store.setAddress({ city: v }),
})

// Данные альтернативного получателя (если заказ забирает другой человек). Эти поля
// хранятся локально и не сохраняются в checkoutStore, но могут быть отправлены
// вместе с заказом, если нужно.
const altRecipient = reactive({
  fullName: '',
  phone: '',
  email: '',
  errors: {
    fullName: '',
    phone: '',
    email: '',
  },
})
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-slider font-medium">Получатель</h3>
    <!-- Основные данные получателя -->
    <UiInput
      v-model="fullName"
      placeholder="ФИО"
      :error="''"
      background="bg-white"
    />
    <UiInput
      v-model="phone"
      type="tel"
      inputmode="tel"
      mask="ru-phone"
      placeholder="Телефон"
      :error="''"
      background="bg-white"
    />
    <UiInput
      v-model="email"
      type="email"
      placeholder="Email"
      :error="''"
      background="bg-white"
    />
    <UiInput
      v-model="city"
      placeholder="Город"
      :error="''"
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
        v-model="altRecipient.fullName"
        placeholder="ФИО"
        :error="altRecipient.errors.fullName"
        background="bg-white"
      />
      <UiInput
        v-model="altRecipient.phone"
        type="tel"
        inputmode="tel"
        mask="ru-phone"
        placeholder="Телефон"
        :error="altRecipient.errors.phone"
        background="bg-white"
      />
      <UiInput
        v-model="altRecipient.email"
        type="email"
        placeholder="Email"
        :error="altRecipient.errors.email"
        background="bg-white"
      />
    </div>
  </div>
</template>
