<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
definePageMeta({ layout: 'main' })

import { useResearchStore } from '~/stores/researchStore'
import { useHead } from '#imports'

const store = useResearchStore()
await store.fetchCategories()

useHead({
  title: 'Исследования — Daigo',
  meta: [
    { name: 'description', content: 'Категории научных исследований продукции Daigo' },
    { property: 'og:title', content: 'Исследования — Daigo' },
    { property: 'og:description', content: 'Категории научных исследований продукции Daigo' }
  ]
})
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-center justify-between mb-6">
        <h1 class="text-slider font-medium">Исследования</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
        <NuxtLink
          v-for="cat in store.categories"
          :to="`/researches/${cat.slug}`"
          :key="cat.id"
          class="flex flex-col text-left group w-full max-w-[416px]"
        >
          <div class="w-full h-[350px] overflow-hidden rounded-[15px] mb-4">
            <img
              :src="cat.image"
              :alt="cat.title"
              class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              width="416"
              height="350"
            />
          </div>
          <h2 class="text-xl md:text-cardhead font-medium text-black leading-tight mb-4">
            {{ cat.title }}
          </h2>
          <span class="flex flex-row gap-2 items-center text-black/50">          
            <img src="/icons/file-dark.svg" width="20" class="opacity-50" />
            {{ cat.researchCount }} исследований
          </span>
        </NuxtLink>
      </div>

      </section>
  </BaseContainer>

</template>
