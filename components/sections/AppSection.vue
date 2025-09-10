<template>
  <section class="mt-24 mb-4 sm:my-20 bg-primary rounded-3xl px-4 sm:px-5 sm:px-7 py-10 sm:py-10 text-white relative overflow-visible">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-10">
      <div class="w-full sm:w-1/2 lg:w-4/6 order-2 sm:order-1">
        <h2 class="font-medium leading-tight mb-5 text-[clamp(1.6rem,6vw,2.8rem)] sm:text-3xl lg:text-[clamp(1.6rem,6vw,2.8rem)]">
          Установите приложение DAIGO
        </h2>
        <p class="font-normal text-sm sm:text-base lg:text-2xl leading-tight mb-8 w-11/12 sm:w-full">
          С приложением удобней! В приложении вы можете приобрести товары от Дайго, а также следить за акциями и предложениями
        </p>
        <a
          href="https://apps.rustore.ru/app/yourappidhere"
          target="_blank"
          rel="noopener"
        >
          <img src="/icons/stores/rustor.svg" alt="RuStore" class="w-[50%] sm:w-[170px]" />
        </a>
      </div>

      <NuxtImg
        src="https://nuxt.daigo.ru/images/app/app-preview.png"
        alt="Скриншоты приложения DAIGO"
        width="400"
        height="400"
        format="webp"
        loading="lazy"
        placeholder
        class="relative -mt-36 sm:mt-0 mx-auto sm:absolute right-0 sm:right-6 lg:right-10 w-10/12 sm:w-5/12 lg:w-[30%] object-contain order-1 sm:order-2"
      />
    </div>
  </section>
</template>
