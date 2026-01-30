<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

// Определяем пропсы
const props = defineProps<{
  item: {
    id: number
    title: string
    subtitle?: string
    price: number
    originalPrice?: number
    oldPrice?: number
    quantity: number
    image: string
  }
}>()

const emit = defineEmits(['update', 'remove'])

const displayOriginalPrice = computed(() => {
  if (!props.item.originalPrice) return null
  if (props.item.originalPrice <= props.item.price) return null
  return props.item.originalPrice
})

// Читаем базовый URL из runtimeConfig (daigoApiBase)
const { public: { daigoApiBase } } = useRuntimeConfig()

// Вычисляем полный путь к изображению: если image уже содержит http, не добавляем базу
const fullImage = computed(() => {
  const url = props.item.image
  return /^https?:\/\//.test(url) ? url : `${daigoApiBase}${url}`
})
</script>

<template>
  <div class="flex gap-4 md:gap-8 border-b pb-4 w-full lg:w-4/5">
    <!-- используем вычисленное свойство fullImage -->
    <img
      :src="fullImage"
      alt=""
      class="w-4/12 md:w-[304px] h-[125px] md:h-[217px] object-contain bg-hoverbtn rounded-lg md:rounded-2xl"
    />
    <div class="flex-1 h-[120px] md:h-[210px] flex flex-col justify-between">
      <h3 class="text-sm md:text-2xl leading-tight">{{ props.item.title }}</h3>
      <div class="flex flex-col gap-4 mt-auto">
        <p class="mt-4 flex items-center gap-2">
  <span
  v-if="displayOriginalPrice"
  class="line-through text-sm md:text-2xl text-[#FB0C2A] font-normal mr-2"
>
  {{ displayOriginalPrice.toLocaleString() }} ₽
</span>

<span
  :class="displayOriginalPrice
    ? 'text-base md:text-cardhead text-black font-medium'
    : 'text-base md:text-cardhead font-medium text-black'"
>
  {{ props.item.price.toLocaleString() }} ₽
</span>

        </p>
        <div
          class="mt-2 flex items-center justify-between gap-3 md:gap-4 border border-primary rounded-md md:rounded-lg py-1.5 md:py-2 px-3 md:px-4 w-28 md:w-40"
        >
          <button @click="emit('update', props.item.id, props.item.quantity - 1)">
            <img src="/icons/cart-dec.svg" />
          </button>
          <span class="text-base md:text-xl text-primary">{{ props.item.quantity }}</span>
          <button @click="emit('update', props.item.id, props.item.quantity + 1)">
            <img src="/icons/cart-inc.svg" />
          </button>
        </div>
      </div>
    </div>
    <button @click="emit('remove', props.item.id)" class="w-6 md:w-8 mt-auto mb-2 md:mt-0 md:mb-auto">
      <img src="/icons/trash.svg" alt="Удалить" />
    </button>
  </div>
</template>
