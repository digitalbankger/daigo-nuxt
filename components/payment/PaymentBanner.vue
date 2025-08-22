<script setup lang="ts">
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-center justify-between px-5 md:px-8 py-12 md:py-20 rounded-2xl bg-[#4E8BFF] text-white"
      style="height: 500px;"
    >
      <div class="w-full lg:w-7/12 md:max-w-7/12 lg:max-w-7/12">
        <div class="flex flex-wrap gap-3 mb-6 w-5/6">
          <span class="text-lg px-3 py-1 rounded bg-yellow-200 text-black">Банковской картой онлайн</span>
          <span class="text-lg px-3 py-1 rounded bg-[#9AFF9F] text-black">Наличными курьеру</span>
          <span class="text-lg px-3 py-1 rounded bg-[#FFBCD8] text-black">Банковской картой курьеру</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)]">
          Оплата
        </h1>
        <p class="mb-6 text-[clamp(1.2rem,4vw,1.5rem)] font-normal">
          Сайт Daigo.ru - является единственным официальным ресурсом бренда Daigo.
        </p>
        <p class="mb-6 text-[clamp(1.2rem,4vw,1.5rem)] font-normal">
          При заказе из городов России, необходима 100% предоплата.
        </p>
      </div>

      <div class="w-1/2 hidden md:block relative">
        <div class="relative">
          <img
            src="/images/oplata/olata-v-daigo.png?width=500"
            alt="Способы оплаты"
            class="max-w-[300px] lg:max-w-[480px] mx-auto"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
