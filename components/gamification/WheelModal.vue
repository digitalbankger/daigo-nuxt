<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiInput from '@/components/ui/UiInput.vue'
import Button from '@/components/ui/Button.vue'
import { useRouter } from '#imports' 

const router = useRouter()

const props = defineProps<{
  show: boolean
  mode: 'phone' | 'ready' | 'result'
  isChecking: boolean
  isSpinning: boolean
  alreadySpun: boolean
  error?: string | null

  prizeName?: string | null
  prizeDescription?: string | null
  couponCode?: string | null
  productId?: number | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-phone', phone: string): void
  (e: 'spin'): void
}>()


const phone = ref('')

const digits = (v: string) => v.replace(/\D/g, '')
const isPhoneValid = computed(() => digits(phone.value).length >= 11)

watch(
  () => props.show,
  (val) => {
    if (val && props.mode === 'phone') {
      phone.value = ''
    }
  }
)

function submitPhone() {
  if (!isPhoneValid.value || props.isChecking) return
  emit('submit-phone', phone.value)
}

const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

async function copyCoupon() {
  if (!props.couponCode) return
  try {
    await navigator.clipboard.writeText(props.couponCode)
    copyStatus.value = 'success'
    setTimeout(() => (copyStatus.value = 'idle'), 1500)
  } catch (e) {
    console.error(e)
    copyStatus.value = 'error'
    setTimeout(() => (copyStatus.value = 'idle'), 1500)
  }
}

async function copyCouponAndGo() {
  if (!props.couponCode) return

  try {
    await navigator.clipboard.writeText(props.couponCode)
    emit('close')                // закрываем модалку
    router.push('/catalog')      // переходим в каталог
  } catch (e) {
    console.error(e)
    copyStatus.value = 'error'
    setTimeout(() => (copyStatus.value = 'idle'), 1500)
  }
}

</script>

<template>
  <UiModal modalClass="!bg-[#242325] !rounded-2xl" :show="show" @close="emit('close')">
    <img src="/icons/popup-element.svg" class="absolute z-0 right-0 top-0" />
    <img src="/icons/close-red.svg" @click="emit('close')" class="absolute z-20 right-4 top-4 cursor-pointer" />
    <div class="flex flex-col gap-5 max-w-[420px] relative z-10">
      <!-- Шаг 1: Ввод телефона -->
      <template v-if="mode === 'phone'">
        <h2 class="text-2xl sm:text-3xl font-medium text-white">Испытать удачу</h2>
        <p class="text-sm sm:text-base text-white">
          Введите номер телефона, чтобы мы могли закрепить ваш приз.
          Один пользователь может крутить колесо только один раз.
        </p>

        <UiInput
          v-model="phone"
          type="tel"
          mask="ru-phone"
          :error="error || (!isPhoneValid && phone ? 'Введите номер полностью' : '')"
          placeholder="+7 (___) ___-__-__"
        />

        <Button
          variant="solid"
          class="w-full !bg-transparent !border !border-white hover:!bg-white"
          :disabled="!isPhoneValid || isChecking"
          @click="submitPhone"
        >
          <span v-if="!isChecking">Продолжить</span>
          <span v-else>Отправляем…</span>
        </Button>
      </template>

      <!-- Шаг 2: Готов к спину -->
      <template v-else-if="mode === 'ready'">
        <h2 class="text-2xl sm:text-3xl font-semibold text-white">Готово! Крутим колесо</h2>
        <p class="text-sm sm:text-base text-white">
          Теперь нажмите кнопку ниже — колесо начнёт вращаться.
        </p>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <Button
          variant="solid"
          class="w-full !bg-transparent !border !border-white hover:!bg-white"
          :disabled="isSpinning"
          @click="emit('spin')"
        >
          <span v-if="!isSpinning">Испытать удачу</span>
          <span v-else>Запускаем колесо…</span>
        </Button>
      </template>

      <!-- РЕЗУЛЬТАТ СПИНА -->
      <div v-else-if="mode === 'result'" class="space-y-4">
        <!-- Если есть ошибка — показываем экран ошибки -->
        <template v-if="error">
          <h2 class="text-2xl sm:text-3xl font-medium text-white">
            Внимание
          </h2>
          <p class="text-sm sm:text-base text-white/80">
            {{ error }}
            <br></br>Активные промокоды и призы можно найти в личном кабинете после авторизации
          </p>

          <Button
            variant="solid"
            class="w-full !bg-white !text-black hover:!bg-gray-100"
            @click="emit('close')"
          >
            Закрыть
          </Button>
        </template>

        <!-- Если ошибки нет — показываем реальный приз -->
        <template v-else>
          <!-- 1) заголовок приза -->
          <div class="space-y-1">
            <p class="text-2xl font-medium text-white">
              {{ prizeName || 'Ваш приз' }}
            </p>
          </div>

          <!-- 2) описание приза -->
          <p v-if="prizeDescription" class="text-sm text-white/80">
            {{ prizeDescription }}
          </p>

          <!-- 3а) если есть купон -->
          <div v-if="couponCode" class="space-y-3">
            <div
              class="w-full rounded-md flex items-center justify-between gap-2"
            >
              <span class="text-xl font-semibold tracking-[0.12em] text-white">
                {{ couponCode }}
              </span>
            </div>

            <button
  type="button"
  class="w-full bg-white text-black rounded-md px-4 py-2 text-sm hover:bg-gray-100 transition"
  @click="copyCouponAndGo"
>
  <span>
    Скопировать промокод и перейти в каталог
  </span>
</button>
          </div>

          <!-- 3б) если купона нет, но есть product_id — подарок-товар -->
          <div v-else-if="productId" class="space-y-3">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center text-xs text-white/60"
              >
                ID {{ productId }}
              </div>
              <div class="flex-1">
                <p class="text-sm text-white">
                  Подарок-товар (ID {{ productId }})
                </p>
                <p class="text-xs text-white/60">
                  По этому ID можно будет подтянуть картинку и название товара.
                </p>
              </div>
            </div>

            <NuxtLink
              to="/catalog"
              class="w-full inline-flex items-center justify-center bg-white text-black rounded-md px-4 py-2 text-sm hover:bg-gray-100 transition"
              @click="emit('close')"
            >
              Перейти в каталог
            </NuxtLink>
          </div>

          <!-- Фоллбек, если нет ни купона, ни product_id -->
          <div v-else class="space-y-3">
            <p class="text-sm text-white/80">
              Приз зафиксирован, подробную информацию вы получите при оформлении заказа.
            </p>
            <NuxtLink
              to="/catalog"
              class="w-full inline-flex items-center justify-center bg-white text-black rounded-md px-4 py-2 text-sm hover:bg-gray-100 transition"
              @click="emit('close')"
            >
              Перейти в каталог
            </NuxtLink>
          </div>
        </template>
      </div>


    </div>
  </UiModal>
</template>
