<script setup lang="ts">
const { variant = 'solid' } = defineProps<{
  variant?: 'solid' | 'outline' | 'graybtn'
}>()

const baseClass = 'inline-flex items-center justify-center gap-2 px-4 py-2 h-12 rounded-lg text-base transition-all'

const variantClasses = computed(() => {
  switch (variant) {
    case 'graybtn':
      return 'bg-hoverbtn text-black hover:text-primary'
    case 'outline':
      return 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white'
    default:
      return 'bg-primary text-white hover:text-textbtnhover hover:bg-hoverbtn'
  }
})
</script>

<template>
  <button :class="[baseClass, variantClasses]">
    <slot name="icon" />
    <slot />
  </button>
</template>
