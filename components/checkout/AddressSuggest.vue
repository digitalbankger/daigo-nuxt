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
  modelValue: string | null | undefined
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

  /** как у UiInput */
  background?: string
  /** глушить автофилл и password-менеджеры */
  suppressAutofill?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'select', item: AddrItem): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'enter'): void
  (e: 'clear'): void
}>()

// ----- UI (совместимо с UiInput) -----
const inputEl = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const showError = computed(() => props.error !== '' && props.error !== false && props.error != null)
const errorText = computed(() => typeof props.error === 'string' ? props.error : (props.error === true ? 'Поле обязательно' : ''))
const bgClass = computed(() => props.background || 'bg-hoverbtn')

// ids/aria (стабильно, без SSR-рандома)
const baseId = computed(() => props.id || 'addr-input')
const listboxId = computed(() => `${baseId.value}-listbox`)

// ----- Значение + DaData -----
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
const input = ref<string>(normalize((props.modelValue ?? '') as string))
const open = ref(false)
const loading = ref(false)
const items = ref<AddrItem[]>([])
const hovered = ref(-1)
const lastSelected = ref<string>('')   // последняя строка, которая была выбрана через select()

const { address, cancel } = useDadata()

onMounted(() => {
  if (props.autofocus && inputEl.value) inputEl.value.focus()
})

watch(() => props.modelValue, v => {
  const val = normalize((v ?? '') as string)
  if (val !== input.value) input.value = val
})

// --- дебаунс 200ms + отмена предыдущего запроса ---
let t: number | undefined
watch([input, () => props.cityFiasId], ([q, fias]) => {
  const val = normalize(String(q || ''))
  emit('update:modelValue', val)

  if (t) { clearTimeout(t); t = undefined }
  if (!val) {
    items.value = []; open.value = false; return
  }
  if (lastSelected.value && val === lastSelected.value) {
    open.value = false; items.value = []; return
  }

  t = window.setTimeout(async () => {
    loading.value = true
    try {
      const data = await address(val, (fias as string | null) || undefined)
      items.value = data
      open.value = data.length > 0
      hovered.value = data.length ? 0 : -1
    } finally {
      loading.value = false
    }
  }, 200)
})

// ---- распарсить улицу/дом из ручного ввода (на случай без выбора подсказки)
function parseManual(v: string): AddrItem {
  const s = normalize(v)
  // эвристика: "ул. Пушкина, 10к2" / "Пушкина 10" / "Пушкина, 10"
  const m = s.match(/(.+?)[,\s]+(\d+[а-яА-Яa-zA-Z\-\/0-9]*)$/)
  const street = m ? normalize(m[1]) : (s || null)
  const house  = m ? normalize(m[2]) : null
  return {
    value: s,
    full: s,
    fias_id: null,
    postal_code: null,
    street,
    house,
    block: null,
    flat: null
  }
}

function select(i: number) {
  const it = items.value[i]
  if (!it) return
  cancel()
  lastSelected.value = normalize(String(it.value))
  input.value = lastSelected.value
  emit('update:modelValue', lastSelected.value)
  emit('select', it) // родитель подтянет street/house/etc
  open.value = false
  items.value = []
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (open.value && hovered.value >= 0) { e.preventDefault(); select(hovered.value) }
    else emit('enter')
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
  // даём выбрать мышкой
  setTimeout(() => {
    // если открыт список и есть ровно один вариант — выберем его
    if (open.value && items.value.length === 1) {
      select(0)
    } else {
      // если пользователь ничего не выбрал, но что-то ввёл — сгенерируем ручной select
      const val = normalize(input.value)
      if (val && val !== lastSelected.value) {
        const manual = parseManual(val)
        lastSelected.value = val
        emit('update:modelValue', val)
        emit('select', manual) // родитель обработает как обычный select
      }
    }
    open.value = false
  }, 120)
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

// ---- анти-автофилл: набор атрибутов для браузеров и менеджеров паролей ----
const suppress = computed(() => props.suppressAutofill !== false)
const safeAutocomplete = computed(() => {
  // если явно передан autocomplete — уважаем его, иначе выключаем
  if (props.autocomplete != null) return props.autocomplete
  return suppress.value ? 'off' : undefined
})
const safeName = computed(() => {
  // нейтральное имя, чтобы менеджеры паролей/автофилла реже цеплялись
  return props.name || (suppress.value ? 'addr_input' : undefined)
})

// трик для iOS/Safari: кратковременно держим readonly, снимаем на фокусе
const antiReadonly = ref(false)
onMounted(() => { if (suppress.value) antiReadonly.value = true })
function handleFocus(e: FocusEvent) {
  if (suppress.value && antiReadonly.value) {
    // снять readonly в следующий тик
    setTimeout(() => { antiReadonly.value = false }, 0)
  }
  onFocus()
}
</script>

<template>
  <div class="w-full group relative">
    <label v-if="label" class="block text-sm mb-1 text-gray-700" :for="baseId">
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
        :id="baseId"
        :name="safeName"
        type="text"
        class="w-full outline-none placeholder-gray-400 border-none"
        :class="bgClass"
        :placeholder="placeholder || 'Улица и дом'"
        :value="input"
        @input="(e:any)=> input = normalize(e.target.value)"
        :readonly="readonly || antiReadonly"
        :disabled="disabled"
        :autocomplete="safeAutocomplete"
        :inputmode="inputmode || 'text'"
        :maxlength="maxlength"
        :aria-invalid="showError ? 'true' : 'false'"
        :aria-errormessage="showError ? (baseId + '-error') : undefined"
        aria-autocomplete="list"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="listboxId"
        spellcheck="false"
        autocapitalize="off"
        enterkeyhint="done"
        :data-lpignore="suppress ? 'true' : null"
        :data-1p-ignore="suppress ? 'true' : null"
        :data-bwignore="suppress ? 'true' : null"
        :data-bitwarden-watching="suppress ? 'false' : null"
        data-form-type="other"
        @focus="handleFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="ml-2 text-gray-400 text-sm select-none">…</div>

      <!-- Кнопка очистки -->
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
      :id="listboxId"
      class="absolute left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-[2147483647] pointer-events-auto"
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

    <!-- Ошибка -->
    <p
      v-if="showError && errorText"
      :id="baseId + '-error'"
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
