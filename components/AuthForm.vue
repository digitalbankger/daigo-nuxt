<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import UiInput from '@/components/ui/UiInput.vue'

const auth = useAuthStore()

type Mode = 'login' | 'register'
const mode = ref<Mode>('login')

const phone = ref('')
const name = ref('')

const isLoading = ref(false)
const errors = reactive<{ name: string; phone: string }>({
  name: '',
  phone: '',
})

const digits = (v: string) => v.replace(/\D/g, '')

const isPhoneValid = computed(() => digits(phone.value).length >= 11)
const isNameValid = computed(() => mode.value === 'login' || name.value.trim().length >= 2)
const canSubmit = computed(() => isPhoneValid.value && isNameValid.value && !isLoading.value)

function validateName() {
  errors.name = mode.value === 'register' && !name.value.trim() ? 'Введите имя' : ''
}
function validatePhone() {
  errors.phone = isPhoneValid.value ? '' : 'Введите телефон полностью'
}

const submit = async () => {
  validateName()
  validatePhone()
  if (!canSubmit.value) return

  isLoading.value = true
  try {
    await auth.loginOrRegister({
      phone: phone.value,     // в сторе уже чистим до цифр
      name: name.value.trim(),
      isRegister: mode.value === 'register'
    })
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl lg:text-4xl font-medium">Войти или создать профиль</h1>
    <p class="text-base lg:text-xl">
      После входа вы сможете заказывать товары с бесплатной доставкой и отслеживать историю заказов.
    </p>

    <!-- tabs -->
    <div class="inline-flex rounded-xl bg-gray-100 p-1">
      <button
        class="px-4 py-2 rounded-lg transition"
        :class="mode==='login' ? 'bg-white shadow font-medium' : 'text-gray-600'"
        @click="mode='login'"
      >
        Вход
      </button>
      <button
        class="px-4 py-2 rounded-lg transition"
        :class="mode==='register' ? 'bg-white shadow font-medium' : 'text-gray-600'"
        @click="mode='register'"
      >
        Регистрация
      </button>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <!-- Имя — только для регистрации -->
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
        @enter="submit"
      />

      <!-- Телефон -->
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
        @enter="submit"
      />

      <img v-if="isLoading" src="/public/images/steps.png" class="transition"/>
      <p v-if="isLoading" class="text-sm text-black/50">Пуш уведомление может идти до 2 минут.</p>

      <button
        class="w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-lg font-medium bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="!canSubmit"
        @click.prevent="submit"
      >
        <span v-if="!isLoading">{{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}</span>
        <span v-else class="inline-flex items-center gap-2">
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="4" opacity=".25"/>
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>
          Ждём подтверждения…
        </span>
      </button>

      <p class="text-xs text-gray-500">
        Нажимая кнопку, вы даёте согласие на сбор, обработку и хранение персональных данных.
      </p>
    </form>
  </div>
</template>
