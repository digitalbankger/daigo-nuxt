<script setup lang="ts">
import { definePageMeta, defineAsyncComponent, storeToRefs } from '#imports'
import { useContentStore } from '~/stores/contentStore'
import CategorySection from '~/components/sections/CategorySection.vue'
import InfoSection from '~/components/sections/InfoSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import SertificatSection from '~/components/sections/SertificatSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import AboutSection from '~/components/sections/AboutSection.vue'
import MicrobiomePromoBanner from '~/components/promotions/MicrobiomePromoBanner.vue'

definePageMeta({ layout: 'main' })

useSeoMeta({
  ogTitle: 'Официальный сайт Daigo (Дайго) в России и СНГ',
  ogDescription: 'Купить Daigo (Daigo) с бесплатной доставкой у официальныго дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.',
  ogType: 'website',
  ogUrl: 'https://daigo.ru/',

  ogImage: 'https://daigo.ru/images/wide-selection.webp',
  ogImageSecureUrl: 'https://daigo.ru/images/wide-selection.webp',

  twitterCard: 'summary_large_image',
  twitterImage: 'https://daigo.ru/images/wide-selection.webp',
})

const contentStore = useContentStore()
await contentStore.loadReviewsOnly()

const { reviews } = storeToRefs(contentStore)

const ReviewSlider  = defineAsyncComponent(() => import('@/components/sections/ReviewSlider.vue'))
const RewardSection = defineAsyncComponent(() => import('@/components/sections/RewardSection.vue'))
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <MicrobiomePromoBanner />

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
