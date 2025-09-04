<template>
  <section ref="target" class="py-1 md:py-2">
    <div v-if="loaded && popularArticles.length" class="container relative">
      <ClientOnly>
        <Swiper
          :modules="[Navigation, Pagination]"
          :slides-per-view="1"
          :space-between="20"
          :navigation="{
            prevEl: '.swiper-button-prev-partner',
            nextEl: '.swiper-button-next-partner'
          }"
          :pagination="{ el: '.popular-articles-pagination', clickable: true }"
          :breakpoints="{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 } 
          }"
          class="popular-articles-carousel"
        >
          <SwiperSlide v-for="article in popularArticles" :key="article.id">
            <ArticleCard :article="article" />
          </SwiperSlide>
        </Swiper>

        <!-- кастомные стрелки -->
        <div class="flex items-center justify-center gap-6 w-full mt-4">
          <button
            class="swiper-button-prev-partner w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Назад"
            type="button"
            @click="slide(-1)"
          >
            <img src="/icons/arrow-left.svg" alt="" class="w-full" />
          </button>
          <button
            class="swiper-button-next-partner w-8 h-8 rounded-full flex items-center justify-center"
            aria-label="Вперёд"
            type="button"
            @click="slide(1)"
          >
            <img src="/icons/arrow-right.svg" alt="" class="w-full" />
          </button>
        </div>

        <!-- пагинация (точки) -->
        <!-- <div class="popular-articles-pagination mt-4 flex justify-center"></div> -->
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useArticlesStore } from '~/stores/articlesStore'
import type { Article } from '~/types/articles'
import ArticleCard from '~/components/articles/ArticleCard.vue'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const target = ref<HTMLElement | null>(null)
const loaded = ref(false)
const popularArticles = ref<Article[]>([])

useIntersectionObserver(
  target,
  async ([{ isIntersecting }]) => {
    if (isIntersecting && !loaded.value) {
      const store = useArticlesStore()
      await store.fetchArticles({})
      popularArticles.value = [...store.articles]
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 6)
      loaded.value = true
    }
  },
  { threshold: 0.1 }
)
</script>

<style scoped>
.popular-articles-carousel { width: 100%; }
/* при желании спрячьте дефолтные стрелки swiper, если появятся по умолчанию */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) { display: none; }
</style>
