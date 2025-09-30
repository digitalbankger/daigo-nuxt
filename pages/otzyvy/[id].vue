<script setup lang="ts">
import { useHead } from '#imports'
import type { H3EventContext } from 'h3'

const route = useRoute()
const id = route.params.id as string

const review = await $fetch<{
  id: string
  author: string
  content: string
  date?: string
  products?: Array<{ slug: string; name: string; image: string }>
}>(`/api/reviews/${id}`)

useHead(() => {
  const title = `Отзыв: ${review.author}`
  const desc = (review.content || '').replace(/<[^>]+>/g, '').slice(0, 160)
  const url = `https://your-domain/reviews/${id}`

  return {
    title,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Review',
          datePublished: review.date,
          author: { '@type': 'Person', name: review.author }
        })
      }
    ]
  }
})
</script>

<template>
  <BaseContainer>
    <article class="prose max-w-3xl mx-auto py-8">
      <h1 class="mb-2">Отзыв: {{ review.author }}</h1>
      <p v-if="review.date" class="text-sm text-gray-500">{{ new Date(review.date).toLocaleDateString('ru-RU') }}</p>
      <div class="mt-6" v-html="review.content"></div>

      <section v-if="review.products?.length" class="mt-8">
        <h2 class="text-lg font-semibold mb-4">Сопутствующие товары</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NuxtLink
            v-for="p in review.products" :key="p.slug"
            :to="`/catalog/${p.slug}`"
            class="block border rounded-xl p-3 hover:shadow"
          >
            <NuxtImg :src="p.image" :alt="p.name" class="w-full h-32 object-contain mb-2" loading="lazy" />
            <div class="text-sm line-clamp-2">{{ p.name }}</div>
          </NuxtLink>
        </div>
      </section>
    </article>
  </BaseContainer>
</template>
