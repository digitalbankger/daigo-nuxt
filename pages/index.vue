<script setup lang="ts">
import { definePageMeta, defineAsyncComponent, storeToRefs } from '#imports'
import { useContentStore } from '~/stores/contentStore'
import BannerSection from '~/components/sections/BannerSection.vue'
import CategorySection from '~/components/sections/CategorySection.vue'
import InfoSection from '~/components/sections/InfoSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import SertificatSection from '~/components/sections/SertificatSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import MediaModal from '~/components/reviews/MediaModal.vue'
import AboutSection from '~/components/sections/AboutSection.vue'

import { ref } from 'vue'
import type { Review } from '~/types/content'
import MainCardsSwiper from '~/components/swiper/MainCardsSwiper.vue'

definePageMeta({ layout: 'main' })

useSeoMeta({
  ogTitle: 'Официальный сайт Daigo (Дайго) в России и СНГ',
  ogDescription: 'Купить Daigo (Daigo) с бесплатной доставкой у официальныго дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.',
  ogType: 'website',
  ogUrl: 'https://daigo.ru/',

  ogImage: 'https://daigo.ru/images/wide-selection.webp',
  ogImageSecureUrl: 'https://daigo.ru/images/wide-selection.webp',
  // ogImageWidth: 1200,
  // ogImageHeight: 630,

  twitterCard: 'summary_large_image',
  twitterImage: 'https://daigo.ru/images/wide-selection.webp',
})

/* ----- отзывы (медиа) ----- */
const isMediaModalOpen = ref(false)
const selectedReview = ref<Review | null>(null)
function openMediaModal(review: Review) {
  selectedReview.value = review
  isMediaModalOpen.value = true
}

const aboutVideoSrc = ref('')

function openAboutVideo(payload: { type: 'video'; src: string }) {
  aboutVideoSrc.value = payload.src
  isMediaModalOpen.value = true
}

function closeMediaModal() {
  isMediaModalOpen.value = false
  selectedReview.value = null
  aboutVideoSrc.value = ''
}
/* ----- сторис ----- */
const contentStore = useContentStore()
await contentStore.load()

const { reviews, banners } = storeToRefs(contentStore)

// const isModalOpen = ref(false)
// const modalSlides = ref<Story[]>([])

// async function openStory(s: { id: number | string }) {
//   const index = stories.value.findIndex(i => i.id === s.id)
//   if (index === -1) return

//   // префетчим детали первого сториса очереди
//   const first = stories.value[index]
//   try {
//     const detail = await contentStore.fetchStory(first.id)
//     Object.assign(first, {
//       slides: detail.slides || [],
//       media: detail.slides || [],
//       productIds: detail.products || [],
//     })
//   } catch {}

//   // формируем очередь и открываем
//   modalSlides.value = [
//     ...stories.value.slice(index),
//     ...stories.value.slice(0, index)
//   ]
//   isModalOpen.value = true
// }


/* ленивые секции */
const ReviewSlider  = defineAsyncComponent(() => import('@/components/sections/ReviewSlider.vue'))
const RewardSection = defineAsyncComponent(() => import('@/components/sections/RewardSection.vue'))
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <!-- <BannerSection :banners="banners" /> -->
      <!-- <MainCardsSwiper /> -->
       <img src="/images/catalog/may9.png" alt="">

      <!-- <ClientOnly>
        <StoriesList v-model:stories="stories" @open="openStory" />
      </ClientOnly> -->

      <!-- Модалка сторис — вне ClientOnly, показываем по v-if 
      <StoryModal
        v-if="isModalOpen"
        :isOpen="isModalOpen"
        :slides="modalSlides"
        @close="isModalOpen = false"
      />-->

      <CategorySection />
      <h2 class="text-slider md:text-product lg:text-slider font-medium mt-8">
        О компании Да́йго
      </h2>
      <AboutSection @open-video="openAboutVideo" />
      <InfoSection />
      <CustomersSection />
      <SertificatSection />

    </div>
  </BaseContainer>

  <div class="flex flex-col gap-10">
    <ReviewSlider
      v-if="reviews"
      :reviews="reviews"
      @open-review="openMediaModal"
    />
  </div>

  <BaseContainer>
    <div class="flex flex-col gap-10">
      <PartnersSection />
      <ClientOnly>
        <RewardSection />
      </ClientOnly>
    </div>
  </BaseContainer>

  <MediaModal
    :show="isMediaModalOpen"
    :type="aboutVideoSrc ? 'video' : (selectedReview?.type || 'image')"
    :src="aboutVideoSrc || selectedReview?.file_url || selectedReview?.photo_urls?.[0] || ''"
    :onClose="closeMediaModal"

  />
</template>
