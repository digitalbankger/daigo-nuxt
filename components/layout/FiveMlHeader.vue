<script setup lang="ts">
import { computed, onMounted } from 'vue'
import CartBadge from '~/components/ui/CartBadge.vue'
import { useCartStore } from '~/stores/cartStore'
import { COMPANY_CONTACTS } from '~/constants/company'

const cartStore = useCartStore()
const companyContacts = COMPANY_CONTACTS
const cartCount = computed(() => Number(cartStore.itemsCount || 0))

onMounted(() => {
  if (!cartStore.isLoaded) {
    void cartStore.loadCart()
  }
})
</script>

<template>
  <div class="w-full border-b border-black/10 bg-white/95 backdrop-blur-xl">
    <div class="mx-auto flex h-16 w-full max-w-[1310px] items-center justify-between gap-2 px-3 sm:h-[70px] sm:px-5 xl:px-0">
      <div class="flex min-w-0 items-center gap-2 sm:gap-5">
        <NuxtLink to="/" aria-label="Главная Daigo" class="shrink-0">
          <img
            src="/logo.svg"
            alt="Daigo"
            width="112"
            height="56"
            class="h-9 w-auto sm:h-11"
          >
        </NuxtLink>

        <NuxtLink
          to="/catalog"
          class="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#1B1B1B] px-3 text-sm font-medium text-white transition hover:bg-black/80 sm:h-10 sm:px-4 sm:text-base"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="hidden xs-max:hidden sm:inline">Каталог</span>
        </NuxtLink>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-5">
        <a
          :href="companyContacts.mainPhone.href"
          data-ym="header-phone"
          class="text-sm md:text-lg flex flex-row items-center gap-2 me-0 lg:me-3 transition duration-300 text-black hover:text-primary"
        >
          <svg
            class="w-[14px] md:w-[20px]"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_2112_8802)">
              <path
                d="M5.48171 1.99244C5.39316 1.87853 5.28138 1.78477 5.15381 1.71738C5.02624 1.64999 4.88579 1.61051 4.74178 1.60158C4.59778 1.59264 4.45353 1.61444 4.3186 1.66554C4.18367 1.71664 4.06116 1.79586 3.95921 1.89794L2.40821 3.45044C1.68371 4.17644 1.41671 5.20394 1.73321 6.10544C3.0483 9.83611 5.18494 13.2236 7.98521 16.0174C10.7791 18.8177 14.1665 20.9543 17.8972 22.2694C18.7987 22.5859 19.8262 22.3189 20.5522 21.5944L22.1032 20.0434C22.2053 19.9415 22.2845 19.819 22.3356 19.684C22.3867 19.5491 22.4085 19.4049 22.3996 19.2609C22.3906 19.1169 22.3512 18.9764 22.2838 18.8488C22.2164 18.7213 22.1226 18.6095 22.0087 18.5209L18.5482 15.8299C18.4264 15.7358 18.2849 15.6704 18.1342 15.6387C17.9835 15.607 17.8276 15.6098 17.6782 15.6469L14.3932 16.4674C13.9547 16.5763 13.4955 16.5701 13.0601 16.4495C12.6246 16.3289 12.2277 16.0979 11.9077 15.7789L8.22371 12.0934C7.90448 11.7736 7.67323 11.3767 7.55235 10.9413C7.43147 10.5059 7.42505 10.0466 7.53371 9.60794L8.35571 6.32294C8.39285 6.17352 8.39567 6.01763 8.36398 5.86696C8.33229 5.71628 8.2669 5.57474 8.17271 5.45294L5.48171 1.99244ZM2.82671 0.766942C3.0892 0.504367 3.40455 0.300638 3.75182 0.169284C4.09908 0.0379306 4.47032 -0.0180424 4.84088 0.00508205C5.21144 0.0282065 5.57284 0.129899 5.90108 0.303408C6.22932 0.476916 6.5169 0.71827 6.74471 1.01144L9.43571 4.47044C9.92921 5.10494 10.1032 5.93144 9.90821 6.71144L9.08771 9.99644C9.04558 10.1666 9.04802 10.3447 9.09479 10.5137C9.14156 10.6826 9.23107 10.8367 9.35471 10.9609L13.0402 14.6464C13.1646 14.7703 13.3189 14.86 13.4882 14.9068C13.6574 14.9535 13.8358 14.9558 14.0062 14.9134L17.2897 14.0929C17.6747 13.9973 18.0763 13.9901 18.4645 14.0719C18.8526 14.1537 19.2171 14.3225 19.5307 14.5654L22.9897 17.2564C24.2332 18.2239 24.3472 20.0614 23.2342 21.1729L21.6832 22.7239C20.5732 23.8339 18.9142 24.3214 17.3677 23.7769C13.4087 22.3858 9.81452 20.1196 6.85271 17.1469C3.88026 14.1856 1.61403 10.5919 0.222706 6.63344C-0.320294 5.08844 0.167206 3.42794 1.27721 2.31794L2.82671 0.766942Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_2112_8802">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>{{ companyContacts.mainPhone.display }}</span>
        </a>

        <NuxtLink
          to="/cart"
          class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-black/5 hover:text-black/60"
          :aria-label="cartCount ? `Корзина, товаров: ${cartCount}` : 'Корзина'"
        >
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M4 5h3l3.5 14h14L28 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="26" r="2" fill="currentColor"/>
            <circle cx="24" cy="26" r="2" fill="currentColor"/>
          </svg>
          <CartBadge />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
