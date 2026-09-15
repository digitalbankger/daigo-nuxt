<script setup lang="ts">
import HeadInformer from '~/components/layout/HeadInformer.vue'
import FiveMlHeader from '~/components/layout/FiveMlHeader.vue'
import MessageModal from '~/components/ui/MessageModal.vue'
import CookieConsentBanner from '~/components/layout/CookieConsentBanner.vue'
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div
    class="five-ml-layout h-dvh overflow-hidden bg-white"
    :class="{ 'five-ml-layout--with-informer': ui.isHeadInformerVisible }"
  >
    <HeadInformer
      v-if="ui.isHeadInformerVisible"
      background-color="#4f8eff"
      @close="ui.closeHeadInformer"
    />

    <header class="five-ml-layout__header fixed left-0 right-0 z-[60]">
      <FiveMlHeader />
    </header>

    <main class="five-ml-layout__main h-full overflow-hidden">
      <NuxtPage />
      <MessageModal />
    </main>

    <CookieConsentBanner />
  </div>
</template>

<style>
.five-ml-layout__header {
  top: 0;
}

.five-ml-layout__main {
  padding-top: 64px;
}

.five-ml-layout--with-informer .five-ml-layout__header {
  top: 72px;
}

.five-ml-layout--with-informer .five-ml-layout__main {
  padding-top: 136px;
}

@media (min-width: 640px) {
  .five-ml-layout__main {
    padding-top: 70px;
  }

  .five-ml-layout--with-informer .five-ml-layout__header {
    top: 56px;
  }

  .five-ml-layout--with-informer .five-ml-layout__main {
    padding-top: 126px;
  }
}
</style>
