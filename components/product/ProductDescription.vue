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

            <div class="w-10/12 sm:w-10/12 relative z-10">
              <h3 class="text-xl sm:text-product font-medium mb-3 leading-tight sm:w-2/3 lg:w-full">{{ section.cards[0].title }}</h3>
              <hr class="text-black/15 border my-4" />
              <div class="space-y-3 text-sm sm:text-base w-full sm:w-10/12" v-html="section.cards[0].text" ></div>
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
            class="w-full lg:w-1/2 bg-[#FAFAFA] px-4 py-6 sm:py-6 sm:px-6 pb-8 rounded-2xl sm:rounded-3xl relative flex flex-col gap-4 overflow-hidden"
          >
            <h3 class="font-medium text-xl sm:text-cardhead w-full leading-tight sm:w-6/12 lg:w-full">{{ card.title }}</h3>
            <hr class="text-black/15 border my-1 w-9/12 sm:w-7/12 lg:w-9/12" />
            <p class="text-sm sm:text-base w-10/12 sm:w-8/12 lg:w-10/12 whitespace-pre-line">{{ card.text }}</p>
            <p class="mt-2 text-xs sm:text-sm text-black/70 sm:w-8/12 lg:w-10/12 whitespace-pre-line">{{ card.note }}</p>
            <img
              v-if="card.image"
              :src="card.image"
              class="absolute bottom-0 right-0 h-[80px] sm:h-[140px] lg:h-[120px]"
            />
          </div>
        </div>
      </div>

      <!-- Лейаут: 7x (1 большая слева ~55%, справа 2, ниже 2 ряда по 2) -->
      <div v-else-if="section.type === 'cards' && section.layout === '734'" class="space-y-8">
        <!-- Верх: большая + 2 справа -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <!-- большая слева (~55%) -->
          <div
            class="relative overflow-hidden bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-6 pb-4 sm:pb-12 rounded-2xl sm:rounded-3xl flex flex-col items-start gap-6
                  lg:col-span-7"
          >
            <div class="relative z-10 w-full">
              <h3 class="text-xl sm:text-product font-medium mb-3 leading-tight">{{ section.cards[0].title }}</h3>
              <hr class="text-black/15 border my-4" />
              <div class="space-y-3 text-sm sm:text-base w-full sm:w-10/12" v-html="section.cards[0].text"></div>
            </div>

            <img
              v-if="section.cards[0].image"
              :src="section.cards[0].image"
              :alt="section.cards[0].title"
              class="absolute z-0 bottom-0 -right-10 sm:right-0 w-[140px] sm:w-[200px]"
              loading="lazy" decoding="async"
            />
          </div>

          <!-- справа 2 карточки (столбец) -->
          <div class="grid grid-cols-1 gap-6 sm:gap-8 lg:col-span-5">
            <div
              v-for="(card, i) in section.cards.slice(1, 3)"
              :key="'right-'+i"
              class="relative bg-[#F8F8F8] p-4 pb-8 rounded-2xl sm:rounded-3xl flex flex-col gap-2"
            >
              <h3 class="font-medium text-xl">{{ card.title }}</h3>
              <hr class="text-black/15 border my-1 w-9/12" />
              <p class="text-sm sm:text-base w-10/12" v-html="card.text"></p>
              <img
                v-if="card.image"
                :src="card.image"
                :alt="card.title"
                class="absolute bottom-1 right-1 h-[80px] sm:h-[80px] object-contain"
                loading="lazy" decoding="async"
              />
            </div>
          </div>
        </div>

        <!-- Низ: два ряда по 2 карточки (50/50) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="(card, idx) in section.cards.slice(3, 7)"
            :key="'bottom-'+idx"
            class="relative bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-6 pb-8 rounded-2xl sm:rounded-3xl flex flex-col gap-4"
          >
            <h3 class="font-medium text-xl sm:text-cardhead leading-tight">{{ card.title }}</h3>
            <hr class="text-black/15 border my-1 w-9/12" />
            <p class="text-sm sm:text-base w-10/12" v-html="card.text"></p>
            <p v-if="card.note" class="mt-2 text-xs sm:text-sm text-black/70 w-10/12" v-html="card.note"></p>
            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="absolute bottom-0 right-0 h-[80px] sm:h-[120px]"
              loading="lazy" decoding="async"
            />
          </div>
        </div>
      </div>

      <!-- Лейаут: 2 карточки по 50% -->
      <div v-else-if="section.type === 'cards' && section.layout === '2'">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div
            v-for="(card, idx) in section.cards"
            :key="'two-' + idx"
            class="relative overflow-hidden w-full bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-6 pb-4 sm:pb-12 rounded-2xl sm:rounded-3xl flex flex-col items-start gap-6"
          >
            <!-- текст -->
            <div class="relative z-10 w-full" :class="card.image ? 'pb-24 sm:pb-10' : ''">
              <h3 class="text-xl sm:text-product font-medium mb-3 leading-tight w-full">
                {{ card.title }}
              </h3>
              <hr class="text-black/15 border my-4" :class="card.image ? 'w-10/12 sm:w-10/12' : 'w-full'" />
              <div class="space-y-3 text-sm sm:text-base" :class="card.image ? 'w-10/12 sm:w-10/12' : 'w-full'" v-html="card.text"></div>
            </div>

            <!-- картинка -->
            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="absolute z-0 bottom-0 -right-10 sm:right-0 h-[120px] sm:h-[180px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <!-- Лейаут: 5 карточек (1 большая + 4 малые) -->
      <div v-else-if="section.type === 'cards' && section.layout === '5'" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <!-- Большая карточка слева -->
          <div
            class="relative overflow-hidden w-full bg-[#FAFAFA] px-4 py-6 sm:px-6 sm:py-6 pb-4 sm:pb-12 rounded-2xl sm:rounded-3xl flex flex-col items-start gap-6"
          >
            <div class="relative z-10" :class="section.cards[0].image ? 'w-full' : ''">
              <h3 class="text-xl sm:text-product font-medium mb-3 leading-tight lg:w-full" >
                {{ section.cards[0].title }}
              </h3>
              <hr class="text-black/15 border my-4" :class="section.cards[0].image ? 'w-10/12' : 'w-full'"/>
              <div class="space-y-3 text-sm sm:text-base" :class="section.cards[0].image ? 'w-10/12' : 'w-full'" v-html="section.cards[0].text"></div>
            </div>
            <img
              v-if="section.cards[0].image"
              :src="section.cards[0].image"
              :alt="section.cards[0].title"
              class="absolute z-0 bottom-0 -right-10 sm:right-0 w-[140px] sm:w-[200px]"
              loading="lazy"
              decoding="async"
            />
          </div>

          <!-- Четыре малые карточки справа -->
          <div class="grid sm:grid-cols-2 grid-rows-2 gap-6 sm:gap-8">
            <div
              v-for="(card, idx) in section.cards.slice(1, 5)"
              :key="'small-' + idx"
              class="relative bg-[#F8F8F8] p-4 pb-8 rounded-2xl sm:rounded-3xl flex flex-col gap-2 w-full"
            >
              <h3 class="font-medium text-xl w-full">{{ card.title }}</h3>
              <hr class="text-black/15 border my-1 w-9/12" />
              <p class="text-sm sm:text-base w-10/12" v-html="card.text"></p>
              <img
                v-if="card.image"
                :src="card.image"
                :alt="card.title"
                class="absolute bottom-1 right-1 h-[80px] sm:h-[80px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
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
