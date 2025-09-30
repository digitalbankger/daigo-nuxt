<!-- ~/components/checkout/CartItemsPreview.vue -->
<script setup lang="ts">
import type { CartItem } from '~/types/checkout'
defineProps<{ items: CartItem[] }>()
</script>

<template>
  <div class="flex flex-wrap gap-4 mb-6">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex flex-col items-center w-20 md:w-24"
    >
      <NuxtImg
        :src="item.image"
        alt="miniature"
        class="h-20 w-20 object-contain rounded-md border"
        loading="lazy"
      />
      <span class="mt-2 text-sm font-medium">{{ item.price.toLocaleString('ru-RU') }} ₽</span>
    </div>
  </div>
</template>
