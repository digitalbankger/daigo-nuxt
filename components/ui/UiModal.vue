<script setup lang="ts">
defineProps<{
  show: boolean
  closable?: boolean
  modalClass?: string
}>()

defineEmits(['close'])
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      @click.self="$emit('close')"
    >
      <div
        class="rounded-xl p-6 max-w-[90vw] w-full sm:max-w-md shadow-lg relative bg-white"
        :class="modalClass"
      >
        <slot />
        <button
          v-if="closable !== false"
          @click="$emit('close')"
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
