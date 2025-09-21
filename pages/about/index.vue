<script setup lang="ts">
import BaseContainer from '@/components/layout/BaseContainer.vue'
import AboutBanner from '@/components/about/AboutBanner.vue'
import CategorySection from '@/components/about/CategorySection.vue'
import AboutSection from '~/components/sections/AboutSection.vue'
import WideSelectionSection from '~/components/sections/WideSelectionSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import RewardSection from '~/components/sections/RewardSection.vue'
import type { link } from 'fs'

useHead({
  title: 'О компании Daigo – Производитель продукции для здоровья',
  meta: [
    {
      name: 'description',
      content:
        'Узнайте больше о компании Daigo – эксклюзивном представителе B&S Corporation в России. Более 100 лет истории, японское качество и исследования.',
    },
    { property: 'og:title', content: 'О компании Daigo' },
    {
      property: 'og:description',
      content:
        'Эксклюзивный дистрибьютор продукции для здоровья из Японии. Исследования, инновации и миссия Daigo.',
    },
    { property: 'og:image', content: '/images/og/about.jpg' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://daigo.ru/about' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [{ rel: 'canonical', href: 'https://daigo.ru/about' }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Daigo',
        url: 'https://daigo.ru',
        logo: 'https://daigo.ru/images/logo.svg',
        sameAs: [
          'https://facebook.com/daigo',
          'https://instagram.com/daigo',
          'https://vk.com/daigo',
        ],
        description:
          'Daigo — эксклюзивный представитель B&S Corporation в России. Производитель продукции для здоровья на основе японских исследований.',
      }),
    },
  ],
})

const people = [
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/1.jpg' },
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/2.jpg' },
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/1.jpg' },
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/2.jpg' },
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/1.jpg' },
  { name: 'Фамилия Имя', role: 'Должность в компании', photo: '/images/team/2.jpg' },
]

const cards = [
  {
    title: '>5 лет',
    subtitle: 'Да́йго поддерживает благотворительные фонды и организации, общественные инициативы',
    imageSrc: '/logo.svg',
    lazy: true,
    styles: {
      card: 'relative bg-hoverbtn rounded-2xl lg:rounded-3xl p-6 lg:p-7 min-h-[150px] lg:min-h-[250px] flex',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-2 text-sm lg:text-lg max-w-[34ch] text-black/70',
      image: 'absolute bottom-auto lg:bottom-4 right-6 w-28'
    }
  },
  {
    title: '>9000',
    subtitle: 'Человек ежемесячно',
    imageSrc: '/images/about/charity-mom.png',
    lazy: true,
    styles: {
      card: 'relative bg-hoverbtn rounded-2xl lg:rounded-3xl p-6 lg:p-7 min-h-[150px] lg:min-h-[250px] overflow-hidden',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-3 text-sm lg:text-lg text-black/70',
      image: 'absolute right-0 bottom-0 h-[140px] lg:h-[200px] object-cover rounded-br-3xl'
    }
  },
  {
    title: '>100',
    subtitle: 'Мероприятий в год проводится на постоянной основе',
    imageSrc: '/images/about/charity-cupcakes.png',
    lazy: true,
    styles: {
      card: 'relative bg-hoverbtn rounded-2xl lg:rounded-3xl p-6 lg:p-7 min-h-[150px] lg:min-h-[250px] overflow-hidden',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-3 text-sm lg:text-lg text-black/70 w-7/12 lg:w-8/12',
      image: 'absolute bottom-4 lg:bottom-7 right-6 w-24 lg:w-36 rounded-xl shadow-sm',
    }
  }
]

