<script setup lang="ts">
import { computed, ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import Button from '../ui/Button.vue'
import UiInput from '../ui/UiInput.vue'
import { useAnalytics } from '~/composables/useAnalytics'
import { sendGuestPreorderFireAndForget, ensureGuestSessionId } from '@/services/guestPreorder'

const analytics = useAnalytics()
const cartStore = useCartStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const props = defineProps<{ mode?: 'cart' | 'checkout' }>()
const emit = defineEmits(['cta'])

const form = cartStore.userForm

// промокод в поле
const coupon = ref('')

// ошибки
const errors = reactive<{ fullName: string; phone: string }>({ fullName: '', phone: '' })

type Focusable = { focus: () => void } | null
const inputRefs = { fullName: ref<Focusable>(null), phone: ref<Focusable>(null) }

// суммы и инфо о купоне из стора
const subtotal = computed(() => cartStore.subtotal)
const grandTotal = computed(() => cartStore.total)
const discountAmount = computed(() => cartStore.discountAmount)
const couponInfo = computed(() => cartStore.couponInfo)

const itemCount = computed(() => cartStore.items.reduce((s, i) => s + i.quantity, 0))

const enableCta = computed(() =>
  props.mode === 'checkout' ? true : Boolean(form.fullName.trim() && form.phone.trim())
)

// === авторизация: новый инлайн-этап кода в корзине ===
const authLoading = ref(false)          // оставляем для совместимости, но не используем «пуш-ожидание»
const preOrderLoading = ref(false)
const isCodeStep = ref(false)           // показывать ли блок ввода кода в корзине

// 4 квадрата кода
const codeDigits = ref<string[]>(['', '', '', ''])
const codeInputs = ref<HTMLInputElement[]>([])
function setCodeRef(el: HTMLInputElement | null, i: number) { if (el) codeInputs.value[i] = el }
function focusCode(i: number) { const el = codeInputs.value[i]; if (el) el.focus() }
const codeValue = computed(() => codeDigits.value.join(''))
const canSubmitCode = computed(() => codeValue.value.length === 4)
const digits = (s: string) => s.replace(/\D/g, '')

function onCodeInput(e: Event, i: number) {
  const el = e.target as HTMLInputElement
  const v = digits(el.value)
  if (!v) { codeDigits.value[i] = ''; return }
  // поддержка вставки сразу "1234"
  if (v.length > 1) {
    const arr = v.slice(0, 4).split('')
    for (let k = 0; k < 4; k++) codeDigits.value[k] = arr[k] ?? ''
    focusCode(Math.min(3, arr.length - 1))
    return
  }
  codeDigits.value[i] = v
  if (i < 3) focusCode(i + 1)
}
function onCodeKeydown(e: KeyboardEvent, i: number) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Backspace' && !el.value && i > 0) {
    codeDigits.value[i - 1] = ''
    focusCode(i - 1)
    e.preventDefault()
  }
  if (e.key === 'ArrowLeft' && i > 0) { focusCode(i - 1); e.preventDefault() }
  if (e.key === 'ArrowRight' && i < 3) { focusCode(i + 1); e.preventDefault() }
}

function resetCode() {
  codeDigits.value = ['', '', '', '']
  authStore.isCodeSent = false
  isCodeStep.value = false
}

// отправка кода и верификация
async function startCodeFlowIfNeeded() {
  // запускаем отправку кода только если ещё не стартовали
  if (!authStore.isCodeSent) {
    await authStore.requestCode({ phone: form.phone, name: form.fullName, isRegister: false })
  }
  isCodeStep.value = true
  setTimeout(() => focusCode(0), 0)
}

async function verifyAndContinue() {
  if (!canSubmitCode.value) return
  await authStore.confirmCode(codeValue.value)
  // после успешной верификации продолжаем прежний флоу: preOrder -> /order
  await proceedPreOrderAndGo()
}

// ===== старый флоу под капотом: preOrder → navigate ====
async function proceedPreOrderAndGo() {
  if (preOrderLoading.value) return
  try {
    preOrderLoading.value = true
    await cartStore.preOrder()
    navigateTo('/order')
  } finally {
    preOrderLoading.value = false
  }
}

