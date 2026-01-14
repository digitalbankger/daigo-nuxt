<script setup lang="ts">
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-center justify-between px-5 md:px-8 py-12 md:py-20 rounded-2xl bg-[#242325] text-white h-[500px]"
    >
      <div class="w-full sm:max-w-2/3 lg:max-w-[60%]">
        <div class="flex flex-wrap gap-2 sm:gap-3 mb-6 w-full lg:w-9/12">
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-yellow-200 text-black">Быстрая доставка</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-[#9AFF9F] text-black">Курьерская служба</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base bg-[#FFBCD8] text-black">По России и СНГ</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)] sm:text-5xl lg:text-[clamp(2rem,6vw,5rem)]">
          Бесплатная доставка
        </h1>
        <p class="mb-6 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-lg lg:text-[clamp(0.875rem,4vw,1.5rem)] font-normal max-w-[82%] sm:max-w-[80%] lg:max-w-[560px] !leading-tight">
          Бесплатная доставка по всей России и странам СНГ при покупке от 10 000 руб.
        </p>
      </div>

      <div class="block relative w-1/3 lg:w-[40%]">
        <div class="relative">
          <img
            src="/images/delivery/delivery.png?width=500"
            alt="Доставка покупок"
            class="max-w-[220px] sm:w-[400px] lg:w-[600px] sm:max-w-[600px] me-0 sm:me-10 ms-0 sm:-ms-10 lg:ms-0 -mt-14 sm:mt-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
