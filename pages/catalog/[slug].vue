<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useProductStore } from '~/stores/productStore'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProductHero from '~/components/product/ProductHero.vue'
import ProductDescription from '~/components/product/ProductDescription.vue'
import ProductUsageInstructions from '~/components/product/ProductUsageInstructions.vue'
import ProductVideo from '~/components/product/ProductVideo.vue'
import ProductFAQ from '~/components/product/ProductFAQ.vue'
import RewardSection from '~/components/sections/RewardSection.vue'
import Button from '~/components/ui/Button.vue'
import ProductInfoBlock from '~/components/product/ProductInfoBlock.vue'
import ProductProductionSection from '~/components/product/ProductProductionSection.vue'
import ProductStickyCartPopup from '~/components/product/ProductStickyCartPopup.vue'
import CertificateProductPage from '~/components/product/certificate/CertificateProductPage.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'
import { useYtm } from '@/composables/useYtm'
import { useAnalytics } from '@/composables/useAnalytics'
import { onMounted, computed, ref } from 'vue'
// import ReviewsBlock from '@/components/product/ProductReviews.vue'
// import UiModal from '@/components/ui/UiModal.vue'

// type ReviewMedia = {
//   id: string
//   type: 'image' | 'video'
//   thumb: string
//   src?: string
// }

// const isMediaModalOpen = ref(false)
// const activeMedia = ref<ReviewMedia | null>(null)

// const onOpenMedia = (m: ReviewMedia) => {
//   activeMedia.value = m
//   isMediaModalOpen.value = true
// }

// const closeMedia = () => {
//   isMediaModalOpen.value = false
//   activeMedia.value = null
// }

const route = useRoute()
const productStore = useProductStore()
await productStore.loadProduct(route.params.slug as string)

const product = computed(() => productStore.product)

// признак «это сертификат?» — выберите свой источник правды
const isCertificate = computed(() =>
  product.value?.template === 'certificate' ||
  product.value?.type === 'certificate' ||
  product.value?.category === 'certificate'
)



// ✅ ОДИН onMounted, внутри – проверка на client и вызов useYtm
onMounted(() => {
  if (!import.meta.client) return        // защита от SSR
  if (!product.value) return

  const ytm = useYtm()

  // ✅ Я.Метрика Enhanced Ecommerce (шаг 4 воронки: просмотр карточки товара)
  const analytics = useAnalytics()
  analytics.viewItem({
    id: product.value.product_id,
    name: product.value.title,
    price: Number(product.value.price) || 0,
    url: `/catalog/${product.value.slug}`,
    image_url: product.value.images?.[0]?.image_url,
    brand: 'Daigo'
  })

  ytm.viewDetail({
    currency: 'RUB',
    brand: 'Daigo',
    items: [
      {
        id: product.value.product_id,
        name: product.value.title,
        price: Number(product.value.price) || 0,
        image_url: product.value.images?.[0]?.image_url
      }
    ]
  })
})

// хлебные крошки / JSON-LD
const { breadcrumbs, jsonLd } = useBreadcrumbs(product, '/catalog')

const faqJsonLd = computed(() => {
  const faq = product.value?.faq
  if (!faq?.items?.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a }
    }))
  }
})

// OpenGraph/Twitter image (берём сначала из effect.image)
const SITE_URL = 'https://daigo.ru'
const shareImage = computed(() => {
  const fromEffect = product.value?.effect?.image
  const fallback =
    (product.value as any)?.hero?.image ||
    (product.value as any)?.images?.[0]?.image_url ||
    (product.value as any)?.images?.[0]
  const src = fromEffect || fallback
  if (!src) return null
  return src.startsWith('http') ? src : `${SITE_URL}${src}`
})

