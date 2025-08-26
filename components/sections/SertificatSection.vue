<script setup lang="ts">
import { useContentStore } from '~/stores/contentStore'
const { $device } = useNuxtApp()

const content = useContentStore()

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-4 md:px-16 py-5 md:py-20 rounded-2xl md:rounded-3xl bg-cover bg-center text-black h-[194px] md:h-[410px]"
      :style="{
        backgroundImage: `url(${$device.isMobile ? '/images/sertmob.webp' : '/images/sertifikaty-daigo.jpg'})`
      }"
    >
        <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
            
            <img
              src="/logo.svg"
              alt="tovary-daigo"
              loading="lazy"
              class="w-12 md:w-28 mb-2 md:mb-4"
            />
            <h3
              class="font-medium leading-tight mb-2 md:mb-4 text-[clamp(1rem,4vw,2.8rem)]"
            >
              Подарочный сертификат DAIGO
            </h3>
            <p
              class="mb-3 md:mb-6 text-[clamp(0.75rem,3vw,1.5rem)] flex flex-col gap-4 font-normal  w-10/12 md:w-4/5 md:max-w-4/5"
            >
              Идеальный подарок для заботы о здоровье и красоте, получатель сможет сам выбрать, что он хочет.
            </p>
            <NuxtLink
              :to="'/akcii'"
              class="inline-flex justify-center items-center gap-2 py-2 md:py-3 px-2 md:px-5 text-white text-xs md:text-xl font-normal transition duration-300 rounded-md rounded-lg tracking-wide w-40 md:w-72 bg-primary hover:bg-primary/80 hover:text-white"
            >
              Купить сертификат
            </NuxtLink>
        </div>

    </div>

  </section>
</template>
