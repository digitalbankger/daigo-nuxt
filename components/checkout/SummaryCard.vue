<script setup lang="ts">
import { computed, ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import Button from '../ui/Button.vue'
import UiInput from '../ui/UiInput.vue'

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

const authLoading = ref(false)
const preOrderLoading = ref(false)

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
  const ok = validateFields()
  if (!ok) {
    await nextTick()
    if (errors.fullName) return inputRefs.fullName.value?.focus()
    if (errors.phone) return inputRefs.phone.value?.focus()
    return
  }
  if (authStore.isAuthenticated) {
    if (preOrderLoading.value) return
    try {
      preOrderLoading.value = true
      await cartStore.preOrder()
      navigateTo('/order')
    } finally { preOrderLoading.value = false }
    return
  }
  try {
    authLoading.value = true
    await authStore.loginOrRegister({
      phone: form.phone,
      name: form.fullName,
      isRegister: false,
      redirectTo: '/order'
    })
  } finally { authLoading.value = false }
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

      <img v-if="authLoading" src="/public/images/steps.png" class="transition"/>
      <p v-if="authLoading" class="text-sm text-black/50">Пуш уведомление может идти до 2 минут.</p>

      <Button
        variant="solid"
        class="w-full hover:bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
        :disabled="!enableCta || authLoading || preOrderLoading"
        @click="handleCta"
      >
        <span v-if="authLoading">Ждём подтверждения…</span>
        <span v-else-if="preOrderLoading">Готовим заказ…</span>
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

      <div class="flex justify-between border-t pt-4 text-[#2B77FF]">
        <span>Бонусов к начислению</span><span class="text-base md:text-lg font-medium">0</span>
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
