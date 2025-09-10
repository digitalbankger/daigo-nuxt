<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  images:
    | { type: 'single'; image: string }
    | { type: 'gallery'; topImage: string; bottomImages: [string, string] }
  details?: {
    soyBeansKg?: number
    soyMilkL?: number
    cultivationMultiplier?: number
    description?: string[]
    image?: string
  }
}>()
</script>

<template>
  <section class="space-y-8">
      <!-- Заголовок -->
      <h2 class="text-slider sm:text-product xl:text-slider font-medium w-full leading-tight lg:w-9/12">{{ title }}</h2>
      <p v-if="subtitle" class="text-lg mb-8">{{ subtitle }}</p>

      <!-- Изображения -->
      <div class="mb-12 mb-8 space-y-4">
        <img
          v-if="images.type === 'single'"
          :src="images.image"
          class="w-full rounded-xl object-cover mb-12"
          loading="lazy"
        />

        <template v-else>
          <img
            :src="images.topImage"
            class="w-full rounded-xl object-cover"
            loading="lazy"
          />
          <div class="grid grid-cols-2 gap-4">
            <img
              :src="images.bottomImages[0]"
              class="w-full rounded-xl object-cover"
              loading="lazy"
            />
            <img
              :src="images.bottomImages[1]"
              class="w-full rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </template>
      </div>

      <div class="block lg:hidden w-full lg:w-3/6 space-y-6">
        <h3 class="text-xl sm:text-product xl:text-slider font-medium leading-tight w-full sm:w-10/12 lg:w-full">{{ details.head }}</h3>
        <div class="space-y-3 leading-relaxed text-sm sm:text-base">
          <p v-for="(text, index) in details.description" :key="index" v-html="text" />
        </div>
      </div>

      <!-- Детали -->
      <div v-if="details" class="flex flex-row gap-4 sm:gap-8 items-start">
        <!-- Левая колонка с фактами -->
        <div class="w-1/2 sm:w-3/5 lg:w-1/6 space-y-4 lg:space-y-8">
          <div
            v-if="details.soyMilkL"
            class="flex flex-col items-start gap-2 sm:gap-4"
          >
            <img
              src="/images/product/production-1.png"
              alt="Молоко"
              class="w-1/2 sm:w-3/12 lg:w-2/3 object-contain"
            />
            <div>
              <p class="text-xl sm:text-3xl lg:text-product font-medium leading-tight">{{ details.soyBeansKg }}кг</p>
              <p class="text-xs sm:text-base">Соевых бобов используется<br />для производства</p>
            </div>
          </div>

          <div
            v-if="details.soyBeansKg"
            class="flex items-start gap-2 sm:gap-4"
          >
            <div>
              <p class="text-xl sm:text-3xl lg:text-product font-medium leading-tight">{{ details.soyMilkL }}л</p>
              <p class="text-xs sm:text-base">Соевого молока</p>
            </div>
          </div>

          <div
            v-if="details.cultivationMultiplier"
            class="flex flex-col items-start gap-2 sm:gap-4"
          >
            <img
              src="/images/product/production-2.png"
              alt="Культура"
              class="w-1/2 sm:w-3/12 lg:w-2/3 object-contain"
            />
            <div>
              <p class="text-xs sm:text-base sm:w-1/2 lg:w-full">Культивация лактобактерий в соевом молоке</p>
            </div>
            <div>
              <p class="text-xl sm:text-3xl lg:text-product font-medium leading-tight"><span class="text-lg font-normal">в</span> {{ details.cultivationMultiplier }} <span class="text-lg font-normal">раз</span></p>
              <p class="text-xs sm:text-base">Больше и качественнее<br />чем в коровьем молоке</p>
            </div>
          </div>
        </div>

        <!-- Правая колонка с описанием и изображением -->
        <div class="hidden lg:block w-3/6 space-y-6">
          <h3 class="text-xl sm:text-4xl xl:text-slider font-medium !leading-tight">{{ details.head }}</h3>

          <div class="space-y-3 leading-relaxed text-base">
            <p v-for="(text, index) in details.description" :key="index" v-html="text" />
          </div>

        </div>

        <div v-if="details.image" class="w-1/2 sm:w-2/6 relative">
            <div class="absolute bg-[#CCDEFF] rounded-xl sm:rounded-3xl top-1/2 -translate-y-1/2 left-2/3 sm:left-[60%] lg:left-1/2 -translate-x-1/2 h-[80%] sm:mt-8 lg:mt-0 w-full sm:w-[400px] lg:w-full z-0"></div>
            <img
              :src="details.image"
              alt="Продукт"
              class="max-w-xs w-[140%] sm:w-[120%] lg:w-full mx-auto sm:ml-auto rounded-xl relative z-10 pt-10 sm:pt-0"
              loading="lazy"
            />
        </div>
      </div>
  </section>
</template>
