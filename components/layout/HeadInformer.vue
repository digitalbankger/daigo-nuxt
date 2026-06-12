<template>
  <div v-if="ui.isHeadInformerVisible"
       class="fixed top-0 left-0 right-0 z-[70] w-full bg-[#1f8cb3] text-white rounded-b-xl sm:rounded-b-none shadow-lg shadow-primary/30"
       aria-label="Информер со ссылкой на каталог">
    <div class="relative flex items-center justify-center gap-4 px-3 sm:px-6 py-2 sm:py-2">

      <!-- DESKTOP TEXT -->
      <NuxtLink
        to="/catalog"
        class="hidden sm:flex items-center gap-3 justify-center uppercase tracking-wide transition duration-300"
        @click="sendInformerGoal"
      >
        <span class="text-sm sm:text-lg font-mont font-medium">Готовьтесь к лету вместе с Daigo – 15-19 Июня</span>
      </NuxtLink>

      <!-- DESKTOP BUTTON -->
      <button
        type="button"
        class="hidden sm:inline-flex items-center justify-center gap-2 bg-[#9AFF9F] text-black rounded-lg py-1.5 px-4 text-sm uppercase transition hover:bg-[#7EFF7E] disabled:opacity-60 disabled:cursor-not-allowed"
        
      >
        <span>Скидка -20% на ВСЕ!</span>
      </button>

      <!-- MOBILE -->
      <div class="flex flex-col items-center gap-2 w-full justify-center sm:hidden uppercase">
        <span class="text-xs sm:text-lg font-mont font-medium">Готовьтесь к лету вместе с Daigo</span>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 bg-[#9AFF9F] text-black rounded-lg py-1 px-4 text-sm uppercase transition hover:bg-[#7EFF7E] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>Скидка -20% на ВСЕ! 15-19 Июня</span>
        </button>
      </div>

      <!-- CLOSE BUTTON -->
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-5 sm:w-7 h-5 sm:h-7 rounded-full text-black/90 hover:text-black/60 bg-white"
        aria-label="Скрыть информер"
        @click="close"
      >
        <svg viewBox="0 0 24 24" class="w-3 sm:w-4 h-3 sm:h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useUiStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'
import { useModalStore } from '~/stores/modalStore'
import { useAuthStore } from '~/stores/authStore'
import { useCartStore } from '~/stores/cartStore'
import { getCouponApplyMessage, isCouponApplySuccess } from '~/utils/coupon'

const ui = useUiStore()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const { reach } = useAnalytics()
const modalStore = useModalStore()

const PROMO_CODE = 'ЛЕТО10'
const shouldOfferPromoReapply = ref(false)
const isProcessing = ref(false)

const isApplied = computed(() => {
  const currentCode = String(cartStore.couponInfo?.code || '').trim().toUpperCase()
  if (currentCode === PROMO_CODE) return true

  return (cartStore.coupons || []).some((coupon: any) => {
    const code = String(coupon?.code || '').trim().toUpperCase()
    return code === PROMO_CODE && coupon?.applied !== false
  })
})

const busy = computed(() => isProcessing.value)

const buttonLabel = computed(() => {
  if (busy.value) return 'Применяем…'
  if (isApplied.value) return 'ЛЕТО10 применён'
  return 'Применить ЛЕТО10'
})

const sendInformerGoal = () => {
  reach('informer-click')
}

function isAuthRequiredError(error: any) {
  const text = String(error?.message || '').toLowerCase()
  return error?.code === 'AUTH_REQUIRED' || text.includes('авториз')
}

function showPromoAuthModal() {
  shouldOfferPromoReapply.value = true
  modalStore.show({
    title: 'Для применения промокода нужна авторизация',
    message: 'Авторизуйтесь, и мы применим ЛЕТО10 к вашей корзине.',
    buttonText: 'Авторизоваться',
    onConfirm: async () => {
      modalStore.close()
      authStore.openAuth(route.fullPath)
    },
  })
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated || !shouldOfferPromoReapply.value) return

    shouldOfferPromoReapply.value = false
    modalStore.show({
      title: 'Готово, можно применить промокод',
      message: 'Авторизация прошла успешно. Нажмите кнопку ниже, чтобы применить ЛЕТО10.',
      buttonText: 'Применить ЛЕТО10',
      onConfirm: async () => {
        modalStore.close()
        await applyPromo({ skipGoal: true })
      },
    })
  }
)

async function applyPromo(opts: { skipGoal?: boolean } = {}) {
  if (!import.meta.client || isProcessing.value) return

  if (!opts.skipGoal) {
    sendInformerGoal()
  }

  if (isApplied.value) {
    modalStore.show({
      title: 'Промокод уже применён',
      message: 'ЛЕТО10 уже активен в вашей корзине.',
    })
    return
  }

  isProcessing.value = true

  try {
    await cartStore.ensureLoaded()
    const res: any = await cartStore.applyCoupon(PROMO_CODE)
    const success = isCouponApplySuccess(res)

    modalStore.show({
      title: success ? '✅ Успешно' : 'Что-то пошло не так',
      message: res?.message || (success ? 'Промокод применён к корзине' : getCouponApplyMessage(res)),
    })
  } catch (e: any) {
    if (isAuthRequiredError(e)) {
      showPromoAuthModal()
      return
    }

    modalStore.show({
      title: 'Что-то пошло не так',
      message: e?.message || 'Не удалось применить промокод',
    })
  } finally {
    isProcessing.value = false
  }
}

const close = () => ui.closeHeadInformer()
</script>
