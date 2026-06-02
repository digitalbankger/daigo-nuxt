<template>
  <UiModal
    :show="isOpen"
    panel-class="sm:max-w-[520px] overflow-hidden p-0"
    @close="closePopup"
  >
    <div class="relative overflow-hidden rounded-xl bg-white">
      <div class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10" />
      <div class="absolute -left-10 top-24 h-28 w-28 rounded-full bg-[#FFEBF1]" />

      <div class="relative p-6 sm:p-8 text-center">
        <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBF1] text-2xl">
          %
        </div>

        <h2 class="text-[28px] sm:text-[34px] leading-tight font-medium text-black">
          Скидка 10% на первую покупку
        </h2>

        <p class="mt-4 text-base sm:text-lg leading-snug text-black/60">
          Вы можете использовать промокод при первом заказе. Скопируйте его или примените сразу к корзине.
        </p>

        <div class="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-4">
          <div class="text-xs uppercase tracking-[0.2em] text-black/40">Промокод</div>
          <div class="mt-1 text-2xl sm:text-3xl font-medium tracking-[0.18em] text-primary">
            {{ WELCOME_CODE }}
          </div>
        </div>

        <p
          v-if="message"
          class="mt-4 text-sm sm:text-base"
          :class="messageType === 'success' ? 'text-primary' : 'text-[#D92D20]'"
        >
          {{ message }}
        </p>

        <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            type="button"
            :disabled="isProcessing"
            class="w-full sm:w-auto"
            @click="copyCode"
          >
            Скопировать промокод
          </Button>

          <Button
            variant="solid"
            type="button"
            :disabled="isProcessing"
            class="w-full sm:w-auto"
            @click="applyCode"
          >
            {{ isProcessing ? 'Применяем…' : 'Применить' }}
          </Button>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import UiModal from '~/components/ui/UiModal.vue'
import Button from '~/components/ui/Button.vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { useCartStore } from '~/stores/cartStore'
import { mayQuizService } from '~/services/mayQuizService'
import { useModalStore } from '~/stores/modalStore'

const WELCOME_CODE = 'WELCOME10'
const STORAGE_KEY_PREFIX = 'welcome10_first_order_popup_seen'

const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const modalStore = useModalStore()

const isOpen = ref(false)
const isProcessing = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const checkedUserId = ref<string | null>(null)

function getStorageKey() {
  return `${STORAGE_KEY_PREFIX}:${authStore.userId || 'unknown'}`
}

function markSeen() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(getStorageKey(), '1')
  } catch {}
}

function wasSeen() {
  if (!import.meta.client) return true
  try {
    return localStorage.getItem(getStorageKey()) === '1'
  } catch {
    return true
  }
}

async function getClientPhone() {
  let phone = String(userStore.profile?.phone_number || '').replace(/\D/g, '')
  if (phone) return phone

  if (!userStore.isLoaded) {
    try {
      await userStore.loadProfile()
    } catch {
      // Если профиль временно не загрузился, проверка нового клиента уйдёт без телефона.
    }
  }

  phone = String(userStore.profile?.phone_number || '').replace(/\D/g, '')
  return phone
}

async function maybeShowPopup() {
  if (!import.meta.client) return
  if (!authStore.isAuthenticated || !authStore.userId) return

  const uid = String(authStore.userId)
  if (checkedUserId.value === uid) return
  checkedUserId.value = uid

  if (wasSeen()) return

  try {
    const phone = await getClientPhone()
    const isNewClient = await mayQuizService.checkIsNewClient(authStore.token, phone)

    if (!isNewClient || wasSeen()) return

    await nextTick()
    window.setTimeout(() => {
      if (!authStore.isAuthenticated || wasSeen() || modalStore.isOpen) return
      message.value = ''
      isOpen.value = true
    }, 600)
  } catch (error) {
    console.warn('[FirstOrderWelcomePopup] client check failed', error)
  }
}

async function copyCode() {
  if (!import.meta.client) return

  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable')
    await navigator.clipboard.writeText(WELCOME_CODE)
    messageType.value = 'success'
    message.value = 'Промокод скопирован'
    markSeen()
  } catch {
    messageType.value = 'error'
    message.value = `Скопируйте промокод вручную: ${WELCOME_CODE}`
  }
}

async function applyCode() {
  if (isProcessing.value) return
  isProcessing.value = true
  message.value = ''

  try {
    await cartStore.ensureLoaded()
    await cartStore.applyCoupon(WELCOME_CODE)
    messageType.value = 'success'
    message.value = 'Промокод применён к корзине'
    markSeen()

    window.setTimeout(() => {
      isOpen.value = false
    }, 900)
  } catch (error: any) {
    const text = error?.message || 'Не удалось применить промокод'
    messageType.value = 'error'
    message.value = text
  } finally {
    isProcessing.value = false
  }
}

function closePopup() {
  markSeen()
  isOpen.value = false
}

watch(
  () => [authStore.isAuthenticated, authStore.userId] as const,
  () => {
    maybeShowPopup()
  },
  { immediate: true }
)
</script>
