<script setup lang="ts">
</script>
 
<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-start lg:items-center justify-between px-5 md:px-8 py-12 md:py-20 rounded-2xl bg-[#4E8BFF] text-white h-[420px] lg:h-[500px]"
    >
      <div class="w-full sm:w-8/12 lg:w-7/12 lg:max-w-7/12 z-10 relative">
        <div class="flex flex-wrap gap-2 sm:gap-3 mb-6 w-full lg:w-5/6">
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-yellow-200 text-black">Банковской картой онлайн</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-[#9AFF9F] text-black">Наличными курьеру</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-[#FFBCD8] text-black">Банковской картой курьеру</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)] sm:text-5xl lg:text-[clamp(2rem,6vw,5rem)]">
          Оплата
        </h1>
        <p class="mb-6 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-lg lg:text-[clamp(0.875rem,4vw,1.5rem)] font-normal max-w-[82%] sm:max-w-[80%] lg:max-w-[560px]">
          Сайт Daigo.ru - является единственным официальным ресурсом бренда Daigo.
        </p>
        <p class="mb-6 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-lg lg:text-[clamp(0.875rem,4vw,1.5rem)] font-normal max-w-[82%] sm:max-w-[80%] lg:max-w-[560px]">
          При заказе из городов России, необходима 100% предоплата.
        </p>
      </div>

      <div class="w-1/2 absolute -right-5 sm:right-0 bottom-28 sm:bottom-10 lg:bottom-auto lg:top-auto z-0 lg:relative">
        <div class="relative">
          <img
            src="/images/oplata/olata-v-daigo.png?width=500"
            alt="Способы оплаты"
            class="max-w-[300px] w-[220px] lg:max-w-[480px] mx-auto"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
