<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCookie } from '#imports'
import Button from '~/components/ui/Button.vue'

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
  <Teleport to="body">
    <Transition name="cookie-banner">
      <section
        v-if="isVisible"
        class="fixed inset-x-0 bottom-0 z-[9999999999] px-3 pb-3 sm:px-5 sm:pb-5"
        aria-label="Согласие на обработку данных о посещениях"
      >
        <div class="mx-auto flex w-full max-w-[1180px] flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_12px_40px_rgba(17,17,17,0.16)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div class="max-w-[860px] text-sm leading-relaxed text-[#49454F] sm:text-base">
            <p>
              Продолжая использовать сайт, вы соглашаетесь на обработку данных о посещениях,
              необходимых для работы сайта, улучшения сервиса и анализа посещаемости, в соответствии с
              <NuxtLink to="/privacy" class="text-primary underline underline-offset-2 hover:text-textbtnhover">
                политикой конфиденциальности
              </NuxtLink>.
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <Button class="w-full sm:w-auto" type="button" @click="acceptCookies">
              Закрыть
            </Button>
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.cookie-banner-enter-from,
.cookie-banner-leave-to {
  opacity: 0;
  transform: translateY(18px);
}
</style>
