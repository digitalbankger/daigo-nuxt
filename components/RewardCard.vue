<template>
  <button
    type="button"
    class="relative w-full bg-hoverbtn rounded-2xl md:rounded-3xl px-4 py-6 md:p-8 h-[360px] md:h-[480px] flex flex-row gap-2 md:gap-4 items-end md:!items-start text-left"
    @click="$emit('open', reward)"
  >
    <div class="relative overflow-hidden w-[30%] md:w-[45%] order-2 md:order-1 h-full flex items-end">
      <img
        v-if="reward.image"
        :src="reward.image"
        :alt="reward.name"
        class="w-full max-h-full object-contain rounded-xl sm:mb-auto"
        loading="lazy"
      />
    </div>

    <div class="w-[70%] md:w-[55%] flex flex-col order-1 md:order-2 h-full">
      <img
        v-if="reward.logo"
        :src="reward.logo"
        :alt="reward.name"
        class="max-w-[120px] h-auto mb-4"
        loading="lazy"
      />

      <div class="flex-1 min-h-0">
        <h3 class="text-base md:text-xl font-medium mb-4 sm:mb-4 leading-snug">
          {{ reward.name }}
        </h3>

        <!-- Обрезаем about -->
        <p class="text-xs md:text-base text-black/70 mb-6 line-clamp-4 md:line-clamp-5">
          {{ reward.about }}
        </p>

        <!-- Обрезаем description -->
        <p class="border-l-2 border-black ps-2 md:ps-4 text-sm md:text-base whitespace-pre-line line-clamp-3 md:line-clamp-4">
          {{ reward.description }}
        </p>
      </div>

      <div class="mt-4 text-xs md:text-sm text-black/60 underline">
        Читать полностью
      </div>

      <img
        src="/icons/arrow-up-right.svg"
        alt="arrow"
        class="absolute w-10 md:w-8 h-10 md:h-8 top-4 right-4"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
export type Reward = {
  image?: string
  name: string
  about: string
  description: string
  logo?: string
}

defineProps<{ reward: Reward }>()
defineEmits<{ (e: 'open', reward: Reward): void }>()
</script>