async function prefillFromProfile() {
  if (!authStore.isAuthenticated) return
  try {
    if (!userStore.profile) await userStore.loadProfile()
    const p = userStore.profile
    if (!p) return
    const fio = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || form.fullName
    const phone = p.phone_number || form.phone
    if (!form.fullName) form.fullName = fio
    if (!form.phone) form.phone = phone
  } catch (e) { /* no-op */ }
}
onMounted(prefillFromProfile)
watch(() => authStore.isAuthenticated, (v) => v && prefillFromProfile())

// показываем код из ответа бэка в поле
watch(couponInfo, (ci) => {
  coupon.value = ci?.code || ''
}, { immediate: true })

function validateFields() {
  errors.fullName = form.fullName.trim() ? '' : 'Введите ФИО'
  errors.phone = form.phone.trim() ? '' : 'Введите телефон'
  return !(errors.fullName || errors.phone)
}

async function handleCta() {
  if (props.mode === 'checkout') { emit('cta'); return }

  analytics?.reach?.('lead_cart')

  const ok = validateFields()
  if (!ok) {
    await nextTick()
    if (errors.fullName) return inputRefs.fullName.value?.focus()
    if (errors.phone) return inputRefs.phone.value?.focus()
    return
  }

  if (authStore.isAuthenticated) {
    await proceedPreOrderAndGo()
    return
  }

  // Гостевой лид — как раньше (fire and forget)
  try {
    const sessionId = ensureGuestSessionId()
    sendGuestPreorderFireAndForget({
      sessionId,
      fullName: form.fullName,
      phone: form.phone
    })
  } catch { /* игнорим */ }

  // Теперь вместо "пуш-ожидания" показываем инлайн код и подтверждаем
  await startCodeFlowIfNeeded()
}

async function applyCoupon() {
  const code = coupon.value.trim()
  if (!code || couponInfo.value?.applied) return
  try {
    await cartStore.applyCoupon(code)
    // поле само обновится из watch(couponInfo)
  } catch {
    alert('Промокод недействителен')
  }
}

