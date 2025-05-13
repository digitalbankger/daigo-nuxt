<template>
  <section class="my-20 bg-primary rounded-3xl px-5 md:px-7 py-10 md:py-10 text-white relative overflow-visible">
    <div class="flex flex-col lg:flex-row items-center justify-between gap-10">
      <div class="w-4/6">
        <h2 class="font-medium leading-tight mb-5 text-[clamp(2rem,6vw,2.8rem)]">
          Установите приложение DAIGO
        </h2>
        <p class="font-normal text-[24px] leading-[130%] mb-8">
          С приложением удобней! В приложении вы можете приобрести товары от Дайго, а также следить за акциями и предложениями
        </p>
        <a
          href="https://apps.rustore.ru/app/yourappidhere"
          target="_blank"
          rel="noopener"
        >
          <img src="/icons/stores/rustor.svg" alt="RuStore" width="170" />
        </a>
      </div>

      <NuxtImg
        src="http://localhost:3000/images/app/app-preview.png"
        alt="Скриншоты приложения DAIGO"
        width="400"
        height="400"
        format="webp"
        loading="lazy"
        placeholder
        class="absolute right-10 w-[30%] object-contain "
      />
    </div>
  </section>
</template>
