<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'

const store = useCheckoutStore()

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

function formatBirthDayForInput(value: string): string {
  const raw = String(value || '').trim()
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`
  }

  return maskBirthDayInput(raw)
}

function maskBirthDayInput(value: string): string {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}.${month}`
  return `${day}.${month}.${year}`
}

const birthDay = computed({
  get: () => formatBirthDayForInput(store.state.recipient.birth_day),
  set: (v: string) => (store.state.recipient.birth_day = maskBirthDayInput(v))
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
    <h3 class="text-[clamp(24px,4vw,36px)] font-medium">Получатель</h3>

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

    <UiInput
      id="checkout-birth-day"
      v-model="birthDay"
      type="text"
      inputmode="numeric"
      :maxlength="10"
      placeholder="Дата рождения* — ДД.ММ.ГГГГ"
      name="birth_day"
      required
      :error="store.errors.recipient.birth_day"
      background="bg-white"
      autocomplete="bday"
    >
      <template #right>
        <span class="birth-help">
          <button
            type="button"
            class="birth-help__button"
            aria-label="Зачем указывать дату рождения"
            aria-describedby="checkout-birth-day-help"
          >
            ?
          </button>
          <span
            id="checkout-birth-day-help"
            class="birth-help__tooltip"
            role="tooltip"
          >
            Дата рождения обязательна. Она нужна для индивидуальных предложений и подарков
          </span>
        </span>
      </template>
    </UiInput>

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

<style scoped>
.birth-help {
  position: relative;
  margin-left: 0.5rem;
  display: inline-flex;
  flex: 0 0 auto;
}

.birth-help__button {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(0 0 0 / 28%);
  border-radius: 9999px;
  color: rgb(0 0 0 / 58%);
  font-size: 0.75rem;
  line-height: 1;
}

.birth-help__button:hover,
.birth-help__button:focus-visible {
  border-color: rgb(0 0 0 / 55%);
  color: rgb(0 0 0 / 85%);
  outline: none;
}

.birth-help__tooltip {
  position: absolute;
  z-index: 30;
  right: -0.5rem;
  bottom: calc(100% + 0.625rem);
  width: 16rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  background: #111;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.35;
  box-shadow: 0 10px 30px rgb(0 0 0 / 18%);
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.25rem);
  transition: opacity 150ms ease, transform 150ms ease;
}

.birth-help__tooltip::after {
  position: absolute;
  top: 100%;
  right: 0.75rem;
  width: 0;
  height: 0;
  border: 0.375rem solid transparent;
  border-top-color: #111;
  content: '';
}

.birth-help:hover .birth-help__tooltip,
.birth-help:focus-within .birth-help__tooltip {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 420px) {
  .birth-help__tooltip {
    right: -0.25rem;
    width: min(15rem, calc(100vw - 3rem));
  }
}
</style>
