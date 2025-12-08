<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import PromoBanner from '~/components/promotions/PromoBanner.vue'
import PromoCardsSections from '~/components/promotions/PromoCardsSections.vue'
import LoyaltySection from '~/components/promotions/LoyaltySection.vue'
import SertificatesSection from '~/components/promotions/SertificatesSection.vue'
import { usePromoStore } from '~/stores/promotionStore'
import { useYtm } from '@/composables/useYtm'
import { onMounted, computed } from 'vue'

definePageMeta({ layout: 'main' })

const promoStore = usePromoStore()
await useAsyncData('promotions:list', () => promoStore.loadPromotions())

// --- YTM: promo_view ---
const ytm = useYtm()
const promotions = computed(() => promoStore.promotions || [])
let promoViewSent = false

function mapToYtmPromos(list: Array<{ id: string|number; title: string }>) {
  return list.map((p, i) => ({
    id: String(p.id),
    name: p.title,
    creative: 'grid',           // тип носителя (список карточек)
    position: String(i + 1),    // позиция в списке
  }))
}

onMounted(() => {
  if (!import.meta.client) return
  if (promoViewSent) return
  if (!promotions.value.length) return

  ytm.promoView(mapToYtmPromos(promotions.value))
  promoViewSent = true
})

</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-4 md:gap-10">
      <PromoBanner />
      <PromoCardsSections />
      <!-- <LoyaltySection /> -->
      <SertificatesSection />
    </div>
  </BaseContainer>
</template>
