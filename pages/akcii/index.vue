<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import PromoBanner from '~/components/promotions/PromoBanner.vue'
import PromoCardsSections from '~/components/promotions/PromoCardsSections.vue'
import LoyaltySection from '~/components/promotions/LoyaltySection.vue'
import SertificatesSection from '~/components/promotions/SertificatesSection.vue'
import { usePromoStore } from '~/stores/promotionStore'

definePageMeta({ layout: 'main' })

// загружаем акции на уровне страницы (SSR/CSR)
const promoStore = usePromoStore()
await useAsyncData('promotions:list', () => promoStore.loadPromotions())
// если хотите не блокировать рендер — можно так:
// await useAsyncData('promotions:list', () => promoStore.loadPromotions(), { lazy: true })
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <PromoBanner />
      <PromoCardsSections />
      <LoyaltySection />
      <SertificatesSection />
    </div>
  </BaseContainer>
</template>
