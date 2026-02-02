<script setup lang="ts">
import { computed, ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { useCheckoutStore } from '~/stores/checkoutStore'
import { bonusService, type BonusCalculateResponse } from '@/services/bonusService'
import Button from '../ui/Button.vue'
import UiInput from '../ui/UiInput.vue'
import { useAnalytics } from '~/composables/useAnalytics'
import { sendGuestPreorderFireAndForget, ensureGuestSessionId } from '@/services/guestPreorder'
import PaymentWarning from './PaymentWarning.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'

const analytics = useAnalytics()
const cartStore = useCartStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const checkoutStore = useCheckoutStore()

const props = defineProps<{ mode?: 'cart' | 'checkout' }>()
const emit = defineEmits(['cta'])

const form = cartStore.userForm

// промокод в поле
const coupon = ref('')

// согласие с документами (обязательно для оформления)
const agreeRequired = ref(false)
const agreeErr = ref('')

// ошибки
const errors = reactive<{ fullName: string; phone: string }>({ fullName: '', phone: '' })

type Focusable = { focus: () => void } | null
const inputRefs = { fullName: ref<Focusable>(null), phone: ref<Focusable>(null) }

// суммы и инфо о купоне из стора
const subtotal = computed(() => cartStore.subtotal)
const grandTotal = computed(() => cartStore.total)
const discountAmount = computed(() => cartStore.discountAmount)
const remarketingDiscountAmount = computed(() => cartStore.remarketingDiscountAmount)
const exhibitionDiscountAmount = computed(() => cartStore.exhibitionDiscountAmount)
const couponInfo = computed(() => cartStore.couponInfo)

// vip скидка
const vipDiscountAmount = computed(() => cartStore.vipDiscountAmount)
const vipDiscountPercent = computed(() => cartStore.vipDiscountPercent)

const itemCount = computed(() => cartStore.items.reduce((s, i) => s + i.quantity, 0))

// === Бонусы ===
// 1) В корзине: начисление 30% от итоговой суммы.
const earnedBonuses = computed(() => Math.floor(Number(grandTotal.value || 0) * 0.5))

const earnedTicket = computed(() => Math.floor(Number(grandTotal.value || 0) / 10000))


// 2) В оформлении заказа: доступные бонусы определяем через /v1/shop/bonus/calculate
const bonusCalc = ref<BonusCalculateResponse | null>(null)
const bonusCalcLoading = ref(false)
const bonusCalcError = ref<string | null>(null)

// Лимит бонусов, который пользователь может списать прямо сейчас.
// Правило:
// - balance = общий баланс бонусов
// - max_bonuses_available = максимум, который можно списать в рамках текущего заказа
// Используем max_bonuses_available только если balance больше этого значения,
// иначе (balance меньше или равен) — лимит равен balance.
const maxBonusesAvailable = computed(() => {
  const balance = Number(bonusCalc.value?.balance ?? 0)
  const max = Number(bonusCalc.value?.max_bonuses_available ?? 0)
  if (!Number.isFinite(balance) || balance <= 0) return 0
  if (!Number.isFinite(max) || max <= 0) return 0
  return balance > max ? max : balance
})

const bonusToSpend = ref('')

// применённые бонусы (влияют только на UI и payload заказа)
const appliedBonuses = ref(0)

const bonusToSpendNumber = computed(() => {
  const raw = String(bonusToSpend.value || '').replace(/[^0-9]/g, '')
  const n = Number(raw || 0)
  return Math.max(0, Math.min(maxBonusesAvailable.value, n))
})

watch(bonusToSpendNumber, (n) => {
  // нормализуем ввод (без лишних символов, не больше доступных)
  if (bonusToSpend.value === '') return
  const normalized = String(n)
  if (bonusToSpend.value !== normalized) bonusToSpend.value = normalized
})

function applyBonuses() {
  const n = Number(bonusToSpendNumber.value || 0)
  appliedBonuses.value = n
  // прокидываем в checkout payload
  if (props.mode === 'checkout') {
    ;(checkoutStore.state as any).bonuses_to_use = n
  }
}

// если пользователь вручную уменьшил ввод ниже уже применённого —
// не меняем итог до нажатия "Использовать" (предсказуемое поведение)

// итоговая сумма с учётом списанных бонусов (1 бонус = 1 рубль)
const finalTotal = computed(() => {
  if (props.mode !== 'checkout') return Number(grandTotal.value || 0)
  return Math.max(0, Number(grandTotal.value || 0) - Number(appliedBonuses.value || 0))
})

// Сумма корзины для расчёта лимитов по списанию бонусов
const cartTotalForBonusCalc = computed(() => Number(grandTotal.value || 0))

async function refreshBonusCalc() {
  if (props.mode !== 'checkout') return

  const total = Math.max(0, Math.floor(cartTotalForBonusCalc.value || 0))
  bonusCalcLoading.value = true
  bonusCalcError.value = null
  try {
    bonusCalc.value = await bonusService.calculate(total)
  } catch (e: any) {
    // не блокируем оформление заказа, просто фиксируем лимит как 0
    bonusCalc.value = { balance: 0, max_bonuses_available: 0, max_total_discount_percent: 0, currency: '' }
    bonusCalcError.value = e?.message || 'Не удалось получить бонусы'
  } finally {
    bonusCalcLoading.value = false
  }
}

// при заходе на чек-аут и при изменении итоговой суммы — пересчитываем лимит
watch(cartTotalForBonusCalc, () => {
  // debounce на случай серии быстрых обновлений
  if (props.mode !== 'checkout') return
  refreshBonusCalc()
}, { immediate: true })

// если уже применённые бонусы оказались выше лимита — автоматически ограничиваем
watch(maxBonusesAvailable, (max) => {
  const lim = Number(max || 0)
  if (appliedBonuses.value > lim) {
    appliedBonuses.value = lim
    bonusToSpend.value = String(lim)
    if (props.mode === 'checkout') {
      ;(checkoutStore.state as any).bonuses_to_use = lim
    }
  }
})

const phoneDigits = computed(() => String(form.phone || '').replace(/\D/g, ''))

const enableCta = computed(() => {
  if (props.mode === 'checkout') return true
  return Boolean(form.fullName.trim() && phoneDigits.value.length === 11)
})

// ограничение: в корзине поле "Имя" — одно слово
watch(
  () => form.fullName,
  (v) => {
    if (props.mode === 'checkout') return
    const cleaned = String(v || '').replace(/\s+/g, ' ').trim()
    const first = cleaned.split(' ')[0] || ''
    if (cleaned !== first) form.fullName = first
  }
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
  agreeErr.value = agreeRequired.value ? '' : 'Нужно принять условия'
  if (!agreeRequired.value) return
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
  errors.fullName = form.fullName.trim() ? '' : 'Введите имя'
  errors.phone = phoneDigits.value.length === 11 ? '' : 'Введите номер'
  return !(errors.fullName || errors.phone)
}

async function handleCta() {
  if (props.mode === 'checkout') { emit('cta'); return }

  agreeErr.value = agreeRequired.value ? '' : 'Нужно принять условия'
  if (!agreeRequired.value) {
    return
  }

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

  // ⛔ В гостевом режиме промокоды недоступны — предлагаем авторизацию
  if (!authStore.isAuthenticated) {
    authStore.openAuth('/cart')
    return
  }

  try {
    await cartStore.applyCoupon(code)
    // поле само обновится из watch(couponInfo)
  } catch (e: any) {
    alert(e?.message || 'Промокод недействителен')
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
          placeholder="Имя"
          type="text"
          :maxlength="120"
          :error="errors.fullName"
          background="bg-white"
          @blur="errors.fullName = form.fullName.trim() ? '' : 'Введите имя'"
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
          @blur="errors.phone = phoneDigits.length === 11 ? '' : 'Введите номер'"
        />
      </div>

      <!-- согласие (обязательно) -->
      <div class="space-y-1">
        <BaseCheckbox v-model="agreeRequired">
          <span class="text-xs text-black/50">
            Я принимаю
            <a href="/privacy" class="underline">политику конфиденциальности</a>
            и
            <a href="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">согласие на обработку персональных данных</a>
          </span>
        </BaseCheckbox>
        <p v-if="agreeErr" class="text-red-600 text-xs">{{ agreeErr }}</p>
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
          class="w-full hover:bg-hoverbtn hover:text-black  !text-sm md:!text-base text-white py-3 rounded-lg transition"
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
        class="w-full hover:!bg-hoverbtn hover:text-black  !text-sm md:!text-base text-white py-3 rounded-lg transition"
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

      <!-- 🆕 детализация скидок -->
      <div
        v-if="vipDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>VIP-скидка</span>
        <span>
          −{{ vipDiscountAmount.toLocaleString() }} ₽
          <template v-if="vipDiscountPercent != null">
            ({{ vipDiscountPercent }}%)
          </template>
        </span>
      </div>

      <div
        v-if="remarketingDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>Персональная скидка</span>
        <span>−{{ remarketingDiscountAmount.toLocaleString() }} ₽</span>
      </div>

      <div
        v-if="exhibitionDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>Скидка участника выставки</span>
        <span>−{{ exhibitionDiscountAmount.toLocaleString() }} ₽</span>
      </div>
      <!-- конец новых строк -->
      <!-- 
      <div
        class="flex justify-between font-medium text-red-500"
      >
        <span>Начислим бонусов</span>
        <span>+ {{ earnedBonuses }}</span>
      </div> -->
      
      <!-- <div
        class="flex justify-between font-medium text-red-500"
      >
        <span>Новогодний конкурс</span>
        <span>+ {{ earnedTicket }} билетов</span>
      </div> -->

      <div class="flex justify-between font-medium text-xl">
        <span>Итого</span><span>{{ finalTotal.toLocaleString() }} ₽</span>
      </div>
    </div>

    <!-- 🆕 списание бонусов (только на оформлении заказа) -->
    <div v-if="props.mode === 'checkout'" class="space-y-3">
      <div class="flex justify-between text-sm md:text-base">
        <span class="text-black/70">Бонусы доступны для списания</span>
        <span class="font-medium">{{ maxBonusesAvailable }}</span>
      </div>

      <UiInput
        v-model="bonusToSpend"
        name="bonuses"
        type="text"
        inputmode="numeric"
        placeholder="Списать бонусы"
        background="bg-white"
      >
        <template #right>
          <button
            type="button"
            class="ml-2 text-white bg-cgreen rounded-md p-3 hover:opacity-80 transition -me-3"
            @click="applyBonuses"
          >
            Использовать
          </button>
        </template>
      </UiInput>

      <div class="text-xs text-black/50">
        Можно списать до {{ maxBonusesAvailable }} бонусов.
      </div>
    </div>

    <!-- Промокод — только в корзине -->
    <div v-if="props.mode === 'checkout'" class="flex flex-row gap-2 md:gap-3 items-start">
      <UiInput
        v-model="coupon"
        name="coupon"
        type="text"
        placeholder="Промокод"
        background="bg-white !border-cgreen !text-cgreen focus:outline-none"
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

    <PaymentWarning v-if="props.mode === 'checkout'"/>

    <!-- Кнопка в режиме checkout -->
    <div v-if="props.mode === 'checkout'" class="pt-2">
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
