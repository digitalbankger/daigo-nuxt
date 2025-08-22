<script setup lang="ts">
import UiCard from '@/components/ui/UiCard.vue'

const topCards = [
  {
    title: 'Японский производитель',
    imageSrc: '/images/japan-flag.png',
    lazy: true,
    styles: {
      card: 'bg-hoverbtn rounded-xl h-[260px]',
      title: 'text-2xl mb-4',
      image: 'w-auto h-2/3 object-cover absolute bottom-0 right-0',
    },
  },
  {
    title: 'Более 100 лет истории',
    imageSrc: '/images/japan-history.png',
    lazy: true,
    styles: {
      card: 'bg-hoverbtn rounded-xl h-[260px]',
      title: 'text-2xl mb-4',
      image: 'w-auto h-2/3 object-cover absolute bottom-0 right-0',
    },
  },
]

const bottomCard = {
  title: 'Десятки профессиональных наград, сертификатов и благодарностей',
  imageSrc: '/images/japan-awards.png',
  lazy: true,
  styles: {
    card: 'bg-hoverbtn rounded-xl h-[294px]',
    title: 'text-2xl w-[70%]',
    image: 'w-auto h-full object-cover absolute bottom-0 right-0',
  },
}
</script>

<template>
  <section class="relative w-full overflow-hidden">

    <div class="flex flex-col lg:flex-col gap-6 items-start ">
        <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
            <div class="w-full lg:w-1/2 rounded-xl overflow-hidden">
              <video
                controls
                preload="none"
                poster="/images/cover-gen.webp"
                class="w-full h-auto rounded-4xl"
              >
                <source :src="videoUrl" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              <div class="w-full flex justify-center">
                <NuxtLink
                  :to="'/about'"
                  class="inline-flex justify-center items-center gap-2 py-3 px-5 text-white text-xl font-normal transition duration-300 rounded-lg tracking-wide lg:w-[70%] bg-primary hover:bg-hoverbtn hover:text-black mt-6"
                >
                  Читать историю компании
                </NuxtLink>
              </div>
            </div>

            <div class="w-full lg:w-1/2 flex flex-col gap-6">
                <!-- Верхний ряд: 2 карточки -->
                <div class="flex flex-col lg:flex-row gap-6">
                  <UiCard
                    v-for="(card, i) in topCards"
                    :key="'top-' + i"
                    :card="card"
                    class="w-full lg:w-1/2 !rounded-3xl overflow-hidden"
                  />
                </div>

                <!-- Нижняя карточка во всю ширину -->
                <UiCard
                  :card="bottomCard"
                  class="w-full !rounded-3xl overflow-hidden"
                />
            </div>
        </div>
      </div>
  </section>
</template>

