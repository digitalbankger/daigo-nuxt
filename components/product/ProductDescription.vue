<template>
  <section v-if="sections?.length" id="description" class="space-y-10 py-10">
    <h2 class="text-slider font-medium">Описание товара</h2>

    <template v-for="(section, index) in sections" :key="index">
      <div v-if="section.type === 'cards' && section.layout === '7'" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 1-я большая карточка -->
          <div
            class="relative w-full bg-[#FAFAFA] p-6 pb-12 rounded-3xl relative flex flex-col items-start gap-6"
          >

            <div class="w-8/12">
              <h3 class="text-product font-medium mb-3 leading-tight">{{ section.cards[0].title }}</h3>
              <hr class="text-black/15 border my-4" />
              <div class="space-y-3 text-base" v-html="section.cards[0].text" ></div>
            </div>
            <div class="w-3/12">
              <img
                v-if="section.cards[0].image"
                :src="section.cards[0].image"
                class="absolute bottom-0 right-0 w-[200px]"
              />
            </div>

          </div>


          <!-- 4 карточки по 25% -->
          <div class="grid md:grid-cols-2 grid-rows-2 gap-8">
            <div
              v-for="(card, idx) in section.cards.slice(1, 5)"
              :key="'top-' + idx"
              class="relative bg-[#F8F8F8] p-4 pb-8 rounded-3xl flex flex-col gap-2 w-full"
            >
              <h3 class="font-medium text-xl w-full">{{ card.title }}</h3>
              <hr class="text-black/15 border my-1 w-9/12">
              <p class="text-base w-10/12">{{ card.text }}</p>
              <img
                v-if="card.image"
                :src="card.image"
                class="absolute bottom-0 right-0 w-[100px] md:w-[140px]"
              />
            </div>
          </div>
        </div>

        <!-- Нижняя группа: 2 карточки по 50% -->
        <div class="flex flex-row gap-8">
          <div
            v-for="(card, idx) in section.cards.slice(5)"
            :key="'bottom-' + idx"
            class="w-full md:w-1/2 bg-[#FAFAFA] p-6 pb-8 rounded-3xl relative flex flex-col gap-4"
          >
            <h3 class="font-medium text-cardhead w-full">{{ card.title }}</h3>
            <hr class="text-black/15 border my-1 w-9/12" />
            <p class="text-base w-10/12">{{ card.text }}</p>
            <img
              v-if="card.image"
              :src="card.image"
              class="absolute bottom-0 right-0 w-[120px] md:w-[160px]"
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
          class="relative bg-[#FAFAFA] p-6 pb-12 rounded-3xl flex flex-col gap-4"
        >
          <h3 class="text-xl font-semibold leading-tight">{{ card.title }}</h3>
          <hr class="text-black/15 border w-9/12" />
          <p class="text-gray-700 whitespace-pre-line">{{ card.text }}</p>
          <img
            v-if="card.image"
            :src="card.image"
            class="absolute bottom-0 right-0 w-[120px] md:w-[160px]"
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
      return 'grid-cols-1 md:grid-cols-2'
    case '5':
      return 'grid-cols-1 lg:grid-cols-12 [&>*:first-child]:col-span-6 [&>*:nth-child(n+2)]:col-span-3'
    case '734':
      return 'grid-cols-1 lg:grid-cols-12 [&>*]:col-span-6'
    default:
      return 'grid-cols-1 md:grid-cols-2'
  }
}
</script>
