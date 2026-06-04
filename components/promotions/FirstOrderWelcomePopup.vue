<template>
  <UiModal
    :show="isOpen"
    :closable="false"
    panel-class="sm:max-w-[1120px] overflow-hidden !p-0 !bg-transparent !shadow-none"
    @close="closePopup"
  >
    <section class="summer-popup" aria-label="Скидка на первую покупку">
      <button
        type="button"
        class="summer-popup__close"
        aria-label="Закрыть попап"
        @click="closePopup"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div class="summer-popup__content">
        <h2 class="summer-popup__title font-haido font-bold">
          ЛЕТО — ЭТО НЕ ТОЛЬКО ОТДЫХ
        </h2>

        <div class="summer-popup__tags" aria-label="Летние факторы нагрузки">
          <span
            v-for="item in summerReasons"
            :key="item.label"
            class="summer-popup__tag font-haido"
          >
            <img :src="item.img" alt="" class="summer-popup__tag-icon" aria-hidden="true" />

            {{ item.label }}
          </span>
        </div>

        <p class="summer-popup__text font-haido">
          Множество летних проблем начинается с микробиома. Поддержите его вместе с Daigo!
        </p>

        <div class="summer-popup__coupon" aria-label="Промокод">
          -10% НА ПЕРВЫЙ ЗАКАЗ
        </div>

        <p
          v-if="message"
          class="summer-popup__message font-haido"
          :class="messageType === 'success' ? 'summer-popup__message--success' : 'summer-popup__message--error'"
        >
          {{ message }}
        </p>

        <div class="summer-popup__actions">
          <button
            type="button"
            class="summer-popup__button"
            :disabled="isProcessing"
            @click="applyCode"
          >
            {{ isProcessing ? 'ПРИМЕНЯЕМ…' : 'ПРИМЕНИТЬ' }}
          </button>

          <button
            type="button"
            class="summer-popup__button"
            :disabled="isProcessing"
            @click="copyCode"
          >
            СКОПИРОВАТЬ
          </button>
        </div>
      </div>

    </section>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import UiModal from '~/components/ui/UiModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'
import { useCartStore } from '~/stores/cartStore'
import { mayQuizService } from '~/services/mayQuizService'
import { useModalStore } from '~/stores/modalStore'

const PROMO_CODE = 'ЛЕТО10'
const STORAGE_KEY_PREFIX = 'leto10_first_order_popup_seen'

const summerReasons = [
  {
    label: 'Смена климата',
    img: '/images/promotions/1.svg',
  },
  {
    label: 'Нарушение пищеварения',
    img: '/images/promotions/2.svg',
  },
  {
    label: 'Обезвоживание и жара',
    img: '/images/promotions/3.svg',
  },
  {
    label: 'Аллергия и пыльца',
    img: '/images/promotions/4.svg',
  },
  {
    label: 'Пищевые отравления',
    img: '/images/promotions/5.svg',
  },
]

const heroImageCandidates = [
  '/images/promotions/leto10-popup-products.webp',
  '/images/promotions/leto10-popup-products.png',
  '/images/promotions/leto10-popup.webp',
  '/images/promotions/leto10-popup.png',
  '/images/promotions/summer-popup-products.webp',
  '/images/promotions/summer-popup-products.png',
  '/images/promotions/welcome-summer-products.webp',
  '/images/promotions/welcome-summer-products.png',
  '/images/group-products.webp',
]

const authStore = useAuthStore()
const userStore = useUserStore()
const cartStore = useCartStore()
const modalStore = useModalStore()

const isOpen = ref(false)
const isProcessing = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const checkedUserId = ref<string | null>(null)
const heroImageIndex = ref(0)

const heroImageSrc = computed(() => {
  if (heroImageIndex.value < 0) return ''
  return heroImageCandidates[heroImageIndex.value] || ''
})

function useNextHeroImage() {
  if (heroImageIndex.value < heroImageCandidates.length - 1) {
    heroImageIndex.value += 1
    return
  }

  heroImageIndex.value = -1
}

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
      messageType.value = 'success'
      heroImageIndex.value = 0
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
    await navigator.clipboard.writeText(PROMO_CODE)
    messageType.value = 'success'
    message.value = `Промокод ${PROMO_CODE} скопирован`
    markSeen()
  } catch {
    messageType.value = 'error'
    message.value = `Скопируйте промокод вручную: ${PROMO_CODE}`
  }
}

