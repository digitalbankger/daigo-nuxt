<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import UiInput from '@/components/ui/UiInput.vue'
import Button from '@/components/ui/Button.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'

const auth = useAuthStore()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')

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
// Кнопка должна быть кликабельной даже без галочки — подсветим чекбокс по валидации
const canSubmitPhone = computed(() => isPhoneValid.value && isNameValid.value && !isLoading.value)

// ======= ШАГ 2: 4 квадрата кода =======
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
  // поддержка вставки сразу 4 цифр
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
  if (e.key === 'ArrowLeft' && idx > 0) { focusIndex(idx - 1); e.preventDefault() }
  if (e.key === 'ArrowRight' && idx < 3) { focusIndex(idx + 1); e.preventDefault() }
}

const codeValue = computed(() => codeDigits.value.join(''))
// Аналогично: не блокируем кнопку из-за чекбокса, а подсвечиваем ошибку
const canSubmitCode = computed(() => codeValue.value.length === 4 && !isLoading.value)

function validateAgree() {
  agreeError.value = agree.value ? '' : 'Нужно согласиться с условиями'
}

function validateName() { errors.name = isNameValid.value ? '' : 'Минимум 2 символа' }
function validatePhone() { errors.phone = isPhoneValid.value ? '' : 'Введите телефон полностью' }
function validateCode() { errors.code = canSubmitCode.value ? '' : 'Введите 4 цифры' }

async function submitPhone() {
  validateName()
  validatePhone()
  validateAgree()
  if (!agree.value) return
  if (!canSubmitPhone.value) return
  isLoading.value = true
  try {
    await auth.requestCode({ phone: phone.value, name: name.value.trim(), isRegister: mode.value === 'register' })
    // при переходе на шаг кода сразу фокус на 1-й инпут
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
  if (!agree.value) return
  if (!canSubmitCode.value) return
  isLoading.value = true
  try {
    await auth.confirmCode(codeValue.value /*, опц. redirectTo */)
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

    <!-- Шаг 1: телефон/имя -->
    <form v-if="!auth.isCodeSent" class="space-y-4" @submit.prevent="submitPhone">
      <div class="inline-flex rounded-xl bg-gray-100 p-1">
        <button
          class="px-4 py-2 rounded-lg transition"
          :class="mode==='login' ? 'bg-white shadow font-medium' : 'text-gray-600'"
          @click.prevent="mode='login'"
        >Вход</button>
        <button
          class="px-4 py-2 rounded-lg transition"
          :class="mode==='register' ? 'bg-white shadow font-medium' : 'text-gray-600'"
          @click.prevent="mode='register'"
        >Регистрация</button>
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
        <span v-if="!isLoading">{{ mode === 'login' ? 'Получить код звонком' : 'Зарегистрироваться и получить код звонком' }}</span>
        <span v-else class="inline-flex items-center gap-2">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4" opacity=".25"/>
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>
          Запрашиваем звонок…
        </span>
      </Button>

      <div class="space-y-1">
        <BaseCheckbox v-model="agree" :error="!!agreeError" @click="validateAgree">
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

    <!-- Шаг 2: ввод кода (4 квадрата) -->
    <form v-else class="space-y-4" @submit.prevent="submitCode">
      <p class="text-base">{{ auth.deliveryHint }}</p>

      <div class="flex items-center gap-3">
        <input
          v-for="(_, i) in 4" :key="i"
          :ref="el => setInputRef(el as HTMLInputElement, i)"
          :value="codeDigits[i]"
          @input="e => handleInput(e as InputEvent, i)"
          @keydown="e => handleKeydown(e as KeyboardEvent, i)"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="1"
          class="w-14 h-14 text-center text-xl rounded-xl border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
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
        <BaseCheckbox v-model="agree" :error="!!agreeError" @click="validateAgree">
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
            Получить код по СМС<span v-if="auth.resendLeft > 0"> ({{ auth.resendLeft }})</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
