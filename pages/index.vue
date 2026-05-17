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
import AboutSection from '~/components/sections/AboutSection.vue'

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
      <BannerSection :banners="banners" />

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
      <AboutSection />
      <InfoSection />
      <CustomersSection />
      <SertificatSection />

    </div>
  </BaseContainer>

  <div class="flex flex-col gap-10">
    <ReviewSlider
      v-if="reviews"
      :reviews="reviews"
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
</template>
