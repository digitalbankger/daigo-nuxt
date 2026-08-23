<script setup lang="ts">
import { definePageMeta, defineAsyncComponent } from "#imports";
import CategorySection from "~/components/sections/CategorySection.vue";
import InfoSection from "~/components/sections/InfoSection.vue";
import CustomersSection from "~/components/sections/CustomersSection.vue";
import SertificatSection from "~/components/sections/SertificatSection.vue";
import PartnersSection from "~/components/sections/PartnersSection.vue";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import AboutSection from "~/components/sections/AboutSection.vue";
import StaticHeroBanner from "~/components/shared/StaticHeroBanner.vue";

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
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <StaticHeroBanner
        image="/images/home/longevity-desktop.jpg"
        image-mobile="/images/home/longevity-desktop.jpg"
        alt="Искусство долголетия — скидка 25% на линейку Daigo"
        content-class="!min-h-[450px] flex items-end sm:!min-h-[360px] sm:items-center lg:!min-h-[500px]"
      >
        <div class="flex w-full max-w-[670px] flex-col text-[#56462E]">
          <h1
            class="
              max-w-[610px]
              font-haido
              text-[clamp(40px,5.8vw,70px)]
              font-semibold
              leading-[0.98]
              drop-shadow-[0_3px_5px_rgba(0,0,0,0.18)]
            "
          >
            Искусство<br />долголетия
          </h1>

          <div class="mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 sm:mt-10">
            <span
              class="text-[clamp(56px,7.2vw,100px)] font-haido font-semibold italic leading-none"
            >
              -25%
            </span>
            <p
              class="mt-2 max-w-[330px] font-haido text-[clamp(20px,3vw,36px)] font-medium italic leading-[1.03] drop-shadow-[0_3px_5px_rgba(0,0,0,0.18)]"
            >
              25-30 августа<br />на всю линейку
            </p>
          </div>

          <div class="mt-7 grid w-full max-w-[600px] grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6">
            <NuxtLink
              to="/catalog"
              class="
                inline-flex items-center justify-center
                rounded-[8px]
                bg-primary
                px-6
                text-base sm:text-lg font-normal text-white
                shadow-[0_10px_30px_rgba(87,66,38,0.12)]
                transition-[filter,transform,box-shadow]
                duration-600
                ease-out
                hover:brightness-[1.06]
                hover:shadow-[0_14px_34px_rgba(87,66,38,0.18)]
                h-[40px]
                sm:h-[58px]
                sm:text-xl
              "
            >
              Выбрать Daigo
            </NuxtLink>

            <NuxtLink
              to="/articles"
              class="
                inline-flex items-center justify-center
                rounded-[8px]
                bg-primary
                px-6
                text-base sm:text-lg font-normal text-white
                shadow-[0_10px_30px_rgba(87,66,38,0.12)]
                transition-[filter,transform,box-shadow]
                duration-600
                ease-out
                hover:brightness-[1.06]
                hover:shadow-[0_14px_34px_rgba(87,66,38,0.18)]
                h-[40px]
                sm:h-[58px]
                sm:text-xl
              "
            >
              Прочитать статью
            </NuxtLink>
          </div>
        </div>
      </StaticHeroBanner>

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
