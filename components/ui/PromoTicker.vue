<template>
  <div class="relative w-full overflow-hidden bg-[#242325] h-[50px] py-1">
    <!-- Левый блик -->
    <div
      class="absolute left-20 sm:left-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[280px] h-52 rounded-full 
             bg-white/30 blur-2xl sm:blur-3xl pointer-events-none"
    ></div>

    <!-- Правый блик -->
    <div
      class="hidden sm:block absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 w-[120px] sm:w-[280px] h-52 rounded-full 
             bg-white/30 blur-3xl pointer-events-none"
    ></div>

    <div class="relative -mt-0.5">
      <!-- ОДНА анимированная дорожка, внутри два раза подряд один и тот же ДЛИННЫЙ набор -->
      <div class="flex ticker">
        <template v-for="repeat in 2" :key="repeat">
          <div
            v-for="(item, idx) in extendedItems"
            :key="`${repeat}-${idx}`"
            class="flex items-center"
          >
            <!-- Текст -->
            <span
              class="px-4 text-red-500 font-extrabold text-xl tracking-[0.08em] uppercase whitespace-nowrap"
            >
              {{ item }}
            </span>

            <!-- Большая точка между надписями -->
            <span
              v-if="idx !== extendedItems.length - 1 || repeat !== 2"
              class="text-red-500 text-5xl leading-none mx-6"
            >
              •
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Массив из двух надписей, например:
   * ['ЧЕРНАЯ ПЯТНИЦА', '21–30 НОЯБРЯ']
   */
  items: string[]
}>()

// Сколько раз повторить твои надписи внутри ОДНОЙ логической группы
const REPEATS_PER_GROUP = 6

// Делаем длинный набор: [items, items, items, ...] × REPEATS_PER_GROUP
const extendedItems = computed(() => {
  const result: string[] = []
  for (let i = 0; i < REPEATS_PER_GROUP; i++) {
    result.push(...props.items)
  }
  return result
})
</script>

<style scoped>
/* Вся дорожка двигается целиком, внутри два одинаковых набора → без разрыва */
@keyframes ticker-move {
  0% {
    transform: translateX(0);
  }
  100% {
    /* сдвиг на половину длины (мы продублировали контент 2 раза) */
    transform: translateX(-50%);
  }
}

.ticker {
  width: max-content;
  animation: ticker-move 100s linear infinite;
}
</style>
