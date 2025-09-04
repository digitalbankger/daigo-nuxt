<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useProductStore } from '~/stores/productStore'
import ProductHero from '~/components/product/ProductHero.vue'
import ProductUsageInstructions from '~/components/product/ProductUsageInstructions.vue'
import ProductVideo from '~/components/product/ProductVideo.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProductDescription from '~/components/product/ProductDescription.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

const route = useRoute()
const productStore = useProductStore()
await productStore.loadProduct(route.params.slug as string)

const product = computed(() => productStore.product)

// хлебные крошки
const { breadcrumbs, jsonLd } = useBreadcrumbs(product, '/catalog')

useHead(() => ({
  title: product.value?.title,
  meta: [
    { name: 'description', content: product.value?.shortDescription },
    { property: 'og:title', content: product.value?.title },
    { property: 'og:description', content: product.value?.shortDescription },
    { property: 'og:type', content: 'product' },
    { property: 'og:url', content: `https://daigo.ru/catalog/${product.value?.slug}` }
  ],
  script: [
    {
      type: 'application/ld+json',
      // Nuxt 3: используем children для JSON-LD
      children: JSON.stringify(jsonLd.value),
    },
  ],
}))
</script>


<template>
  <BaseContainer>

  <div v-if="product">
    <!-- breadcrumbs -->
    <nav aria-label="Хлебные крошки" class="mb-2 md:mb-4 text-sm md:text-base text-black/50">
      <ul class="flex flex-wrap items-center gap-1">
        <li
          v-for="(bc, i) in breadcrumbs"
          :key="i"
          class="flex items-center gap-1"
        >
          <template v-if="bc.to">
            <NuxtLink
              :to="bc.to"
              class="hover:text-black underline-offset-4 hover:underline"
            >
              {{ bc.label }}
            </NuxtLink>
          </template>
          <template v-else>
            <span class="text-black/70">{{ bc.label }}</span>
          </template>
          <span v-if="i < breadcrumbs.length - 1">/</span>
        </li>
      </ul>
    </nav>
    <ProductHero :product="product" />
    <ProductDescription :product="product" />
    <ProductInfoBlock
      v-if="product.actionPrinciple"
      :title="product.actionPrinciple.title"
      :image="product.actionPrinciple.image"
      :content="product.actionPrinciple.text"
      image-position="right"
      class="mt-6 md:mt-12"
    />

    <ProductInfoBlock
      v-if="product.effect"
      :title="product.effect.title"
      :image="product.effect.image"
      :content="product.effect.content"
      image-position="left"
      class="mt-6 md:mt-12"
    />
    <ProductVideo :video-url="product.videoUrl" :video-poster="product.videoPoster" />
    <ProductInfoBlock
      v-if="product.composition"
      :title="product.composition.title"
      :image="product.composition.image"
      :content="product.composition.content"
      image-position="right"
      class="mt-6 md:mt-12"
    />
    <ProductUsageInstructions 
      :data="product.usageInstructions" 
      class="mt-6 md:mt-12"
    />
    <ProductProductionSection
      v-if="product.productionSection"
      v-bind="product.productionSection"
      class="mt-6 md:mt-12"
    />

  </div>

  </BaseContainer>
</template>
