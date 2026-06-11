<!-- components/checkout/InlineAuthCode.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{ phone: string }>()
const emit = defineEmits<{ (e: 'verified'): void; (e: 'change-phone'): void }>()

const auth = useAuthStore()

const code = ref<string[]>(['', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])
function setRef(el: HTMLInputElement | null, i: number) { if (el) inputs.value[i] = el }
function focus(i: number) { const el = inputs.value[i]; if (el) el.focus() }
const digits = (s: string) => s.replace(/\D/g, '')

function onInput(e: Event, i: number) {
  const el = e.target as HTMLInputElement
  const v = digits(el.value)
  if (!v) { code.value[i] = ''; return }
  if (v.length > 1) {
    const arr = v.slice(0, 4).split('')
    for (let k = 0; k < 4; k++) code.value[k] = arr[k] ?? ''
    focus(Math.min(3, arr.length - 1)); return
  }
  code.value[i] = v
  if (i < 3) focus(i + 1)
}
function onKeydown(e: KeyboardEvent, i: number) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Backspace' && !el.value && i > 0) {
    code.value[i - 1] = ''
    focus(i - 1)
    e.preventDefault()
  }
  if (e.key === 'ArrowLeft' && i > 0) { focus(i - 1); e.preventDefault() }
  if (e.key === 'ArrowRight' && i < 3) { focus(i + 1); e.preventDefault() }
}

const codeValue = computed(() => code.value.join(''))
const canSubmit = computed(() => codeValue.value.length === 4)

async function sendCode() {
  await auth.requestCode({ phone: props.phone, isRegister: false })
  setTimeout(() => focus(0), 0)
}
async function verify() {
  if (!canSubmit.value) return
  await auth.confirmCode(codeValue.value)
  emit('verified')
}

onMounted(() => {
  if (!auth.isCodeSent) sendCode(); else setTimeout(() => focus(0), 0)
})
</script>

<template>
  <div class="space-y-3">
    <div class="text-sm text-gray-600">{{ auth.deliveryHint }}</div>
    <div class="flex items-center gap-3">
      <input v-for="(_, i) in 4" :key="i"
             :ref="el => setRef(el, i)"
             :value="code[i]"
             @input="e => onInput(e, i)"
             @keydown="e => onKeydown(e as KeyboardEvent, i)"
             inputmode="numeric" autocomplete="one-time-code" maxlength="1"
             class="w-14 h-14 text-center text-xl rounded-xl border border-gray-300
                    focus:outline-none focus:ring-0 focus:border-black"/>
    </div>
    <div class="text-sm text-gray-600 space-x-4">
      <button type="button" class="underline" @click="$emit('change-phone')">Изменить номер</button>
      <button type="button" class="underline disabled:opacity-50" :disabled="auth.resendLeft>0" @click="auth.resendCode">
        Получить код голосом<span v-if="auth.resendLeft>0"> ({{ auth.resendLeft }})</span>
      </button>
    </div>
    <Button :variant="'solid'" class="w-full" type="button" :disabled="!canSubmit" @click="verify">Подтвердить</Button>
  </div>
</template>

<style scoped>
input:focus{ outline:none !important; box-shadow:none !important; }
</style>
