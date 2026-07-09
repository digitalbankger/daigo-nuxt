<script setup lang="ts">
import { computed } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
const props = defineProps<{
  show: boolean
  closable?: boolean
  closeOnOverlay?: boolean
  panelClass?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isScrollLocked = computed(() => Boolean(props.show))
useBodyScrollLock(isScrollLocked)
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[99999] overflow-y-auto bg-black/40 flex items-start justify-center px-4 py-6 sm:items-center"
      @click.self="props.closeOnOverlay !== false && emit('close')"
    >
      <div
        :class="[
          'bg-white rounded-xl p-6 max-w-[90vw] w-full shadow-lg relative',
          props.panelClass ?? 'sm:max-w-md'
        ]"
      >
        <slot />
        <button
          v-if="closable !== false"
          @click="emit('close')"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>