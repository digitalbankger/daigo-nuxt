<template>
  <div v-if="ui.isHeadInformerVisible"
       class="fixed top-0 left-0 right-0 z-[70] w-full bg-primary text-white rounded-b-xl sm:rounded-b-none shadow-lg shadow-primary/30"
       aria-label="Информер со ссылкой на каталог">
    <div class="relative flex items-center justify-center gap-4 px-3 sm:px-6 py-2 sm:py-2">

      <!-- DESKTOP TEXT -->
      <NuxtLink
        to="/catalog"
        class="hidden sm:flex items-center gap-3 justify-center uppercase tracking-wide transition duration-300"
        @click="sendInformerGoal"
      >
        <span class="text-sm sm:text-lg font-mont font-medium">5% скидка на первый заказ</span>
      </NuxtLink>

      <!-- DESKTOP BUTTON -->
      <button
        type="button"
        class="hidden sm:inline-flex items-center justify-center gap-2 bg-[#9AFF9F] text-black rounded-lg py-1.5 px-4 text-sm uppercase transition hover:bg-[#7EFF7E] disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="busy"
        @click="applyWelcome()"
      >
        <span>{{ busy ? (isApplied ? 'Отмена…' : 'Применение…') : (isApplied ? 'Отменить WELCOME5' : 'Применить WELCOME5') }}</span>
      </button>

      <!-- MOBILE -->
      <div class="flex flex-col items-center gap-2 w-full justify-center sm:hidden uppercase">
        <span class="text-xs sm:text-lg font-mont font-medium">5% скидка на первый заказ</span>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 bg-[#9AFF9F] text-black rounded-lg py-1 px-4 text-sm uppercase transition hover:bg-[#7EFF7E] disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="busy"
          @click="applyWelcome()"
        >
          <span>{{ busy ? (isApplied ? 'Отмена…' : 'Применение…') : (isApplied ? 'Отменить WELCOME5' : 'Применить WELCOME5') }}</span>
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
import { storeToRefs } from 'pinia'
import { useRoute } from '#imports'
import { useUiStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'
import { usePromoStore } from '~/stores/promotionStore'
import { useModalStore } from '~/stores/modalStore'
import { useAuthStore } from '~/stores/authStore'
import { useYtm } from '@/composables/useYtm'
import { isCouponApplySuccess } from '~/utils/coupon'

type PromoType = 'discount' | 'gift' | 'code' | '2plus1' | 'notice' | string
interface Promotion {
  id: number | string
  title: string
  description?: string
  image?: string
  coupon?: string | null
  promo_type: PromoType
  is_applied?: boolean
  link?: string | null
}

const ui = useUiStore()
const route = useRoute()
const authStore = useAuthStore()
const { reach } = useAnalytics()
const promoStore = usePromoStore()
const modalStore = useModalStore()
const ytm = useYtm()

const { promotions, pendingId } = storeToRefs(promoStore)

const WELCOME_CODE = 'WELCOME5'
const shouldOfferWelcomeReapply = ref(false)

const welcomePromo = computed<Promotion | null>(() => {
  const list = (promotions.value || []) as Promotion[]
  return list.find(p => (p.coupon || '').trim().toUpperCase() === WELCOME_CODE) || null
})

const isApplied = computed(() => Boolean(welcomePromo.value?.is_applied))

const busy = computed(() => {
  const p = welcomePromo.value
  if (!p) return false
  return pendingId.value === p.id
})

const sendInformerGoal = () => {
  reach('informer-click')
}

function toYtmPromo(p: Promotion) {
  return {
    id: String(p.id),
    name: p.title,
    creative: 'head_informer', // отдельный носитель, чтобы отличать от grid
    position: '1',
  }
}

function isAuthRequiredError(error: any) {
  return error?.code === 'AUTH_REQUIRED' || String(error?.message || '').toLowerCase().includes('необходимо авторизоваться')
}

function showWelcomeAuthModal() {
  shouldOfferWelcomeReapply.value = true
  modalStore.show({
    title: 'Что-то пошло не так',
    message: 'Для применения акции необходимо авторизоваться',
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
    if (!isAuthenticated || !shouldOfferWelcomeReapply.value) return

    shouldOfferWelcomeReapply.value = false
    modalStore.show({
      title: 'Ура, теперь вы можете применить промокод',
      message: 'Авторизация прошла успешно. Нажмите кнопку ниже, чтобы применить WELCOME5 ещё раз.',
      buttonText: 'Применить ещё раз',
      onConfirm: async () => {
        modalStore.close()
        await applyWelcome({ skipGoal: true })
      },
    })
  }
)

async function applyWelcome(opts: { skipGoal?: boolean } = {}) {
  if (!import.meta.client) return

  if (!opts.skipGoal) {
    sendInformerGoal()
  }

  // гарантируем, что промки есть (как на акциях: если SSR не дал — подгрузить)
  if (!promotions.value?.length) {
    try { await promoStore.loadPromotions() } catch {}
  }

  const promo = welcomePromo.value
  if (!promo) {
    modalStore.show({
      title: 'Промокод не найден',
      message: `Промокод ${WELCOME_CODE} сейчас недоступен`,
    })
    return
  }

  if (busy.value) return

  // YTM promoClick — как на карточках
  ytm.promoClick([toYtmPromo(promo)])

  try {
    if (isApplied.value) {
      await promoStore.cancelActive()
      modalStore.show({ title: 'Готово', message: 'Акция отменена' })
      return
    }

    const res: any = await promoStore.apply(promo as any)

    // логика success — 1 в 1 как у тебя на странице акций
    const success = isCouponApplySuccess(res)

    modalStore.show({
      title: success ? '✅ Успешно' : 'Что-то пошло не так',
      message: res?.message || (success ? 'Промокод применён' : 'Не удалось применить промокод'),
    })
  } catch (e: any) {
    if (isAuthRequiredError(e)) {
      showWelcomeAuthModal()
      return
    }

    modalStore.show({
      title: 'Что-то пошло не так',
      message: e?.message || 'Не удалось применить промокод',
    })
  }
}

const close = () => ui.closeHeadInformer()
</script>

<style scoped>
.shadow-primary\/30 {
    --tw-shadow-color: #f65b7836;
    --tw-shadow: var(--tw-shadow-colored);
}
</style>