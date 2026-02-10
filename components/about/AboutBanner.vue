<script setup lang="ts">
</script>
 
<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-12 sm:py-20 rounded-2xl bg-primary text-white relative h-[440px] lg:h-[500px]"
    >
      <div class="w-full sm:max-w-[80%] lg:max-w-[60%] relative z-20">
        <div class="flex flex-wrap gap-2 sm:gap-3 mb-6 w-full sm:w-10/12">
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-lg bg-[#FFF05D] text-black">Исследования</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-lg bg-[#9AFF9F] text-black">Благотворительность</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-lg bg-[#FFBCD8] text-black">Партнеры и награды</span>
          <span class="px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-lg bg-[#FFF05D] text-black">Команда</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)] sm:text-5xl lg:text-[clamp(2rem,6vw,5rem)]">
          О компании
        </h1>
        <p class="mb-6 text-[clamp(0.875rem,4vw,1.5rem)] sm:text-lg lg:text-[clamp(0.875rem,4vw,1.5rem)] font-normal max-w-[82%] sm:max-w-[80%] lg:max-w-[560px]">
          Daigo является эксклюзивным представителем компании «B&S Corporation» (Япония) на территории России и занимаемся продажей уникального продукта для здоровья и долголетия со 100-летней историей
        </p>
      </div>

      <div class="block">
        <img
          src="/images/about/about.png"
          alt="Daigo & Tamotsu продукты"
          class="hidden lg:block max-w-[360px] lg:max-w-[580px] me-10 relative z-10"
          loading="lazy"
        />
        <img
          src="/images/about/about-mob.webp"
          alt="Daigo & Tamotsu продукты"
          class="block lg:hidden max-w-[160px] sm:max-w-[40%] lg:max-w-[580px] absolute right-2 bottom-2 z-10"
          loading="lazy"
        />
        <!-- <img
          src="/images/loyalty/flower.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[100px] lg:max-w-[160px] me-10 absolute -top-10 sm:-top-14 right-[36%] z-0 rotate-[210deg]"
          loading="lazy"
        />
        <img
          src="/images/loyalty/flower.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[200px] lg:max-w-[260px] absolute bottom-0 -right-16 sm:right-0 z-0"
          loading="lazy"
        /> -->
      </div>
    </div>
  </section>
</template>
