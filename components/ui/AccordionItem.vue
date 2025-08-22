<template>
  <div class="border-b border-black/50">
    <button
      @click="toggle"
      class="w-full flex justify-between items-center pb-4 pt-6 px-2 text-xl focus:outline-none"
    >
      <span>{{ title }}</span>
      <img
        src="/icons/plus.svg"
        alt="раскрыть"
        class="w-8 h-8 transform transition-transform duration-300"
        :class="{ 'rotate-45': isOpen }"
      />
    </button>

    <transition name="accordion">
      <div
        v-show="isOpen"
        ref="content"
        class="overflow-hidden text-base text-black/70 px-2 transition-all duration-500"
      >
        <div class="pb-4 px-1">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
}>()

const isOpen = ref(false)
const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 500px;
  opacity: 1;
}
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.5s ease;
}
</style>
