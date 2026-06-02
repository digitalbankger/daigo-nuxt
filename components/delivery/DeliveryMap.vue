<script setup lang="ts">
</script>

<template>
  <section class="w-full py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 items-start">
      <div class="relative">
        <div class="bg-gray-100 rounded-2xl h-[300px] lg:h-[500px] relative overflow-hidden">
          <img 
            src="/images/delivery/map.jpg?height=500&width=640"
            alt="Карта доставки по Москве"
            class="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      </div>

      <div class="flex flex-col gap-4 lg:gap-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-medium mb-2 lg:mb-4">Москва</h2>
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <div>
                <p class="text-lg lg:text-2xl my-2 font-normal">г.Москва Большой Сухаревский переулок 21 стр.2</p>
              </div>
            </div>

            <div class="text-sm lg:text-lg flex flex-row items-center gap-2">
              <img src="/icons/phone.svg" />
              <a
                href="tel:88005552043"
              >
              <span>8 800 555 20 43</span>
              </a>
            </div>
            <div class="text-sm lg:text-lg flex flex-row items-center gap-2">
              <img src="/icons/bi_mailbox.svg" /> 
              <span>Электронная почта: info@daigo.ru</span>
            </div>
            <div class="text-sm lg:text-lg flex flex-row items-center gap-2">
              <img src="/icons/clock.svg" /> 
              <span>Часы работы: пн-пт 9:00 – 18:00</span>
            </div>
          </div>

          <div class="mt-8 w-full">
            <a 
              href="https://yandex.ru/maps/?text=Большой%20сухаревский%20переулок%2021%20строение%202" 
              target="_blank" 
              class="text-primary border border-primary px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors w-full flex items-center justify-center">
              Проложить маршрут
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
