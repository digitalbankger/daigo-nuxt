<script setup lang="ts">
type CertImages = {
  imgFirst?: string
  imgSec?: string
  imgThirt?: string
  imgFour?: string
}

const props = defineProps<{
  /** Опционально: если хочешь явно указать картинку в синем блоке */
  howImage?: string
  /** Весь объект картинок для сертификата */
  certImages?: CertImages
  title?: string
}>()

// Фоллбек: если howImage не передан — используем одну из картинок из объекта
const resolvedHow = computed(() => props.howImage || props.certImages?.imgThirt || '')
</script>

<template>
  <section class="space-y-4 sm:space-y-6">
    <h2 class="text-2xl sm:text-slider font-medium leading-tight">
      {{ title || 'Электронный сертификат' }}
    </h2>

    <div class="flex flex-col gap-4 sm:gap-16">
      <!-- Ряд 1 -->
      <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <!-- Левая половина -->
        <div class="relative overflow-hidden bg-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:basis-1/2 h-[320px] sm:h-auto">
          <img src="/images/cert/flow-left.png" class="absolute left-0 bottom-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <img src="/images/cert/flow-right.png" class="absolute right-0 top-0 z-0 w-1/4 sm:w-auto" loading="lazy" />
          <h3 class="text-2xl sm:text-product font-medium leading-tight mb-3 sm:mb-4 relative z-10">
            Как активировать сертификат Daigo?
          </h3>
          <p class="text-sm sm:text-lg text-white/80 w-full sm:w-1/2 relative z-10">
            Подарите здоровье вашим близким
            с сертификатом Daigo, идеальный подарок 
            для заботы о здоровье и красоте
          </p>
          <!-- Большая иллюстрация в синем блоке -->
          <img
            src="/images/cert/girl.png"
            alt=""
            class="absolute right-0 bottom-0 sm:right-0 sm:bottom-0 max-h-[50%] sm:max-h-[66%] object-contain"
            loading="lazy"
          >
        </div>

        <!-- Правая половина (4 шага) -->
        <div class="lg:basis-1/2 flex flex-wrap gap-4 sm:gap-6">
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Получите письмо на email</h4>
            <p class="text-sm sm:text-lg text-black/60">В нём будет сертификат и уникальный код активации</p>
            <img src="/images/cert/env.png" class="absolute right-0 bottom-0 w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">01</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1">Перейдите на сайт Daigo</h4>
            <img src="/images/cert/site.png" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">02</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1">Выберите понравившиеся продукты</h4>
            <img src="/images/cert/daigo.png" class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">03</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Введите код сертификата</h4>
            <p class="text-sm sm:text-lg text-black/60">В корзине при оформлении заказа</p>
            <img
              :src="certImages?.imgFirst"
              class="absolute right-0 bottom-0 w-32 sm:w-40 object-contain"
              loading="lazy"
            >
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">04</span>
          </div>
        </div>
      </div>

      <!-- Ряд 2 -->
      <div class="flex flex-col lg:flex-row-reverse gap-4 sm:gap-6">
        <!-- Правая половина (синяя) -->
        <div class="relative overflow-hidden bg-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:basis-1/2 h-[320px] sm:h-auto">
          <img src="/images/cert/flow-left.png" class="absolute left-0 bottom-0 z-0 w-1/3 sm:w-auto" loading="lazy" />
          <img src="/images/cert/flow-right.png" class="absolute right-0 top-0 z-0 w-1/4 sm:w-auto" loading="lazy" />
          <h3 class="text-xl sm:text-product font-medium leading-tight mb-3 sm:mb-4">
            Как активировать сертификат Daigo?
          </h3>
          <p class="text-sm sm:text-lg w-full sm:w-1/2 text-white/80 relative z-10">
            Подарите здоровье вашим близким
            с сертификатом Daigo, идеальный подарок 
            для заботы о здоровье и красоте
          </p>
          <img
            src="/images/cert/gift.png"
            alt=""
            class="absolute right-0 bottom-0 sm:right-0 sm:bottom-0 max-h-[40%] sm:max-h-[66%] object-contain"
            loading="lazy"
          >
        </div>

        <!-- Левая половина (3 карточки) -->
        <div class="lg:basis-1/2 flex flex-wrap gap-4 sm:gap-6">
          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-2">Укажите email получателя</h4>
            <p class="text-sm sm:text-lg text-black/60">Передайте лично в премиальной упаковке, сопровождая тёплыми словами</p>
            <img src="/images/cert/env.png" class="absolute right-0 bottom-0 h-36 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">01</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-0.75rem)] grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1">Персональное поздравление</h4>
            <p class="text-sm sm:text-lg text-black/60">Сертификат будет отправлен напрямую с персональным поздравлением от вас</p>
            <img src="/images/cert/kolpak.png" class="absolute right-0 bottom-0 h-36 object-contain" loading="lazy">
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">02</span>
          </div>

          <div class="relative overflow-hidden bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[200px] sm:min-h-[300px] basis-full grow">
            <h4 class="text-lg sm:text-2xl leading-tight font-normal mb-1 w-full sm:w-10/12">
              Когда использовать электронный подарочный сертификат от Daigo
            </h4>
            <p class="text-sm sm:text-lg text-black/60 w-full sm:w-10/12">
              Идеально подходит для мгновенной отправки — например, в день рождения, профессиональный праздник или Новый год.
            </p>
            <img
              :src="certImages?.imgSec"
              class="absolute right-0 bottom-0 w-28 sm:w-44 object-contain"
              loading="lazy"
            >
            <span class="absolute left-3 bottom-2 text-2xl sm:text-slider font-medium text-[#5DA3FF]">03</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
