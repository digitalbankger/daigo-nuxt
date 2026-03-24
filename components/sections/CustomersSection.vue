<script setup lang="ts">
import { ref, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

defineProps<{
  hideTitle?: boolean
}>()

const productGroups = [
  {
    id: 'metabiotics',
    title: 'Принцип действия метабиотиков',
    label: 'Метабиотики',
    slides: [
      {
        text: 'Восстановить баланс кишечной микрофлоры и наладить работу ЖКТ. Укрепить иммунитет.',
        image: '/images/customers/allPrinciples.webp',
        imageWidth: 'w-[80%] sm:w-[44%]',
        tags: ['Кишечник и иммунитет', 'Кожа и волосы', 'Зубы и десны'],
        slugs: ['articles/chto-takoe-metabiotiki'],
      },
      {
        text: 'Восстановить баланс микрофлоры кожи головы и выработки коллагена в глубоких слоях кожи.',
        image: '/images/customers/shampoo.png',
        imageWidth: 'w-[80%] sm:w-[44%]',
        tags: ['Кишечник и иммунитет', 'Кожа и волосы', 'Зубы и десны'],
        slugs: ['articles/chto-takoe-metabiotiki'],
      },
      {
        text: 'Восстановить здоровый баланс микрофлоры полости рта и улучшить здоровье зубов.',
        image: '/images/customers/dent.png',
        imageWidth: 'w-[90%] sm:w-[65%]',
        tags: ['Кишечник и иммунитет', 'Кожа и волосы', 'Зубы и десны'],
        slugs: ['articles/chto-takoe-metabiotiki'],
      },
    ],
    preview: '/images/customers/allPrinciples-prev.png',
  },
  {
    id: 'plazmogeny',
    title: 'Принцип действия плазмогенов',
    label: 'Плазмалогены',
    slides: [
      {
        text: 'Восстановить когнитивные функции мозга, улучшить память и концентрацию внимания.\n\nУлучшить состояние при хронической усталости и информационном истощении.',
        image: '/images/customers/tamotsu-single.png',
        imageWidth: 'w-[50%] sm:w-[34%] -right-8 sm:right-10',
        tags: ['Нервная система и мозг'],
        slugs: ['plasmalogens'],
      },
    ],
    preview: '/images/customers/tamotsu-group.png',
  },
  {
    id: 'peptidy',
    title: 'Принцип действия пептидов',
    label: 'Пептиды',
    slides: [
      {
        text: 'Улучшить защитную и эстетическую функции кожи и обеспечить профилактику возрастного старения кожи.\n\nВосстановить кожу после травматических воздействий.',
        image: '/images/customers/dermic-single.png',
        imageWidth: 'w-[44%] right-2 bottom-4',
        tags: ['Нервная система и мозг', 'Кожа и волосы', 'Кости и мышцы'],
        slugs: ['aminobiotics'],
      },
      {
        text: 'Улучшить работу нервной системы и мозга.\n\nПротиводействовать тревожности и депрессии.\nПомочь бороться с бессонницей, снять метеочувствительность.',
        image: '/images/customers/brainy-single.png',
        imageWidth: 'w-[44%] right-2 bottom-4',
        tags: ['Нервная система и мозг', 'Кожа и волосы'],
        slugs: ['aminobiotics'],
      },
      {
        text: 'Улучшить работу суставов, укрепить хрящевую, костную и мышечную ткани.\nВосстановить суставы после травм.',
        image: '/images/customers/jointic-single.png',
        imageWidth: 'w-[44%] right-2 bottom-4',
        tags: ['Нервная система и мозг', 'Кожа и волосы', 'Кости и мышцы'],
        slugs: ['aminobiotics'],
      },
    ],
    preview: '/images/customers/brainy.png',
  },
]


const selectedGroupId = ref('metabiotics')
const selectedGroup = computed(() =>
  productGroups.find((g) => g.id === selectedGroupId.value)
)
const currentSlide = ref(0)
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 v-if="!hideTitle" class="text-slider sm:text-product lg:text-slider font-medium mb-6 sm:mb-8">Покупателям
    </h2>

    <div class="flex flex-col lg:flex-row gap-4 sm:gap-6">
      <div class="w-full lg:w-4/6 rounded-3xl relative overflow-hidden">
        <Transition name="fade" mode="out-in">
        <Swiper
          v-if="selectedGroup"
          :key="selectedGroup.id"
          :slides-per-view="1"
          :loop="false"
          @slideChange="({ realIndex }) => currentSlide = realIndex"
        >
          <SwiperSlide
            v-for="(slide, index) in selectedGroup.slides"
            :key="index"
          >
            <div class="relative p-6 transition bg-hoverbtn h-[446px] rounded-[30px] lg:py-5 sm:p-10 lg:px-12">
              <div v-if="slide.tags?.length" class="flex flex-wrap gap-3 mb-4 w-full sm:w-4/6">
                <span
                  v-for="(tag, i) in slide.tags"
                  :key="tag"
                  class="px-3 py-2 sm:py-2 rounded-lg text-sm sm:text-lg text-black select-none"
                  :class="slide.tags.length === 1 ? 'bg-[#B5EBFF]' : ['bg-[#FFF279]', 'bg-[#B7FFBA]', 'bg-[#FFCDDD]'][i % 3]"
                >
                  {{ tag }}
                </span>
              </div>

              <div
               class="flex justify-between items-start"
               >
                <div>
                  <h3 class="text-[clamp(1.4rem,6vw,2.8rem)] font-medium leading-tight mt-8 sm:mt-4 mb-4">
                    {{ selectedGroup?.label }}
                  </h3>
                  <p
                    class="text-sm sm:text-base font-normal"
                    :class="selectedGroup?.id === 'peptidy' ? 'w-full sm:w-3/5' : 'w-3/5'"
                  >
                    {{ slide.text }}
                  </p>
                  <!-- <NuxtLink
                    :to="`/catalog?klass-produkta=${slide.slugs.join(',')}`"
                    class="mt-6 inline-block px-4 py-2 text-white bg-primary rounded-full hover:bg-prymary/80 transition"
                  >
                    Подробнее
                  </NuxtLink> -->
                  <NuxtLink
                    :to="`/${slide.slugs}`"
                    class="mt-6 inline-block px-4 py-2 text-white bg-primary rounded-full hover:bg-prymary/80 transition"
                  >
                    Подробнее
                  </NuxtLink>
                </div>

                <img
                  :src="slide.image"
                  :alt="selectedGroup?.label"
                  class="absolute bottom-0 -right-20 sm:right-0"
                  :class="slide.imageWidth"
                  loading="lazy"
                />

              </div>
            </div>
          </SwiperSlide>
        </Swiper>
        </Transition>

        <div class="flex gap-2 absolute bottom-6 left-6 sm:left-12 z-20">
          <div
            v-for="(_, i) in selectedGroup?.slides.length"
            :key="i"
            class="h-[3px] w-10 sm:w-16 rounded-full transition-colors"
            :style="{
              backgroundColor: i === currentSlide ? '#303030CC' : '#3030301A'
            }"
          />
        </div>

      </div>

      <div class="w-full lg:w-2/6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
        <button
          v-for="group in productGroups.filter(g => g.id !== selectedGroupId)"
          :key="group.id"
          @click="selectedGroupId = group.id; currentSlide = 0"
          class="relative h-[207px] overflow-hidden bg-hoverbtn rounded-2.5xl flex flex-col justify-between items-start transition-transform duration-300 hover:-translate-y-1 w-full text-left"
        >
          <div class="p-4 sm:px-10 lg:p-4 relative z-10">
            <h3 class="text-xl w-4/6 sm:w-full lg:w-4/6">{{ group.title }}</h3>
          </div>
          <img
            :src="group.preview"
            alt="preview"
            class="absolute bottom-0 right-0 w-[56%]"
            loading="lazy"
          />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>