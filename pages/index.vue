<script setup lang="ts">
import { definePageMeta, defineAsyncComponent } from '#imports'
import { useContentStore } from '~/store/contentStore'
import BannerSection from '~/components/sections/BannerSection.vue'
import CategorySection from '~/components/sections/CategorySection.vue'
import InfoSection from '~/components/sections/InfoSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'

definePageMeta({ layout: 'main' })

const contentStore = useContentStore()
await contentStore.load()

const StoriesList = defineAsyncComponent(() => import('@/components/sections/StoriesList.vue'))

const isModalOpen = ref(false)
const modalSlides = ref<string[]>([])

const openStory = (story: { slides: string[] }) => {
  modalSlides.value = story.slides
  isModalOpen.value = true
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <BannerSection />

    <ClientOnly>
      <StoriesList @open="openStory" />
    </ClientOnly>
    <ClientOnly>
      <StoryModal :isOpen="isModalOpen" :slides="modalSlides" @close="isModalOpen = false" />
    </ClientOnly>
    
    <CategorySection />
    <InfoSection />
    <CustomersSection />
  </div>
</template>
