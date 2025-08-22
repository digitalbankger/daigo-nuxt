<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { usePromoStore } from '~/stores/promotionStore'
import { useModalStore } from '~/stores/modalStore'
import PromotionItem from '~/components/ui/PromotionItem.vue'

const promoStore = usePromoStore()
const modalStore = useModalStore()
const { promotions } = storeToRefs(promoStore)

// подстраховка на клиенте, если пришли без данных (на случай { lazy: true })
onMounted(() => {
  if (!promotions.value.length) promoStore.loadPromotions()
})

const handleApply = async (promotion: any) => {
  const result = await promoStore.applyPromotion(promotion)
  modalStore.show({
    title: result.success ? '✅ Успешно' : '❌ Ошибка',
    message: result.success ? 'Акция применена' : 'Не удалось применить акцию'
  })
}
</script>

<template>
  <section class="relative w-full overflow-hidden py-10">
    <h2 class="text-slider font-medium mb-10">Действующие акции</h2>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <PromotionItem
        v-for="promotion in promotions"
        :key="promotion.id"
        :promotion="promotion"
        @apply="handleApply"
      />
    </div>

    <!-- Прим.: сюда можно добавить скелетон, если promotions пуст -->
  </section>
</template>
