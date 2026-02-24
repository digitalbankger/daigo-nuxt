<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useHead, useRuntimeConfig } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
definePageMeta({ layout: 'main' })

type DocType = 'pdf' | 'image' | 'video'

type DocItem = {
  id: string
  type: DocType
  title: string
  src: string        
  thumb?: string      
  year?: number
  tag?: string      
}

const QualityTopBlocks = defineAsyncComponent(() => import('~/components/quality/QualityTopBlocks.vue'))
const QualityDocsGrid = defineAsyncComponent(() => import('~/components/quality/QualityDocsGrid.vue'))
const QualityFaq = defineAsyncComponent(() => import('~/components/quality/QualityFaq.vue'))
const MediaViewerModal = defineAsyncComponent(() => import('~/components/quality/MediaViewerModal.vue'))

const title = 'Качество и безопасность'
const description =
  'Продукты Дайго проходят государственную регистрацию и производятся на площадках, работающих по международным стандартам качества. Документы подтверждают безопасность, состав и соответствие требованиям ЕАЭС.'

const documents = ref<DocItem[]>([
  {
    id: 'sgr-lux',
    type: 'pdf',
    title: 'СГР БАД «ДАЙГО Люкс»',
    src: 'https://s3.firstvds.ru/materials/sgr-daigo-lux.pdf',
    tag: 'СГР',
  },
  {
    id: 'sgr-daigo-5-10ml',
    type: 'pdf',
    title: 'СГР БАД «ДАЙГО» 5 мл и 10 мл',
    src: 'https://s3.firstvds.ru/materials/sgr-daigo-5ml-10ml.pdf',
    tag: 'СГР',
  },
  {
    id: 'ds-daigo-dent-2030',
    type: 'pdf',
    title: 'ДС «Дайго Дент» (действует до 21.07.2030)',
    src: 'https://s3.firstvds.ru/materials/ds-daigo-dent-valid-until-2030-07-21.pdf',
    tag: 'ДС',
  },
  {
    id: 'ds-shampoo-2028',
    type: 'pdf',
    title: 'ДС «Шампунь» (действует до 16.05.2028)',
    src: 'https://s3.firstvds.ru/materials/ds-shampoo-valid-until-2028-05-16.pdf',
    tag: 'ДС',
  },
  {
    id: 'sgr-pril-brainy',
    type: 'pdf',
    title: 'СГР Прил «Дайго Брэйни»',
    src: 'https://s3.firstvds.ru/materials/sgr-pril-daigo-brainy.pdf',
    tag: 'СГР',
  },
  {
    id: 'sgr-pril-dermic',
    type: 'pdf',
    title: 'СГР Прил «Дайго Дермик»',
    src: 'https://s3.firstvds.ru/materials/sgr-pril-daigo-dermic.pdf',
    tag: 'СГР',
  },
  {
    id: 'sgr-pril-jointic',
    type: 'pdf',
    title: 'СГР Прил «Дайго Джоинтик»',
    src: 'https://s3.firstvds.ru/materials/sgr-pril-daigo-jointic.pdf',
    tag: 'СГР',
  },
  {
    id: 'sgr-lactis-zoo-300',
    type: 'pdf',
    title: 'Свидетельство о госрегистрации Lactis ZOO (300)',
    // ВАЖНО: у тебя в имени сейчас .pdf.pdf — лучше переименовать на стороне S3.
    src: 'https://s3.firstvds.ru/materials/sgr-lactis-zoo-300.pdf.pdf',
    tag: 'СГР',
  },
  {
    id: 'sgr-tamotsu-3-years',
    type: 'pdf',
    title: 'СГР Tamotsu (срок 3 года)',
    src: 'https://s3.firstvds.ru/materials/sgr-tamotsu-3-years.pdf',
    tag: 'СГР',
  },

  // пример “фото сертификата”
//   { id: 'gmp-photo', type: 'image', title: 'GMP сертификат завода', src: '/images/quality/gmp.jpg', tag: 'GMP' },

  // пример “видео”
//   { id: 'factory-video', type: 'video', title: 'Производство — платформа', src: 'https://www.youtube.com/watch?v=XXXX', tag: 'Видео' },
])

const selected = ref<DocItem | null>(null)
const isModalOpen = ref(false)

const openDoc = (doc: DocItem) => {
  selected.value = doc
  isModalOpen.value = true
}
const closeDoc = () => {
  isModalOpen.value = false
  selected.value = null
}

// FAQ
const faq = [
  {
    q: 'Срок годности зависит от партии?',
    a: 'Да. Срок годности зависит от партии и указан на упаковке. Обновление регистрационного досье применяется к новым партиям.',
  },
  {
    q: 'Что такое регистрационное досье и как оно обновляется?',
    a: 'Регистрационное досье регулярно обновляется на основании новых научных данных и требований регуляторов.',
  },
  {
    q: 'Как подтверждается безопасность продукта?',
    a: 'Документы подтверждают безопасность, состав и соответствие требованиям ЕАЭС. При необходимости предоставляются декларации/сертификаты и материалы регистрации.',
  },
  {
    q: 'Почему у разных партий могут быть отличия?',
    a: 'Допустимы технологические вариации сырья и параметров производства в пределах норм. Критические показатели контролируются системой качества производителя.',
  },
]

const canonical = '/quality-and-safety'

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonical },
  ],
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical,
      }),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((x) => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: { '@type': 'Answer', text: x.a },
        })),
      }),
    },
  ],
}))
</script>

<template>
    <BaseContainer>
  <div class="mx-auto py-6 sm:py-10">
    <h1 class="text-3xl sm:text-5xl font-medium mb-6">Качество и безопасность</h1>

    <p class="text-black/70 text-base sm:text-lg max-w-[980px] mb-8">
      Продукты Дайго проходят государственную регистрацию и производятся на площадках, работающих по международным стандартам качества.
      Документы подтверждают безопасность, состав и соответствие требованиям ЕАЭС.
    </p>

    <QualityTopBlocks />

    <div class="mt-10 sm:mt-14">
      <h2 class="text-2xl sm:text-3xl font-medium mb-8">Документы</h2>
      <QualityDocsGrid :items="documents" @open="openDoc" />
    </div>

    <div class="mt-10 sm:mt-14">
      <h2 class="text-2xl sm:text-3xl font-medium mb-10">Часто задаваемые вопросы</h2>
      <QualityFaq :items="faq" />
    </div>

    <MediaViewerModal
      :open="isModalOpen"
      :item="selected"
      @close="closeDoc"
    />
  </div>
  </BaseContainer>
</template>