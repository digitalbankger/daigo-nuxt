<script setup lang="ts">
import { definePageMeta, defineAsyncComponent, storeToRefs } from '#imports'
import { useContentStore } from '~/stores/contentStore'

import StaticHeroBanner from '~/components/shared/StaticHeroBanner.vue'
import CategorySection from '~/components/sections/CategorySection.vue'
import InfoSection from '~/components/sections/InfoSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import SertificatSection from '~/components/sections/SertificatSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import AppSection from '~/components/sections/AppSection.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import MediaModal from '~/components/reviews/MediaModal.vue'
import AboutSection from '~/components/sections/AboutSection.vue'


import { ref } from 'vue'
import type { Review } from '~/types/content'

definePageMeta({ layout: 'main' })

/* ----- отзывы (медиа) ----- */
const isMediaModalOpen = ref(false)
const selectedReview = ref<Review | null>(null)
function openMediaModal(review: Review) {
  selectedReview.value = review
  isMediaModalOpen.value = true
}

/* ----- сторис ----- */
const contentStore = useContentStore()
await contentStore.load()

const { reviews } = storeToRefs(contentStore)

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
      <StaticHeroBanner />

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
      @open-review="openMediaModal"
    />
  </div>

  <BaseContainer>
    <div class="flex flex-col gap-10">
      <PartnersSection />
      <ClientOnly>
        <RewardSection />
      </ClientOnly>
      <AppSection />
    </div>
  </BaseContainer>

  <MediaModal
    v-if="selectedReview"
    :show="isMediaModalOpen"
    :type="selectedReview.type"
    :src="selectedReview.file_url || selectedReview.photo_urls?.[0] || ''"
    :onClose="() => {
      isMediaModalOpen = false
      selectedReview.value = null
    }"
  />
</template>
