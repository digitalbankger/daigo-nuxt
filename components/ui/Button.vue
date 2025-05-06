<template>
  <button 
    :class="[
      variant === 'graybtn' ? 'bg-hoverbtn px-4 py-2 h-12 text-base rounded-md transition-all' : '',
      variant === 'solid' ? 'bg-primary text-white hover:text-textbtnhover hover:bg-hoverbtn px-4 py-2 h-12 w-full text-base rounded-md transition-all' : '',
      variant === 'outline' ? 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white px-4 py-2 h-12 w-full text-base rounded-md transition-all' : ''
    ]"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'solid',
    validator: (value) => ['graybtn', 'solid', 'outline'].includes(value),
  }
});
</script>
