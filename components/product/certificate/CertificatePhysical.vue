<script setup lang="ts">
import { computed } from 'vue'

type CertImages = {
  imgFirst?: string
  imgSec?: string
  imgThirt?: string
  imgFour?: string
}

const props = defineProps<{
  howImage?: string
  certImages?: CertImages
  title?: string
}>()

// Большая иллюстрация в синих блоках (приоритет howImage → imgFour → imgThirt)
const resolvedHow = computed(() => props.howImage || props.certImages?.imgThirt || props.certImages?.imgFour || '')
</script>

<template>
  <section class="space-y-4 sm:space-y-6">
    <h2 class="text-2xl sm:text-slider font-medium leading-tight">
      {{ title || 'Электронный сертификат' }}
    </h2>

    <div class="flex flex-col gap-4 sm:gap-16">
      <!-- Ряд 1 (слева синий, справа 4 шага) -->
      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <!-- Левая половина: большой синий -->
        <div class="relative overflow-hidden bg-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:basis-1/2 h-[320px] sm:h-auto">
          <img src="/images/cert/flow-left.png" class="absolute left-0 bottom-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <img src="/images/cert/flow-right.png" class="absolute right-0 top-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <h3 class="text-xl sm:text-product font-medium leading-tight mb-3 sm:mb-4 relative z-10">
            Как активировать сертификат Daigo?
          </h3>
          <p class="text-sm sm:text-lg w-full sm:w-1/2 text-white/80 relative z-10">
            Физический сертификат представлен в виде стильной карты в премиальной упаковке.
          </p>
          <img
            :src="resolvedHow"
            alt=""
            class="absolute right-0 bottom-0 sm:right-0 sm:bottom-0 max-h-[60%] sm:max-h-[66%] object-contain"
            loading="lazy"
          >
        </div>

        <!-- Правая половина: 4 шага (2×2) -->
        <div class="lg:basis-1/2 flex flex-wrap gap-4 sm:gap-6">
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Откройте упаковку</h4>
            <p class="text-sm sm:text-lg text-black/60">Найдите уникальный код на обороте карты</p>
            <img :src="certImages?.imgFour" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-4xl font-semibold text-[#5DA3FF]">01</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Перейдите на сайт Daigo</h4>
            <img src="/images/cert/site.png" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-4xl font-semibold text-[#5DA3FF]">02</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Выберите понравившиеся продукты</h4>
            <img src="/images/cert/daigo.png" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-4xl font-semibold text-[#5DA3FF]">03</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Введите код сертификата</h4>
            <p class="text-sm sm:text-lg text-black/60">В корзине при оформлении заказа</p>
            <img src="/images/cert/site-sec.png" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-4xl font-semibold text-[#5DA3FF]">04</span>
          </div>
        </div>
      </div>

      <!-- Ряд 2 (справа синий, слева 3 карточки) -->
      <div class="flex flex-col lg:flex-row-reverse gap-4 sm:gap-6">
        <!-- Правая половина: большой синий блок «Как подарить…» -->
        <div class="relative overflow-hidden bg-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:basis-1/2 h-[320px] sm:h-auto">
          <img src="/images/cert/flow-left.png" class="absolute left-0 bottom-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <img src="/images/cert/flow-right.png" class="absolute right-0 top-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <h3 class="text-xl sm:text-product font-medium leading-tight mb-3 sm:mb-4">
            Как подарить сертификат Daigo?
          </h3>
          <p class="text-sm sm:text-lg w-full sm:w-1/2">
            Идеальный подарок на любой случай — получатель сам выберет, что ему нужно.
          </p>
          <p class="text-lg sm:text-2xl mt-4">
            Подойдёт для:
          </p>
          <ul class="mt-3 sm:mt-4 text-sm sm:text-base list-disc pl-5 space-y-1 opacity-90">
            <li>Крупных праздников</li>
            <li>Партнёрам и клиентам</li>
            <li>По важным событиям</li>
          </ul>
          <img
            src="/images/cert/gift.png"
            alt=""
            class="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 max-h-44 sm:max-h-[60%] object-contain"
            loading="lazy"
          >
        </div>

        <!-- Левая половина: 3 карточки -->
        <div class="lg:basis-1/2 flex flex-wrap gap-4 sm:gap-6">
          <!-- 1. Подарите сертификат -->
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Подарите сертификат</h4>
            <p class="text-sm sm:text-lg text-black/60">
              Передайте лично в премиальной упаковке, сопровождая тёплыми словами
            </p>
            <img src="/images/cert/gift-small.png" class="absolute right-0 bottom-0 h-28 sm:h-36 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">01</span>
          </div>

          <!-- 2. Отправьте курьером -->
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1">Отправьте курьером</h4>
            <p class="text-sm sm:text-lg text-black/60">
              Можно отправить сертификат с курьером — его доставка уже включена
            </p>
            <img src="/images/cert/box.png" class="absolute right-0 bottom-0 h-28 sm:h-36 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">02</span>
          </div>

          <!-- 3. Когда использовать (шире, на всю строку) -->
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px]
                      basis-full grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1 w-full sm:w-10/12">
              Когда использовать физический подарочный сертификат от Daigo
            </h4>
            <p class="text-sm sm:text-lg text-black/60 w-full sm:w-10/12">
              Прекрасный вариант для крупных праздников, корпоративных мероприятий и важных событий.
            </p>
            <img :src="certImages?.imgSec" class="absolute right-0 bottom-0 h-28 sm:h-44 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">03</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
