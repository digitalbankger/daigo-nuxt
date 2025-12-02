<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  show: boolean
  secondsLeft: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'pay'): void
}>()

const progress = computed(() => {
  const total = 5
  const ratio = props.secondsLeft / total
  return Math.max(0, Math.min(1, ratio))
})

</script>

<template>
  <UiModal :show="show" :closable="true" @close="$emit('close')">
    <div class="w-full max-w-md text-center space-y-4">
      <h2 class="text-xl md:text-2xl font-medium">
        Перенаправляем на оплату
      </h2>

      <p class="text-sm md:text-base text-gray-600">
        <span v-if="secondsLeft > 0">
          Через {{ secondsLeft }} сек. откроется страница оплаты.
        </span>
        <span v-else>
          Если окно оплаты не открылось автоматически, нажмите кнопку ниже.
        </span>
      </p>

      <div class="flex items-center justify-center">
        <div class="relative w-16 h-16 flex items-center justify-center">
            <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                <circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="#FFFFFF"        
                stroke-width="4"
                />
                <circle
                cx="18" cy="18" r="16"
                fill="none"
                stroke="#3B82F6"       
                stroke-width="2"
                stroke-linecap="round"
                :stroke-dasharray="100"
                :stroke-dashoffset="100 - progress * 100"
                class="transition-all duration-300 ease-linear !border-none"
                />
            </svg>

            <!-- Число внутри -->
            <span class="text-lg font-medium">{{ secondsLeft }}</span>
        </div>
        <span class="px-2">сек.</span>
      </div>

      <div class="flex flex-col gap-3 justify-center mt-2">
        <Button variant="solid" type="button" @click="$emit('pay')">
          Оплатить
        </Button>

        <!-- <button
          type="button"
          class="text-sm text-gray-500 underline"
          @click="$emit('close')"
        >
          Вернуться в профиль
        </button> -->
      </div>
    </div>
  </UiModal>
</template>
