<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'
import Button from '@/components/ui/Button.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { activateVip } from '~/services/vipService'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  hasVipFlag: boolean // true — есть UTM/кука, false — показываем QR
}>()

const emit = defineEmits<{
  (e: 'activated'): void
}>()

// Получаем статус лояльности из профиля
const userStore = useUserStore()
const loyaltyStatus = computed(() => userStore.profile?.loyalty_status || 'none')

/* ====================== РЕЖИМ 1: ВВОД 6-ЗНАЧНОГО КОДА ====================== */

const codeDigits = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])

const code = computed(() => codeDigits.value.join(''))
const agree = ref(false)
const agreeError = ref('')
const canSubmit = computed(() => /^\d{6}$/.test(code.value) && agree.value)

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
  if (err.includes('user already has VIP status')) return 'У вас уже активирован VIP-статус.'
  if (err.includes('invalid VIP code')) return 'Код не найден. Проверьте правильность ввода.'
  if (err.includes('VIP code already used')) return 'Этот код уже был использован.'
  if (err.includes('retrieving user by DaigoID')) return 'Пользователь не найден.'
  if (err.includes('Failed to activate VIP code')) return 'Ошибка при активации кода. Попробуйте позже.'
  if (err.includes('Failed to update loyalty status')) return 'Ошибка при обновлении статуса. Попробуйте позже.'
  return err
}

async function submitCode() {
  if (!canSubmit.value || loading.value) return
  agreeError.value = agree.value ? '' : 'Нужно согласие с политикой'
  if (!agree.value) return

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

/* ====================== РЕЖИМ 2: СКАНЕР QR-КОДА ====================== */
/* ====================== РЕЖИМ 2: СКАНЕР QR-КОДА ====================== */

const videoRef = ref<HTMLVideoElement | null>(null)
const isScanning = ref(false)
const qrError = ref<string | null>(null)
let controls: any = null

async function startScan() {
  if (!process.client) return
  if (isScanning.value) return

  try {
    isScanning.value = true
    qrError.value = null

    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const reader = new BrowserMultiFormatReader()

    controls = await reader.decodeFromVideoDevice(
      undefined,
      videoRef.value!,
      (result, err, c) => {
        if (result) {
          // останавливаем камеру
          c.stop()
          controls = null
          isScanning.value = false

          const raw = result.getText() || ''

          if (!raw) {
            isSuccess.value = false
            modalText.value = 'QR-код считан, но ссылка пуста.'
            showModal.value = true
            return
          }

          // 1) если это валидный URL — просто переходим
          try {
            const url = new URL(raw)
            window.location.href = url.toString()
            return
          } catch {
            // невалидный URL — попробуем добавить https://
          }

          try {
            const fixed = 'https://' + raw.replace(/^\/+/, '')
            const url = new URL(fixed)
            window.location.href = url.toString()
            return
          } catch {
            // вообще не похоже на ссылку
            isSuccess.value = false
            modalText.value = 'QR-код считан, но не удалось распознать ссылку.'
            showModal.value = true
          }
        }
      }
    )
  } catch (e: any) {
    console.error('[vip-qr] scan error', e)
    isScanning.value = false
    qrError.value = 'Не удалось получить доступ к камере. Разрешите доступ в настройках браузера.'
  }
}

onBeforeUnmount(() => {
  if (controls) {
    controls.stop()
    controls = null
  }
})

</script>

<template>
  <section class="mt-8 p-4 sm:p-6 rounded-2xl bg-hoverbtn bg-primary/10 border border-primary">
    <h2 class="text-lg sm:text-xl font-medium mb-3">
      VIP-программа
    </h2>

    <!-- Если у пользователя уже VIP-статус, отображаем информацию -->
    <template v-if="loyaltyStatus === 'vip'">
      <p class="text-sm sm:text-base text-gray-700 mb-2">
        Вы VIP&nbsp;клиент
      </p>
      <p class="text-sm sm:text-base text-gray-700 mb-4">
        У вас автоматически применяется 10% скидка
      </p>
    </template>

    <!-- Есть VIP-метки → вводим код -->
    <template v-else-if="hasVipFlag">
      <p class="text-sm sm:text-base text-gray-700 mb-4">
        Введите 6-значный VIP-код, указанный на вашей карте.
      </p>

      <form class="space-y-4" @submit.prevent="submitCode">
        <div class="flex gap-2 sm:gap-3">
          <input
            v-for="(_, index) in codeDigits"
            :key="index"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="w-8 h-8 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-medium border rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-black/10 bg-white"
            v-model="codeDigits[index]"
            :ref="el => setInputRef(el as HTMLInputElement | null, index)"
            @input="onInput(index)"
            @keydown.backspace="onBackspace(index, $event)"
          />
        </div>

		<div class="space-y-1">
		  <BaseCheckbox v-model="agree" @click="agreeError = ''">
		    <span class="text-xs text-black/50">
		      Я согласен(на) с
		      <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
		      и
		      <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
		    </span>
		  </BaseCheckbox>
		  <p v-if="agreeError" class="text-xs text-red-600">{{ agreeError }}</p>
		</div>

        <Button type="submit" :disabled="!canSubmit || loading">
          <span v-if="!loading">Активировать VIP</span>
          <span v-else>Отправка…</span>
        </Button>
      </form>
    </template>

    <!-- Нет VIP-меток → QR-сканер -->
    <template v-else>
      <p class="text-sm sm:text-base text-gray-700 mb-4">
        Отсканируйте QR-код с вашей VIP-карты, чтобы активировать статус.
      </p>

      <div class="space-y-3">
        <div
          class="bg-black/5 rounded-2xl overflow-hidden aspect-video max-w-[360px] w-full mx-auto flex items-center justify-center relative"
        >
          <!-- Картинка-заглушка, пока сканер не запущен -->
          <img
            v-if="!isScanning"
            src="/images/qr.svg"
            alt="QR-код"
            class="w-32 h-32 opacity-60"
          />

          <!-- Видео с камеры поверх (или вместо) заглушки -->
          <video
            v-show="isScanning"
            ref="videoRef"
            class="w-full h-full object-cover"
            autoplay
            muted
            playsinline
          />
        </div>

        <p v-if="qrError" class="text-xs sm:text-sm text-red-500">
          {{ qrError }}
        </p>

        <div class="flex justify-center mt-2">
          <Button type="button" class="w-full" @click="startScan" :disabled="isScanning">
            <span v-if="!isScanning">Включить сканер</span>
            <span v-else>Сканируем…</span>
          </Button>
        </div>
      </div>
    </template>
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
