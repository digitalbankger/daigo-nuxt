<template>
  <div class="w-full px-0 md:px-0 mx-auto md:w-full bg-[#F2F1ED] overflow-y-hidden overflow-x-hidden">

    <header class="">
      <BaseContainer>
        <NavbarWomen />
      </BaseContainer>
    </header>
    <main>
      <NuxtPage />
      <MessageModal />
    </main>

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
import NavbarWomen from '~/components/layout/NavbarWomen.vue'
import MessageModal from '~/components/ui/MessageModal.vue'
import { defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
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

.women-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.women-bg__top,
.women-bg__bottom {
  position: absolute;
  left: 0%;
  width: 100%;
  max-width: 980px;
  height: auto;
  opacity: 1;
}
.women-bg__top {
  top: 0px;
}
.women-bg__bottom {
  bottom: 0px;
}

</style>