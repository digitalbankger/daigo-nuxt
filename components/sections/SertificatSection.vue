<script setup lang="ts">
import { useContentStore } from '~/stores/contentStore'
const { $device } = useNuxtApp()

const content = useContentStore()
const certificateCatalogLink = { path: '/catalog', query: { podarochnye: 'sertificate' } }

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 lg:px-16 py-5 sm:py-20 rounded-2xl sm:rounded-3xl bg-[#CCDEFF] bg-[length:44%_auto] sm:bg-[length:50%_auto] bg-right-bottom sm:bg-right lg:bg-cover lg:bg-center bg-no-repeat text-black sm:h-[410px]"
      :style="{
        backgroundImage: `url(${$device.isMobile ? '/images/sertmob.webp' : '/images/sertifikaty-daigo.jpg'})`
      }"
    >
        <div class="w-full sm:max-w-[80%] lg:max-w-[60%]">
            
            <img
              src="/logo.svg"
              alt="tovary-daigo"
              loading="lazy"
              class="w-12 sm:w-20 lg:w-28 mb-2 sm:mb-4"
            />
            <h3
              class="font-medium leading-tight mb-2 sm:mb-4 text-[clamp(1rem,4vw,2.8rem)]"
            >
              Подарочный сертификат DAIGO
            </h3>
            <p
              class="mb-3 sm:mb-6 text-[0.8rem] sm:text-xl lg:text-[1.5rem] flex flex-col gap-4 font-normal  w-10/12 sm:w-4/5 sm:max-w-4/5"
            >
              Идеальный подарок для заботы о здоровье и красоте, получатель сможет сам выбрать, что он хочет.
            </p>
            <NuxtLink
              :to="certificateCatalogLink"
              class="inline-flex justify-center items-center gap-2 py-2 sm:py-3 px-2 sm:px-5 text-white text-xs sm:text-xl font-normal transition duration-300 rounded-md rounded-lg tracking-wide w-40 sm:w-72 bg-primary hover:bg-primary/80 hover:text-white"
            >
              Купить сертификат
            </NuxtLink>
        </div>

    </div>

  </section>
</template>
