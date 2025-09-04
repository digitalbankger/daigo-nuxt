<script setup lang="ts">
import { computed, ref, reactive, nextTick } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'
import Button from '../ui/Button.vue'
import UiInput from '../ui/UiInput.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()

// Определяем пропы. Карточка может работать в двух режимах:
//  - 'cart' (по умолчанию) — отображается на странице корзины, показывает форму
//    для гостя, промокод и кнопку «Перейти к оформлению».
//  - 'checkout' — используется на странице оформления заказа. В этом режиме
//    форма гостя и промокод скрываются, а кнопка внутри карточки вызывает
//    событие cta (например, «Оформить заказ»).
const props = defineProps<{ mode?: 'cart' | 'checkout' }>()

// Подготавливаем эмиттер. В режиме checkout карточка эмитит событие
// `cta` при клике на кнопку, чтобы родительская страница могла выполнить
// действие (напр. отправить заказ).
const emit = defineEmits(['cta'])

// форма гостя хранится в store
const form = cartStore.userForm

// промокод
const coupon = ref('')

// ошибки
const errors = reactive<{ 
  fullName: string; 
  phone: string; 
  //city: string 
}>({
  fullName: '',
  phone: '',
  //city: '',
})

// ссылки на компоненты инпутов (экспонируют focus())
type Focusable = { focus: () => void } | null
const inputRefs = {
  fullName: ref<Focusable>(null),
  phone: ref<Focusable>(null),
  //city: ref<Focusable>(null),
}

// суммы
const total = computed(() =>
  cartStore.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const discountAmount = computed(() => {
  const promo = cartStore.promoNotice
  if (promo && (promo.type === 'discount' || promo.type === 'code') && promo.discount) {
    return Math.round(total.value * promo.discount / 100)
  }
  return Math.round(total.value * 0.15)
})

const totalWithDiscount = computed(() => total.value - discountAmount.value)
const itemCount = computed(() => cartStore.items.reduce((s, i) => s + i.quantity, 0))

// блокировка CTA (опционально). На странице оформления заказа (mode = checkout)
// кнопку мы всегда отображаем, так как действия (оформить заказ) обрабатываются родителем.
const enableCta = computed(() => {
  if (props.mode === 'checkout') return true
  if (authStore.isAuthenticated) return true
  return Boolean(
    form.fullName.trim() && 
    form.phone.trim() 
    //form.city.trim()
  )
})

async function handleCta() {
  if (!authStore.isAuthenticated) {
    // валидация
    errors.fullName = form.fullName.trim() ? '' : 'Введите ФИО'
    errors.phone    = form.phone.trim() ? '' : 'Введите телефон'
    //errors.city     = form.city.trim() ? '' : 'Введите город'

    if (errors.fullName || errors.phone || errors.city) {
      await nextTick()
      if (errors.fullName) return inputRefs.fullName.value?.focus()
      if (errors.phone)    return inputRefs.phone.value?.focus()
      //if (errors.city)     return inputRefs.city.value?.focus()
      return
    }

    // регистрация гостя
    const { data } = await useFetch('/api/users/create', {
      method: 'POST',
      body: { 
        fullName: form.fullName, 
        phone: form.phone, 
        //city: form.city 
      },
    })
    if (!data.value?.success) {
      alert(data.value?.message || 'Не удалось создать пользователя')
      return
    }
    authStore.setUser({
      id: data.value.userId || null,
      fullName: form.fullName,
      phone: form.phone,
      //city: form.city,
    })
  }
  navigateTo('/order')
}

// Внешний обработчик для кнопки внутри карточки. В режиме checkout
// эмитим событие cta, чтобы родитель мог вызвать submit(). В режиме cart
// вызываем handleCta() и переходим на страницу оформления.
async function onClickCta() {
  if (props.mode === 'checkout') {
    emit('cta')
    return
  }
  await handleCta()
}

async function applyCoupon() {
  if (!coupon.value.trim()) return
  const { data } = await useFetch('/api/cart/apply-coupon', {
    method: 'POST',
    body: { code: coupon.value },
  })
  if (data.value?.success) {
    if (data.value.promo_notice) cartStore.promoNotice = data.value.promo_notice
  } else {
    alert(data.value?.message || 'Промокод недействителен')
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-none md:shadow-productcard p-0 md:p-6 w-full md:w-[416px] flex flex-col gap-4">
    <!-- Форма для гостя. Показываем только в режиме корзины и только если пользователь
         не авторизован. На странице оформления заказа (mode='checkout') эта форма
         находится отдельно, поэтому здесь она скрыта. -->
    <div v-if="props.mode !== 'checkout' && !authStore.isAuthenticated" class="space-y-4">
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

      <Button
        variant="solid"
        class="w-full hover:bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
        @click="onClickCta"
      >
        Перейти к оформлению
      </Button>
    </div>

    <!-- Детали заказа -->
    <div class="space-y-3 md:space-y-4 text-sm md:text-base">
      <h3 class="text-2xl md:text-cardhead font-medium mb-6 md:mb-8 mt-4">Детали заказа</h3>

      <div class="flex justify-between">
        <span>Товаров в корзине</span>
        <span>{{ itemCount }} шт</span>
      </div>

      <div class="flex justify-between">
        <span>Стоимость продуктов</span>
        <span>{{ total.toLocaleString() }} ₽</span>
      </div>

      <div class="flex justify-between">
        <span>Доставка</span>
        <span>Бесплатно</span>
      </div>

      <div class="flex justify-between font-medium text-cgreen">
        <span>Скидка</span>
        <span>{{ cartStore.promoNotice?.discount ?? 15 }}%</span>
      </div>

      <div class="flex justify-between border-t pt-4 text-[#2B77FF]">
        <span>Бонусов к начислению</span>
        <span class="text-base md:text-lg font-medium">100</span>
      </div>

      <div class="flex justify-between font-medium text-xl">
        <span>Итого</span>
        <span>{{ totalWithDiscount.toLocaleString() }} ₽</span>
      </div>
    </div>

    <!-- Промокод. Показывается только в режиме корзины. На странице оформления
         промокод добавляется на предыдущем шаге -->
    <div v-if="props.mode !== 'checkout'" class="flex flex-row space-x-2 md:space-x-3">
      <UiInput
        v-model="coupon"
        name="coupon"
        type="text"
        placeholder="Промокод"
        background="bg-white !border-cgreen"
      >
        <template #right>
          <button
            type="button"
            @click="applyCoupon"
            class="pl-2 text-cgreen hover:text-cgreen/80 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </template>
      </UiInput>
      <Button
        variant="outline"
        class="h-[52px] w-ful !border-cgreen !text-cgreen hover:!bg-cgreen hover:!text-white"
        @click="applyCoupon"
      >
        Применить
      </Button>
    </div>

    <!-- Кнопка оформления заказа в режиме checkout. Она вызывается только если
         props.mode === 'checkout'. На странице корзины эта кнопка выводится
         внутри формы гостя -->
    <div v-if="props.mode === 'checkout'" class="pt-4">
      <Button
        variant="solid"
        class="w-full bg-black text-white py-3 rounded-lg transition"
        @click="onClickCta"
      >
        Оформить заказ
      </Button>
    </div>
  </div>
</template>
