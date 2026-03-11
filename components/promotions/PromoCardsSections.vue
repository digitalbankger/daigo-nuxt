<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { usePromoStore } from '~/stores/promotionStore'
import { useModalStore } from '~/stores/modalStore'
import { useAuthStore } from '~/stores/authStore'
import PromotionItem from '~/components/ui/PromotionItem.vue'
import { isCouponApplySuccess } from '~/utils/coupon'

type PromoType = 'discount' | 'gift' | 'code' | '2plus1' | 'notice'
interface Promotion {
  id: number | string
  title: string
  description?: string
  image: string
  coupon?: string | null
  promo_type: PromoType
  // флаг с бэка (может уже быть в типах)
  is_applied?: boolean
  link?: string | null
}

const route = useRoute()
const authStore = useAuthStore()
const promoStore = usePromoStore()
const modalStore = useModalStore()
const pendingPromotionAfterAuth = ref<Promotion | null>(null)

// берём состояния из стора
const { promotions, isApplying, pendingId } = storeToRefs(promoStore)

onMounted(() => {
  // на CSR подгружаем, если SSR не вернул (например, нет session_id на сервере)
  if (!promotions.value.length) promoStore.loadPromotions()
})

function isAuthRequiredError(error: any) {
  return error?.code === 'AUTH_REQUIRED' || String(error?.message || '').toLowerCase().includes('необходимо авторизоваться')
}

function getPromoEntityLabel(promotion: Promotion) {
  return promotion.promo_type === 'code' ? 'промокод' : 'акцию'
}

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated || !pendingPromotionAfterAuth.value) return

    const promotion = pendingPromotionAfterAuth.value
    pendingPromotionAfterAuth.value = null

    modalStore.show({
      title: `Ура, теперь вы можете применить ${getPromoEntityLabel(promotion)}`,
      message: 'Авторизация прошла успешно. Нажмите кнопку ниже, чтобы повторить применение.',
      buttonText: 'Применить ещё раз',
      onConfirm: async () => {
        modalStore.close()
        await handleApply(promotion)
      },
    })
  }
)

async function handleApply(promotion: Promotion) {
  try {
    // 0) Если у акции есть явная ссылка — просто переходим и ничего не показываем
    const link = (promotion as any)?.link?.trim?.()
    if (link) {
      if (/^https?:\/\//i.test(link)) {
        await navigateTo(link, { external: true })
      } else {
        await navigateTo(link)
      }
      return // ← НЕТ модалок
    }

    const res: any = await promoStore.apply(promotion as any)

    // Для 'discount' стор делает navigateTo — модалка не нужна
    if (promotion.promo_type === 'discount') return

    const success = isCouponApplySuccess(res)

    modalStore.show({
      title: success ? '✅ Успешно' : 'Что-то пошло не так',
      message:
        res?.message ||
        (success ? 'Акция применена' : 'Не удалось применить акцию'),
    })
  } catch (e: any) {
    if (isAuthRequiredError(e)) {
      pendingPromotionAfterAuth.value = promotion
      modalStore.show({
        title: 'Что-то пошло не так',
        message: e?.message || 'Для применения акции необходимо авторизоваться',
        buttonText: 'Авторизоваться',
        onConfirm: async () => {
          modalStore.close()
          authStore.openAuth(route.fullPath)
        },
      })
      return
    }

    modalStore.show({
      title: 'Что-то пошло не так',
      message: e?.message || 'Не удалось применить акцию',
    })
  }
}


async function handleCancel() {
  try {
    await promoStore.cancelActive()
    modalStore.show({ title: 'Готово', message: 'Акция отменена' })
  } catch (e: any) {
    modalStore.show({
      title: 'Что-то пошло не так',
      message: e?.message || 'Не удалось отменить акцию',
    })
  }
}
</script>

<template>
  <section class="relative w-full overflow-hidden py-4 sm:py-10">
    <h2 class="text-slider sm:text-product lg:text-slider font-medium leading-tight mb-4 sm:mb-10">
      Действующие акции
    </h2>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <PromotionItem
        v-for="promotion in promotions"
        :key="promotion.id"
        :promotion="promotion"
        :is-applied="Boolean(promotion.is_applied)"
        :busy="pendingId === promotion.id"
        @apply="handleApply"
        @cancel="handleCancel"
      />
    </div>

    <!-- глобальный индикатор -->
    <div v-if="isApplying" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div class="bg-white px-6 py-4 rounded-xl shadow-lg">
        Выполняется…
      </div>
    </div>
  </section>
</template>
