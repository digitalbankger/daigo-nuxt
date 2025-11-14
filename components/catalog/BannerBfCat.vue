<script setup lang="ts">
import { ref } from 'vue'

const rotation = ref(0)
const isSpinning = ref(false)

const spin = () => {
  if (isSpinning.value) return

  isSpinning.value = true

  const extraTurns = 5                       // сколько полных оборотов
  const randomOffset = Math.floor(Math.random() * 360) // случайный угол

  rotation.value += extraTurns * 360 + randomOffset

  // через 4 секунды (как в transition) разрешаем следующий спин
  setTimeout(() => {
    isSpinning.value = false
  }, 4000)
}
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="banner-slide bg-[#242325] flex flex-col sm:flex-row items-center justify-between
             px-4 sm:px-8 lg:px-16 py-6 sm:py-10 lg:py-16 rounded-3xl
             bg-cover bg-right-bottom text-white
             h-[420px] sm:h-[360px] lg:h-[500px]"
    >
      <img src="/images/catalog-bf.png" class="hidden sm:block w-full absolute right-0 top-1/2 -translate-y-1/2" />
      <img src="/images/catalog-bf-mobile.png" class="sm:hidden block w-full absolute right-0 top-0 z-0" />

      <!-- КОЛЕСО -->
      <img
        src="/icons/spinner.svg"
        class="hidden sm:block spinner w-[1140px] absolute left-10 sm:-left-36 top-[70%]"
        :style="{ transform: `translateY(-50%) rotate(${rotation}deg)` }"
      />

      <div class="w-full sm:max-w-[80%] lg:max-w-[60%]">
        <img src="/icons/head.svg" class="w-full sm:w-[360px] relative sm:absolute sm:right-60 top-0 sm:top-6 z-10" />

        <div class="absolute right-0 sm:right-60 ps-3 top-32 mt-2 sm:mt-0 sm:top-40 pt-2 space-y-6 w-[70%] sm:w-[260px]">
          <div
            class="text-[clamp(0.575rem,3.2vw,0.9rem)]
                    sm:text-[0.9rem]
                    lg:text-[clamp(0.575rem,3.2vw,0.9rem)]
                    flex flex-col gap-4 font-light
                    max-w-[90%] sm:max-w-[80%] lg:max-w-[300px]"
          >
            <p>
              Каждый день с 21 по 30 Ноября!
              Новые предложения каждый день <br>и возможность выграть десятки призов в нашем колесе фортуны.
            </p>
          </div>

          <!-- КНОПКА -->
          <NuxtLink
            to="/catalog"
            @click.prevent="spin"
            class="w-full bg-transparent border border-white text-white hover:bg-white hover:text-black sm:w-70
                   justify-center rounded-md sm:rounded-lg hidden sm:inline-flex items-center gap-2
                   px-5 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-normal
                   transition duration-300 group"
          >
            Испытать удачу!
          </NuxtLink>
        </div>
      </div>
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
    height: clamp(420px, 78vh, 720px) !important;
  }
}

/* sm..lg (640–1023px): планшетная картинка и высота */
@media (min-width: 640px) and (max-width: 1023px) {
  .banner-slide {
    background-image: url('/images/banners/hero-tablet.jpg'); /* ПОДСТАВЬ СВОЙ ПУТЬ */
    height: 500px !important;
  }
}


/* колесо */
.spinner {
  transition: transform 4s cubic-bezier(0.12, 0.01, 0.08, 0.99);
  transform-origin: center center;
}
</style>