// оставляем хэндлер удаления на будущее (кнопку закомментируем в шаблоне)
async function removeCoupon() {
  try {
    await cartStore.removeCoupon()
    coupon.value = ''
  } catch {
    alert('Не удалось удалить промокод')
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-none md:shadow-productcard p-0 md:p-6 w-full md:w-[416px] flex flex-col gap-4">
    <!-- Блок полей (как было) -->
    <div v-if="props.mode !== 'checkout'" class="space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <UiInput
          ref="inputRefs.fullName"
          v-model="form.fullName"
          name="full_name"
          autocomplete="name"
          placeholder="ФИО"
          type="text"
          :maxlength="120"
          :error="errors.fullName"
          background="bg-white"
          @blur="errors.fullName = form.fullName.trim() ? '' : 'Введите ФИО'"
        />
        <UiInput
          ref="inputRefs.phone"
          v-model="form.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          mask="ru-phone"
          autocomplete="tel"
          placeholder="+7 (___) ___-__-__"
          :error="errors.phone"
          background="bg-white"
          @blur="errors.phone = form.phone.trim() ? '' : 'Введите телефон'"
        />
      </div>

      <!-- БЫЛО: "ждём подтверждения пуша" — УБРАНО. -->
      <!-- НОВОЕ: инлайн-ввод кода авторизации -->
      <div v-if="isCodeStep && !authStore.isAuthenticated" class="space-y-3">
        <div class="text-sm text-black/60">
          Мы отправили код на указанный номер.
        </div>
        <div class="flex items-center gap-3">
          <input
            v-for="(_, i) in 4"
            :key="i"
            :ref="el => setCodeRef(el, i)"
            :value="codeDigits[i]"
            @input="e => onCodeInput(e, i)"
            @keydown="e => onCodeKeydown(e as KeyboardEvent, i)"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="w-14 h-14 text-center text-xl rounded-xl border border-gray-300
                   focus:outline-none focus:ring-0 focus:border-black"
          />
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <div>
            <button type="button" class="underline" @click="resetCode">Изменить номер</button>
          </div>
          <div>
            <button
              type="button"
              class="underline disabled:opacity-50"
              :disabled="authStore.resendLeft > 0"
              @click="authStore.resendCode"
            >
              Отправить код повторно<span v-if="authStore.resendLeft > 0"> ({{ authStore.resendLeft }})</span>
            </button>
          </div>
        </div>
        <Button
          variant="solid"
          class="w-full hover:bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
          :disabled="!canSubmitCode || preOrderLoading"
          @click="verifyAndContinue"
        >
          <span v-if="preOrderLoading">Готовим заказ…</span>
          <span v-else>Подтвердить</span>
        </Button>
      </div>

      <!-- CTA как раньше -->
      <Button
        v-else
        variant="solid"
        class="w-full hover:bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
        :disabled="!enableCta || preOrderLoading"
        @click="handleCta"
      >
        <span v-if="preOrderLoading">Готовим заказ…</span>
        <span v-else>Перейти к оформлению</span>
      </Button>
    </div>

    <!-- Детали заказа -->
    <div class="space-y-3 md:space-y-4 text-sm md:text-base">
      <h3 class="text-2xl md:text-cardhead font-medium mb-6 md:mb-8 mt-4">Детали заказа</h3>

      <div class="flex justify-between"><span>Товаров в корзине</span><span>{{ itemCount }} шт</span></div>
      <div class="flex justify-between"><span>Стоимость продуктов</span><span>{{ subtotal.toLocaleString() }} ₽</span></div>
      <div class="flex justify-between"><span>Доставка</span><span>Бесплатно</span></div>

      <div class="flex justify-between font-medium text-cgreen">
        <span>Скидка</span>
        <span>
          <template v-if="couponInfo?.applied">
            −{{ discountAmount.toLocaleString() }} ₽
            <span v-if="typeof couponInfo?.discount_percent === 'number'">
              ({{ couponInfo!.discount_percent }}%)
            </span>
          </template>
          <template v-else>0 ₽</template>
        </span>
      </div>

      <div class="flex justify-between font-medium text-xl">
        <span>Итого</span><span>{{ grandTotal.toLocaleString() }} ₽</span>
      </div>
    </div>

    <!-- Промокод — только в корзине -->
    <div v-if="props.mode !== 'checkout'" class="flex flex-row gap-2 md:gap-3 items-start">
      <UiInput
        v-model="coupon"
        name="coupon"
        type="text"
        placeholder="Промокод"
        background="bg-white !border-cgreen !text-cgreen"
      >
        <template #right>
          <button
            type="button"
            class="pl-2 transition"
            :class="couponInfo?.applied ? 'text-gray-300 cursor-not-allowed' : 'text-cgreen hover:text-cgreen/80'"
            :disabled="!!couponInfo?.applied"
            @click="applyCoupon"
            aria-label="Применить промокод"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <!--
          <button
            v-if="couponInfo?.applied"
            type="button"
            @click="removeCoupon"
            class="pl-2 text-red-500 hover:text-red-600 transition"
            aria-label="Удалить промокод"
            title="Удалить промокод"
          >
            ✕
          </button>
          -->
        </template>
      </UiInput>

      <Button
        variant="outline"
        class="h-[52px] w-full !border-cgreen"
        :class="couponInfo?.applied ? '!text-gray-300 cursor-not-allowed hover:bg-transparent' : '!text-cgreen hover:!bg-cgreen hover:!text-white'"
        :disabled="!!couponInfo?.applied || !coupon.trim()"
        @click="applyCoupon"
      >
        Применить
      </Button>
    </div>

    <!-- Кнопка в режиме checkout -->
    <div v-if="props.mode === 'checkout'" class="pt-4">
      <Button variant="solid" class="w-full bg-black text-white py-3 rounded-lg transition" @click="handleCta">
        Оформить заказ
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* страховочный сброс аутлайна для некоторых браузеров */
input:focus { outline: none !important; box-shadow: none !important; }
</style>
