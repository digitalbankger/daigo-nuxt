<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Product } from '~/types/product'

const props = defineProps<{
  products: Product[]
  cardWidth?: number // минимальная ширина карточки
  gap?: number       // gap между карточками
}>()

const wrap = ref<HTMLDivElement|null>(null)

// пролистывание “на экран”
function scrollByPage(dir: 1 | -1) {
  const el = wrap.value
  if (!el) return
  el.scrollBy({ left: dir * (el.clientWidth * 0.9), behavior: 'smooth' })
}

function onWheel(e: WheelEvent) {
  // гориз. скролл колёсиком
  if (!wrap.value) return
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
    wrap.value.scrollLeft += e.deltaY
    e.preventDefault()
  }
}

onMounted(() => {
  // клавиатура стрелки ← →
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') scrollByPage(1)
    if (e.key === 'ArrowLeft')  scrollByPage(-1)
  }
  window.addEventListener('keydown', handler)
  // снимаем при размонтировании
  // @ts-ignore
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <div class="relative">
    <!-- стрелки -->
    <button
      aria-label="Назад"
      class="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80"
      @click="scrollByPage(-1)"
    >‹</button>

    <button
      aria-label="Вперёд"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80"
      @click="scrollByPage(1)"
    >›</button>

    <!-- дорожка -->
    <div
      ref="wrap"
      class="flex overflow-x-auto snap-x snap-mandatory scrollbar-hidden"
      :style="{
        gap: (gap ?? 16) + 'px',
        scrollPadding: '0 ' + (gap ?? 16) + 'px'
      }"
      @wheel.passive="onWheel"
    >
      <!-- «рамка», чтобы у первой/последней был нормальный отступ -->
      <div :style="{ width: (gap ?? 16) + 'px', flex: '0 0 auto' }" aria-hidden="true" />
      <slot name="card" v-for="p in products" :p="p" :key="p.id">
        <!-- дефолтная карточка -->
        <NuxtLink
          :to="p.slug ? `/catalog/${p.slug}` : `/product/${p.id}`"
          class="snap-start flex-shrink-0 bg-white rounded-2xl shadow p-4 w-[min(80vw,360px)]"
          :style="{ minWidth: (cardWidth ?? 280) + 'px' }"
        >
          <NuxtImg :src="p.image" format="webp" class="w-full h-44 object-contain bg-hoverbtn rounded-xl" loading="lazy"/>
          <div class="mt-3 text-lg leading-snug">{{ p.name }}</div>
          <div class="mt-1 text-sm text-gray-500 line-clamp-2">{{ p.subtitle }}</div>
          <div class="mt-2 font-medium">{{ p.price }} ₽</div>
        </NuxtLink>
      </slot>
      <div :style="{ width: (gap ?? 16) + 'px', flex: '0 0 auto' }" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar { display: none; }
.scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
</style>
