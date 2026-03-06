<script setup lang="ts">
import { useContentStore } from '~/stores/contentStore'
import UiCard from '~/components/ui/UiCard.vue'

const content = useContentStore()

const publicationCards = [
  {
    title: 'Статьи',
    text: 'Мы еженедельно выпускаем новые статьи, в которых рассказываем о продуктах Дайго',
    imageSrc: '/images/book.webp',
    extraImage: '/images/feb/Bookmark.svg',
    showArrow: true,
    arrowSrc: '/images/feb/el-arrow.svg',
    lazy: true,
    link: "/articles",
    styles: {
      card: 'relative overflow-hidden bg-[#F1B0C9] h-[290px] sm:h-[300px] lg:h-[500px] w-full sm:w-1/2 rounded-3xl sm:py-10 sm:px-10 lg:px-12',
      title: 'text-white relative z-10 font-medium leading-tight mb-0 lg:mb-4 text-[clamp(2rem,6vw,3.5rem)] sm:text-3xl lg:text-[clamp(2rem,6vw,3.5rem)]',
      text: 'text-white relative z-10 w-full text-[clamp(1rem,4vw,1.5rem)] lg:w-4/5 sm:text-base lg:text-[clamp(1rem,4vw,1.5rem)] font-normal !leading-tight',
      image: 'absolute bottom-0 right-0 w-[55%]',
      extraImage: 'absolute top-0 left-0 w-[31%] z-0',
    }
  },
  {
    title: 'Исследования',
    text: 'Научные исследования, подтверждающие эффективность продуктов Дайго',
    imageSrc: '/images/malekula.webp',
    extraImage: '/images/feb/Team.svg',
    showArrow: true,
    arrowSrc: '/images/feb/el-arrow-sec.svg',
    lazy: true,
    link: "/researches",
    styles: {
      card: 'relative overflow-hidden bg-[#B684B5] h-[290px] sm:h-[300px] lg:h-[500px] w-full sm:w-1/2 rounded-3xl sm:py-10 sm:px-10 lg:px-12',
      title: 'text-white relative z-10 font-medium leading-tight mb-0 lg:mb-4 text-[clamp(2rem,6vw,3.5rem)] sm:text-3xl lg:text-[clamp(2rem,6vw,3.5rem)]',
      text: 'text-white relative z-10 text-[clamp(1rem,4vw,1.5rem)] sm:text-base lg:text-[clamp(1rem,4vw,1.5rem)] font-normal !leading-tight',
      image: 'absolute bottom-0 right-0 w-[60%]',
      extraImage: 'absolute top-0 left-0 w-[34%] z-0',
    }
  }
]
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <div
      class="relative overflow-hidden flex flex-col sm:flex-row items-center justify-between
             px-6 sm:px-10 lg:px-16 py-8 sm:py-20 rounded-3xl
             bg-cover bg-right-top sm:bg-right lg:bg-center text-black
             h-[345px] sm:h-[430px] start-card"
      :style="{
        '--bg-mobile':  'url(/images/feb/scmob.jpg)',
        '--bg-tablet':  'url(/images/feb/StartCard.jpg)',
        '--bg-desktop': 'url(/images/feb/StartCard.jpg)'
      }"
    >
      <div class="w-full sm:max-w-[80%] lg:max-w-[60%]">
        <h3 class="text-white font-medium leading-tight mb-4 text-[clamp(2rem,5vw,3.5rem)]">
          С чего начать
        </h3>
        <p class="text-white mb-4 sm:mb-6 text-[clamp(1rem,3vw,1.5rem)] flex flex-col gap-4 font-normal w-full sm:max-w-[80%] sm:max-w-full lg:max-w-[550px]">
          Подборка статей, чтобы вы могли познакомиться с продуктами Дайго и подробнее узнать об их применении
        </p>
        <NuxtLink
          to="/articles"
          class="hidden sm:inline-flex relative z-20 justify-center items-center gap-2 py-3 px-3 sm:px-5
                 text-[#fff] text-lg sm:text-xl font-normal transition duration-300
                 border border-[#fff] rounded-lg tracking-wide w-56 sm:w-72
                 hover:bg-[#fff] hover:text-black"
        >
          Перейти к статьям
        </NuxtLink>

        <NuxtLink
          to="/articles"
          class="relative z-20 text-[#FA458A] inline-flex sm:hidden items-center gap-2 text-base sm:text-2xl font-normal transition duration-300 group"
        >
          Перейти к статьям
          <img src="/icons/arrow-pink.svg" alt="→" class="w-6 h-6 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <picture class="w-full sm:w-3/5 absolute bottom-0 right-0 sm:right-6 sm:bottom-0">
        <source srcset="/images/group-products.webp" type="image/webp" />
        <img src="/images/group-products.webp" alt="tovary-daigo" class="object-contain" loading="lazy" />
      </picture>
    </div>

    <div class="flex flex-col sm:flex-row gap-6 w-full mt-6">
      <UiCard v-for="(item, index) in publicationCards" :key="index" :card="item" />
    </div>
  </section>
</template>

<style scoped>
/* По умолчанию (desktop ≥1024px) */
.start-card {
  background-image: var(--bg-desktop);
}

/* Tablet: 768–1023px */
@media (min-width: 768px) and (max-width: 1023.98px) {
  .start-card {
    background-image: var(--bg-tablet);
  }
}

/* Mobile: <768px */
@media (max-width: 767.98px) {
  .start-card {
    background-image: var(--bg-mobile);
  }
}
</style>
