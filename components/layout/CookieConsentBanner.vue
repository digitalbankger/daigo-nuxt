<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCookie } from '#imports'

const CONSENT_VERSION = '2026-06-03'
const CONSENT_STORAGE_KEY = `daigo_cookie_consent:${CONSENT_VERSION}`
const LEGACY_STORAGE_KEY = 'daigo_cookie_consent'
const CONSENT_COOKIE_NAME = 'daigo_cookie_consent'
const CONSENT_TTL_DAYS = 365

const consentCookie = useCookie<string>(CONSENT_COOKIE_NAME, {
  default: () => '',
  maxAge: CONSENT_TTL_DAYS * 24 * 60 * 60,
  sameSite: 'lax',
  secure: import.meta.server ? true : window.location.protocol === 'https:',
  path: '/',
})

// Для нового посетителя баннер виден уже в SSR HTML. Раньше он появлялся
// только в onMounted и становился поздним LCP-элементом в Lighthouse.
const isVisible = ref(consentCookie.value !== 'accepted')

const consentPayload = computed(() => ({
  status: 'accepted',
  version: CONSENT_VERSION,
  acceptedAt: new Date().toISOString(),
}))

const hasConsent = () => {
  if (!process.client) return true

  return (
    consentCookie.value === 'accepted' ||
    localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted' ||
    localStorage.getItem(LEGACY_STORAGE_KEY) === 'accepted'
  )
}

const acceptCookies = () => {
  if (!process.client) return

  localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
  localStorage.setItem(LEGACY_STORAGE_KEY, 'accepted')
  localStorage.setItem(`${CONSENT_STORAGE_KEY}:meta`, JSON.stringify(consentPayload.value))
  consentCookie.value = 'accepted'
  isVisible.value = false
}

onMounted(() => {
  // Legacy localStorage поддерживаем, но новый посетитель больше не ждёт
  // hydration, чтобы увидеть баннер.
  isVisible.value = !hasConsent()
})
</script>

<template>
  <!-- fixed-позиционирование не требует Teleport. Так баннер попадает прямо в SSR DOM
       и не ждёт отдельного teleport/hydration шага перед первой отрисовкой. -->
  <section
    v-if="isVisible"
    class="fixed inset-x-0 bottom-0 z-[9999999999] px-3 pb-3 sm:px-5 sm:pb-5"
    aria-label="Согласие на обработку данных о посещениях"
  >
    <div
      class="mx-auto flex w-full max-w-[820px] items-center gap-3 rounded-2xl border border-black/10 bg-white px-3 py-2.5 shadow-[0_8px_28px_rgba(17,17,17,0.14)] sm:px-4 sm:py-3"
    >
      <p class="min-w-0 flex-1 text-[11px] leading-[1.35] text-[#49454F] sm:text-sm">
        Продолжая использовать сайт, вы соглашаетесь на обработку данных о посещениях согласно
        <NuxtLink to="/privacy" class="text-primary underline underline-offset-2 hover:text-textbtnhover">
          политике конфиденциальности
        </NuxtLink>.
      </p>

      <button
        type="button"
        class="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90 sm:h-10 sm:px-4 sm:text-sm"
        @click="acceptCookies"
      >
        Закрыть
      </button>
    </div>
  </section>
</template>
