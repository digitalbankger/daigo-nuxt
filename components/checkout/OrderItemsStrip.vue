<script setup lang="ts">
import type { CartItem } from '~/stores/cartOrderStore'
const props = defineProps<{ items: CartItem[] }>()
</script>
<template>
  <div class="flex items-center gap-6 overflow-x-auto pb-2">
    <div v-for="it in items" :key="it.id" class="flex flex-col items-start min-w-[80px] gap-2">
      <div class="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden">
        <img v-if="it.img" :src="it.img" class="w-full h-full object-cover" />
      </div>
      <div class="mt-2 text-sm text-black/70 line-clamp-2 text-left">{{ it.title }}</div>
      <div class="text-xl">
        <span v-if="it.price === 0" class="text-green-600">Бесплатно</span>
        <span v-else>{{ (it.price).toLocaleString('ru-RU') }} ₽</span>
      </div>
    </div>
  </div>
</template>