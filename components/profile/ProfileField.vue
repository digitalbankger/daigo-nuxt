<!-- components/profile/ProfileField.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'

const props = defineProps<{
  label: string
  field: string
  value: string
  placeholder?: string
  type?: string
  validator?: (val: string) => string | null
}>()

const emit = defineEmits<{
  (e: 'save', field: string, value: string): void
}>()

const isEditing = ref(false)
const localValue = ref(props.value)
const error = ref<string | null>(null)

watch(() => props.value, (val) => {
  if (!isEditing.value) localValue.value = val
})

async function start() {
  isEditing.value = true
  error.value = null
  localValue.value = props.value
  await nextTick()
  // авто‑фокус на внутренний input UiInput, если поддерживает autofocus
  const el = document.getElementById(inputId()) as HTMLInputElement | null
  el?.focus?.()
  el?.select?.()
}

function cancel() {
  isEditing.value = false
  error.value = null
  localValue.value = props.value
}

function save() {
  if (props.validator) {
    const result = props.validator(localValue.value)
    if (result) {
      error.value = result
      return
    }
  }
  emit('save', props.field, localValue.value)
  isEditing.value = false
}

function clear() {
  localValue.value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    save()
  }
}

function inputId() {
  // уникальный id для связи label/input (и фокуса)
  return `pf-${props.field}`
}
</script>

<template>
  <div class="w-full">
    <!-- Режим просмотра -->
    <div
      v-if="!isEditing"
      class="flex items-center justify-between border border-gray-200 px-4 py-3 rounded-lg bg-hoverbtn h-order"
    >
      <span class="truncate" :title="props.value">{{ props.value }}</span>
      <button type="button" @click="start" aria-label="Редактировать">
        <img src="/icons/edit.svg" class="w-4 h-4" />
      </button>
    </div>

    <!-- Режим редактирования -->
    <div v-else>
      <label :for="inputId()" class="sr-only">{{ label }}</label>
      <UiInput
        :id="inputId()"
        v-model="localValue"
        :placeholder="props.placeholder || ''"
        :type="props.type || 'text'"
        :error="error || undefined"
        autofocus
        @keydown="onKeydown"
      />

      <!-- Кнопки ПОД инпутом -->
      <div class="mt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black/60 hover:bg-black/5"
          @click="cancel"
        >
          <img src="/icons/close.svg" alt="" class="w-4 h-4" />
          Отмена
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          @click="save"
        >
          <img src="/icons/check-white.svg" alt="" class="w-4 h-4" />
          ОК
        </button>
      </div>

      <!-- Сообщение об ошибке -->
      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.h-order { height: 52px; }
</style>
