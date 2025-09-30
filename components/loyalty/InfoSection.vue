<script setup lang="ts">
import { ref } from 'vue'

const floating = ref(false)

function enableFloating() {
  setTimeout(() => {
    floating.value = true
  }, 500)
}

function disableFloating() {
  floating.value = false
}
</script>

<template>
  <section class="relative w-full py-5 md:py-5">
    <div class="container mx-auto">
      <h2 class="text-slider font-medium mb-8">
        Как начисляются бонусы?
      </h2>

      <div class="flex flex-col lg:flex-row gap-10 items-center">

        <div class="w-full flex flex-col gap-4">
          <h3 class="text-2xl md:text-3xl font-medium mb-1">
            1 отзыв = 1000 бонусов
          </h3>

          <p class="flex items-center gap-3 mb-4">
            Начисляем 1000 бонусов за отзыв о наших продуктах
          </p>

          <h3 class="text-2xl md:text-3xl font-medium mb-1">
            10% при заказе от 300 000 ₽  
          </h3>

          <p class="flex items-center gap-3 mb-4">
            При 1 заказе от 300.000 рублей начисляем 10%
          </p>

          <h3 class="text-2xl md:text-3xl font-medium mb-1">
            1% при заказе до 300 000 ₽
          </h3>

          <p class="flex items-center gap-3 mb-4">
            При 1 заказе до 300.000 рублей начисляем 1%
          </p>

          <p class="text-lg md:text-lg text-black/50 uppercase mb-2">
            АКЦИИ, БАЛЛЫ И КАРТА ЛОЯЛЬНОСТИ НЕ СУММИРУЕТСЯ ПРИ СПИСАНИИ С ПРОМОКОДАМИ
          </p>

          <p class="text-lg md:text-lg text-black/50 uppercase mb-2">
            БАЛЛЫ НЕ НАЧИСЛЯЮТСЯ НА ТОВАРЫ СО СКИДКАМИ.
          </p>

          <p class="text-lg md:text-lg text-black/50 uppercase mb-2">
            Ограничение по оплате баллам до 25% от стоимости заказа
          </p>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes floatUp {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes floatDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

.animate-float-up {
  animation: floatUp 2.5s ease-in-out infinite;
}

.animate-float-down {
  animation: floatDown 2.5s ease-in-out infinite;
}
</style>
