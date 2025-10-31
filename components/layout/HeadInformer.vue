<template>
  <div v-if="ui.isHeadInformerVisible"
       class="fixed top-0 left-0 right-0 z-[60] w-full bg-primary text-white"
       aria-label="Информер со ссылкой на каталог">
    <div class="relative flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">

      <!-- DESKTOP -->
      <NuxtLink
        to="/catalog"
        class="hidden sm:flex items-center gap-3 w-full justify-center uppercase tracking-wide hover:bg-primary/90 transition duration-300"
        @click="sendInformerGoal"
      >
        <img
          src="/icons/sale.svg"
          alt="sale"
          class="w-8 h-8 p-0.5 bg-[#9AFF9F] rounded-lg"
          loading="lazy"
        />
        <span class="text-sm sm:text-lg font-normal">Daigo дарит подарки - получить уже сейчас!</span>
      </NuxtLink>

      <!-- MOBILE -->
      <div class="flex flex-col items-center gap-2 w-full justify-center sm:hidden uppercase">
        <span class="text-sm sm:text-lg font-normal">Daigo дарит подарки</span>
        <NuxtLink
          to="/catalog"
          class="sm:hidden inline-flex items-center justify-center gap-2 bg-[#9AFF9F] text-black rounded-lg py-1.5 px-4 text-sm uppercase transition hover:bg-[#7EFF7E]"
          @click="sendInformerGoal"
        >
          <span>Получить уже сейчас</span>
          <img
            src="/icons/sale.svg"
            alt="sale"
            class="w-5 h-5"
            loading="lazy"
          />
        </NuxtLink>
      </div>

      <!-- CLOSE BUTTON -->
      <button
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-5 sm:w-7 h-5 sm:h-7 rounded-full text-black/90 hover:text-black/60 bg-white"
        aria-label="Скрыть информер"
        @click="close"
      >
        <svg viewBox="0 0 24 24" class="w-3 sm:w-4 h-3 sm:h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'

const ui = useUiStore()
const { reach } = useAnalytics()

const sendInformerGoal = () => {
  reach('informer-click')
}

const close = () => ui.closeHeadInformer()
</script>
