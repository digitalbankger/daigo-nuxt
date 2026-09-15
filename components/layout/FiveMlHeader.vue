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
          class="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#4f8eff] px-3 text-sm font-medium text-white transition hover:bg-[#3f7fe8] sm:h-10 sm:px-4 sm:text-base"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="hidden xs-max:hidden sm:inline">Каталог</span>
        </NuxtLink>
      </div>

      <div class="flex shrink-0 items-center gap-1.5 sm:gap-4 lg:gap-5">
        <a
          :href="companyContacts.mainPhone.href"
          data-ym="header-phone-mobile"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-black transition hover:text-[#4f8eff] sm:text-sm md:hidden"
          :aria-label="`Позвонить ${companyContacts.mainPhone.display}`"
        >
          <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7.2 3.5 9.4 8l-2 1.8c1 2.1 2.7 3.8 4.8 4.8l1.8-2 4.5 2.2-.5 3.4c-.2 1.2-1.2 2.1-2.4 2.1C9 20.3 3.7 15 3.7 8.4c0-1.2.9-2.2 2.1-2.4l1.4-.2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ companyContacts.mainPhone.display }}</span>
        </a>

        <a
          :href="companyContacts.mainPhone.href"
          data-ym="header-phone"
          class="hidden items-center gap-2 text-sm text-black transition hover:text-[#4f8eff] md:flex lg:text-base"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7.2 3.5 9.4 8l-2 1.8c1 2.1 2.7 3.8 4.8 4.8l1.8-2 4.5 2.2-.5 3.4c-.2 1.2-1.2 2.1-2.4 2.1C9 20.3 3.7 15 3.7 8.4c0-1.2.9-2.2 2.1-2.4l1.4-.2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ companyContacts.mainPhone.display }}
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
