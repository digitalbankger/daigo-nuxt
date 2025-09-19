<script setup lang="ts">
import Button from './Button.vue'

type PromoType = 'discount' | 'gift' | 'code'
interface Promotion {
  id: number | string
  title: string
  description: string
  image: string
  coupon?: string | null
  promo_type: PromoType
}

const props = defineProps<{ promotion: Promotion }>()
const emit = defineEmits<{ (e: 'apply', promotion: Promotion): void }>()
</script>

<template>
  <div class="bg-white rounded-xl overflow-hidden flex flex-col">
    <img
      :src="promotion.image"
      :alt="promotion.title"
      class="w-full h-auto object-contain"
      loading="lazy"
      decoding="async"
      @click="emit('apply', promotion)"
    />

    <div class="py-4 flex flex-col flex-1">
      <h3 class="text-2xl font-medium mb-2 leading-snug">{{ promotion.title }}</h3>

      <p
        v-if="promotion.description"
        class="text-base text-black/70 mb-4"
        v-html="promotion.description"
      />

      <div v-if="promotion.coupon" class="mb-4">
        <div class="text-sm text-black/70">Промокод:</div>
        <div class="font-medium text-base text-primary tracking-wide select-all">{{ promotion.coupon }}</div>
      </div>

      <div class="mt-auto">
        <Button
          variant="outline"
          class="w-full"
          @click="emit('apply', promotion)"
        >
          Применить акцию
        </Button>
      </div>
    </div>
  </div>
</template>
