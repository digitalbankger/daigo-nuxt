<script setup lang="ts">
// здесь можно ничего не писать — баннер полностью статичный
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative banner-slide bg-[#242325] flex flex-col sm:flex-row items-center justify-between
             px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-16 rounded-3xl
             bg-cover bg-right-bottom text-white
             h-[420px] sm:h-[320px] lg:h-[500px]"
    >
      <img src="/images/gen-bf-mobile.png" class="sm:hidden block w-full absolute left-0 bottom-0 z-0" />
      <img src="/images/gen-bf.png" class="hidden sm:block w-full absolute left-0 bottom-0 z-0" />
      <!-- Левая часть: теги, заголовок, текст, кнопка -->
      <div class="w-full sm:max-w-[80%] lg:max-w-[60%] ">
        <div class="sm:absolute top-8 right-56 flex flex-col gap-4">
            <!-- Заголовок -->
            <img src="/icons/head.svg" class="mx-auto w-11/12 sm:w-[360px]" />
            <!-- Текст -->
            <div
            class="text-[clamp(0.56rem,3.1vw,0.9rem)]
                    sm:text-[0.9rem]
                    lg:text-[clamp(0.56rem,3.1vw,0.9rem)]
                    flex flex-col gap-4 font-light
                    max-w-[67%] sm:max-w-[80%] lg:max-w-[248px] ms-auto"
            >
            <p>
                Каждый день с 21 по 30 Ноября! 
                Новые предложения каждый день <br>и возможность выграть десятки призов в нашем колесе фортуны.
            </p>
            </div>

            <!-- Кнопка -->
            <NuxtLink
            to="/catalog"
            class="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black sm:w-70
                    justify-center rounded-md sm:rounded-lg inline-flex items-center gap-2
                    px-5 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-normal
                    transition duration-300 group max-w-[67%] sm:max-w-[80%] lg:max-w-[248px] ms-auto"
            >
            Перейти в каталог
            </NuxtLink>
        </div>
      </div>

      <!-- Правая часть: можно оставить пустой или картинку/объект -->
      <!-- Пример: картинка продукта -->
      <!--
      <div class="hidden sm:block sm:w-[40%] lg:w-[35%]">
        <img
          src="/images/hero-product.png"
          alt="Daigo"
          class="w-full h-auto object-contain"
        />
      </div>
      -->
    </div>
  </section>
</template>

<style scoped>
/* Десктоп (>= 1024px) — по умолчанию */
.banner-slide {
  background-image: url('/images/banners/hero-desktop.jpg'); /* ПОДСТАВЬ СВОЙ ПУТЬ */
  background-size: cover;
  background-position: right bottom;
}

/* < sm (до 640px): мобильная картинка и высота */
@media (max-width: 639px) {
  .banner-slide {
    background-image: url('/images/banners/hero-mobile.jpg'); /* ПОДСТАВЬ СВОЙ ПУТЬ */
    height: clamp(420px, 68vh, 720px) !important;
  }
}

/* sm..lg (640–1023px): планшетная картинка и высота */
@media (min-width: 640px) and (max-width: 1023px) {
  .banner-slide {
    background-image: url('/images/banners/hero-tablet.jpg'); /* ПОДСТАВЬ СВОЙ ПУТЬ */
    height: 500px !important;
  }
}
</style>
