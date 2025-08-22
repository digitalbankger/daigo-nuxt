<script setup lang="ts">
import BaseContainer from '@/components/layout/BaseContainer.vue'
import AboutBanner from '@/components/about/AboutBanner.vue'
import CategorySection from '@/components/about/CategorySection.vue'
import AboutSection from '~/components/sections/AboutSection.vue'
import WideSelectionSection from '~/components/sections/WideSelectionSection.vue'
import CustomersSection from '~/components/sections/CustomersSection.vue'
import PartnersSection from '~/components/sections/PartnersSection.vue'
import RewardSection from '~/components/sections/RewardSection.vue'

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
      card: 'relative bg-hoverbtn rounded-3xl p-6 md:p-7 min-h-[250px] flex',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-2 text-lg max-w-[34ch] black/70',
      image: 'absolute bottom-4 right-6 w-28'
    }
  },
  {
    title: '>9000',
    subtitle: 'Человек ежемесячно',
    imageSrc: '/images/about/charity-mom.png',
    lazy: true,
    styles: {
      card: 'relative bg-hoverbtn rounded-3xl p-6 md:p-7 min-h-[250px] overflow-hidden',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-3 text-lg text-black/70',
      image: 'absolute right-0 bottom-0 h-[200px] object-cover rounded-br-3xl'
    }
  },
  {
    title: '>100',
    subtitle: 'Мероприятий в год проводится на постоянной основе',
    imageSrc: '/images/about/charity-cupcakes.png',
    lazy: true,
    styles: {
      card: 'relative bg-hoverbtn rounded-3xl p-6 md:p-7 min-h-[250px] overflow-hidden',
      title: 'text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-none',
      subtitle: 'mt-3 text-lg text-black/70 w-8/12',
      image: 'absolute bottom-7 right-6 w-36 rounded-xl shadow-sm',
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
      <section class="relative w-full pb-6 md:pb-6">
        <h2 class="text-slider font-medium mb-5">Исследования</h2>
        <div class="flex flex-col md:flex-row gap-8">
          <div class="md:w-4/12 flex flex-col gap-8">
            <UiCard
              :card="{
                title: 'Исследования проводились в крупнейших НИИ и лабораториях России, Японии и Испании',
                imageSrc: '/images/about/flags.png',
                styles: {
                  card: 'relative bg-hoverbtn rounded-3xl md:h-[207px] overflow-hidden',
                  title: 'text-2xl font-normal leading-tight mb-4 w-[96%]',
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
                  card: 'relative bg-primary rounded-3xl md:h-[207px] overflow-hidden',
                  title: 'text-2xl font-normal text-white leading-tight mb-4 w-7/12 relative z-10',
                  image: 'h-[207px] absolute bottom-0 right-0 z-0',
                  extraImage: 'absolute top-0 left-0 h-[207px] z-0',
                }
              }"
            />
          </div>
          <UiCard
            :card="{
              tags: [
                { label: 'Плазмалогены', color: 'bg-yellow-200 text-black' },
                { label: 'Производство', color: 'bg-green-200 text-black' },
                { label: 'Здоровье', color: 'bg-pink-200 text-black' },
                { label: 'Daigo Lux', color: 'bg-sky-200 text-black' },
                { label: 'Daigo', color: 'bg-rose-200 text-black' },
                { label: 'Tamotsu', color: 'bg-yellow-200 text-black' },
              ],
              title: 'Результаты подкреплены исследованиями',
              list: [
                { text: 'Производство Daigo', icon: '/icons/file.svg' },
                { text: 'Плазмалогены',       icon: '/icons/file.svg' },
              ],
              imageSrc: '/images/about/materialy.png',
              button: { text: 'Читать все исследования', link: '/researches' },
              styles: {
                card: 'relative bg-hoverbtn rounded-3xl md:h-[446px] p-9 overflow-hidden',
                tags: '!w-8/12 mb-6',
                title: 'text-cardhead font-medium leading-tight w-8/12',
                image: 'h-[280px] absolute bottom-10 right-10',
                button: '!mt-4 bg-primary text-white px-6 py-4 rounded-lg hover:bg-primary/80',
              }
            }"
            class="w-full md:w-8/12"
          />
        </div>
      </section>
      <CustomersSection :hide-title="true" />
        <section class="relative w-full py-12 md:py-12">
          <h2 class="font-medium leading-tight mb-5 text-slider md:w-1/2">
            Мы заботимся о вашем здоровье и долголетии
          </h2>
          <div class="flex lg:flex-row gap-10">
            <div class="md:w-5/12">
              <NuxtImg
                src="http://localhost:3000/images/about/director.jpg"
                alt="Генеральный директор Daigo"
                format="webp"
                loading="lazy"
                width="528"
                height="524"
                placeholder
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

            <div class="md:w-6/12 flex">
              <ul class="text-lg leading-relaxed space-y-4 list-disc list-outside">
                <li class="flex flex-col gap-2">
                  <span class="text-cardhead font-medium">
                    Миссия
                  </span>
                  <span>
                    Внести вклад в оздоровление нации и сделать Россию страной долгожителей.
                  </span>
                </li>
                <li class="flex flex-col gap-2">
                  <span class="text-cardhead font-medium">
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

        <section class="relative w-full pb-12 md:pb-12">
          <h2 class="text-slider font-medium mb-5">Команда</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <article
              v-for="p in people"
              :key="p.id ?? p.name"
              class="relative overflow-hidden rounded-3xl bg-gray-100"
            >
              <!-- Изображение -->
              <div class="aspect-[1/1] w-full">
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
                class="absolute left-0 right-0 bottom-0 rounded-2xl bg-white/50 backdrop-blur shadow-sm p-6"
              >
                <h3 class="text-2xl font-medium leading-tight">
                  {{ p.name }}
                </h3>
                <p class="text-lg text-black/50 mt-1">
                  {{ p.role }}
                </p>
              </div>
            </article>
          </div>
        </section>
      <section class="relative w-full pb-12 md:pb-12">
        <h2 class="text-slider font-medium mb-5">Благотворительность</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UiCard v-for="(card, i) in cards" :key="i" :card="card" />
        </div>

        <div class="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center mx-auto">
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
