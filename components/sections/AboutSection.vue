<script setup lang="ts">
import UiCard from '@/components/ui/UiCard.vue'
const { $device } = useNuxtApp()

const bottomCardForUi = computed(() => ({
  ...bottomCard,
  imageSrc: $device.isMobile
    ? (bottomCard.imageMobile  ?? bottomCard.imageSrc)
    : (bottomCard.imageDesktop ?? bottomCard.imageSrc),
}))

const topCards = [
  {
    title: 'Японский производитель',
    imageSrc: '/images/japan-flag.png',
    lazy: true,
    styles: {
      card: 'bg-hoverbtn rounded-xl h-[190px] sm:h-[260px] !p-4 sm:!p-6',
      title: 'text-base sm:text-2xl sm:w-8/12 lg:w-full leading-tight mb-4',
      image: 'w-auto h-7/12 sm:h-2/3 object-cover absolute bottom-0 right-0',
    },
  },
  {
    title: 'Более 100 лет истории',
    imageSrc: '/images/japan-history.png',
    lazy: true,
    styles: {
      card: 'bg-hoverbtn rounded-xl h-[190px] sm:h-[260px] !p-4 sm:!p-6',
      title: 'text-base sm:text-2xl sm:w-8/12 lg:w-full leading-tight mb-4',
      image: 'w-auto h-7/12 sm:h-2/3 object-cover absolute bottom-0 right-0',
    },
  },
]

const bottomCard = {
  title: 'Десятки профессиональных наград, сертификатов и благодарностей',
  imageSrc: '/images/japan-awards.png',
  imageDesktop: '/images/japan-awards.png',
  imageMobile:  '/images/japan-awards-mobile.webp',
  lazy: true,
  styles: {
    card: 'bg-hoverbtn rounded-xl h-[207px] sm:h-[294px] !p-4 sm:!p-6',
    title: 'text-base sm:text-2xl w-[80%] sm:w-[60%] lg:w-[70%] leading-tight',
    image: 'w-auto xs-max:h-[80%] h-full object-cover absolute bottom-0 right-0',
  },
}
</script>

<template>
  <section class="relative w-full overflow-hidden -mt-4">

    <div class="flex flex-col lg:flex-col gap-6 items-start ">
        <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
            <div class="w-full lg:w-1/2 rounded-xl overflow-hidden">
              <!-- <video
                controls
                preload="none"
                poster="https://s3.firstvds.ru/shop-service/about.jpg"
                class="w-full h-auto rounded-2xl sm:rounded-4xl"
              >
                <source src="https://s3.firstvds.ru/shop-service/about.mp4" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video> -->
              <img src="/images/about/about.jpg" alt="Видео о компании Daigo & Tamotsu" class="w-full h-auto rounded-2xl sm:rounded-4xl" />
              <div class="w-full flex justify-center">
                <NuxtLink
                  :to="'/about'"
                  class="inline-flex justify-center items-center gap-2 py-3 px-5 text-white text-base sm:text-xl font-normal transition duration-300 rounded-lg tracking-wide lg:w-[70%] bg-primary hover:bg-hoverbtn hover:text-black mt-6"
                >
                  Читать историю компании
                </NuxtLink>
              </div>
            </div>

            <div class="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
                <!-- Верхний ряд: 2 карточки -->
                <div class="flex flex-row lg:flex-row gap-4 sm:gap-6">
                  <UiCard
                    v-for="(card, i) in topCards"
                    :key="'top-' + i"
                    :card="card"
                    class="w-1/2 lg:w-1/2 !rounded-xl sm:!rounded-3xl overflow-hidden"
                  />
                </div>

                <!-- Нижняя карточка во всю ширину -->
                <UiCard
                  :card="bottomCardForUi"
                  class="w-full !rounded-2xl sm:!rounded-3xl overflow-hidden"
                />
            </div>
        </div>
      </div>
  </section>
</template>

