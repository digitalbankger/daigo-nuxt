<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import UiInput from '@/components/ui/UiInput.vue'
import Button from '@/components/ui/Button.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import TelegramLoginButton from '@/components/auth/TelegramLoginButton.vue'

const auth = useAuthStore()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')

type LoginMethod = 'phone' | 'telegram'
const loginMethod = ref<LoginMethod>('phone')

const phone = ref('')
const name = ref('')

const isLoading = ref(false)
const agree = ref(false)
const agreeError = ref('')
const errors = reactive<{ name: string; phone: string; code: string }>({
  name: '',
  phone: '',
  code: ''
})

const digits = (v: string) => v.replace(/\D/g, '')
const isPhoneValid = computed(() => digits(phone.value).length >= 11)
const isNameValid = computed(() => mode.value === 'login' || name.value.trim().length >= 2)
const canSubmitPhone = computed(() => isPhoneValid.value && isNameValid.value && agree.value && !isLoading.value)

const codeDigits = ref<string[]>(['', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])

function setInputRef(el: HTMLInputElement | null, idx: number) {
  if (el) inputs.value[idx] = el
}

function focusIndex(i: number) {
  const el = inputs.value[i]
  if (el) el.focus()
}

function handleInput(e: Event, idx: number) {
  const el = e.target as HTMLInputElement
  const v = el.value.replace(/\D/g, '')
  if (!v) {
    codeDigits.value[idx] = ''
    return
  }
  if (v.length > 1) {
    const arr = v.slice(0, 4).split('')
    for (let i = 0; i < 4; i++) codeDigits.value[i] = arr[i] ?? ''
    focusIndex(Math.min(3, arr.length - 1))
    return
  }
  codeDigits.value[idx] = v
  if (idx < 3 && v) focusIndex(idx + 1)
}

function handleKeydown(e: KeyboardEvent, idx: number) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Backspace' && !el.value && idx > 0) {
    codeDigits.value[idx - 1] = ''
    focusIndex(idx - 1)
    e.preventDefault()
  }
  if (e.key === 'ArrowLeft' && idx > 0) {
    focusIndex(idx - 1)
    e.preventDefault()
  }
  if (e.key === 'ArrowRight' && idx < 3) {
    focusIndex(idx + 1)
    e.preventDefault()
  }
}

const codeValue = computed(() => codeDigits.value.join(''))
const canSubmitCode = computed(() => codeValue.value.length === 4 && agree.value && !isLoading.value)

function validateAgree() {
  agreeError.value = agree.value ? '' : 'Нужно согласиться с условиями'
}

function validateName() {
  errors.name = isNameValid.value ? '' : 'Минимум 2 символа'
}
function validatePhone() {
  errors.phone = isPhoneValid.value ? '' : 'Введите телефон полностью'
}
function validateCode() {
  errors.code = canSubmitCode.value ? '' : 'Введите 4 цифры'
}

