<script setup lang="ts">
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-center justify-between px-5 md:px-8 py-12 md:py-20 rounded-2xl bg-[#4E8BFF] text-white"
      style="height: 500px;"
    >
      <div class="w-full md:max-w-1/2 lg:max-w-[60%]">
        <div class="flex flex-wrap gap-3 mb-6 w-9/12">
          <span class="text-lg px-3 py-1 rounded bg-yellow-200 text-black">Быстрая доставка</span>
          <span class="text-lg px-3 py-1 rounded bg-[#9AFF9F] text-black">Курьерская служба</span>
          <span class="text-lg px-3 py-1 rounded bg-[#FFBCD8] text-black">По России и СНГ</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)]">
          Бесплатная доставка
        </h1>
        <p class="mb-6 text-[clamp(1rem,4vw,1.2rem)] font-normal">
          Бесплатная доставка штатными курьерами Дайго по Москве и Санкт-Петербургу или любой удобной курьерской службой по России и странам СНГ
        </p>
      </div>

      <div class="hidden md:block relative">
        <div class="relative">
          <img
            src="/images/delivery/delivery.png?width=500"
            alt="Доставка покупок"
            class="max-w-[300px] lg:max-w-[600px] me-10"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
