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
      card: 'bg-hoverbtn rounded-xl h-[190px] md:h-[260px] !p-4 md:!p-6',
      title: 'text-base md:text-2xl leading-tight mb-4',
      image: 'w-auto h-7/12 md:h-2/3 object-cover absolute bottom-0 right-0',
    },
  },
  {
    title: 'Более 100 лет истории',
    imageSrc: '/images/japan-history.png',
    lazy: true,
    styles: {
      card: 'bg-hoverbtn rounded-xl h-[190px] md:h-[260px] !p-4 md:!p-6',
      title: 'text-base md:text-2xl leading-tight mb-4',
      image: 'w-auto h-7/12 md:h-2/3 object-cover absolute bottom-0 right-0',
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
    card: 'bg-hoverbtn rounded-xl h-[207px] md:h-[294px] !p-4 md:!p-6',
    title: 'text-base md:text-2xl w-[80%] md:w-[70%] leading-tight',
    image: 'w-auto h-full object-cover absolute bottom-0 right-0',
  },
}
</script>

<template>
  <section class="relative w-full overflow-hidden -mt-4">

    <div class="flex flex-col lg:flex-col gap-6 items-start ">
        <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
            <div class="w-full lg:w-1/2 rounded-xl overflow-hidden">
              <video
                controls
                preload="none"
                poster="/images/cover-gen.webp"
                class="w-full h-auto rounded-2xl md:rounded-4xl"
              >
                <source :src="videoUrl" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              <div class="w-full flex justify-center">
                <NuxtLink
                  :to="'/about'"
                  class="inline-flex justify-center items-center gap-2 py-3 px-5 text-white text-base md:text-xl font-normal transition duration-300 rounded-lg tracking-wide lg:w-[70%] bg-primary hover:bg-hoverbtn hover:text-black mt-6"
                >
                  Читать историю компании
                </NuxtLink>
              </div>
            </div>

            <div class="w-full lg:w-1/2 flex flex-col gap-4 md:gap-6">
                <!-- Верхний ряд: 2 карточки -->
                <div class="flex flex-row lg:flex-row gap-4 md:gap-6">
                  <UiCard
                    v-for="(card, i) in topCards"
                    :key="'top-' + i"
                    :card="card"
                    class="w-1/2 lg:w-1/2 !rounded-xl md:!rounded-3xl overflow-hidden"
                  />
                </div>

                <!-- Нижняя карточка во всю ширину -->
                <UiCard
                  :card="bottomCardForUi"
                  class="w-full !rounded-2xl md:!rounded-3xl overflow-hidden"
                />
            </div>
        </div>
      </div>
  </section>
</template>

