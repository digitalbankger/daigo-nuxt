<template>
  <section ref="target" class="py-2">
    <div v-if="loaded && popularArticles.length" class="container">
      <Swiper
        :modules="[Navigation, Pagination]"
        :slides-per-view="3"
        :space-between="20"
        navigation
        pagination
        class="popular-articles-carousel"
      >
        <SwiperSlide v-for="article in popularArticles" :key="article.id">
          <ArticleCard :article="article" />
        </SwiperSlide>
      </Swiper>
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
        .sort((a, b) => b.views - a.views)
        .slice(0, 6)
      loaded.value = true
    }
  },
  { threshold: 0.1 }
)
</script>

<style scoped>
.popular-articles-carousel {
  width: 100%;
}
</style>
