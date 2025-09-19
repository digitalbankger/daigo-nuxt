<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { usePromoStore } from '~/stores/promotionStore'
import { useModalStore } from '~/stores/modalStore'
import PromotionItem from '~/components/ui/PromotionItem.vue'

type PromoType = 'discount' | 'gift' | 'code'
interface Promotion {
  id: number | string
  title: string
  description: string
  image: string
  coupon?: string | null
  promo_type: PromoType
}

const promoStore = usePromoStore()
const modalStore = useModalStore()
const { promotions, isApplying } = storeToRefs(promoStore)

onMounted(() => {
  if (!promotions.value.length) promoStore.loadPromotions()
})

const handleApply = async (promotion: Promotion) => {
  try {
    // ВАЖНО: вызываем promoStore.apply (не applyPromotion)
    const result: any = await promoStore.apply(promotion)

    const success =
      result?.success === true ||
      result?.applied === true ||
      typeof result?.discount_amount === 'number' ||
      typeof result?.discount_percent === 'number'

    // Для типов 'discount' без запроса стор делает navigateTo — модалка не нужна
    if (promotion.promo_type === 'discount') return

    modalStore.show({
      title: success ? '✅ Успешно' : '❌ Ошибка',
      message:
        (result?.message as string) ||
        (success ? 'Акция применена' : 'Не удалось применить акцию'),
    })
  } catch (e: any) {
    modalStore.show({
      title: '❌ Ошибка',
      message: e?.message || 'Не удалось применить акцию',
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
        @apply="handleApply"
      />
    </div>

    <div
      v-if="isApplying"
      class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
    >
      <div class="bg-white px-6 py-4 rounded-xl shadow-lg">
        Применение…
      </div>
    </div>
  </section>
</template>
