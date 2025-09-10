<script setup lang="ts">
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-8 sm:py-20 rounded-2xl bg-[#4E8BFF] text-white h-[405px] sm:h-[500px]"
    >
      <div class="w-full sm:max-w-[94%] lg:max-w-[60%]">
        <div class="flex flex-wrap gap-2 sm:gap-3 mb-6 w-full sm:w-9/12">
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base lg:text-lg bg-yellow-200 text-black">Акции и скидки</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base lg:text-lg bg-green-200 text-black">Баллы и бонусы</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base lg:text-lg bg-pink-200 text-black">Программа лояльности</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-base lg:text-lg bg-yellow-200 text-black">Подарочные сертификаты</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)]">
          Daigo & Tamotsu покупателям
        </h1>
        <p class="hidden sm:block mb-6 text-sm leading-tight sm:text-[1.5rem] font-normal max-w-[180px] sm:max-w-[80%] lg:max-w-[560px]">
          Органические продукты из Японии, Официальный представитель B&S Corporation.
        </p>
        <p class="block sm:hidden mb-6 text-sm sm:text-[1.5rem] font-normal max-w-[180px] sm:max-w-[80%] lg:max-w-[560px]">
          Органические продукты из Японии, Официальный представитель <br/>B&S Corporation.
        </p>
        <img
          src="/images/promotions/promo-banner.png"
          alt="Daigo & Tamotsu продукты"
          class="block lg:hidden absolute bottom-2 right-0 w-[40%] sm:w-[40%]"
          loading="lazy"
        />
      </div>

      <div class="hidden lg:block">
        <img
          src="/images/promotions/promo-banner.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[300px] lg:max-w-[460px] me-10"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>
