<script setup lang="ts">
// Компонент для отображения подарка (бесплатной позиции) в корзине.
// Вынесен в поддиректорию components/cart, чтобы структура проекта
// была более очевидной. Содержимое копирует существующий компонент
// CartGift.vue из корня.

defineProps<{
  gift: {
    id: number
    title: string
    image: string
    note?: string
  }
}>()
</script>

<template>
  <div class="flex gap-4 items-center border-b pb-4 opacity-80">
    <img :src="gift.image" alt="" class="w-24 h-24 object-contain" />
    <div>
      <p class="text-lg font-medium">{{ gift.title }}</p>
      <p v-if="gift.note" class="text-sm text-gray-500">{{ gift.note }}</p>
    </div>
    <span class="ml-auto text-sm px-2 py-1 bg-pink-100 text-pink-600 rounded">Подарок</span>
  </div>
</template>