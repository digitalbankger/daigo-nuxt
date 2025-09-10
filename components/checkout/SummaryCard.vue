<script setup lang="ts">
import { computed, ref, reactive, nextTick } from 'vue'
import { useCartStore } from '~/stores/cartStore'
import { useAuthStore } from '~/stores/authStore'
import Button from '../ui/Button.vue'
import UiInput from '../ui/UiInput.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()

// Режим отображения: 'cart' (по умолчанию) или 'checkout'
const props = defineProps<{ mode?: 'cart' | 'checkout' }>()
// Для режима checkout эмитим событие cta (например, для submit заказа)
const emit = defineEmits(['cta'])

// Форма гостя хранится в cartStore
const form = cartStore.userForm

// Промокод
const coupon = ref('')

// Ошибки валидации формы
const errors = reactive<{ fullName: string; phone: string }>({
  fullName: '',
  phone: '',
})

// Ссылки на инпуты, чтобы фокусировать при ошибке
type Focusable = { focus: () => void } | null
const inputRefs = {
  fullName: ref<Focusable>(null),
  phone: ref<Focusable>(null),
}

// Сумма товаров
const total = computed(() =>
  cartStore.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// Скидка (из promoNotice, иначе 15%)
const discountAmount = computed(() => {
  const promo = cartStore.promoNotice
  if (promo && (promo.type === 'discount' || promo.type === 'code') && promo.discount) {
    return Math.round(total.value * promo.discount / 100)
  }
  return Math.round(total.value * 0.15)
})

// Итоговая сумма
const totalWithDiscount = computed(() => total.value - discountAmount.value)
// Количество единиц товаров
const itemCount = computed(() => cartStore.items.reduce((s, i) => s + i.quantity, 0))

// Разрешить нажатие CTA: в checkout всегда, иначе если авторизован или форма гостя заполнена
const enableCta = computed(() => {
  if (props.mode === 'checkout') return true
  if (authStore.isAuthenticated) return true
  return Boolean(form.fullName.trim() && form.phone.trim())
})

/**
 * Проверяем форму гостя и вызываем preOrder() в cartStore.
 * После успешного предварительного оформления для авторизованного
 * пользователя переходим на /order. Для гостя бэкенд отправит SMS,
 * поэтому редирект осуществляется после успешного входа.
 */
async function handleCta() {
  if (!authStore.isAuthenticated) {
    // Проверяем поля формы гостя
    errors.fullName = form.fullName.trim() ? '' : 'Введите ФИО'
    errors.phone    = form.phone.trim()    ? '' : 'Введите телефон'

    if (errors.fullName || errors.phone) {
      await nextTick()
      if (errors.fullName) return inputRefs.fullName.value?.focus()
      if (errors.phone)    return inputRefs.phone.value?.focus()
      return
    }
  }
  try {
    // Отправляем предварительный заказ (определяет режим самостоятельно)
    await cartStore.preOrder()
    // Для авторизованного сразу переходим на страницу оформления
    if (authStore.isAuthenticated) {
      navigateTo('/order')
    } else {
      // Для гостя: ждём подтверждения SMS, а редирект делаем в authStore после входа.
    }
  } catch (e) {
    alert('Не удалось оформить заказ')
  }
}

// Обработчик клика по кнопке. В режиме checkout эмитит событие cta.
async function onClickCta() {
  if (props.mode === 'checkout') {
    emit('cta')
    return
  }
  await handleCta()
}

// Применить промокод через cartStore
async function applyCoupon() {
  if (!coupon.value.trim()) return
  try {
    await cartStore.applyCoupon(coupon.value)
    coupon.value = ''
  } catch (e) {
    alert('Промокод недействителен')
  }
}
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-none md:shadow-productcard p-0 md:p-6 w-full md:w-[416px] flex flex-col gap-4"
  >
    <!-- Форма гостя (только в режиме корзины и если пользователь не авторизован) -->
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
        :disabled="!enableCta"
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
        <span>{{ cartStore.promoNotice?.discount ?? 0 }}%</span>
      </div>

      <div class="flex justify-between border-t pt-4 text-[#2B77FF]">
        <span>Бонусов к начислению</span>
        <span class="text-base md:text-lg font-medium">0</span>
      </div>

      <div class="flex justify-between font-medium text-xl">
        <span>Итого</span>
        <span>{{ totalWithDiscount.toLocaleString() }} ₽</span>
      </div>
    </div>

    <!-- Промокод (виден только в режиме корзины) -->
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

    <!-- Кнопка оформления заказа в режиме checkout -->
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
