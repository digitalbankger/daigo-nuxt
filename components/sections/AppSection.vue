<template>
  <section class="mt-24 mb-4 md:my-20 bg-primary rounded-3xl px-4 md:px-5 md:px-7 py-10 md:py-10 text-white relative overflow-visible">
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10">
      <div class="w-full md:w-4/6 order-2 md:order-1">
        <h2 class="font-medium leading-tight mb-5 text-[clamp(1.6rem,6vw,2.8rem)]">
          Установите приложение DAIGO
        </h2>
        <p class="font-normal text-sm md:text-2xl md:leading-[130%] mb-8 w-11/12 md:w-full">
          С приложением удобней! В приложении вы можете приобрести товары от Дайго, а также следить за акциями и предложениями
        </p>
        <a
          href="https://apps.rustore.ru/app/yourappidhere"
          target="_blank"
          rel="noopener"
        >
          <img src="/icons/stores/rustor.svg" alt="RuStore" class="w-[50%] md:w-[170px]" />
        </a>
      </div>

      <NuxtImg
        src="https//nuxt.daigo.ru/images/app/app-preview.png"
        alt="Скриншоты приложения DAIGO"
        width="400"
        height="400"
        format="webp"
        loading="lazy"
        placeholder
        class="relative -mt-36 md:mt-0 mx-auto md:absolute right-0 md:right-10 w-10/12 md:w-[30%] object-contain order-1 md:order-2"
      />
    </div>
  </section>
</template>
