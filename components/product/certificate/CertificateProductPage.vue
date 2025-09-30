<script setup lang="ts">
import ProductHero from '~/components/product/ProductHero.vue'
import ProductFAQ from '~/components/product/ProductFAQ.vue'
import RewardSection from '~/components/sections/RewardSection.vue'

// новые секции
import CertificateElectronic from './CertificateElectronic.vue'
import CertificatePhysical from './CertificatePhysical.vue'

const props = defineProps<{ product: any }>()

// open-graph: картинка для шаринга
const SITE_URL = 'https://daigo.ru'
const shareImage = computed(() => {
  const hero = (props.product as any)?.images?.[0]?.image_url
  if (!hero) return null
  return hero.startsWith('http') ? hero : `${SITE_URL}${hero}`
})

useHead(() => ({
  title: props.product?.title,
  meta: [
    { name: 'description', content: props.product?.shortDescription?.replace(/<[^>]*>/g, '') },
    { property: 'og:title', content: props.product?.title },
    { property: 'og:description', content: props.product?.shortDescription?.replace(/<[^>]*>/g, '') },
    { property: 'og:type', content: 'product' },
    ...(shareImage.value ? [{ property: 'og:image', content: shareImage.value }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    ...(shareImage.value ? [{ name: 'twitter:image', content: shareImage.value }] : [])
  ],
}))
</script>

<template>
    <!-- верх — как у обычного товара -->
    <ProductHero :product="product" />

    <!-- Электронный сертификат -->
    <CertificateElectronic
      class="mt-6 md:mt-10"
      :cert-images="product.certImages"
    />

    <!-- Физический сертификат -->
    <CertificatePhysical
      class="mt-6 md:mt-24"
      :cert-images="product.certImages"
    />

    <!-- низ страницы — общий -->
    <ClientOnly>
      <RewardSection class="mt-12 md:mt-16" />
    </ClientOnly>

    <ProductFAQ v-if="product.faq?.items?.length" :faq="product.faq" class="mt-10" />
</template>
