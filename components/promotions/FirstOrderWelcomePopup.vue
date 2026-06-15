<template>
  <UiModal
    :show="isOpen"
    :closable="false"
    panel-class="overflow-hidden !p-0 !bg-transparent !shadow-none"
    @close="closePopup"
  >
    <section class="summer-popup mx-auto" aria-label="Летняя акция Daigo">
      <button
        type="button"
        class="summer-popup__close"
        aria-label="Закрыть попап"
        @click="closePopup"
      >
        <span aria-hidden="true">×</span>
      </button>

      <div class="summer-popup__content">
        <div class="summer-popup__top">
          <h2 class="summer-popup__title font-haido">
            Начните лето с заботы <span class="summer-popup__subtitle font-haido">
            о здоровье!
          </span>
          </h2>


        <div class="mt-[10px] md:mt-[15px] pt-4 flex flex-wrap items-center gap-x-[1.4rem] md:gap-x-[1.9rem] gap-y-2 sm:mt-7">
          <img src="localhost:3000/public/images/articles/summer/20.png" alt="Лето - это не только отдых" class="h-[60px] sm:h-[82px] w-auto" />

          <div class="max-w-[190px] text-[clamp(24px,3vw,40px)] font-haido font-light uppercase leading-[1.05]">
            на все<br />
            заказы
          </div>
        </div>
          <NuxtLink
  to="/catalog"
  class="summer-popup__button font-haido mt-7"
  @click="handleCatalogClick"
>
  Перейти к покупкам
</NuxtLink>
        </div>
        

        <div class="summer-popup__bottom">
          <p class="summer-popup__period font-haido">
            Акция действует в период с 15 по 19 июня
          </p>

        </div>
      </div>
    </section>
  </UiModal>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UiModal from '~/components/ui/UiModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useModalStore } from '~/stores/modalStore'

const MAIN_TRIGGER_KEY = 'leto20_popup_main_shown_v1'
const EXIT_TRIGGER_KEY = 'leto20_popup_exit_shown_v1'
const CONVERTED_KEY = 'leto20_popup_converted_v1'
const OPEN_DELAY_MS = 7_000
const REQUIRED_SCROLL_PROGRESS = 0.4

const authStore = useAuthStore()
const modalStore = useModalStore()

const isOpen = ref(false)
const hasSpentEnoughTime = ref(false)
const hasScrolledEnough = ref(false)
const wasClosedByUser = ref(false)

let openDelayTimer: ReturnType<typeof window.setTimeout> | null = null