useHead(() => {
  const scripts: any[] = [{ type: 'application/ld+json', children: JSON.stringify(jsonLd.value) }]
  if (faqJsonLd.value) {
    scripts.push({ type: 'application/ld+json', children: JSON.stringify(faqJsonLd.value) })
  }

  return {
    title: product.value?.title,
    meta: [
      { name: 'description', content: product.value?.shortDescription },
      { property: 'og:title', content: product.value?.title },
      { property: 'og:description', content: product.value?.shortDescription },
      { property: 'og:type', content: 'product' },
      { property: 'og:url', content: `https://daigo.ru/catalog/${product.value?.slug}` },
      ...(shareImage.value
        ? [
            { property: 'og:image', content: shareImage.value },
            { property: 'og:image:secure_url', content: shareImage.value },
            { property: 'og:image:alt', content: product.value?.title || 'Daigo' }
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      ...(shareImage.value ? [{ name: 'twitter:image', content: shareImage.value }] : []),
      { name: 'twitter:title', content: product.value?.title },
      { name: 'twitter:description', content: product.value?.shortDescription }
    ],
    link: [
      { rel: 'canonical', href: `https://daigo.ru/catalog/${product.value?.slug}` },
      ...(shareImage.value ? [{ rel: 'image_src', href: shareImage.value }] : [])
    ],
    script: scripts
  }
})
</script>

<template>
  <BaseContainer>
    <div v-if="product">
      <!-- breadcrumbs -->
      <nav aria-label="Хлебные крошки" class="mb-2 md:mb-4 text-sm md:text-base text-black/50">
        <ul class="flex flex-wrap items-center gap-1">
          <li v-for="(bc, i) in breadcrumbs" :key="i" class="flex items-center gap-1">
            <template v-if="bc.to">
              <NuxtLink :to="bc.to" class="hover:text-black underline-offset-4 hover:underline">
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

      <!-- Если сертификат — рисуем спец. страницу -->
      <CertificateProductPage v-if="isCertificate" :product="product" />

      <!-- Иначе — стандартная карточка товара -->
      <template v-else>
        <ProductHero :product="product" />

        <ClientOnly>
          <ProductStickyCartPopup :product="product" observe-target="#product-cta" />
        </ClientOnly>

        <ProductDescription :product="product" />

        <ProductInfoBlock
          v-if="product.nabor"
          :title="product.nabor.title"
          :image="product.nabor.image"
          :content="product.nabor.text"
          image-position="left"
          class="mt-6 md:mt-12"
        />

        <ProductInfoBlock
          v-if="product.naborCombo"
          :title="product.naborCombo.title"
          :image="product.naborCombo.image"
          :content="product.naborCombo.text"
          image-position="right"
          class="mt-6 md:mt-12"
        />

        <ProductInfoBlock
          v-if="product.combo"
          :title="product.combo.title"
          :image="product.combo.image"
          :content="product.combo.text"
          image-position="right"
          class="mt-6 md:mt-12"
        />

        <ProductInfoBlock
          v-if="product.actionPrinciple"
          :title="product.actionPrinciple.title"
          :image="product.actionPrinciple.image"
          :content="product.actionPrinciple.text"
          :image-position="product.actionPrinciple.imagePosition || 'right'"
          class="mt-6 md:mt-12"
        />

        <ProductInfoBlock
          v-if="product.effect"
          :title="product.effect.title"
          :image="product.effect.image"
          :content="product.effect.content"
          :image-position="product.effect.imagePosition || 'left'"
          class="mt-6 md:mt-12"
        />

        <ProductInfoBlock
          v-if="product.effectCombo"
          :title="product.effectCombo.title"
          :image="product.effectCombo.image"
          :content="product.effectCombo.content"
          :image-position="product.effectCombo.imagePosition || 'right'"
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

        <ProductInfoBlock
          v-if="product.compositionCombo"
          :title="product.compositionCombo.title"
          :image="product.compositionCombo.image"
          :content="product.compositionCombo.content"
          image-position="left"
          class="mt-6 md:mt-12"
        />

        <ProductUsageInstructions
          v-if="product?.usageInstructions"
          :data="product.usageInstructions"
          class="mt-6 md:mt-12"
        />

        <!-- <ReviewsBlock
          v-if="product?.reviews?.items?.length"
          :reviews="product.reviews"
          title="Отзывы"
          @openMedia="onOpenMedia"
        /> 
        
        <UiModal
          :show="isMediaModalOpen"
          @close="closeMedia"
          :panelClass="'sm:max-w-3xl p-0 overflow-hidden'"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <div class="text-sm font-semibold text-[#111]">Отзыв</div>
            <button class="text-sm text-[#6B7280] hover:text-[#111]" @click="closeMedia">Закрыть</button>
          </div>

          <div class="bg-black">
            <img
              v-if="activeMedia?.type === 'image'"
              :src="activeMedia?.src || activeMedia?.thumb"
              class="w-full max-h-[80vh] object-contain"
              alt=""
            />

            <video
              v-else-if="activeMedia?.type === 'video'"
              class="w-full max-h-[80vh]"
              controls
              :src="activeMedia?.src"
            />
          </div>
        </UiModal> -->

        <ProductProductionSection
          v-if="product.productionSection"
          v-bind="product.productionSection"
          class="mt-6 md:mt-12"
        />

        <ClientOnly>
          <RewardSection class="mt-12 md:mt-16 md:mt-12" />
        </ClientOnly>

        <ProductFAQ v-if="product.faq?.items?.length" :faq="product.faq" />

        <section
          class="relative overflow-hidden w-full flex items-center justify-center rounded-2xl lg:min-h-[380px] bg-primary bg-no-repeat px-4 md:px-6 lg:px-10 py-4 md:py-8 text-white mt-16"
        >
          <img src="/images/subscription-product.png" alt="" class="hidden lg:block absolute z-0 right-0 h-full" />
          <img src="/images/subscription-left.png" alt="" class="hidden lg:block absolute z-0 left-0 h-full" />
          <img src="/images/product/prod-right.png" alt="" class="block lg:hidden absolute z-0 right-0 h-full" />
          <img src="/images/product/prod-left.png" alt="" class="block lg:hidden absolute z-0 left-0 h-full" />
          <div class="relative z-10 md:w-full flex flex-col gap-2 md:gap-4 items-start justify-center my-auto">
            <h2 class="font-medium leading-tight text-sm md:text-3xl lg:text-[40px]">
              Как выбрать<span class="ms-1 rounded-md px-3 py-1 text-black bg-[#C3FF00]">правильный товар?</span>
            </h2>
            <p class="text-[10px] md:text-2xl leading-tight font-light md:max-w-[60%] mb-1">
              Чтобы подробнее узнать о товарах от Дайго, рекомендуем ознакомиться со статьями на нашем сайте
            </p>
            <Button tp="/articles" variant="outline" class="!text-white !border-white hover:!text-black hover:bg-white !text-xs md:!text-lg !px-2 h-8 md:h-12 w-40 md:w-60">
              Перейти к статьям
            </Button>
          </div>
        </section>
      </template>
    </div>
  </BaseContainer>
</template>
