<script setup lang="ts">
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="flex flex-col md:flex-row items-center justify-between px-5 md:px-8 py-12 md:py-20 rounded-2xl bg-[#4E8BFF] text-white"
      style="height: 500px;"
    >
      <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
        <div class="flex flex-wrap gap-3 mb-6 w-8/12">
          <span class="text-lg px-3 py-1 rounded bg-[#FFF05D] text-black">Исследования</span>
          <span class="text-lg px-3 py-1 rounded bg-[#9AFF9F] text-black">Благотворительность</span>
          <span class="text-lg px-3 py-1 rounded bg-[#FFBCD8] text-black">Партнеры и награды</span>
          <span class="text-lg px-3 py-1 rounded bg-[#FFF05D] text-black">Команда</span>
        </div>
        <h1 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,5rem)]">
          О компании
        </h1>
        <p class="mb-6 text-[clamp(1rem,4vw,1.5rem)] font-normal max-w-[90%] sm:max-w-[80%] lg:max-w-[560px]">
          Daigo является эксклюзивным представителем компании «B&S Corporation» (Япония) на территории России и занимаемся продажей уникального продукта для здоровья и долголетия со 100-летней историей
        </p>
      </div>

      <div class="hidden md:block">
        <img
          src="/images/about/about.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[360px] lg:max-w-[580px] me-10 relative z-10"
          loading="lazy"
        />
        <img
          src="/images/loyalty/flower.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[100px] lg:max-w-[160px] me-10 absolute lg:-top-14 right-[36%] z-0 rotate-[210deg]"
          loading="lazy"
        />
        <img
          src="/images/loyalty/flower.png"
          alt="Daigo & Tamotsu продукты"
          class="max-w-[200px] lg:max-w-[260px] absolute bottom-0 right-0 z-0"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>
