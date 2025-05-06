<template>
  <div>
    <!-- <header class="bg-white sticky top-0 z-50"> -->
    <header class="">
      <BaseContainer>
        <component :is="isMobile ? NavbarMobile : NavbarDesctop" />
      </BaseContainer>
    </header>
    <main>
      <BaseContainer>
        <NuxtPage />
      </BaseContainer>
    </main>
  </div>
</template>

<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import NavbarMobile from '~/components/layout/NavbarMobile.vue'
import NavbarDesctop from '~/components/layout/NavbarDesctop.vue'
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '~/store/deviceStore'

const { isMobile } = storeToRefs(useDeviceStore())
</script>
