<template>
  <div class="relative !pl-[0%] md:!pl-[8%]">
    <!-- Заголовок и стрелки -->
    <div class="relative max-w-[1310px] w-full mx-auto flex items-center justify-between mb-6">
      <div class="hidden md:flex gap-2 absolute right-0 -top-14">
        <button class="swiper-button-prev-partner">
          <img src="/icons/arrow-left.svg" alt="prev" class="w-2/3" />
        </button>
        <button class="swiper-button-next-partner">
          <img src="/icons/arrow-right.svg" alt="next" class="w-2/3" />
        </button>
      </div>
    </div>

    <!-- Слайдер -->
    <Swiper
      ref="swiperRef"
      :modules="[Navigation]"
      :space-between="32"
      :loop="false"
      :speed="500"
      :navigation="{
        nextEl: '.swiper-button-next-partner',
        prevEl: '.swiper-button-prev-partner'
      } as NavigationOptions"
      :breakpoints="{
        320: { slidesPerView: 1 },
        768: { slidesPerView: 1.3 },
        1024: { slidesPerView: 2 },
        1280: { slidesPerView: 2 }
      }"
      class="overflow-visible"
      @slideChange="({ realIndex }) => currentSlide = realIndex"

    >
      <SwiperSlide
        v-for="(partner, index) in partners"
        :key="index"
        class="h-auto mb-5"
      >
        <PartnerCard :partner="partner" />
      </SwiperSlide>
    </Swiper>

    <div class="flex gap-2 absolute bottom-0 right-0 md:right-0 z-20">
      <div
        v-for="(_, i) in partners.length"
        :key="i"
        class="h-[2.5px] md:h-[3px] w-8 md:w-16 rounded-full transition-colors"
        :style="{
          backgroundColor: i === currentSlide ? '#303030CC' : '#3030301A'
        }"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import type { NavigationOptions } from 'swiper/types'
import 'swiper/css'
import 'swiper/css/navigation'

import PartnerCard from '@/components/PartnerCard.vue'

const swiperRef = ref()
const currentSlide = ref(0)

const partners = [
  {
    logo: '/images/partners/verba.png',
    name: 'Verba Mayr',
    about: 'Австрийский центр здоровья, открывший свои двери в России в 2015 году.',
    description:
      'Verba Mayr предлагает своим гостям программы омоложения и детокса по известной методике австрийского врача Франца Ксавьер Майера. <br><br>Мы на регулярной основе проводим обучающие мероприятия о Дайго для врачей центра'
  },
  {
    logo: '/images/partners/emc.png',
    name: 'EMC',
    about: 'ЕМС — это 35 лет работы и ведущая частная клиника в России.',
    description:
      'Благодаря коллективу из 600 врачей, в том числе из США, Израиля, Европы, Японии, диагностика и лечение проходит по современным американским и европейским протоколам. <br>Для пациентов это возможность получить доступ к лучшим мировым методикам лечения, не уезжая за рубеж.'
  },
  {
    logo: '/images/partners/luciano.png',
    name: 'Luciano',
    about: 'Центры интегративной медицины и SPA-комплексы премиум класса.',
    description:
      'Мы активно сотрудничаем с комплексами Luciano и проводим на их территории обучающие мероприятия для ведущих врачей в Казани и Сочи.'
  },
  {
    logo: '/images/partners/apteka36.png',
    name: 'Аптечная сеть 36.6',
    about: '',
    description:
      'Сегодня аптеки «36.6» дают возможность управлять своим здоровьем. <br><br>Это концепция образа жизни, включающая комплексные меры по поддержанию и сохранению активного долголетия и ухода за собой.'
  },
  {
    logo: '/images/partners/mat.png',
    name: 'Мать и дитя',
    about: '',
    description:
      '“Мать и дитя” сегодня - это 6 утльтра современных высокотехнологичных госпиталей и 36 клиник, обладающих мощным диагностическими и терапевтическими ресурсами, в 27 городах России, более 7000 квалифицированных специалистов, знающих и любящих свою работу, уникальный спект медицинских услуг для всей семьи'
  },
  {
    logo: '/images/partners/bosco.png',
    name: 'Аптеки Bosco',
    about: 'Bosco — это первая в России клиника, где собраны все самые эффективные на сегодняшний день методики антивозрастной медицины.',
    description:
      'В аптеке клиники продаются препараты, произведенные лучшими фармацевтическими компаниями мира. <br><br>Врачи клиники широко применяют продукты Дайго в своей практике.'
  }
]

onMounted(() => {
  nextTick(() => {
    swiperRef.value?.swiper?.update()
    currentSlide.value = swiperRef.value?.swiper?.realIndex ?? 0
  })
})
</script>

<style scoped>
.swiper-button-next-partner::after,
.swiper-button-prev-partner::after {
  display: none !important;
  content: none !important;
}
.swiper-button-prev-partner, .swiper-button-next-partner {
  top: -60px;
  justify-content: flex-end;
}
.swiper-button-prev-partner {
  left: auto;
  right: 40px;
}
.swiper-button-next-partner {
  right: 0;
}
</style>
