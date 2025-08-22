<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import Button from '~/components/ui/Button.vue'

definePageMeta({ layout: 'main' })

import { useRoute } from 'vue-router'
import { useResearchStore } from '~/stores/researchStore'
import { useSeoMeta, useHead } from '#imports'

const route = useRoute()
const store = useResearchStore()

// SSR-фетч
await store.fetchCategoryItems(route.params.slug as string)

// вычисления для верстки
const featured = computed(() => store.researches.filter(i => i.isFeatured))
const others = computed(() => store.researches.filter(i => !i.isFeatured))

// SEO
const pageTitle = computed(() =>
  `${store.currentCategory?.title ?? ''} — Исследования Daigo`
)
useSeoMeta({
  title: pageTitle.value,
  description: pageTitle.value,
  ogTitle: pageTitle.value,
  ogDescription: pageTitle.value
})
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle.value
      })
    }
  ]
})

function fmt(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('ru-RU')
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-center justify-between mb-6">
        <h1 class="text-[clamp(46px,8vw,80px)] font-medium">{{ store.currentCategory?.title }}</h1>
      </div>
      <!-- Верхний блок “Основные исследования” -->
      <div v-if="featured.length" class="mb-12">
        <h2 class="text-slider font-medium mb-4">Основные исследования</h2>

        <div class="flex gap-8 md:flex-row">
          <!-- слева — первый, большой -->
          <NuxtLink
            :to="`/researches/item/${featured[0].slug}`"
            class="flex flex-col text-left group w-full md:w-1/2"
          >
            <img
              :src="featured[0].image"
              :alt="featured[0].title"
              class="w-full md:h-[355px] object-cover object-center transition-transform duration-300 mb-4 rounded-2xl"
              loading="lazy"
              decoding="async"
            />
            <div class="">
              <h3 class="text-cardhead font-medium text-black leading-tight mb-4">
                {{ featured[0].title }}
              </h3>
              <span class="flex flex-row gap-2 items-center text-black/50">          
                <img src="/icons/calendar.svg" width="20" class="opacity-50" />
                {{ fmt(featured[0].date) }}
              </span>
            </div>
          </NuxtLink>

          <!-- справа — остальные фичеред в сетке; если их >3, уходят в несколько строк -->
          <div class="flex flex-col gap-8 w-full md:w-1/2">
            <NuxtLink
              v-for="it in featured.slice(1)"
              :key="it.id"
              :to="`/researches/item/${it.slug}`"
              class="flex flex-row gap-4 group block rounded-xl overflow-hidden"
            >
              <img
                :src="it.image"
                :alt="it.title"
                class="w-full md:h-[210px] object-cover object-center transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              <div class="">
                <h3 class="font-medium text-xl">
                  {{ it.title }}
                </h3>
                <span class="flex flex-row gap-2 items-center text-black/50 mt-4">          
                  <img src="/icons/calendar.svg" width="20" class="opacity-50" />
                  {{ fmt(it.date) }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Все исследования -->
      <h2 class="text-slider font-medium mb-4">Все исследования</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        <NuxtLink
          v-for="it in others"
          :key="it.id"
          :to="`/researches/item/${it.slug}`"
          class="group block overflow-hidden bg-white h-full flex flex-col gap-4"
        >
          <img
            :src="it.image"
            :alt="it.title"
            class="h-80 w-full object-cover rounded-xl"
            loading="lazy"
            decoding="async"
          />
              <h3 class="font-medium text-xl">
                {{ it.title }}
              </h3>
              <div class="flex flex-row gap-2 items-center text-black/50 mt-auto">          
                <img src="/icons/calendar.svg" width="20" class="opacity-50" />
                {{ fmt(it.date) }}
              </div>
        </NuxtLink>
      </div>
      
    </section>

    <section
      class="relative overflow-hidden w-full flex items-center justify-center rounded-2xl md:min-h-[415px] bg-primary bg-no-repeat px-6 md:px-6 lg:px-10 py-8 md:py-8 text-white mt-16"
    >
    <img src="/images/subscription-product.png" alt="Banner" class="absolute  z-0 right-0" />
    <img src="/images/subscription-left.png" alt="Banner" class="absolute z-0 left-0" />
      <div class="relative z-10 md:w-full flex flex-col gap-4 items-start justify-center my-auto">
        <h2 class="font-medium leading-tight text-slider">
          Подпишитесь на <span class="ms-1 rounded-md px-3 py-1 text-black bg-[#C3FF00]">рассылку</span>
        </h2>
        <p class="text-lg md:text-2xl leading-10 text-left max-w-[90%] md:max-w-[60%] mb-1">
          Оставьте свою электронную почту и получайте дайджест полезных видео и статей раз в неделю, а также узнавайте первыми о новых акциях и предложениях
        </p>
        <Button
          variant="solid"
          class="!text-black text-lg bg-white hover:bg-gray-100 w-60"
        >
          Отправить
      </Button>
      </div>
    </section>
  </BaseContainer>
</template>
