<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamification'
import WheelModal from '@/components/gamification/WheelModal.vue'
import { useAnalytics } from '~/composables/useAnalytics'
import {
  WHEEL_SEGMENTS,
  // checkWheelPhone,   // ← больше не используем в баннере
  spinWheel,
  mapSpinToWheelResult,
  type WheelSpinResponse
} from '@/services/gamificationService'

const SEGMENTS_COUNT = 16
const SECTOR_ANGLE = 360 / SEGMENTS_COUNT
const POINTER_OFFSET = 0

const LIGHTS_COUNT = 12

const auth = useAuthStore()
const gamification = useGamificationStore()
const analytics = useAnalytics()

const rotation = ref(0)
const isSpinning = ref(false)

const modalOpen = ref(false)
const modalMode = ref<'phone' | 'ready' | 'result'>('phone')
const isCheckingPhone = ref(false)
const isSpinRequest = ref(false)
const modalError = ref<string | null>(null)

const lastSpin = ref<WheelSpinResponse | null>(null)

const prizeTitle = computed(() => lastSpin.value?.prizeName ?? null)
const prizeDescription = computed(() => lastSpin.value?.prizeDescription ?? null)
const prizeCouponCode = computed(() => lastSpin.value?.couponCode ?? null)
const prizeProductId = computed(() => lastSpin.value?.productId ?? null)

const segments = WHEEL_SEGMENTS
const alreadySpun = computed(() => !gamification.canSpinAgain())

// подсветка/пульсация колеса при ховере на колесе или кнопке
const isWheelHighlighted = ref(false)
const setHighlight = (val: boolean) => {
  if (isSpinning.value) return
  isWheelHighlighted.value = val
}

// НОВАЯ логика открытия: всегда режим ввода телефона
function onCtaClick() {
  modalError.value = null
  modalMode.value = 'phone'
  modalOpen.value = true
}

/**
 * НОВАЯ логика отправки телефона:
 *  - сразу делаем POST /fortune/spins/{phone}
 *  - если есть приз → закрываем модалку, крутим колесо
 *  - если спинов нет / ошибка → показываем результат с текстом ошибки
 */
async function handleSubmitPhone(phone: string) {
  try {
    isCheckingPhone.value = true
    isSpinRequest.value = true
    modalError.value = null

    // сразу спин по номеру
    const spin = await spinWheel(phone)
    lastSpin.value = spin

    const wheelResult = mapSpinToWheelResult(spin)
    gamification.setWheelResult(wheelResult)

    // закрываем попап и запускаем анимацию
    modalOpen.value = false
    spinToSegment(spin.segmentId)
  } catch (e: any) {
    console.error('handleSubmitPhone / spin error', e)

    const msg: string | undefined =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      (typeof e?.response?.data === 'string' ? e.response.data : undefined)

    if (msg && msg.toLowerCase().includes('no available')) {
      modalError.value = 'Вы уже участвовали в розыгрыше.'
    } else if (msg && msg.toLowerCase().includes('invalid phone')) {
      modalError.value = 'Неверный формат номера телефона.'
    } else {
      modalError.value = 'Не удалось выполнить спин. Попробуйте позже.'
    }

    // показываем экран результата с ошибкой
    modalMode.value = 'result'
    modalOpen.value = true
  } finally {
    isCheckingPhone.value = false
    isSpinRequest.value = false
  }
}

// старая функция handleSpin больше не нужна, но оставим заглушку,
// чтобы не ломать пропсы/эмиты модалки
function handleSpin() {
  // no-op: логика спина теперь в handleSubmitPhone
}

function sectorCenterDeg(id: number): number {
  return POINTER_OFFSET + SECTOR_ANGLE * (id - 0.5)
}

function spinToSegment(prizeId: number) {
  // всего 16 секторов, поэтому визуальный сектор — это "зеркало" относительно круга
  const visualId = SEGMENTS_COUNT + 1 - prizeId
  // на всякий случай нормализуем в диапазон [1; SEGMENTS_COUNT]
  const id =
    ((visualId - 1 + SEGMENTS_COUNT) % SEGMENTS_COUNT) + 1

  const target = sectorCenterDeg(id)
  const current = ((rotation.value % 360) + 360) % 360
  const extraTurns = 5
  const delta = extraTurns * 360 + (target - current)

  isSpinning.value = true
  isWheelHighlighted.value = false
  rotation.value += delta
}

