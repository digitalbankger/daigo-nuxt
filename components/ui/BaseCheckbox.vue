<template>
  <label
    class="inline-flex items-center cursor-pointer gap-2 select-none"
    role="checkbox"
    tabindex="0"
    :aria-checked="modelValue"
    @click="onRootClick"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <div
      class="relative w-6 h-6 xs:w-5 xs:h-5 aspect-square shrink-0 border rounded-sm flex items-center justify-center transition-all duration-300"
      :class="[{ 'bg-transparent': modelValue }, props.error ? 'border-red-500' : 'border-black']"
    >
      <svg
        v-if="modelValue"
        class="w-4 h-4 stroke-black"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>

    <slot />
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  error?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}

function onRootClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null

  if (target?.closest('a, button')) {
    return
  }

  toggle()
}
</script>
