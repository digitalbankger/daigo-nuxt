<template>
  <div class="w-full px-0 md:px-0 mx-auto md:w-full">
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
    <BaseContainer v-if="!route.meta.hideFooter">
      <!-- <component :is="isMobile ? FooterMobile : FooterDesctop" /> -->
      <FooterDesctop />
      <MobileNav class="block lg:hidden"/>
    </BaseContainer>

    <!-- AUTH SHEET -->
    <Teleport to="body">
      <!-- FADING OVERLAY -->
      <Transition name="fade">
        <div
          v-if="isAuthModalOpen"
          class="fixed inset-0 z-[100] bg-black/40"
          aria-hidden="true"
          @click="closeAuth"
        />
      </Transition>

      <!-- SLIDING SHEET -->
      <Transition name="sheet">
        <div
          v-if="isAuthModalOpen"
          class="fixed right-0 top-0 z-[101] h-full w-11/12 sm:w-[500px]
                bg-white rounded-l-2xl shadow-xl p-4 md:px-12 py-12 sm:py-28 overflow-y-auto"
          role="dialog" aria-modal="true"
        >
          <button class="absolute top-4 right-4 opacity-60 p-3 bg-hoverbtn rounded-full hover:opacity-100"
                  @click="closeAuth" aria-label="Закрыть">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <ClientOnly>
            <LazyAuthForm />
          </ClientOnly>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import NavbarDesctop from '~/components/layout/NavbarDesctop.vue'
import FooterDesctop from '~/components/layout/FooterDesctop.vue'
import MessageModal from '~/components/ui/MessageModal.vue'
import MobileNav from '~/components/MobileNav.vue'
import { defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
const { public: { carrotId = '65310-79e35206a74ce38752218d816a' } } = useRuntimeConfig()
useHead({
  script: [
    {
      key: 'carrotquest',
      type: 'text/javascript',
      children: `!function(){function t(t,e){return function(){window.carrotquestasync.push(t,arguments)}}if("undefined"==typeof carrotquest){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://cdn.carrotquest.app/api.min.js",document.getElementsByTagName("head")[0].appendChild(e),window.carrotquest={},window.carrotquestasync=[],carrotquest.settings={};for(var n=["connect","track","identify","auth","onReady","addCallback","removeCallback","trackMessageInteraction"],a=0;a<n.length;a++)carrotquest[n[a]]=t(n[a])}}(),carrotquest.connect("${carrotId}");`
    },
  ]
  })
// import { onMounted } from 'vue'
// import { useUiStore } from '@/stores/ui'

// const ui = useUiStore()
// onMounted(() => ui.initUi())
import { useRoute } from 'vue-router'
const route = useRoute()

const LazyAuthForm = defineAsyncComponent(() => import('@/components/AuthForm.vue'))

const auth = useAuthStore()
const { isAuthModalOpen } = storeToRefs(auth)
const { closeAuth } = auth

watch(isAuthModalOpen, (open) => {
  if (process.client) document.documentElement.style.overflow = open ? 'hidden' : ''
}, { immediate: true })
</script>

<style scoped>
.sheet-enter-from, .sheet-leave-to { transform: translateX(100%); opacity: .8; }
.sheet-enter-active, .sheet-leave-active { transition: transform .28s ease, opacity .28s ease; }
</style>