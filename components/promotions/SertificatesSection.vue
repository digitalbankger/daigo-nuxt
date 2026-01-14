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
  <section class="relative w-full py-8 sm:py-20">
    <div class="container px-0 sm:px-4 mx-auto">
      <h2 class="text-4xl sm:text-5xl font-medium leading-tight mb-6 sm:mb-12">
        Подарочные сертификаты
      </h2>

      <div class="flex flex-col lg:flex-row gap-4 sm:gap-10 items-start sm:items-center">
        <div
          class="w-1/2 min-h-[500px] group relative mx-auto order-2 sm:order-1 hidden lg:block"
          @mouseenter="enableFloating"
          @mouseleave="disableFloating"
        >
          <div
            class="w-full absolute transition-transform duration-700 ease-in-out z-10 group-hover:-translate-x-6 group-hover:-translate-y-2"
            style="left: 0; top: 0"
          >
            <img
              src="/images/promotions/circle-1.png"
              class="w-[80px] -mb-10 relative z-10"
              :class="floating ? 'animate-float-down' : ''"
            />
            <img
              src="/images/promotions/cert-100k.png"
              class="sm:w-[50%] mb-auto"
              :class="floating ? 'animate-float-up' : ''"
            />
          </div>

          <div
            class="w-full absolute transition-transform duration-700 ease-in-out z-20 group-hover:-translate-x-2 group-hover:translate-y-3"
            style="right: 0px; top: 100px"
          >
            <img
              src="/images/promotions/circle-2.png"
              class="w-[50px] -mb-8 absolute -right-4 z-10"
              :class="floating ? 'animate-float-up' : ''"
            />
            <img
              src="/images/promotions/cert-50k.png"
              class="sm:w-[50%] ms-auto"
              :class="floating ? 'animate-float-down' : ''"
            />
          </div>

          <div
            class="w-full absolute transition-transform duration-700 ease-in-out z-30 group-hover:translate-x-2 group-hover:-translate-y-3"
            style="left: 0px; top: 260px"
          >
            <img
              src="/images/promotions/circle-3.png"
              class="w-[80px] -mb-8 absolute -top-2 right-[43%] z-10"
              :class="floating ? 'animate-float-up' : ''"
            />
            <img
              src="/images/promotions/cert-20k.png"
              class="sm:w-[50%]"
              :class="floating ? 'animate-float-up' : ''"
            />
          </div>

          <div
            class="w-full absolute transition-transform duration-700 ease-in-out z-40 group-hover:translate-x-6 group-hover:translate-y-3"
            style="right: 40px; top: 320px"
          >
            <img
              src="/images/promotions/circle-4.png"
              class="w-[80px] -mb-8 absolute z-10 bottom-16 left-2"
              :class="floating ? 'animate-float-down' : ''"
            />
            <img
              src="/images/promotions/circle-5.png"
              class="w-[100px] absolute z-10 -bottom-8 -right-4"
              :class="floating ? 'animate-float-up' : ''"
            />
            <img
              src="/images/promotions/cert-10k.png"
              class="sm:w-[50%] ms-auto"
              :class="floating ? 'animate-float-down' : ''"
            />
          </div>
        </div>

        <div class="w-full lg:w-1/2 flex flex-col gap-4 order-1 sm:order-2">
          <h3 class="text-base sm:text-3xl font-medium mb-4">
            Номинал от 10 000 ₽ до 100 000 ₽
          </h3>

          <ul class="text-sm sm:text-lg space-y-3 mb-4">
            <li class="flex items-center gap-3">
              <img
                src="/icons/bi_mailbox.svg" class="w-5 h-5"
              /> Бесплатно на Email или доставка курьером
            </li>
            <li class="flex items-center gap-2">
              <img
                src="/icons/bi_gift.svg" class="w-5 h-5"
              /> Идеальный подарок для заботы о здоровье и красоте
            </li>
            <li class="flex items-center gap-2">
              <img
                src="/icons/bi_credit-card.svg" class="w-5 h-5"
              /> Можно купить в любом варианте: электронные и физические
            </li>
            <li class="flex items-center gap-2">
              <img
                src="/icons/bi_person.svg" class="w-5 h-5"
              /> Получатель сам выбирает то, что хочет
            </li>
          </ul>

          <p class="text-sm sm:text-lg mb-2">
            Сертификат не подлежит обналичиванию. Действует 1 год.
          </p>
          <p class="text-sm sm:text-lg mb-4">
            Используется за 1 покупку, остаток сгорает. На сертификаты не распространяются скиди по промокодам
          </p>

          <UiButton
            class="mt-2 w-full lg:!w-60 !bg-[#242325]"
            :to="'/promotions/certificates'"
            variant="solid"
          >
            Узнать подробнее
          </UiButton>
        </div>
        <img src="/images/promotions/promo-sert-mob.jpg" class="w-full block lg:hidden order-2"/>
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