function handleSpinEnd() {
  if (!isSpinning.value) return
  isSpinning.value = false

  // Если спин был успешным и есть приз — шлём цель
  if (lastSpin.value) {
    analytics.reach('fortune_prize', {
      prize_id: lastSpin.value.segmentId,
      prize_name: lastSpin.value.prizeName,
      prize_type: lastSpin.value.prizeType,
      coupon_code: lastSpin.value.couponCode || null,
      product_id: lastSpin.value.productId || null,
    })
  }

  // Открываем попап с результатом
  modalMode.value = 'result'
  modalOpen.value = true
}

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="banner-slide relative bg-[#242325]
             flex items-start sm:items-center justify-between
             px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-16
             rounded-3xl text-white
             h-[570px] sm:h-[360px] lg:h-[500px]
             overflow-hidden"
    >
      <!-- фон баннера -->
      <img src="/images/catalog-bf.png" class="hidden sm:block w-8/12 absolute right-0 bottom-0 z-0" />
      <img src="/images/catalog-bf-mobile.png" class="sm:hidden block w-full absolute right-0 top-2 z-0" />
      

      <!-- колесо: выведено за левый край -->
      <div
        class="pointer-events-none absolute
               left-1/2 -translate-x-1/2 sm:-translate-x-0 sm:left-[80px] lg:left-[120px]
               -bottom-[4%] sm:-bottom-[30%]
               w-[340px] sm:w-[420px] lg:w-[600px]
               z-10"
      >
        <div
          class="relative w-full aspect-square pointer-events-auto z-10"
          @mouseenter="setHighlight(true)"
          @mouseleave="setHighlight(false)"
        >
          <!-- колесо -->
          <img
            src="/images/wheel-gift.png"
            alt="Колесо фортуны"
            class="spinner p-2 bg-[#242325] rounded-full shadow-lg sm:shadow-xl shadow-red-400/20 cursor-pointer"
            :class="{ 'wheel-pulse': isWheelHighlighted }"
            :style="{ '--rotation': `${rotation}deg` }"
            @transitionend="handleSpinEnd"
            @click="onCtaClick"
          />

          <!-- индикатор сверху -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
            <img src="/icons/spinner-indicator.svg" alt="" class="w-10 h-10" />
          </div>
        </div>
      </div>

      <!-- правая часть -->
      <div class="w-full sm:max-w-[80%] lg:max-w-[60%]">
        <div class="sm:absolute top-8 right-56 flex flex-col gap-4">
            <!-- Заголовок -->
            <img src="/icons/head.svg" class="relative z-20 mx-auto w-11/12 sm:w-[360px]" />
            <!-- Текст -->
            <div
            class="relative z-20 text-[clamp(0.56rem,3.1vw,0.9rem)]
                    sm:text-[0.9rem]
                    lg:text-[clamp(0.56rem,3.1vw,0.9rem)]
                    flex flex-col gap-4 font-light
                    max-w-[67%] sm:max-w-[80%] lg:max-w-[248px] ms-auto"
            >
            <p>
                Каждый день с 21 по 30 Ноября! 
                Новые предложения каждый день <br>и возможность выграть десятки призов в нашем колесе фортуны.
            </p>
            </div>

            <!-- Кнопка -->
            <button
              to="/catalog"
              class="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black sm:w-70
                        justify-center rounded-md sm:rounded-lg hidden sm:inline-flex items-center gap-2
                        px-5 py-2 sm:py-3 mt-2 text-sm sm:text-base lg:text-lg font-normal
                        transition duration-300 group max-w-[90%] sm:max-w-[80%] lg:max-w-[248px] ms-auto hover:bg-white hover:text-black transition
                    disabled:opacity-60 relative z-10"
              @mouseenter="setHighlight(true)"
              @mouseleave="setHighlight(false)"
              :disabled="alreadySpun || isSpinning"
              @click="onCtaClick"
            >
              <span >Испытать удачу!</span>
            </button>
        </div>
      </div>
    </div>

<WheelModal
  :show="modalOpen"
  :mode="modalMode"
  :is-checking="isCheckingPhone"
  :is-spinning="isSpinRequest || isSpinning"
  :already-spun="alreadySpun"
  :error="modalError"

  :prize-name="prizeTitle || undefined"
  :prize-description="prizeDescription || undefined"
  :coupon-code="prizeCouponCode || undefined"
  :product-id="prizeProductId || undefined"

  @close="modalOpen = false"
  @submit-phone="handleSubmitPhone"
  @spin="handleSpin"
/>

  </section>
</template>

<style scoped>
/* вращение колеса — через CSS-переменную */
.spinner {
  width: 100%;
  height: 100%;
  transition: transform 4s cubic-bezier(0.12, 0.01, 0.08, 0.99);
  transform-origin: center center;
  transform: rotate(var(--rotation, 0deg));
}

/* пульс при наведении */
.wheel-pulse {
  animation: wheel-pulse 1s ease-in-out infinite;
}

@keyframes wheel-pulse {
  0%,
  100% {
    transform: scale(1) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: scale(1.04) rotate(var(--rotation, 0deg));
  }
}


</style>
