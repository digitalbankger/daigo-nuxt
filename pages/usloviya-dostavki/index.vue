<script setup lang="ts">
import DeliveryBanner from '~/components/delivery/DeliveryBanner.vue'
import DeliveryPartners from '~/components/delivery/DeliveryPartners.vue'
import DeliveryMap from '~/components/delivery/DeliveryMap.vue'
import DeliveryInfo from '~/components/delivery/DeliveryInfo.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { definePageMeta } from '#imports'

definePageMeta({ layout: 'main' })
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <DeliveryBanner />
      <DeliveryPartners />
      <DeliveryMap />
      <DeliveryInfo />
    </div>
  </BaseContainer>
</template>
