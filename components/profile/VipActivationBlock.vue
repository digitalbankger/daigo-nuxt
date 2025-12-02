<script setup lang="ts">
import { ref, computed } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import Button from '@/components/ui/Button.vue'
import { activateVip } from '~/services/vipService'

const emit = defineEmits<{
  (e: 'activated'): void
}>()

// 6 цифр кода
const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])

const code = computed(() => codeDigits.value.join(''))

const canSubmit = computed(() => /^\d{6}$/.test(code.value))

const loading = ref(false)
const showModal = ref(false)
const modalText = ref('')
const isSuccess = ref(false)

function setInputRef(el: HTMLInputElement | null, index: number) {
  inputRefs.value[index] = el
}

function onInput(index: number) {
  let val = codeDigits.value[index] || ''
  if (val.length > 1) {
    val = val.slice(-1)
    codeDigits.value[index] = val
  }

  if (val && index < inputRefs.value.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onBackspace(index: number, event: KeyboardEvent) {
  if (codeDigits.value[index]) return
  if (index > 0 && event.key === 'Backspace') {
    inputRefs.value[index - 1]?.focus()
  }
}

function mapError(err?: string) {
  if (!err) return 'Не удалось активировать VIP-статус. Попробуйте позже.'

  if (err.includes('user already has VIP status')) {
    return 'У вас уже активирован VIP-статус.'
  }
  if (err.includes('invalid VIP code')) {
    return 'Код не найден. Проверьте правильность ввода.'
  }
  if (err.includes('VIP code already used')) {
    return 'Этот код уже был использован.'
  }
  if (err.includes('retrieving user by DaigoID')) {
    return 'Пользователь не найден.'
  }
  if (err.includes('Failed to activate VIP code')) {
    return 'Ошибка при активации кода. Попробуйте позже.'
  }
  if (err.includes('Failed to update loyalty status')) {
    return 'Ошибка при обновлении статуса. Попробуйте позже.'
  }

  return err
}

async function onSubmit() {
  if (!canSubmit.value || loading.value) return

  try {
    loading.value = true
    const res = await activateVip(code.value)

    if (res.is_activated) {
      isSuccess.value = true
      modalText.value = 'VIP-статус успешно активирован!'
      emit('activated')
    } else {
      isSuccess.value = false
      modalText.value = mapError(res.err)
    }

    showModal.value = true
  } catch (e: any) {
    isSuccess.value = false
    modalText.value = mapError(e?.data?.err || e?.message)
    showModal.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="mt-8 p-4 sm:p-6 rounded-2xl bg-hoverbtn">
    <h2 class="text-lg sm:text-xl font-medium mb-3">
      Активация VIP-статуса
    </h2>
    <p class="text-sm sm:text-base text-gray-700 mb-4">
      Введите 6-значный VIP-код, указанный на вашей карте.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div class="flex gap-2 sm:gap-3">
        <input
          v-for="(_, index) in codeDigits"
          :key="index"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-10 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-medium border rounded-xl outline-none focus:ring-2 focus:ring-black/10"
          v-model="codeDigits[index]"
          :ref="el => setInputRef(el as HTMLInputElement | null, index)"
          @input="onInput(index)"
          @keydown.backspace="onBackspace(index, $event)"
        />
      </div>

      <Button
        type="submit"
        :disabled="!canSubmit || loading"
      >
        <span v-if="!loading">Активировать VIP</span>
        <span v-else>Отправка…</span>
      </Button>
    </form>

    <!-- Модалка результата -->
    <UiModal :show="showModal" :closable="true" @close="showModal = false">
      <div class="w-full max-w-sm text-center space-y-4">
        <h3 class="text-lg font-medium">
          {{ isSuccess ? 'Готово' : 'Не удалось активировать' }}
        </h3>
        <p class="text-sm sm:text-base text-gray-700 whitespace-pre-line">
          {{ modalText }}
        </p>
        <Button type="button" @click="showModal = false">
          Понятно
        </Button>
      </div>
    </UiModal>
  </section>
</template>
