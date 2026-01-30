<!-- components/profile/ProfileField.vue -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'

const props = defineProps<{
  label: string
  field: string
  value: string | null | undefined
  placeholder?: string
  type?: string
  validator?: (val: string) => string | null
}>()

const emit = defineEmits<{
  (e: 'save', field: string, value: string): void
}>()

const isEditing = ref(false)
const error = ref<string | null>(null)
const localValue = ref<string>('')

function isZeroDateISO(s: string) {
  return s === '0001-01-01' || s === '01-01-0001' || s === '1-1-1'
}

function normalizeRaw(v: string | null | undefined) {
  const s = String(v ?? '').trim()
  if (!s) return ''
  if (isZeroDateISO(s)) return ''
  return s
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toDisplayDate(iso: string) {
  // iso: YYYY-MM-DD -> DD.MM.YYYY
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  const [, y, mm, dd] = m
  return `${dd}.${mm}.${y}`
}

function toISODate(input: string) {
  // принимает:
  // - YYYY-MM-DD (из input type=date)
  // - DD.MM.YYYY
  // - DD-MM-YYYY
  // возвращает YYYY-MM-DD или '' если невалидно/пусто
  const s = String(input ?? '').trim()
  if (!s) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  const m1 = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (m1) {
    const [, dd, mm, y] = m1
    return `${y}-${mm}-${dd}`
  }

  const m2 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (m2) {
    const [, dd, mm, y] = m2
    return `${y}-${mm}-${dd}`
  }

  return ''
}

function isValidISODate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [y, m, d] = iso.split('-').map(Number)
  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  // проверка "переполнений" (например 2025-02-31)
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  )
}

function normalizeForInput(v: string | null | undefined) {
  const raw = normalizeRaw(v)
  if (!raw) return ''

  if ((props.type || 'text') === 'date') {
    // в input type=date нужно ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
    // если вдруг пришло DD.MM.YYYY — конвертим
    const iso = toISODate(raw)
    return iso || ''
  }

  return raw
}

function displayValue(v: string | null | undefined) {
  const raw = normalizeRaw(v)
  if (!raw) return ''
  if ((props.type || 'text') === 'date') {
    // в просмотре показываем DD.MM.YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return toDisplayDate(raw)
    return raw
  }
  return raw
}

const isEmpty = computed(() => !displayValue(props.value))

const displayText = computed(() => {
  const v = displayValue(props.value)
  return v || (props.placeholder || '')
})

watch(
  () => props.value,
  (val) => {
    if (!isEditing.value) localValue.value = normalizeForInput(val)
  },
  { immediate: true }
)

async function start() {
  isEditing.value = true
  error.value = null
  localValue.value = normalizeForInput(props.value)
  await nextTick()
  const el = document.getElementById(inputId()) as HTMLInputElement | null
  el?.focus?.()
  el?.select?.()
}

function cancel() {
  isEditing.value = false
  error.value = null
  localValue.value = normalizeForInput(props.value)
}

function save() {
  let v = String(localValue.value ?? '').trim()

  // спец-логика даты
  if ((props.type || 'text') === 'date') {
    const iso = toISODate(v)
    if (iso && !isValidISODate(iso)) {
      error.value = 'Некорректная дата'
      return
    }
    v = iso // либо '', если пусто/не распознано
  }

  if (props.validator) {
    const result = props.validator(v)
    if (result) {
      error.value = result
      return
    }
  }

  emit('save', props.field, v)
  isEditing.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancel()
  }
  if (e.key === 'Enter') {
    // для date input Enter часто не нужен, но оставим
    e.preventDefault()
    save()
  }
}

function inputId() {
  return `pf-${props.field}`
}
</script>

<template>
  <div class="w-full">
    <!-- Просмотр -->
    <div
      v-if="!isEditing"
      class="flex items-center justify-between border border-gray-200 px-4 py-3 rounded-lg bg-hoverbtn h-order"
    >
      <span
        class="truncate"
        :class="isEmpty ? 'text-black/30' : ''"
        :title="displayText"
      >
        {{ displayText }}
      </span>

      <button type="button" @click="start" aria-label="Редактировать">
        <img src="/icons/edit.svg" class="w-4 h-4" />
      </button>
    </div>

    <!-- Редактирование -->
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

      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.h-order { height: 52px; }
</style>
