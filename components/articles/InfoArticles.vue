<script setup lang="ts">
import { useContentStore } from '~/stores/contentStore'

const content = useContentStore()

const publicationCards = [
  {
    title: 'Метабиотики Дайго',
    text: 'Подборка статей, чтобы вы могли узнать больше о метабиотиках Дайго и об их применении',
    imageSrc: '/images/articles/meta.png',
    showArrow: true,
    arrowSrc: '/icons/Arrow-green.svg',
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#B7FFBA] h-[500px] w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'w-2/3 relative z-10 font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.5rem)]',
      text: 'relative z-10 text-[clamp(1rem,6vw,1.5rem)] font-normal',
      image: 'absolute bottom-0 right-0 w-[46%]',
      extraImage: 'absolute top-0 left-0 w-[31%] z-0',
      arrow: 'bottom-4 left-4 rotate-45',
    }
  },
  {
    title: 'Плазмалогены Дайго',
    text: 'Подборка статей, чтобы вы могли узнать больше о плазмогенах Дайго и об их применении',
    imageSrc: '/images/articles/plasmo.png',
    showArrow: true,
    arrowSrc: '/icons/Arrow-blue.svg',
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#B5EBFF] h-[500px] w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'w-2/3 relative z-10 font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.5rem)]',
      text: 'relative z-10 text-[clamp(1rem,6vw,1.5rem)] font-normal',
      image: 'absolute bottom-0 right-0 w-[46%]',
      extraImage: 'absolute top-0 left-0 w-[34%] z-0',
      arrow: 'bottom-4 left-4 rotate-45',
    }
  }
]

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-20 rounded-3xl bg-cover bg-center text-black h-[430px]"
      :style="{ backgroundImage: `url(/images/StartCard.png)` }"
    >
        <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
            <h3
              class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.5rem)]"
            >
            С чего начать
            </h3>
            <p
              class="mb-6 text-[clamp(1rem,6vw,1.5rem)] flex flex-col gap-4 font-normal w-2/3 sm:max-w-[80%] lg:max-w-[550px]"
            >
              Подборка статей, чтобы вы могли познакомиться с продуктами Дайго и подробнее узнать об их применении
            </p>
            <NuxtLink
              :to="'/articles'"
              class="inline-flex justify-center items-center gap-2 py-3 px-5 text-primary text-xl font-normal transition duration-300 border border-primary rounded-lg tracking-wide w-72 hover:bg-primary hover:text-white"
            >
              Перейти к статьям
            </NuxtLink>
        </div>

        <picture class="w-3/5 absolute bottom-0 right-6 md:bottom-0">
            <source :srcset="`/images/group-products.webp`" type="image/webp" />
            <img
              :src="`/images/group-products.webp`"
              alt="tovary-daigo"
              class="object-contain"
              loading="lazy"
            />
        </picture>

    </div>


    <div class="flex flex-row gap-6 w-full mt-6">
      <UiCard v-for="(item, index) in publicationCards" :key="index" :card="item" />
    </div>
  </section>
</template>