<script setup lang="ts">
type Props = {
  link?: string
  image?: string
}

withDefaults(defineProps<Props>(), {
  link: '/catalog',
  image: '/images/promotions/leto10-popup-bg.jpg'
})
</script>

<template>
  <section
    class="relative w-full overflow-hidden rounded-[28px] bg-cover bg-center bg-no-repeat px-5 py-7 text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] sm:px-10 sm:py-9 lg:min-h-[360px] lg:px-16 lg:py-11"
    :style="{ backgroundImage: `url(${image})` }"
  >
    <!-- затемнение/градиент поверх фона, чтобы текст читался -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-black/0 to-transparent"
    />

    <div class="relative z-10 flex min-h-[390px] sm:min-h-[490px] items-start md:items-center pt-8">
      <div class="relative z-20">
        <p class="hidden md:block text-[clamp(34px,5.2vw,70px)] font-haido font-[600] uppercase leading-[0.95] tracking-[0.02em]">
          Начните лето с заботы
        </p>

        <p class="hidden md:block mt-3 text-[clamp(34px,5.2vw,72px)] font-haido font-light italic uppercase leading-[0.95] tracking-[0.02em]">
          о здоровье!
        </p>

        <p class="block md:hidden text-[clamp(24px,5.2vw,70px)] font-haido font-[600] uppercase leading-[1.2] tracking-[0.02em]">
          Начните лето с заботы <span class="italic font-light">о здоровье!</span>
        </p>

        <div class="mt-[22px] md:mt-[44px] pt-4 flex flex-wrap items-center gap-x-[1.4rem] md:gap-x-[1.9rem] gap-y-2 sm:mt-7">
          <img src="/images/articles/summer/20.png" alt="Лето - это не только отдых" class="h-[48px] sm:h-[82px] sm:ml-[-46px] w-auto" />

          <div class="max-w-[190px] text-[clamp(17px,2vw,30px)] font-haido font-light uppercase leading-[1.05]">
            на все<br />
            заказы
          </div>
        </div>

        <p
          class="mt-1 md:mt-3 inline-block pt-2 text-[clamp(16px,1.8vw,26px)] font-medium uppercase tracking-[0.02em]"
        >
          в период с 15 по 20 июня
        </p>

        <div class="mt-5 sm:mt-7">
        <NuxtLink
        :to="link"
        class="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#1991B7] to-[#86C4D7] px-5 py-3 text-base uppercase text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:brightness-105 sm:min-h-[54px] sm:px-7 sm:text-xl"
        >
        Подготовка к лету с Daigo
        </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>