function getSessionFlag(key: string) {
  if (!import.meta.client) return false

  try {
    return window.sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function setSessionFlag(key: string) {
  if (!import.meta.client) return

  try {
    window.sessionStorage.setItem(key, '1')
  } catch {
    // Если sessionStorage недоступен, попап всё равно должен работать в текущей вкладке.
  }
}

function isDesktopExitIntentAvailable() {
  if (!import.meta.client) return false

  return window.innerWidth >= 1024
    && Boolean(window.matchMedia?.('(hover: hover) and (pointer: fine)').matches)
}

function canOpenPopup() {
  if (!import.meta.client) return false
  if (isOpen.value) return false
  if (modalStore.isOpen) return false
  if (authStore.isAuthModalOpen) return false
  if (getSessionFlag(CONVERTED_KEY)) return false

  return true
}

async function openPopup(source: 'main' | 'exit') {
  if (!canOpenPopup()) return

  if (source === 'main') {
    if (getSessionFlag(MAIN_TRIGGER_KEY)) return
    setSessionFlag(MAIN_TRIGGER_KEY)
  }

  if (source === 'exit') {
    if (!wasClosedByUser.value) return
    if (!isDesktopExitIntentAvailable()) return
    if (getSessionFlag(EXIT_TRIGGER_KEY)) return
    setSessionFlag(EXIT_TRIGGER_KEY)
  }

  await nextTick()
  isOpen.value = true
}

function getScrollProgress() {
  if (!import.meta.client) return 0

  const documentElement = document.documentElement
  const scrollTop = window.scrollY || documentElement.scrollTop || 0
  const maxScroll = Math.max(0, documentElement.scrollHeight - window.innerHeight)

  if (maxScroll <= 0) return 1

  return Math.min(1, scrollTop / maxScroll)
}

function checkMainPopupTrigger() {
  if (!hasSpentEnoughTime.value || !hasScrolledEnough.value) return

  void openPopup('main')
}

function handleScroll() {
  if (hasScrolledEnough.value) return

  hasScrolledEnough.value = getScrollProgress() >= REQUIRED_SCROLL_PROGRESS
  checkMainPopupTrigger()
}

function handleExitIntent(event: MouseEvent) {
  if (event.clientY > 0) return

  void openPopup('exit')
}

function markConverted() {
  setSessionFlag(CONVERTED_KEY)
  wasClosedByUser.value = false
}
function handleCatalogClick() {
  markConverted()
  isOpen.value = false
}
function closePopup() {
  wasClosedByUser.value = true
  isOpen.value = false
}

watch(
  () => [modalStore.isOpen, authStore.isAuthModalOpen] as const,
  ([isMessageModalOpen, isAuthOpen]) => {
    if (!isMessageModalOpen && !isAuthOpen) checkMainPopupTrigger()
  }
)

onMounted(() => {
  if (!import.meta.client) return

  openDelayTimer = window.setTimeout(() => {
    hasSpentEnoughTime.value = true
    checkMainPopupTrigger()
  }, OPEN_DELAY_MS)

  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.documentElement.addEventListener('mouseleave', handleExitIntent)
})

onBeforeUnmount(() => {
  if (!import.meta.client) return

  if (openDelayTimer) {
    window.clearTimeout(openDelayTimer)
    openDelayTimer = null
  }

  window.removeEventListener('scroll', handleScroll)
  document.documentElement.removeEventListener('mouseleave', handleExitIntent)
})
</script>

<style scoped>
.summer-popup {
position: relative;
    width: min(840px, calc(100vw - 24px));
    min-height: min(750px, calc(100vh - 24px));
    overflow: hidden;
    border-radius: 15px;
    color: #fff;
    background-image: linear-gradient(180deg, rgba(22, 166, 211, .22) 0%, rgba(22, 166, 211, .04) 44%, rgba(255, 255, 255, 0) 70%), url(/images/promotions/leto10-popup-bg.jpg);
    background-size: cover;
    background-position: center bottom;
    background-position-x: 80%;
    box-shadow: 0 24px 70px rgba(0, 0, 0, .25);
}

.summer-popup__close {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  background: rgba(15, 125, 170, .18);
  color: #fff;
  font-size: 40px;
  line-height: 1;
  font-weight: 200;
  cursor: pointer;
  transition: opacity .2s ease, background-color .2s ease;
}

.summer-popup__close:hover {
  opacity: .82;
  background: rgba(15, 125, 170, .28);
}

.summer-popup__content {
  position: relative;
  z-index: 4;
  display: flex;
  min-height: inherit;
  flex-direction: column;
  justify-content: space-between;
  padding: 34px 30px 24px;
}

.summer-popup__title {
  margin: 0;
  font-size: clamp(28px, 5vw, 52px);
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: .01em;
  text-transform: uppercase;
}

.summer-popup__subtitle {
  margin: 2px 0 0;
  font-size: clamp(28px, 5vw, 52px);
  line-height: 1.2;
  font-weight: 300;
  font-style: italic;
  letter-spacing: .01em;
  text-transform: uppercase;
  text-shadow: 0 4px 18px rgba(0,0,0,.10);
}

.summer-popup__discount {
  display: flex;
  align-items: flex-start;
  gap: 26px;
  margin-top: 22px;
}

.summer-popup__discount-value {
  font-size: clamp(72px, 13vw, 118px);
  line-height: .82;
  font-weight: 600;
  letter-spacing: -.06em;
  text-shadow: 0 4px 18px rgba(0,0,0,.10);
}

.summer-popup__discount-text {
  padding-top: 12px;
  font-size: clamp(28px, 5.2vw, 52px);
  line-height: .92;
  font-weight: 300;
  font-style: italic;
  letter-spacing: .01em;
  text-transform: uppercase;
  text-shadow: 0 4px 18px rgba(0,0,0,.10);
}

.summer-popup__bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.summer-popup__period {
  margin: 0;
  color: #1B96CE;
  font-size: clamp(19px, 3.4vw, 32px);
  line-height: 1.05;
  font-weight: 500;
  letter-spacing: .01em;
  text-transform: uppercase;
}

.summer-popup__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 28px;
  border-radius: 9px;
  background: linear-gradient(90deg, #1991B7 0%, #86C4D7 100%);
  color: #fff;
  font-size: 17px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: .01em;
  text-transform: uppercase;
  box-shadow: 0 10px 22px rgba(0,0,0,.14);
  transition: filter .2s ease, transform .2s ease;
}

.summer-popup__button:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

@media (max-width: 767px) {
  .summer-popup {
    width: min(90%, calc(100vw - 20px));
    min-height: min(500px, calc(100vh - 20px));
    background-position: 55% bottom;
  }

  .summer-popup__close {
    top: 8px;
    right: 8px;
    width: 34px;
    height: 34px;
    font-size: 34px;
  }

  .summer-popup__content {
    padding: 24px 18px 18px;
  }

  .summer-popup__discount {
    gap: 14px;
    margin-top: 18px;
  }

  .summer-popup__discount-text {
    padding-top: 8px;
  }

  .summer-popup__bottom {
    gap: 12px;
  }

  .summer-popup__button {
    min-height: 46px;
    padding: 12px 20px;
    font-size: 15px;
  }
  .summer-popup__period {
    margin: 0;
    color: #1B96CE;
    font-size: clamp(16px, 2.4vw, 32px);
    line-height: 1.05;
    font-weight: 600;
    letter-spacing: .01em;
    text-transform: uppercase;
  }
}
</style>
