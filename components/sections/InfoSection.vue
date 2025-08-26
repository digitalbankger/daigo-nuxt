<script setup lang="ts">
import { useContentStore } from '~/stores/contentStore'
const { $device } = useNuxtApp()
import UiCard from '~/components/ui/UiCard.vue'
const content = useContentStore()

const publicationCards = [
  {
    title: 'Статьи',
    text: 'Мы еженедельно выпускаем новые статьи, в которых рассказываем о продуктах Дайго',
    imageSrc: '/images/book.webp',
    extraImage: '/images/Bookmark.webp',
    showArrow: true,
    arrowSrc: '/icons/Arrow-green.svg',
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#B7FFBA] h-[290px] md:h-[500px] w-full md:w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'relative z-10 font-medium leading-tight mb-0 md:mb-4 text-[clamp(2rem,6vw,3.5rem)]',
      text: 'relative z-10 w-full md:w-4/5 text-[clamp(1rem,4vw,1.5rem)] font-normal',
      image: 'absolute bottom-0 right-0 w-[55%]',
      extraImage: 'absolute top-0 left-0 w-[31%] z-0',
    }
  },
  {
    title: 'Исследования',
    text: 'Научные исследования, подтверждающие эффективность продуктов Дайго',
    imageSrc: '/images/malekula.webp',
    extraImage: '/images/team.webp',
    showArrow: true,
    arrowSrc: '/icons/Arrow-blue.svg',
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#B5EBFF] h-[290px] md:h-[500px] w-full md:w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'relative z-10 font-medium leading-tight mb-0 md:mb-4 text-[clamp(2rem,6vw,3.5rem)]',
      text: 'relative z-10 text-[clamp(1rem,4vw,1.5rem)] font-normal',
      image: 'absolute bottom-0 right-0 w-[60%]',
      extraImage: 'absolute top-0 left-0 w-[34%] z-0',
    }
  }
]

</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-8 md:py-20 rounded-3xl bg-cover bg-right-top bg-size-5/12 md:bg-center text-black h-[345px] md:h-[430px]"
      :style="{
        backgroundImage: `url(${$device.isMobile ? '/images/scmob.webp' : '/images/StartCard.png'})`
      }"
    >
        <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
            <h3
              class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.5rem)]"
            >
            С чего начать
            </h3>
            <p
              class="mb-4 md:mb-6 text-[clamp(1rem,4vw,1.5rem)] flex flex-col gap-4 font-normal w-full sm:max-w-[80%] lg:max-w-[550px]"
            >
              Подборка статей, чтобы вы могли познакомиться с продуктами Дайго и подробнее узнать об их применении
            </p>
            <NuxtLink
              :to="'/articles'"
              class="hidden md:inline-flex justify-center items-center gap-2 py-3 px-3 md:px-5 text-[#FA458A] text-lg md:text-xl font-normal transition duration-300 border border-[#FA458A] rounded-lg tracking-wide w-56 md:w-72 hover:bg-primary hover:text-white"
            >
              Перейти к статьям
            </NuxtLink>
            <NuxtLink
              to="/akcii"
              class="relative z-20 text-[#FA458A] inline-flex md:hidden items-center gap-2 text-base md:text-2xl font-normal transition duration-300 group"
            >
              Перейти к статьям
              <img
                src="/icons/arrow-pink.svg"
                alt="→"
                class="w-6 h-6 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
              />
            </NuxtLink>
        </div>

        <picture class="w-full md:w-3/5 absolute bottom-0 right-0 md:right-6 md:bottom-0">
            <source :srcset="`/images/group-products.webp`" type="image/webp" />
            <img
              :src="`/images/group-products.webp`"
              alt="tovary-daigo"
              class="object-contain"
              loading="lazy"
            />
        </picture>

    </div>


    <div class="flex flex-col md:flex-row gap-6 w-full mt-6">
      <UiCard v-for="(item, index) in publicationCards" :key="index" :card="item" />
    </div>
  </section>
</template>





<!-- <script setup lang="ts">
import { useContentStore } from '~/store/contentStore'

const content = useContentStore()
</script>

<template>
  <section class="relative w-full overflow-hidden h-[430px] rounded-4xl">
    <picture>
      <source srcset="/images/StartCard.avif" type="image/avif" />
      <source srcset="/images/StartCard.png" type="image/png" />
      <img
        src="/images/StartCard.png"
        alt="Фон"
        class="absolute inset-0 w-full h-full object-cover rounded-4xl"
        loading="lazy"
      />
    </picture>

    <div
      class="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 md:py-20 text-black h-full"
    >
      <div class="w-full md:max-w-[50%] lg:max-w-[60%]">
        <h3 class="font-medium leading-tight mb-4 text-[clamp(2rem,6vw,3.5rem)]">
          С чего начать
        </h3>
        <p class="mb-6 text-[clamp(1rem,6vw,1.5rem)] flex flex-col gap-4 font-normal w-2/3 sm:max-w-[80%] lg:max-w-[550px]">
          Подборка статей, чтобы вы могли познакомиться с продуктами Дайго и подробнее узнать об их применении
        </p>
        <NuxtLink
          :to="'/articles'"
          class="inline-flex items-center gap-2 py-3 text-2xl font-normal transition duration-300 group"
        >
          <img
            src="/icons/arrow.svg"
            alt="→"
            class="w-5 h-5 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-row gap-6 w-full mt-6">
      <UiCard
        title="Нервная система и мозг"
        imageSrc="/img/brain.png"
        :imageStyle="{ width: '60px', height: '60px' }"
        text="Позаботьтесь о здоровье мозга"
        :showArrow="true"
        :lazy="true"
      />
      <UiCard
        title="Нервная система и мозг"
        imageSrc="/img/brain.png"
        :imageStyle="{ width: '60px', height: '60px' }"
        text="Позаботьтесь о здоровье мозга"
        :showArrow="true"
        :lazy="true"
      />
    </div>
  </section>
</template> -->
