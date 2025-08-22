<script setup lang="ts">
import { useBonusStore } from '@/stores/bonusStore'

const bonusStore = useBonusStore()
await bonusStore.loadBonusHistory()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>

<template>
  <section class="relative w-full pb-5 pt-3 md:pt-3 md:pb-5">
    <div class="container mx-auto">
      <h2 class="text-slider font-medium mb-8">Ваши бонусы</h2>

      <div class="flex flex-col gap-6 items-start w-full">
        <div v-if="bonusStore.isLoading" class="text-sm text-blue-500">Загрузка бонусов...</div>

        <div v-else-if="bonusStore.history.length" class="w-full space-y-8">
          <div
            v-for="(bonus, index) in bonusStore.history"
            :key="index"
            class="flex items-center gap-6"
          >
            <!-- Левая карточка с бонусами -->
            <div
              class="relative w-[190px] h-[130px] rounded-xl flex items-center justify-center text-white font-medium text-[46px] overflow-hidden"
              style="background-color: #4F8EFF;"
            >
              <img src="/images/loyalty/left-ball.png" alt="" class="absolute top-0 left-0 w-20" />
              <img src="/images/loyalty/right-ball.png" alt="" class="absolute bottom-0 right-0 w-20" />
              {{ bonus.operation_type === 'credit' ? '+' : '-' }}{{ bonus.value }}
            </div>

            <!-- Правая текстовая часть -->
            <div class="flex flex-col mb-auto">
              <div class="!text-cardhead font-medium mb-2">
                {{ bonus.operation_type === 'credit' ? 'Начисление бонусов' : 'Списание бонусов' }}
              </div>
              <div class="text-lg text-black/70 mb-1">
                Заказ № {{ bonus.order_id || '—' }}, {{ formatDate(bonus.date) }}
              </div>
              <div class="text-lg text-black">
                {{ bonus.order_price ? `Сумма заказа: ${bonus.order_price} ₽` : 'Без заказа' }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400">История бонусов пуста</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-cardhead {
  font-size: 18px;
  line-height: 1.2;
}
</style>
