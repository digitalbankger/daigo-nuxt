<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'

const cart = useCartStore()
const count = computed(() => cart.itemsCount)
const visible = computed(() => count.value > 0)
</script>

<template>
  <div
    v-if="visible"
    class="absolute -top-1.5 -right-1.5 min-w-4 h-4 sm:min-w-5 sm:h-5 p-1 rounded-full bg-[#AF1701] text-white
           text-[10px] sm:text-xs leading-5 text-center font-medium flex items-center justify-center"
    role="status"
    :aria-label="`Товаров в корзине: ${count}`"
  >
    <span class="">{{ count }}</span>
</div>
</template>
