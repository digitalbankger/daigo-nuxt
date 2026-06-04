<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '~/components/ui/Button.vue'

const CONSENT_VERSION = '2026-06-03'
const CONSENT_STORAGE_KEY = `daigo_cookie_consent:${CONSENT_VERSION}`
const LEGACY_STORAGE_KEY = 'daigo_cookie_consent'
const CONSENT_COOKIE_NAME = 'daigo_cookie_consent'
const CONSENT_TTL_DAYS = 365

const isVisible = ref(false)

const consentPayload = computed(() => ({
  status: 'accepted',
  version: CONSENT_VERSION,
  acceptedAt: new Date().toISOString(),
}))

const readCookie = (name: string) => {
  if (!process.client) return ''

  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1] || ''
}

const setConsentCookie = () => {
  if (!process.client) return

  const maxAge = CONSENT_TTL_DAYS * 24 * 60 * 60
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie = `${CONSENT_COOKIE_NAME}=accepted; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`
}

const hasConsent = () => {
  if (!process.client) return true

  return (
    localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted' ||
    localStorage.getItem(LEGACY_STORAGE_KEY) === 'accepted' ||
    readCookie(CONSENT_COOKIE_NAME) === 'accepted'
  )
}

const acceptCookies = () => {
  if (!process.client) return

  localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
  localStorage.setItem(LEGACY_STORAGE_KEY, 'accepted')
  localStorage.setItem(`${CONSENT_STORAGE_KEY}:meta`, JSON.stringify(consentPayload.value))
  setConsentCookie()
  isVisible.value = false
}

onMounted(() => {
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
            <p class="font-semibold text-[#222]">Мы используем данные о посещениях</p>
            <p class="mt-1">
              Это помогает обеспечивать работу сайта, улучшать сервис и анализировать посещаемость.
              Нажимая «Принять», вы соглашаетесь на обработку данных о посещениях в соответствии с
              <NuxtLink to="/privacy" class="text-primary underline underline-offset-2 hover:text-textbtnhover">
                политикой конфиденциальности
              </NuxtLink>.
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <NuxtLink
              to="/privacy"
              class="hidden rounded-lg px-4 py-3 text-sm font-medium text-[#49454F] transition hover:text-primary sm:inline-flex"
            >
              Подробнее
            </NuxtLink>
            <Button class="w-full sm:w-auto" type="button" @click="acceptCookies">
              Принять
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
