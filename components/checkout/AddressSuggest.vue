<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useDadata } from '@/composables/useDadata'

type AddrItem = {
  value: string
  full: string
  fias_id: string | null
  postal_code: string | null
  street: string | null
  house: string | null
  block: string | null
  flat: string | null
}

const props = defineProps<{
  /** РЕКОМЕНДУЕТСЯ привязывать к address_line */
  modelValue: string | null | undefined
  /** FIAS выбранного города для сужения поиска */
  cityFiasId?: string | null

  placeholder?: string
  label?: string
  error?: string | boolean

  disabled?: boolean
  readonly?: boolean
  autofocus?: boolean
  name?: string
  autocomplete?: string
  inputmode?: 'text' | 'tel' | 'numeric' | 'email' | 'search' | 'url'
  maxlength?: number
  id?: string

  /** динамический фон, по умолчанию hoverbtn — как у UiInput */
  background?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'select', item: AddrItem): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'enter'): void
  (e: 'clear'): void
}>()

// ----- UI состояние (в точности как UiInput) -----
const inputEl = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const showError = computed(() => props.error !== '' && props.error !== false && props.error != null)
const errorText = computed(() =>
  typeof props.error === 'string' ? props.error : (props.error === true ? 'Поле обязательно' : '')
)
const bgClass = computed(() => props.background || 'bg-hoverbtn')

// ----- Значение инпута + DaData -----
const input = ref<string>((props.modelValue ?? '') as string)
const open = ref(false)
const loading = ref(false)
const items = ref<AddrItem[]>([])
const hovered = ref(-1)
const lastSelected = ref<string>('')

const { address, cancel } = useDadata()

onMounted(() => {
  if (props.autofocus && inputEl.value) inputEl.value.focus()
})

watch(() => props.modelValue, v => {
  const val = (v ?? '') as string
  if (val !== input.value) input.value = val
})

watch([input, () => props.cityFiasId], async ([q, fias]) => {
  emit('update:modelValue', (q as string) ?? '')
  const trimmed = String(q || '').trim()

  if (!trimmed) {
    items.value = []
    open.value = false
    return
  }

  // если только что выбрали — не дёргаем снова
  if (lastSelected.value && trimmed === lastSelected.value) {
    open.value = false
    items.value = []
    return
  }

  loading.value = true
  try {
    const data = await address(trimmed, fias || undefined)
    items.value = data
    open.value = data.length > 0
    hovered.value = data.length ? 0 : -1
  } finally {
    loading.value = false
  }
})

function select(i: number) {
  const it = items.value[i]
  if (!it) return

  cancel()
  lastSelected.value = String(it.value).trim()

  input.value = it.value                 // показываем полную строку
  emit('update:modelValue', it.value)    // v-model = address_line
  emit('select', it)

  open.value = false
  items.value = []
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (open.value && hovered.value >= 0) {
      e.preventDefault()
      select(hovered.value)
    } else {
      emit('enter')
    }
  }
  if (!open.value) return
  if (e.key === 'ArrowDown') { e.preventDefault(); hovered.value = Math.min(hovered.value + 1, items.value.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); hovered.value = Math.max(hovered.value - 1, 0) }
  if (e.key === 'Escape')    { e.preventDefault(); open.value = false }
}

function onFocus() {
  isFocused.value = true
  emit('focus')
  if (items.value.length && input.value.trim() !== lastSelected.value) open.value = true
}
function onBlur() {
  isFocused.value = false
  emit('blur')
  setTimeout(() => { open.value = false }, 120) // даём выбрать пункт мышкой
}

function clear() {
  if (props.readonly || props.disabled) return
  input.value = ''
  lastSelected.value = ''
  items.value = []
  open.value = false
  emit('update:modelValue', '')
  emit('clear')
  inputEl.value?.focus()
}
</script>

<template>
  <div class="w-full group relative">
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
        type="text"
        class="w-full outline-none placeholder-gray-400 border-none"
        :class="bgClass"
        :placeholder="placeholder || 'Улица и дом'"
        :value="input"
        @input="(e:any)=> input = e.target.value"
        :readonly="readonly"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :aria-invalid="showError ? 'true' : 'false'"
        :aria-errormessage="showError ? (id ? id + '-error' : undefined) : undefined"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        aria-autocomplete="list"
      />

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="ml-2 text-gray-400 text-sm select-none">…</div>

      <!-- Кнопка очистки — как у UiInput -->
      <button
        v-if="input && !readonly && !disabled"
        type="button"
        @click="clear"
        class="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Очистить"
      >
        ✕
      </button>

      <slot name="right" />
    </div>

    <!-- Выпадающий список -->
    <ul
      v-if="open && items.length"
      class="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-[10000]"
      role="listbox"
    >
      <li
        v-for="(it, idx) in items"
        :key="it.full + idx"
        :class="['px-3 py-2 cursor-pointer hover:bg-gray-50', hovered===idx && 'bg-gray-50']"
        @mouseenter="hovered = idx"
        @mousedown.prevent="select(idx)"
        role="option"
      >
        <div class="text-sm">{{ it.value }}</div>
        <div class="text-xs text-gray-500" v-if="it.postal_code">Индекс: {{ it.postal_code }}</div>
      </li>
    </ul>

    <!-- Ошибка как в UiInput -->
    <p
      v-if="showError && errorText"
      :id="id ? id + '-error' : undefined"
      class="mt-1 text-sm text-red-600 flex items-center gap-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"/>
      </svg>
      {{ errorText }}
    </p>
  </div>
</template>

<style scoped>
.h-order { height: 52px; }
</style>
