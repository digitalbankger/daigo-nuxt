<script setup lang="ts">
// Этот компонент отображает один товар в корзине. Он полностью
// повторяет логическую и визуальную часть из файла CartItem.vue в
// корневой директории проекта. Мы выделяем его в поддиректорию
// components/cart для большей структурированности. При изменениях в
// старом файле следует синхронизировать их здесь.

defineProps<{
  item: {
    id: number
    title: string
    subtitle?: string
    price: number
    oldPrice?: number
    quantity: number
    image: string
  }
}>()

const emit = defineEmits(['update', 'remove'])
</script>

<template>
  <div class="flex gap-8 border-b pb-4">
    <img :src="item.image" alt="" class="md:w-[304px] md:h-[217px] object-contain bg-hoverbtn rounded-2xl" />
    <div class="flex-1 h-[210px] flex flex-col justify-between">
      <h3 class="text-2xl">{{ item.title }}</h3>
      <div class="flex flex-col gap-4 mt-auto">
        <p class="mt-4 flex items-center gap-2">
          <!-- старая цена, если есть -->
          <span
            v-if="item.oldPrice"
            class="line-through text-2xl text-black/60 font-normal mr-2"
          >
            {{ item.oldPrice.toLocaleString() }} ₽
          </span>

          <!-- текущая цена -->
          <span
            :class="item.oldPrice
              ? 'text-cardhead text-cgreen font-medium'
              : 'text-cardhead font-medium text-black'"
          >
            {{ item.price.toLocaleString() }} ₽
          </span>
        </p>
        <div class="mt-2 flex items-center justify-between gap-4 border border-primary rounded-lg py-2 px-4 w-40">
          <button @click="emit('update', item.id, item.quantity - 1)">−</button>
          <span class="text-xl text-primary">{{ item.quantity }}</span>
          <button @click="emit('update', item.id, item.quantity + 1)">+</button>
        </div>
      </div>
    </div>
    <button @click="emit('remove', item.id)" class="mb-auto">
      <img src="/icons/trash.svg" alt="Удалить" />
    </button>
  </div>
</template>