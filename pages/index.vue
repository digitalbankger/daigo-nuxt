<script setup lang="ts">
import { definePageMeta, defineAsyncComponent, storeToRefs } from '#imports'
import { useContentStore } from '~/store/contentStore'
import BannerSection from '~/components/sections/BannerSection.vue'
import CategorySection from '~/components/sections/CategorySection.vue'
import InfoSection from '~/components/sections/InfoSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import SertificatSection from '~/components/sections/SertificatSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import WideSelectionSection from '~/components/sections/WideSelectionSection.vue'
import AppSection from '~/components/sections/AppSection.vue'
import SubscribeSection from '~/components/sections/SubscribeSection.vue'

definePageMeta({ layout: 'main' })

const contentStore = useContentStore()
await contentStore.load()

const { reviews, banner } = storeToRefs(contentStore)

const StoriesList = defineAsyncComponent(() => import('@/components/sections/StoriesList.vue'))
const ReviewSlider = defineAsyncComponent(() => import('@/components/sections/ReviewSlider.vue'))

const isModalOpen = ref(false)
const modalSlides = ref<string[]>([])

const openStory = (story: { slides: string[] }) => {
  modalSlides.value = story.slides
  isModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <BannerSection :banner="banner" />

    <ClientOnly>
      <StoriesList @open="openStory" />
    </ClientOnly>

    <ClientOnly>
      <StoryModal :isOpen="isModalOpen" :slides="modalSlides" @close="isModalOpen = false" />
    </ClientOnly>
    
    <CategorySection />
    <InfoSection />
    <CustomersSection />
    <SertificatSection />

    <ReviewSlider v-if="reviews" :reviews="reviews" />
    <PartnersSection />
    <WideSelectionSection />
    <AppSection />
    <SubscribeSection />

  </div>
</template>
