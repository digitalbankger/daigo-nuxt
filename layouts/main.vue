<template>
  <div class="w-full px-4 md:px-0 mx-auto md:w-full">
    <!-- <header class="bg-white sticky top-0 z-50"> -->
    <header class="">
      <BaseContainer>
        <!-- <component :is="isMobile ? NavbarMobile : NavbarDesctop" /> -->
        <NavbarDesctop />
      </BaseContainer>
    </header>
    <main>
      <NuxtPage />
      <MessageModal />
    </main>
    <BaseContainer>
      <!-- <component :is="isMobile ? FooterMobile : FooterDesctop" /> -->
      <FooterDesctop />
    </BaseContainer>
    <!-- <MobileNav /> -->
  </div>
</template>

<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import NavbarMobile from '~/components/layout/NavbarMobile.vue'
import NavbarDesctop from '~/components/layout/NavbarDesctop.vue'
import FooterMobile from '~/components/layout/FooterMobile.vue'
import FooterDesctop from '~/components/layout/FooterDesctop.vue'
import MessageModal from '~/components/ui/MessageModal.vue'
import MobileNav from '~/components/MobileNav.vue'
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '~/stores/deviceStore'

const { isMobile } = storeToRefs(useDeviceStore())
</script>
