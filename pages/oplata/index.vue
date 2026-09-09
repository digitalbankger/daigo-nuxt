<script setup lang="ts">
import PaymentBanner from '~/components/payment/PaymentBanner.vue'
import PaymentMethods from '~/components/payment/PaymentMethods.vue'
import PaymentBonuses from '~/components/payment/PaymentBonuses.vue'
import PaymentRequisites from '~/components/payment/PaymentRequisites.vue'
import PaymentInfo from '~/components/payment/PaymentInfo.vue'
import ProductCarousel from '~/components/payment/ProductCarousel.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { definePageMeta } from '#imports'

definePageMeta({ layout: 'main' })

usePageCanonical('/oplata')
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <PaymentBanner />
      <PaymentBonuses />
      <PaymentMethods />
      <PaymentRequisites />
      <PaymentInfo />
      <!-- <ProductCarousel /> -->
    </div>
  </BaseContainer>
</template>
