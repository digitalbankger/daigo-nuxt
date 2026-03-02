<script setup lang="ts">
import UiCard from '@/components/ui/UiCard.vue'

const { $device } = useNuxtApp()

const props = withDefaults(defineProps<{ showReadButton?: boolean }>(), {
  showReadButton: true,
})

const emit = defineEmits<{
  (e: 'open-video', payload: { type: 'video'; src: string; poster?: string }): void
}>()

const aboutVideo = {
  src: 'https://s3.firstvds.ru/materials/daigo-about.mp4',
  poster: '/images/about/about.jpg',
}

const bottomCardForUi = computed(() => ({
  ...bottomCard,
  imageSrc: $device.isMobile
    ? (bottomCard.imageMobile ?? bottomCard.imageSrc)
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
  imageMobile: '/images/japan-awards-mobile.webp',
  lazy: true,
  styles: {
    card: 'bg-hoverbtn rounded-xl h-[207px] sm:h-[294px] !p-4 sm:!p-6',
    title: 'text-base sm:text-2xl w-[80%] sm:w-[60%] lg:w-[70%] leading-tight',
    image: 'w-auto xs-max:h-[80%] h-full object-cover absolute bottom-0 right-0',
  },
}

function onPlay() {
  emit('open-video', {
    type: 'video',
    src: aboutVideo.src,
    poster: aboutVideo.poster,
  })
}
</script>

<template>
  <section class="relative w-full overflow-hidden -mt-4">
    <div class="flex flex-col lg:flex-col gap-6 items-start">
      <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
        <!-- Видео превью + плей -->
        <div class="w-full lg:w-1/2 rounded-xl overflow-hidden">
          <div class="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden">
            <img
              :src="aboutVideo.poster"
              alt="Видео о компании Daigo & Tamotsu"
              class="w-full h-auto rounded-2xl sm:rounded-3xl"
              loading="lazy"
            />

            <!-- play overlay -->
            <button
              type="button"
              class="absolute inset-0 flex items-center justify-center hover:scale-105 transition"
              aria-label="Открыть видео"
              @click.stop="onPlay"
            >
              <img
                src="/icons/play-white.svg"
                class="w-18 h-18 cursor-pointer"
                alt="play"
              />
            </button>
          </div>

          <div v-if="props.showReadButton" class="w-full flex justify-center">
            <NuxtLink
              :to="'/about'"
              class="inline-flex justify-center items-center gap-2 py-3 px-5 text-white text-base sm:text-xl font-normal transition duration-300 rounded-lg tracking-wide lg:w-[70%] bg-primary hover:bg-hoverbtn hover:text-black mt-6"
            >
              Читать историю компании
            </NuxtLink>
          </div>
        </div>

        <!-- Карточки справа -->
        <div class="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
          <div class="flex flex-row lg:flex-row gap-4 sm:gap-6">
            <UiCard
              v-for="(card, i) in topCards"
              :key="'top-' + i"
              :card="card"
              class="w-1/2 lg:w-1/2 !rounded-xl sm:!rounded-3xl overflow-hidden"
            />
          </div>

          <UiCard
            :card="bottomCardForUi"
            class="w-full !rounded-2xl sm:!rounded-3xl overflow-hidden"
          />
        </div>
      </div>
    </div>
  </section>
</template>