<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: string | number | null | undefined
  placeholder?: string
  label?: string
  error?: string | boolean
  type?: 'text' | 'tel' | 'email' | 'number' | 'password'
  editable?: boolean
  mask?: 'ru-phone' | string
  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  name?: string
  autocomplete?: string
  inputmode?: 'text' | 'tel' | 'numeric' | 'email' | 'search' | 'url'
  maxlength?: number
  id?: string
  /** динамический фон, по умолчанию hoverbtn */
  background?: string
  
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'enter'): void
  (e: 'clear'): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const inner = computed<string>({
  get: () => (props.modelValue ?? '') as string,
  set: (val) => emit('update:modelValue', val)
})

const showError = computed(() => props.error !== '' && props.error !== false && props.error != null)
const errorText = computed(() => typeof props.error === 'string' ? props.error : (props.error === true ? 'Поле обязательно' : ''))


// значение по умолчанию для фона
const bgClass = computed(() => props.background || 'bg-hoverbtn')

onMounted(() => {
  if (props.autofocus && inputEl.value) inputEl.value.focus()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') emit('enter')
}

function clear() {
  if (props.readonly || props.disabled) return
  emit('update:modelValue', '')
  emit('clear')
  inputEl.value?.focus()
}

/** Маска российского номера: +7 (XXX) XXX-XX-XX */
function formatRuPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '')

  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d && d[0] !== '7') {
    if (d[0] === '9') d = '7' + d
    else d = '7' + d
  }

  d = d.slice(0, 11)

  const p = (i: number, j: number) => d.slice(i, j)
  const has = (n: number) => d.length > n

  let out = '+7'
  if (has(1)) out += ` (${p(1, 4)}`
  if (has(4)) out += `) ${p(4, 7)}`
  if (has(7)) out += `-${p(7, 9)}`
  if (has(9)) out += `-${p(9, 11)}`
  return out
}

watch(inner, (val) => {
  if (
    props.type === 'tel' &&
    (props.mask === 'ru-phone' || props.mask === undefined)
  ) {
    const formatted = formatRuPhone(String(val))
    if (formatted !== val) {
      emit('update:modelValue', formatted)
    }
  }
})

defineExpose({
  focus: () => inputEl.value?.focus()
})
</script>

<template>
  <div class="w-full group">
    <label
      v-if="label"
      class="block text-sm mb-1 text-gray-700"
      :for="id"
    >
      {{ label }}
    </label>

    <div
      :class="[
        'flex items-center w-full rounded-lg border transition px-4 h-order text-sm font-light tracking-wide',
        bgClass,
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text',
        isFocused ? 'border-primary ring-1 ring-primary' : 'border-gray-300',
        showError ? 'border-red-500 ring-red-300' : 'hover:border-primary/50'
      ]"
    >
      <slot name="left" />

      <input
        ref="inputEl"
        :id="id"
        :name="name"
        :type="type || 'text'"
        class="w-full outline-none placeholder-gray-400 border-none"
        :class="bgClass"
        :placeholder="placeholder"
        v-model="inner"
        :readonly="readonly"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode || (type === 'tel' ? 'tel' : undefined)"
        :maxlength="maxlength || (type === 'tel' ? 18 : undefined)"
        :aria-invalid="showError ? 'true' : 'false'"
        :aria-errormessage="showError ? (id ? id + '-error' : undefined) : undefined"
        @focus="isFocused = true; emit('focus')"
        @blur="isFocused = false; emit('blur')"
        @keydown="onKeydown"
      />

      <button
        v-if="inner && !readonly && !disabled"
        type="button"
        @click="clear"
        class="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Очистить"
      >
        ✕
      </button>

      <slot name="right" />
    </div>

    <p
      v-if="showError && errorText"
      :id="id ? id + '-error' : undefined"
      class="mt-1 text-sm text-red-600 flex items-center gap-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3m0 4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
        />
      </svg>
      {{ errorText }}
    </p>
  </div>
</template>

<style scoped>
.h-order {
  height: 52px;
}
</style>
