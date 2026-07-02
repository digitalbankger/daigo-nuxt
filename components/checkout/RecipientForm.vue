<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import CitySuggest from '@/components/checkout/CitySuggest.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'

const store = useCheckoutStore()
const dadataSuggestionsDisabled = computed(() => Boolean((store as any).isApplyingSavedAddress))

onMounted(async () => {
  if (typeof store.loadOptions === 'function') {
    try { await store.loadOptions() } catch {}
  }
})

/** Имя и фамилия по отдельности */
const firstName = computed<string>({
  get: () => store.state.recipient.first_name,
  set: (val: string) => {
    const s = sanitizeName(val)
    store.state.recipient.first_name = s
  }
})

const lastName = computed<string>({
  get: () => store.state.recipient.last_name,
  set: (val: string) => {
    const s = sanitizeName(val)
    store.state.recipient.last_name = s
  }
})

/** Прокси-поля получателя */
const phone = computed({
  get: () => store.state.recipient.phone_number,
  set: (v: string) => (store.state.recipient.phone_number = v)
})
const email = computed({
  get: () => store.state.recipient.email,
  set: (v: string) => (store.state.recipient.email = v)
})

/** Город: текстовое значение и FIAS для дальнейших подсказок адреса */
const city = computed({
  get: () => store.state.address?.city || '',
  set: (v: string) => store.setAddress?.({ city: v })
})

/** Обработчик выбора города из DaData */
type CityItem = {
  value: string
  full: string
  fias_id: string | null
  region: string | null
  city: string | null
  city_with_type: string | null
  geo_lat: number | null
  geo_lon: number | null
  postal_code: string | null
}
function onCitySelect(it: CityItem) {
  // сохраняем максимум полезных полей; если store.setAddress делает merge — всё ок
  store.setAddress?.({
    city: it.value,
    city_fias_id: it.fias_id,
    region: it.region ?? null,
    postal_code: it.postal_code ?? null,
    geo_lat: it.geo_lat ?? null,
    geo_lon: it.geo_lon ?? null
  })
  // при смене города можно сбросить ранее выбранные поля адреса (если они есть в сторе)
  // store.setAddress?.({ street: '', house: '', address_line: '' })
}

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


// === как и было: регулярка для имени ===
const NAME_RE = /[^\p{L}\p{M}\-'\s]/gu
function sanitizeName(input: string): string {
  const cleaned = (input ?? '').replace(NAME_RE, '').replace(/\s+/g, ' ').trim()
  return cleaned
}

// Отдельный стейт для touched флагов
const firstNameTouched = ref(false)
const lastNameTouched  = ref(false)

const firstNameError = computed(() => {
  const raw = (firstName.value || '').trim()
  if (!firstNameTouched.value && !raw) return ''
  if (!raw) return 'Укажите имя'
  return store.errors.recipient.first_name || ''
})

const lastNameError = computed(() => {
  const raw = (lastName.value || '').trim()
  if (!lastNameTouched.value && !raw) return ''
  if (!raw) return 'Укажите фамилию'
  return store.errors.recipient.last_name || ''
})

function onFirstNameBlur() {
  firstNameTouched.value = true
}
function onLastNameBlur() {
  lastNameTouched.value = true
}
watch(() => firstName.value, (v) => {
  if (!firstNameTouched.value && (v?.trim()?.length ?? 0) > 0) {
    firstNameTouched.value = true
  }
})
watch(() => lastName.value, (v) => {
  if (!lastNameTouched.value && (v?.trim()?.length ?? 0) > 0) {
    lastNameTouched.value = true
  }
})

</script>

<template>
  <div class="space-y-4">
    <h3 class="text-slider font-medium">Получатель</h3>

    <!-- Основные данные получателя -->
    <!-- <UiInput
      v-model="fullName"
      placeholder="ФИО"
      :error="store.errors.recipient.first_name || store.errors.recipient.last_name"
      background="bg-white"
      autocomplete="name"
    /> -->

    <!-- Имя и фамилия раздельно -->
    <UiInput
      v-model="firstName"
      placeholder="Имя*"
      :error="firstNameError"
      background="bg-white"
      autocomplete="given-name"
      @blur="onFirstNameBlur"
    />
    <UiInput
      v-model="lastName"
      placeholder="Фамилия*"
      :error="lastNameError"
      background="bg-white"
      autocomplete="family-name"
      @blur="onLastNameBlur"
    />

    <UiInput
      v-model="phone"
      type="tel"
      inputmode="tel"
      mask="ru-phone"
      placeholder="Телефон*"
      :error="store.errors.recipient.phone_number"
      background="bg-white"
      autocomplete="tel"
    />

    <UiInput
      v-model="email"
      type="email"
      placeholder="Email*"
      :error="store.errors.recipient.email"
      background="bg-white"
      autocomplete="email"
    />

    <!-- Город с автоподстановкой DaData -->
    <div>
      <label class="sr-only">Город</label>
      <CitySuggest
        v-model="city"
        @select="onCitySelect"
        :suggestions-disabled="dadataSuggestionsDisabled"
        background="bg-white"
        placeholder="Город*"
      />
      <!-- вывод ошибки из вашего стора (оставил прежний путь) -->
      <p v-if="store.errors.recipient.city" class="mt-1 text-xs text-red-600">
        {{ store.errors.recipient.city }}
      </p>
    </div>

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
        autocomplete="name"
      />
      <UiInput
        v-model="otherPhone"
        type="tel"
        inputmode="tel"
        mask="ru-phone"
        placeholder="Телефон другого получателя"
        :error="store.errors.other.phone"
        background="bg-white"
        autocomplete="tel"
      />
      <UiInput
        v-model="otherEmail"
        type="email"
        placeholder="Email другого получателя (необязательно)"
        :error="store.errors.other.email"
        background="bg-white"
        autocomplete="email"
      />
    </div>
  </div>
</template>
