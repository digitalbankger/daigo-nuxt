<template>
  <section v-if="sections?.length" id="description" class="space-y-6 sm:space-y-10 py-4 sm:py-10">
    <h2 class="text-3xl sm:text-product xl:text-slider font-medium">Описание товара</h2>

    <template v-for="(section, index) in sections" :key="index">
      <div v-if="section.type === 'cards' && section.layout === '7'" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <!-- 1-я большая карточка -->
          <div
            class="relative overflow-hidden relative w-full bg-[#FAFAFA] px-4 py-6 sm:py-6 sm:px-6 pb-4 sm:pb-12 rounded-2xl sm:rounded-3xl relative flex flex-col items-start gap-6"
          >

            <div class="w-10/12 sm:w-8/12 relative z-10">
              <h3 class="text-xl sm:text-product font-medium mb-3 leading-tight sm:w-2/3 lg:w-full">{{ section.cards[0].title }}</h3>
              <hr class="text-black/15 border my-4" />
              <div class="space-y-3 text-sm sm:text-base" v-html="section.cards[0].text" ></div>
            </div>
            <div class="w-3/12">
              <img
                v-if="section.cards[0].image"
                :src="section.cards[0].image"
                class="absolute z-0 bottom-0 -right-10 sm:right-0 w-[140px] sm:w-[200px]"
              />
            </div>

          </div>


          <!-- 4 карточки по 25% -->
          <div class="grid sm:grid-cols-2 grid-rows-2 gap-6 sm:gap-8">
            <div
              v-for="(card, idx) in section.cards.slice(1, 5)"
              :key="'top-' + idx"
              class="relative bg-[#F8F8F8] p-4 pb-8 rounded-2xl sm:rounded-3xl flex flex-col gap-2 w-full"
            >
              <h3 class="font-medium text-xl w-full">{{ card.title }}</h3>
              <hr class="text-black/15 border my-1 w-9/12">
              <p class="text-sm sm:text-base w-10/12">{{ card.text }}</p>
              <img
                v-if="card.image"
                :src="card.image"
                class="absolute bottom-1 right-1 h-[80px] sm:h-[80px]"
              />
            </div>
          </div>
        </div>

        <!-- Нижняя группа: 2 карточки по 50% -->
        <div class="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div
            v-for="(card, idx) in section.cards.slice(5)"
            :key="'bottom-' + idx"
            class="w-full lg:w-1/2 bg-[#FAFAFA] px-4 py-6 sm:py-6 sm:px-6 pb-8 rounded-2xl sm:rounded-3xl relative flex flex-col gap-4"
          >
            <h3 class="font-medium text-xl sm:text-cardhead w-full leading-tight sm:w-6/12 lg:w-full">{{ card.title }}</h3>
            <hr class="text-black/15 border my-1 w-9/12 sm:w-7/12 lg:w-9/12" />
            <p class="text-sm sm:text-base w-10/12 sm:w-8/12 lg:w-10/12">{{ card.text }}</p>
            <img
              v-if="card.image"
              :src="card.image"
              class="absolute bottom-0 right-0 h-[80px] sm:h-[140px] lg:h-[120px]"
            />
          </div>
        </div>
      </div>

      <!-- 🟢 Остальные layout-ы (по grid) -->
      <div
        v-else-if="section.type === 'cards'"
        class="grid gap-6"
        :class="getGrid(section.layout)"
      >
        <div
          v-for="(card, idx) in section.cards"
          :key="idx"
          class="relative bg-[#FAFAFA] px-4 py-6 sm:py-6 sm:px-6 pb-6 sm:pb-12 rounded-2xl sm:rounded-3xl flex flex-col gap-4"
        >
          <h3 class="text-xl font-semibold leading-tight">{{ card.title }}</h3>
          <hr class="text-black/15 border w-9/12" />
          <p class="text-black/70 whitespace-pre-line">{{ card.text }}</p>
          <img
            v-if="card.image"
            :src="card.image"
            class="absolute bottom-0 right-0 h-[80px] sm:h-[140px]"
          />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{ product: Product }>()

const sections = props.product.descriptionSections

const getGrid = (layout: string) => {
  switch (layout) {
    case '2':
      return 'grid-cols-1 sm:grid-cols-2'
    case '5':
      return 'grid-cols-1 lg:grid-cols-12 [&>*:first-child]:col-span-6 [&>*:nth-child(n+2)]:col-span-3'
    case '734':
      return 'grid-cols-1 lg:grid-cols-12 [&>*]:col-span-6'
    default:
      return 'grid-cols-1 sm:grid-cols-2'
  }
}
</script>
