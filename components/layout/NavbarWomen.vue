<template>
  <nav
    class="py-2 relative transition-[margin] duration-200 z-50"
  >
    <!-- TOP BAR: только лого + бургер -->
    <div class="w-full flex items-center justify-between py-2 px-0 sm:px-2">
      <NuxtLink to="/" aria-label="Главная" @click="closeMenu">
        <img src="/logo.svg" alt="daigo logo" class="h-8 md:h-10 xl:h-12" />
      </NuxtLink>

      <button
        type="button"
        class="inline-flex items-center justify-center w-11 h-11 rounded-xl backdrop-blur transition text-black"
        aria-label="Меню"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        @click="toggleMenu"
      >
        <!-- burger / close -->
        <svg v-if="!isMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- POPUP MENU -->
    <Teleport to="body">
      <div v-if="isMenuOpen" class="fixed inset-0 z-[9999]">
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/35" @click.self="closeMenu" />

        <!-- panel -->
        <div
          class="absolute right-0 top-0 h-full w-[92vw] max-w-[420px] bg-white shadow-2xl flex flex-col"
        >
          <!-- header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-black/10">
            <button
              type="button"
              class="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-black/10 hover:bg-black/5 transition"
              aria-label="Закрыть меню"
              @click="closeMenu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- content -->
          <div class="px-5 py-4 overflow-y-auto">
            <!-- CTA: каталог -->
            <NuxtLink
              to="/catalog"
              class="w-full inline-flex justify-center items-center bg-primary text-white rounded-xl gap-2 py-3 px-5 text-lg font-normal transition duration-300 hover:opacity-90"
              @click="closeMenu"
            >
              <img src="/icons/catalog.svg" alt="→" class="w-5 h-5" />
              Каталог
            </NuxtLink>

            <!-- phone -->
            <a
              :href="companyContacts.mainPhone.href"
              data-ym="header-phone"
              class="mt-4 w-full inline-flex items-center gap-2 text-black hover:text-primary transition"
              @click="closeMenu"
            >
              <svg class="w-[18px]" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.48171 1.99244C5.39316 1.87853 5.28138 1.78477 5.15381 1.71738C5.02624 1.64999 4.88579 1.61051 4.74178 1.60158C4.59778 1.59264 4.45353 1.61444 4.3186 1.66554C4.18367 1.71664 4.06116 1.79586 3.95921 1.89794L2.40821 3.45044C1.68371 4.17644 1.41671 5.20394 1.73321 6.10544C3.0483 9.83611 5.18494 13.2236 7.98521 16.0174C10.7791 18.8177 14.1665 20.9543 17.8972 22.2694C18.7987 22.5859 19.8262 22.3189 20.5522 21.5944L22.1032 20.0434C22.2053 19.9415 22.2845 19.819 22.3356 19.684C22.3867 19.5491 22.4085 19.4049 22.3996 19.2609C22.3906 19.1169 22.3512 18.9764 22.2838 18.8488C22.2164 18.7213 22.1226 18.6095 22.0087 18.5209L18.5482 15.8299C18.4264 15.7358 18.2849 15.6704 18.1342 15.6387C17.9835 15.607 17.8276 15.6098 17.6782 15.6469L14.3932 16.4674C13.9547 16.5763 13.4955 16.5701 13.0601 16.4495C12.6246 16.3289 12.2277 16.0979 11.9077 15.7789L8.22371 12.0934C7.90448 11.7736 7.67323 11.3767 7.55235 10.9413C7.43147 10.5059 7.42505 10.0466 7.53371 9.60794L8.35571 6.32294C8.39285 6.17352 8.39567 6.01763 8.36398 5.86696C8.33229 5.71628 8.2669 5.57474 8.17271 5.45294L5.48171 1.99244Z"
                  fill="currentColor"
                />
              </svg>
              <span class="text-base font-medium">{{ companyContacts.mainPhone.display }}</span>
            </a>

            <!-- quick actions -->
            <div class="mt-4 grid grid-cols-3 gap-3">
              <button
                type="button"
                class="rounded-xl border border-black/10 p-3 hover:bg-black/5 transition flex flex-col items-center"
                @click="handleOrders"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_1905_4439)">
                    <path
                      d="M16.372 2.22582C16.1332 2.13013 15.8668 2.13013 15.628 2.22582L3.692 6.99982L8.5 8.92182L20.808 3.99982L16.372 2.22582ZM23.5 5.07782L11.192 9.99982L16 11.9218L28.308 6.99982L23.5 5.07782ZM30 8.47782L17 13.6778V29.5218L30 24.3218V8.47782ZM15 29.5238V13.6758L2 8.47782V24.3238L15 29.5238ZM14.886 0.367821C15.6011 0.0818199 16.3989 0.0818199 17.114 0.367821L31.372 6.07182C31.5574 6.14611 31.7163 6.27421 31.8282 6.4396C31.9401 6.605 32 6.80011 32 6.99982V24.3238C31.9997 24.7235 31.8798 25.1139 31.6555 25.4447C31.4313 25.7755 31.1131 26.0316 30.742 26.1798L16.372 31.9278C16.1332 32.0235 15.8668 32.0235 15.628 31.9278L1.26 26.1798C0.888502 26.0319 0.569885 25.7759 0.345284 25.4451C0.120683 25.1143 0.000412659 24.7237 0 24.3238L0 6.99982C4.64799e-05 6.80011 0.0598875 6.605 0.171814 6.4396C0.283741 6.27421 0.442625 6.14611 0.628 6.07182L14.886 0.367821Z"
                      fill="currentColor"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1905_4439">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span class="text-xs mt-1">Заказы</span>
              </button>

              <NuxtLink
                to="/cart"
                class="rounded-xl border border-black/10 p-3 hover:bg-black/5 transition flex flex-col items-center relative"
                @click="closeMenu"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                    fill="currentColor"
                  />
                </svg>
                <span class="text-xs mt-1">Корзина</span>
                <CartBadge />
              </NuxtLink>

              <button
                type="button"
                class="rounded-xl border border-black/10 p-3 hover:bg-black/5 transition flex flex-col items-center"
                @click="handleProfile"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 16C17.5913 16 19.1174 15.3679 20.2426 14.2426C21.3679 13.1174 22 11.5913 22 10C22 8.4087 21.3679 6.88258 20.2426 5.75736C19.1174 4.63214 17.5913 4 16 4C14.4087 4 12.8826 4.63214 11.7574 5.75736C10.6321 6.88258 10 8.4087 10 10C10 11.5913 10.6321 13.1174 11.7574 14.2426C12.8826 15.3679 14.4087 16 16 16ZM20 10C20 11.0609 19.5786 12.0783 18.8284 12.8284C18.0783 13.5786 17.0609 14 16 14C14.9391 14 13.9217 13.5786 13.1716 12.8284C12.4214 12.0783 12 11.0609 12 10C12 8.93913 12.4214 7.92172 13.1716 7.17157C13.9217 6.42143 14.9391 6 16 6C17.0609 6 18.0783 6.42143 18.8284 7.17157C19.5786 7.92172 20 8.93913 20 10ZM28 26C28 28 26 28 26 28H6C6 28 4 28 4 26C4 24 6 18 16 18C26 18 28 24 28 26ZM26 25.992C25.998 25.5 25.692 24.02 24.336 22.664C23.032 21.36 20.578 20 16 20C11.422 20 8.968 21.36 7.664 22.664C6.308 24.02 6.004 25.5 6 25.992H26Z"
                    fill="currentColor"
                  />
                </svg>
                <span class="text-xs mt-1">Профиль</span>
              </button>
            </div>

            <!-- links -->
            <div class="mt-6">
              <ul class="flex flex-col">
                <li>
                  <NuxtLink class="menuLink" to="/akcii" @click="closeMenu">Акции</NuxtLink>
                </li>
                <li>
                  <NuxtLink class="menuLink" to="/about" @click="closeMenu">О нас</NuxtLink>
                </li>
                <li>
                  <NuxtLink class="menuLink" to="/articles" @click="closeMenu">Статьи</NuxtLink>
                </li>
                <li>
                  <NuxtLink class="menuLink" to="/researches" @click="closeMenu">Исследования</NuxtLink>
                </li>
                <li>
                  <NuxtLink class="menuLink" to="/otzyvy" @click="closeMenu">Отзывы</NuxtLink>
                </li>
                <li>
                  <NuxtLink class="menuLink" to="/contacts" @click="closeMenu">Контакты</NuxtLink>
                </li>
              </ul>
            </div>
          </div>

          <!-- footer -->
          <div class="mt-auto px-5 py-4 border-t border-black/10 text-xs text-black/50">
            © Daigo
          </div>
        </div>
      </div>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { COMPANY_CONTACTS } from '~/constants/company'
import { ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { navigateTo, useRouter } from '#imports'
import { storeToRefs } from 'pinia'
import CartBadge from '@/components/ui/CartBadge.vue'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/ui'

const companyContacts = COMPANY_CONTACTS

const ui = useUiStore()
const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)
const router = useRouter()

const isMenuOpen = ref(false)
const isPartnersOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (!isMenuOpen.value) isPartnersOpen.value = false
}

const closeMenu = () => {
  isMenuOpen.value = false
  isPartnersOpen.value = false
}

const handleProfile = async () => {
  closeMenu()
  if (isAuthenticated.value) {
    await navigateTo('/profile')
  } else {
    auth.openAuth()
  }
}

const ORDERS_PATH = '/orders'
const handleOrders = async () => {
  closeMenu()
  if (isAuthenticated.value) {
    await navigateTo(ORDERS_PATH)
  } else {
    auth.openAuth()
  }
}

// блокируем скролл body, пока меню открыто
watch(isMenuOpen, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => {
  // закрывать меню при смене маршрута
  router.afterEach(() => closeMenu())

  // закрывать по ESC
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeMenu()
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
})
</script>

<style scoped>
.menuLink {
  @apply w-full inline-flex items-center gap-2 px-3 py-3 rounded-xl text-base text-black hover:bg-black/5 transition;
}
.subLink {
  @apply block px-2 py-2 rounded-lg text-sm text-black/80 hover:bg-black/5 transition;
}
</style>