async function applyCode() {
  if (isProcessing.value) return
  isProcessing.value = true
  message.value = ''

  try {
    await cartStore.ensureLoaded()
    await cartStore.applyCoupon(PROMO_CODE)
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

<style scoped>
.summer-popup {
  position: relative;
  width: min(1120px, calc(100vw - 24px));
  min-height: 490px;
  overflow: hidden;
  border-radius: 30px;
  color: #fff;
  /* background:
    radial-gradient(circle at 14% 0%, rgba(255,255,255,0.34), transparent 36%),
    linear-gradient(180deg, rgba(20, 168, 211, 0.98) 0%, rgba(66, 190, 214, 0.85) 50%, rgba(250, 236, 204, 0.95) 75%, rgba(244, 223, 189, 1) 100%);
  */
  background-image: url('/images/promotions/leto10-popup-bg.jpg');
  background-size: cover;
  background-position: center;
}

.summer-popup__close {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 46px;
  line-height: 1;
  font-weight: 200;
  cursor: pointer;
  transition: opacity .2s ease;
}

.summer-popup__close:hover {
  opacity: .75;
}

.summer-popup__content {
  position: relative;
  z-index: 4;
  max-width: 90%;
  padding: 20px 46px 74px;
}

.summer-popup__title {
  margin: 0;
  font-size: clamp(38px, 5vw, 46px);
  line-height: 1.03;
  font-weight: 600;
  font-style: italic;
  letter-spacing: .04em;
  text-transform: uppercase;
  text-shadow: 0 4px 20px rgba(0,0,0,.12);
}

.summer-popup__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 930px;
  margin-top: 24px;
}

.summer-popup__tag {
  display: inline-flex;
  gap: 10px;
  min-height: 38px;
  padding: 6px 16px;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 7px;
  background: rgba(12, 146, 189, .18);
  color: #fff;
  font-size: clamp(14px, 1.7vw, 20px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: .02em;
  backdrop-filter: blur(2px);
}

.summer-popup__tag-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
}

.summer-popup__text {
  max-width: 470px;
  margin: 26px 0 26px;
  font-size: clamp(17px, 2vw, 18px);
  line-height: 1.45;
  font-weight: 500;
  font-style: italic;
  letter-spacing: .02em;
  text-shadow: 0 2px 12px rgba(0,0,0,.16);
}

.summer-popup__coupon {
  width: min(316px, 100%);
  margin-top: 34px;
  padding: 13px 18px;
  border-radius: 7px;
  background: rgba(255,255,255,.96);
  color: #20A1C5;
  text-align: center;
  font-size: clamp(17px, 2vw, 21px);
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: .03em;
  box-shadow: 0 12px 28px rgba(0,0,0,.08);
}

.summer-popup__message {
  max-width: 420px;
  margin: 14px 0 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,.92);
  font-size: 15px;
  line-height: 1.3;
}

.summer-popup__message--success {
  color: #20A1C5;
}

.summer-popup__message--error {
  color: #d92d20;
}

.summer-popup__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.summer-popup__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 150px;
  height: 50px;
  padding: 0 26px;
  border: 1.5px solid #20A1C5;
  border-radius: 7px;
  background: rgba(255,255,255,.18);
  color: #1597c1;
  font-size: 18px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: .01em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease, opacity .2s ease;
}

.summer-popup__button:hover:not(:disabled) {
  background: #20A1C5;
  color: #fff;
}

.summer-popup__button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.summer-popup__media {
  position: absolute;
  right: 20px;
  bottom: -6px;
  z-index: 3;
  width: min(50%, 560px);
  height: 72%;
  pointer-events: none;
}

.summer-popup__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: right bottom;
  filter: drop-shadow(0 18px 32px rgba(0,0,0,.16));
}

@media (max-width: 767px) {
  .summer-popup {
    min-height: auto;
    border-radius: 22px;
  }

  .summer-popup::after {
    height: 94px;
  }

  .summer-popup__close {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 36px;
  }

  .summer-popup__content {
    max-width: none;
    padding: 25px 15px 50px 25px;
  }
  .summer-popup {
    width: 100%;
  }
  .summer-popup__title {
    max-width: 330px;
    font-size: 31px;
    letter-spacing: .02em;
  }

  .summer-popup__tags {
    gap: 7px;
    margin-top: 18px;
  }

  .summer-popup__tag {
    min-height: 32px;
    padding: 5px 9px;
    font-size: 11px;
    border-radius: 6px;
    gap: 6px;
  }

  .summer-popup__tag-icon {
    width: 20px;
    height: 20px;
  }

  .summer-popup__text {
    max-width: 100%;
    margin-top: 26px;
    font-size: 15px;
  }

  .summer-popup__coupon {
    width: 245px;
    margin-top: 20px;
    padding: 11px 12px;
    font-size: 16px;
  }

  .summer-popup__actions {
    gap: 10px;
  }

  .summer-popup__button {
    min-width: 0;
    width: calc(50% - 5px);
    height: 44px;
    padding: 0 10px;
    font-size: 12px;
    background: rgba(255,255,255,.2);
  }

  .summer-popup__message {
    max-width: 285px;
    font-size: 13px;
  }

  .summer-popup__media {
    right: -14px;
    bottom: -8px;
    width: 74%;
    height: 160px;
  }
}
</style>