async function submitPhone() {
  validateName()
  validatePhone()
  validateAgree()
  if (!canSubmitPhone.value) return
  isLoading.value = true
  try {
    await auth.requestCode({ phone: phone.value, name: name.value.trim(), isRegister: mode.value === 'register' })
    setTimeout(() => focusIndex(0), 0)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function submitCode() {
  validateCode()
  validateAgree()
  if (!canSubmitCode.value) return
  isLoading.value = true
  try {
    await auth.confirmCode(codeValue.value)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function changePhone() {
  auth.isCodeSent = false
  codeDigits.value = ['', '', '', '']
  setTimeout(() => {
    const tel = document.querySelector<HTMLInputElement>('input[name="phone"]')
    tel?.focus()
  }, 0)
}

async function resend() {
  await auth.resendCode()
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl lg:text-4xl font-medium">Войти или создать профиль</h1>
    <p class="text-base lg:text-xl">
      После входа вы сможете заказывать товары и отслеживать историю заказов.
    </p>

    <div class="inline-flex rounded-xl bg-gray-100 p-1 w-full">
      <button
        class="flex-1 px-4 py-2 rounded-lg transition"
        :class="loginMethod==='phone' ? 'bg-white shadow font-medium' : 'text-gray-600'"
        type="button"
        @click.prevent="loginMethod='phone'"
      >
        По номеру
      </button>
      <button
        class="flex-1 px-4 py-2 rounded-lg transition"
        :class="loginMethod==='telegram' ? 'bg-white shadow font-medium' : 'text-gray-600'"
        type="button"
        @click.prevent="loginMethod='telegram'"
      >
        Telegram
      </button>
    </div>

    <div v-if="loginMethod === 'phone'">
      <form v-if="!auth.isCodeSent" class="space-y-4" @submit.prevent="submitPhone">
        <div class="inline-flex rounded-xl bg-gray-100 p-1">
          <button
            class="px-4 py-2 rounded-lg transition"
            :class="mode==='login' ? 'bg-white shadow font-medium' : 'text-gray-600'"
            type="button"
            @click.prevent="mode='login'"
          >
            Вход
          </button>
          <button
            class="px-4 py-2 rounded-lg transition"
            :class="mode==='register' ? 'bg-white shadow font-medium' : 'text-gray-600'"
            type="button"
            @click.prevent="mode='register'"
          >
            Регистрация
          </button>
        </div>

        <UiInput
          v-if="mode==='register'"
          v-model="name"
          name="first_name"
          type="text"
          autocomplete="name"
          placeholder="Имя"
          :error="errors.name"
          background="bg-white"
          @blur="validateName"
          @enter="submitPhone"
        />

        <UiInput
          v-model="phone"
          name="phone"
          type="tel"
          inputmode="tel"
          mask="ru-phone"
          autocomplete="tel"
          placeholder="+7 (___) ___-__-__"
          :error="errors.phone"
          background="bg-white"
          @blur="validatePhone"
          @enter="submitPhone"
        />

        <Button :variant="'solid'" class="w-full" :disabled="!canSubmitPhone || isLoading" @click="submitPhone">
          <span v-if="!isLoading">{{ mode === 'login' ? 'Получить код' : 'Зарегистрироваться и получить код' }}</span>
          <span v-else class="inline-flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4" opacity=".25"/>
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" fill="none"/>
            </svg>
            Отправляем код…
          </span>
        </Button>

        <div class="space-y-1">
          <BaseCheckbox v-model="agree" @click="validateAgree">
            <span class="text-xs text-black/50">
              Я согласен(на) с
              <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
              и
              <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
            </span>
          </BaseCheckbox>
          <p v-if="agreeError" class="text-xs text-red-600">{{ agreeError }}</p>
        </div>
      </form>

      <form v-else class="space-y-4" @submit.prevent="submitCode">
        <p class="text-base">Мы отправили код на указанный номер.</p>

        <div class="flex items-center gap-3">
          <input
            v-for="(_, i) in 4"
            :key="i"
            :ref="el => setInputRef(el as HTMLInputElement, i)"
            :value="codeDigits[i]"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="w-14 h-14 text-center text-xl rounded-xl border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
            @input="e => handleInput(e as InputEvent, i)"
            @keydown="e => handleKeydown(e as KeyboardEvent, i)"
          />
        </div>

        <p v-if="errors.code" class="text-sm text-red-600">{{ errors.code }}</p>

        <div class="flex gap-2">
          <Button :variant="'solid'" class="flex-1" type="submit" :disabled="!canSubmitCode || isLoading">
            <span v-if="!isLoading">Подтвердить</span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4" opacity=".25"/>
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" fill="none"/>
              </svg>
              Проверяем…
            </span>
          </Button>
        </div>

        <div class="space-y-1">
          <BaseCheckbox v-model="agree" @click="validateAgree">
            <span class="text-xs text-black/50">
              Я согласен(на) с
              <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
              и
              <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
            </span>
          </BaseCheckbox>
          <p v-if="agreeError" class="text-xs text-red-600">{{ agreeError }}</p>
        </div>

        <div class="text-sm text-gray-600 space-y-1">
          <div>
            <button type="button" class="underline" @click="changePhone">
              Изменить номер
            </button>
          </div>
          <div>
            <button
              type="button"
              class="underline disabled:opacity-50"
              :disabled="auth.resendLeft > 0"
              @click="resend"
            >
              Отправить код повторно<span v-if="auth.resendLeft > 0"> ({{ auth.resendLeft }})</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <div v-else class="space-y-4">
      <div class="flex justify-center">
        <ClientOnly>
          <TelegramLoginButton
            bot-name="daigonotifybot"
            size="medium"
            :radius="12"
            request-access="write"
            :disabled="!agree || isLoading"
          />
        </ClientOnly>
      </div>

      <div class="space-y-1">
        <BaseCheckbox v-model="agree" @click="validateAgree">
          <span class="text-xs text-black/50">
            Я согласен(на) с
            <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
            и
            <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
          </span>
        </BaseCheckbox>
        <p v-if="agreeError" class="text-xs text-red-600">{{ agreeError }}</p>
      </div>
    </div>
  </div>
</template>
