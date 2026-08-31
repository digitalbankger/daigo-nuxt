<script setup lang="ts">
import { definePageMeta, defineAsyncComponent } from "#imports";
import CategorySection from "~/components/sections/CategorySection.vue";
import InfoSection from "~/components/sections/InfoSection.vue";
import CustomersSection from "~/components/sections/CustomersSection.vue";
import SertificatSection from "~/components/sections/SertificatSection.vue";
import PartnersSection from "~/components/sections/PartnersSection.vue";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import AboutSection from "~/components/sections/AboutSection.vue";
import BannerSection from "~/components/sections/BannerSection.vue";

definePageMeta({ layout: "main" });

useSeoMeta({
  ogTitle: "Официальный сайт Daigo (Дайго) в России и СНГ",
  ogDescription:
    "Купить Daigo (Daigo) с бесплатной доставкой у официального дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.",
  ogType: "website",
  ogUrl: "https://daigo.ru/",
  ogImage: "https://daigo.ru/images/wide-selection.webp",
  ogImageSecureUrl: "https://daigo.ru/images/wide-selection.webp",
  twitterCard: "summary_large_image",
  twitterImage: "https://daigo.ru/images/wide-selection.webp",
});

const RewardSection = defineAsyncComponent(
  () => import("@/components/sections/RewardSection.vue"),
);

const contentStore = useContentStore()
await contentStore.load()

const { banners } = storeToRefs(contentStore)
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <BannerSection :banners="banners" />

      <CategorySection />
      <h2 class="text-slider md:text-product lg:text-slider font-medium mt-8">
        О компании Дайго
      </h2>
      <AboutSection />
      <InfoSection />
      <CustomersSection />
      <SertificatSection />
    </div>
  </BaseContainer>

  <BaseContainer>
    <div class="flex flex-col gap-10 mt-10">
      <PartnersSection />
      <ClientOnly>
        <RewardSection />
      </ClientOnly>
    </div>
  </BaseContainer>
</template>