definePageMeta({
  layout: 'main',
})
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
      <AboutBanner />
      <CategorySection />
      <AboutSection class="mt-6"/>
      <WideSelectionSection />
      <section class="relative w-full pb-6 lg:pb-6">
        <h2 class="text-slider sm:text-product lg:text-slider font-medium mb-5">Исследования</h2>
        <div class="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div class="lg:w-4/12 flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-8 order-2 lg:order-1">
            <UiCard
              :card="{
                title: 'Исследования проводились в крупнейших НИИ и лабораториях России, Японии и Испании',
                imageSrc: '/images/about/flags.png',
                styles: {
                  card: 'relative bg-hoverbtn rounded-2xl lg:rounded-3xl h-[180px] lg:h-[207px] overflow-hidden',
                  title: 'text-base lg:text-2xl font-normal leading-tight mb-4 w-[90%] lg:w-[96%]',
                  image: 'h-[30px] absolute bottom-6 right-6',
                }
              }"
            />
            <UiCard
              :card="{
                title: 'Как Дайго влияет на организм спортсменов?',
                imageSrc: '/images/about/girl.png',
                extraImage: '/images/subscription-left.png',
                styles: {
                  card: 'relative bg-primary rounded-2xl lg:rounded-3xl h-[180px] lg:h-[207px] overflow-hidden',
                  title: 'text-base lg:text-2xl font-normal text-white leading-tight mb-4 w-9/12 lg:w-7/12 relative z-10',
                  image: 'h-[180px] lg:h-[207px] absolute bottom-0 right-0 z-0',
                  extraImage: 'absolute top-0 left-0 h-[207px] z-0',
                }
              }"
            />
          </div>
          <UiCard
            :card="{
              tags: [
                { label: 'Плазмалогены', color: 'bg-[#FFF05D] text-black' },
                { label: 'Производство', color: 'bg-[#9AFF9F] text-black' },
                { label: 'Здоровье', color: 'bg-[#FFBCD8] text-black' },
                { label: 'Daigo Lux', color: 'bg-[#89DEFF] text-black' },
                { label: 'Daigo', color: 'bg-[#FFBCD8] text-black' },
                { label: 'Tamotsu', color: 'bg-[#FFF05D] text-black' },
              ],
              title: 'Результаты подкреплены исследованиями',
              list: [
                { text: 'Производство Daigo', icon: '/icons/file.svg', link: '/researches/proizvodstvo-daigo' },
                { text: 'Плазмалогены',       icon: '/icons/file.svg', link: '/researches' },
              ],
              imageSrc: '/images/about/materialy.png',
              button: { text: 'Читать все исследования', link: '/researches' },
              styles: {
                card: 'relative bg-hoverbtn rounded-3xl lg:h-[446px] p-4 sm:p-9 overflow-hidden',
                tags: '!w-full sm:!w-10/12 lg:!w-8/12 mb-6',
                title: 'text-xl sm:text-cardhead font-medium leading-tight w-full sm:w-8/12',
                image: 'h-[120px] sm:h-[280px] absolute bottom-24 sm:bottom-10 -right-4 lg:right-10',
                button: '!mt-4 bg-primary text-white px-6 py-4 rounded-lg hover:bg-primary/80',
              }
            }"
            class="w-full lg:w-8/12 order-1 lg:order-2"
          />
        </div>
      </section>
      <CustomersSection :hide-title="true" />
        <section class="relative w-full py-6 lg:py-12">
          <h2 class="font-medium leading-tight mb-5 text-slider sm:text-product lg:text-slider lg:w-1/2">
            Мы заботимся о вашем здоровье и долголетии
          </h2>
          <div class="flex flex-col lg:flex-row gap-4 lg:gap-10">
            <div class="lg:w-5/12">
              <img
                src="https://nuxt.daigo.ru/images/about/director.jpg"
                alt="Генеральный директор Daigo"
                format="webp"
                loading="lazy"
                width="528"
                height="524"
                class="max-w-full h-auto w-full mx-auto"
              />
              <li class="flex flex-col gap-1 mt-4">
                <span class="text-2xl font-medium">
                  Дмитрий Федоров
                </span>
                <span class="text-black/50">
                  Генеральный директор
                </span>
              </li>
            </div>

            <div class="lg:w-6/12 flex">
              <ul class="text-sm lg:text-lg leading-relaxed space-y-4 list-disc list-outside">
                <li class="flex flex-col gap-2">
                  <span class="text-base lg:text-cardhead font-medium">
                    Миссия
                  </span>
                  <span>
                    Внести вклад в оздоровление нации и сделать Россию страной долгожителей.
                  </span>
                </li>
                <li class="flex flex-col gap-2">
                  <span class="text-base lg:text-cardhead font-medium">
                    Наша цель
                  </span>
                  <span>
                    Продвигать инновационные метабиотики и развивать эффективные методы профилактики, поддержки здоровья и активного долголетия.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="relative w-full pb-6 lg:pb-12">
          <h2 class="text-slider sm:text-product lg:text-slider font-medium mb-3 lg:mb-5">Команда</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
            <article
              v-for="p in people"
              :key="p.id ?? p.name"
              class="relative overflow-hidden rounded-xl lg:rounded-3xl bg-gray-100"
            >
              <!-- Изображение -->
              <div class="aspect-[3/4] lg:aspect-[1/1] w-full">
                <img
                  :src="p.photo"
                  :alt="p.name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <!-- Нижняя плашка (как в макете) -->
              <div
                class="absolute left-0 right-0 bottom-0 rounded-xl lg:rounded-2xl bg-white/50 backdrop-blur shadow-sm px-2 py-3 lg:p-6"
              >
                <h3 class="text-base lg:text-2xl font-medium leading-tight">
                  {{ p.name }}
                </h3>
                <p class="text-xs lg:text-lg text-black/50 mt-1">
                  {{ p.role }}
                </p>
              </div>
            </article>
          </div>
        </section>
      <section class="relative w-full pb-6 lg:pb-12">
        <h2 class="text-3xl lg:text-slider font-medium mb-5">Благотворительность</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UiCard v-for="(card, i) in cards" :key="i" :card="card" />
        </div>

        <div class="mt-10 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center mx-auto">
          <img src="/images/about/charity-1.png" class="max-h-20 mx-auto object-contain" alt="">
          <img src="/images/about/charity-2.png" class="max-h-20 mx-auto object-contain" alt="">
          <img src="/images/about/charity-3.png" class="max-h-20 mx-auto object-contain" alt="">
          <img src="/images/about/charity-4.png" class="max-h-20 mx-auto object-contain" alt="">
          <img src="/images/about/charity-5.png" class="max-h-20 mx-auto object-contain" alt="">
        </div>
      </section>
      <PartnersSection />
      <RewardSection />
    </div>
  </BaseContainer>
</template>
