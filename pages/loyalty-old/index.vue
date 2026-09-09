<script setup lang="ts">
import PromoBanner from '~/components/loyalty/PromoBanner.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import LoyaltySection from '~/components/loyalty/LoyaltySection.vue'
import SertificatesSection from '~/components/loyalty/InfoSection.vue'
import BonusesHistory from '~/components/loyalty/BonusSection.vue'

definePageMeta({ layout: 'main' })

usePageCanonical('/loyalty-old')

</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <PromoBanner />
      <LoyaltySection />
      <SertificatesSection />
      <BonusesHistory />
    </div>
  </BaseContainer>
</template>

