<script setup lang="ts">
import { definePageMeta, defineAsyncComponent, storeToRefs } from '#imports'
import { useContentStore } from '~/stores/contentStore'
import BannerSection from '~/components/sections/BannerSection.vue'
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
import type { Review, Story } from '~/types/content'

definePageMeta({ layout: 'main' })

const isMediaModalOpen = ref(false)
const selectedReview = ref<Review | null>(null)

function openMediaModal(review: Review) {
  selectedReview.value = review
  isMediaModalOpen.value = true
}

const isModalOpen = ref(false)
const modalSlides = ref<Story[]>([])
const currentStory = ref<Story | null>(null)

function getStoryQueue(story: Story): Story[] {
  const index = allStories.value.findIndex(s => s.id === story.id)
  return [
    ...allStories.value.slice(index),
    ...allStories.value.slice(0, index)
  ]
}

const allStories = ref<Story[]>([])

const contentStore = useContentStore()
await contentStore.load()

const { reviews, banners, stories } = storeToRefs(contentStore)

await contentStore.load()

function openStory(story: Story) {
  isModalOpen.value = true
  const index = stories.value.findIndex(s => s.id === story.id)
  modalSlides.value = [...stories.value.slice(index), ...stories.value.slice(0, index)]
}

const StoriesList = defineAsyncComponent(() => import('@/components/sections/StoriesList.vue'))
const ReviewSlider = defineAsyncComponent(() => import('@/components/sections/ReviewSlider.vue'))
const RewardSection = defineAsyncComponent(() => import('@/components/sections/RewardSection.vue'))

</script>

<template>
  <BaseContainer>
  <div class="flex flex-col gap-10">
    <BannerSection :banners="banners" />
    <ClientOnly>
      <StoriesList v-model:stories="stories" @open="openStory" />
      <StoryModal :isOpen="isModalOpen" :slides="modalSlides" @close="isModalOpen = false" />
    </ClientOnly>

    
    <CategorySection />
    <InfoSection />
    <CustomersSection />
    <SertificatSection />
    <h2 class="text-slider font-medium mt-8">
      О компании Да́йго
    </h2>
    <AboutSection />

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
    <!-- <WideSelectionSection /> -->
    <AppSection />
    <!-- <SubscribeSection /> -->
  </div>
  </BaseContainer>

  <MediaModal
    v-if="selectedReview"
    :show="isMediaModalOpen"
    :type="selectedReview.type"
    :src="selectedReview.file_url || selectedReview.photo_urls?.[0] || ''"
    :onClose="() => {
      isMediaModalOpen.value = false
      selectedReview.value = null
    }"
  />

</template>
