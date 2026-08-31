<script setup lang="ts">
definePageMeta({ layout: false })

const canonical = 'https://daigo.ru/catalog/5ml-test'

useSeoMeta({
  title: 'Метабиотик Daigo 5 мл — официальный сайт Daigo',
  description:
    'Метабиотик Daigo 5 мл. Оригинальный японский метабиотик Daigo на официальном сайте.',
  ogTitle: 'Метабиотик Daigo 5 мл',
  ogDescription:
    'Оригинальный японский метабиотик Daigo 5 мл на официальном сайте.',
  ogType: 'website',
  ogUrl: canonical,
  ogImage:
    'https://daigoworld.com/cdn/shop/files/metabiotic-daigo-5ml-481137.png?v=1741776597&width=1200',
  twitterCard: 'summary_large_image',
})

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Метабиотик Daigo 5 мл',
  brand: { '@type': 'Brand', name: 'Daigo' },
  image:
    'https://daigoworld.com/cdn/shop/files/metabiotic-daigo-5ml-481137.png?v=1741776597&width=1200',
  description:
    'Оригинальный японский метабиотик Daigo 5 мл на официальном сайте Daigo.',
  offers: {
    '@type': 'Offer',
    url: canonical,
    priceCurrency: 'RUB',
    price: '14900',
    availability: 'https://schema.org/InStock',
  },
}

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(productSchema),
    },
  ],
})
</script>

<template>
  <main class="daigo-5ml-page">
    <iframe
      class="daigo-5ml-page__frame"
      src="/daigo-5ml/index.html"
      title="Метабиотик Daigo 5 мл"
      loading="eager"
      allow="autoplay; fullscreen; picture-in-picture"
    />
  </main>
</template>

<style scoped>
.daigo-5ml-page {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: #fff;
}

.daigo-5ml-page__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}
</style>
