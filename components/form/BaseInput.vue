<template>
  <div>
    <input
      :value="modelValue"
      @input="onInput"
      @blur="touched = true"
      :placeholder="placeholder"
      :class="[
        'w-full px-[15px] py-[16px] text-base rounded-md border placeholder-[#49454F/50]',
        'border-black/30',
        shouldShowError ? 'border-red-500' : '',
        inputClass
      ]"
    />
    <p v-if="shouldShowError" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  rules?: Array<(val: string) => true | string>
  inputClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const error = ref('')
const touched = ref(false)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}

const shouldShowError = computed(() => touched.value && !!error.value)

watch(
  () => props.modelValue,
  (val) => {
    if (props.rules?.length) {
      for (const rule of props.rules) {
        const result = rule(val)
        if (result !== true) {
          error.value = result
          return
        }
      }
    }
    error.value = ''
  },
  { immediate: true }
)
</script>
