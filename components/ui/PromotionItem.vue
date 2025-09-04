<script setup lang="ts">
import Button from './Button.vue';

defineProps<{
  promotion: {
    id: number | string
    title: string
    description: string
    image: string
    coupon?: string
    promo_type: 'discount' | 'gift' | 'code'
  }
}>()
</script>

<template>
  <div class="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer">
    <img
      :src="promotion.image"
      :alt="promotion.title"
      class="w-full object-contein"
      loading="lazy"
      @click="$emit('apply', promotion)"
    />
    <div class="lg:hidden py-4 flex flex-col flex-1">
      <!-- <h3 class="text-xl font-semibold mb-2">{{ promotion.title }}</h3>
      <p class="text-sm text-gray-700 mb-4 line-clamp-3">{{ promotion.description }}</p>

      <div v-if="promotion.coupon" class="mb-4">
        <div class="text-sm text-gray-600">Промокод:</div>
        <div class="font-bold text-base">{{ promotion.coupon }}</div>
      </div> -->

      <div class="mt-auto">
        <Button
          variant="outline"
          class="w-full"
          @click="$emit('apply', promotion)"
        >
          Применить акцию
        </Button>
      </div>
    </div>
  </div>
</template>
