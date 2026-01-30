<script setup lang="ts">
import UiModal from './UiModal.vue'
import { useModalStore } from '~/stores/modalStore'
import Button from './Button.vue'

const modalStore = useModalStore()
</script>

<template>
  <UiModal :show="modalStore.isOpen" @close="modalStore.close">
    <div class="flex flex-col items-center gap-4 text-center">
        <div v-if="modalStore.icon" class="text-xl">
          <component :is="modalStore.icon" />
        </div>
        <h2 class="text-[clamp(2rem,4vw,2.4rem)] font-medium">{{ modalStore.title }}</h2>
        <p class="text-xl text-black/60">{{ modalStore.message }}</p>
        <Button
          variant="solid"
          @click="modalStore.close"
        >
          Закрыть
        </Button>
    </div>
  </UiModal>
</template>
