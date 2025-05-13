<script setup lang="ts">
import { useContentStore } from '~/store/contentStore'

const content = useContentStore()

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-20 rounded-3xl bg-cover bg-center text-black md:h-[410px]"
      :style="{ backgroundImage: `url(/images/sertifikaty-daigo.jpg)` }"
    >
        <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
            
            <img
              src="/logo.svg"
              alt="tovary-daigo"
              loading="lazy"
              class="md:w-28 mb-4"
            />
            <h3
              class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,2.8rem)]"
            >
              Подарочный сертификат DAIGO
            </h3>
            <p
              class="mb-6 text-[clamp(1rem,6vw,1.5rem)] flex flex-col gap-4 font-normal  md:max-w-4/5"
            >
                Идеальный подарок для заботы о здоровье и красоте, получатель сможет сам выбрать, что он хочет.
            </p>
            <NuxtLink
              :to="'/articles'"
              class="inline-flex justify-center items-center gap-2 py-3 px-5 text-white text-xl font-normal transition duration-300 rounded-lg tracking-wide w-72 bg-primary hover:text-white"
            >
              Перейти к статьям
            </NuxtLink>
        </div>

    </div>

  </section>
</template>
