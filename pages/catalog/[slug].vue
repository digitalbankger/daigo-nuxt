<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useProductStore } from '~/stores/productStore'
import { useAuthStore } from '~/stores/authStore'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProductHero from '~/components/product/ProductHero.vue'
import BundleProductHero from '~/components/product/bundle/BundleProductHero.vue'
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
import { onMounted, computed, defineAsyncComponent, ref } from 'vue'
import ReviewsBlock from '@/components/product/ProductReviews.vue'
import UiModal from '@/components/ui/UiModal.vue'
import ReviewFormModal from '~/components/reviews/ReviewFormModal.vue'
import { createProductReview } from '~/services/reviewService'
import DaigoSpecialSections from '@/components/product/special/DaigoSpecialSections.vue'
import { getOmegaBundlePageContent } from '~/data/omegaBundlePageContent'
import {
  isOmegaBundleSlug,
  type OmegaBundleSlug,
} from '~/constants/omegaBundles'
import type { BundleContentSection } from '~/types/product'

const OMEGA_PRODUCT_SLUG = 'zhir-pecheni-treski-omega-3'

const relatedOmegaBundles: BundleContentSection[] = [{
  type: 'related-products',
  products: [
    {
      product_id: '8dea5513-5c3a-4350-9ad4-35edf8696f0c',
      variant_id: '16908f72-d05e-4e48-8174-881d9d33ec0b',
      slug: 'obnovlenie-kozhi',
      title: 'Обновление кожи. Омега-3 и аминобиотик Dermic',
      image: '/images/omega-bundle/omega-dermic.jpg',
      price: 31025,
      originalPrice: 36500,
    },
    {
      product_id: '6bc6d4f7-2c7e-47b8-a7f4-59cfdf9b1002',
      variant_id: '3184d090-3f98-4c64-9e59-195785af2001',
      slug: 'svoboda-dyhaniya',
      title: 'Свобода движения. Омега-3 и аминобиотик Jointic',
      image: '/images/omega-bundle/omega-jointic.jpg',
      price: 31025,
      originalPrice: 36500,
    },
    {
      product_id: '42a6bb34-a1a0-4a50-8c10-bf6c5e3a1001',
      variant_id: '67fbbda5-f3f0-41bf-b1ea-0e6f74cf3001',
      slug: 'dvizhenie-mysli',
      title: 'Движение мысли. Омега-3 и аминобиотик Brainy',
      image: '/images/omega-bundle/omega-brainy.jpg',
      price: 31025,
      originalPrice: 36500,
    },
  ],
}]

const bundlePageContent = computed(() => {
  const slug = product.value?.slug || String(route.params.slug || '')

  if (!isOmegaBundleSlug(slug)) {
    return null
  }

  return getOmegaBundlePageContent(slug as OmegaBundleSlug)
})

const BundleProductSections = defineAsyncComponent(
  () => import('~/components/product/bundle/BundleProductSections.vue'),
)

// Отзыв
type ReviewMedia = {
  id: string
  type: 'image' | 'video'
  thumb: string
  src?: string
}

type ProductReviewItem = {
  id: string
  author: string
  rating: number
  date?: string
  title?: string
  text: string
  source?: string
  verified?: boolean
  media?: ReviewMedia[]
  tags?: string[]
  i18n?: {
    ru: { title?: string; text: string }
    en?: { title?: string; text: string }
  }
}

type ProductReviewsData = {
  ratingAvg?: number
  count?: number
  source?: string
  items: ProductReviewItem[]
}

const isWriteReviewOpen = ref(false)
const isSubmittingReview = ref(false)
const reviewError = ref('')
const reviewFormRef = ref<InstanceType<typeof ReviewFormModal> | null>(null)

const authStore = useAuthStore()

const openWriteReview = () => {
  if (!authStore.isAuthenticated || !authStore.userId) {
    authStore.openAuth(route.fullPath)
    return
  }

  isWriteReviewOpen.value = true
  reviewError.value = ''
}

const closeWriteReview = () => {
  isWriteReviewOpen.value = false
  reviewError.value = ''
  isSubmittingReview.value = false
}

const submitReview = async (payload: any) => {
  if (isSubmittingReview.value) return

  if (!authStore.isAuthenticated || !authStore.userId) {
    reviewError.value = 'Чтобы оставить отзыв, авторизуйтесь.'
    authStore.openAuth(route.fullPath)
    return
  }

  const slug = String(product.value?.slug || route.params.slug || '').trim()
  if (!slug) {
    reviewError.value = 'Не удалось определить товар для отзыва.'
    return
  }

  isSubmittingReview.value = true
  reviewError.value = ''

  try {
    const formData = payload.formData instanceof FormData ? payload.formData : new FormData()
    formData.set('daigo_id', String(authStore.userId))
    await createProductReview(slug, formData)
    reviewFormRef.value?.markSent()
  } catch (err: any) {
    const status = Number(err?.statusCode || err?.response?.status || err?.status || 0)

    if (status === 401 || status === 403) {
      reviewError.value = 'Сессия авторизации истекла. Авторизуйтесь еще раз, чтобы оставить отзыв.'
      authStore.openAuth(route.fullPath)
      return
    }

    reviewError.value =
      err?.data?.message ||
      err?.data?.statusMessage ||
      err?.statusMessage ||
      err?.message ||
      'Не удалось отправить отзыв. Попробуйте еще раз.'
  } finally {
    isSubmittingReview.value = false
  }
}

const isMediaModalOpen = ref(false)
const activeMedia = ref<ReviewMedia | null>(null)

const onOpenMedia = (m: ReviewMedia) => {
  if (m.type === 'video') return
  activeMedia.value = m
  isMediaModalOpen.value = true
}

const closeMedia = () => {
  isMediaModalOpen.value = false
  activeMedia.value = null
}
// --- Конец логики отзывов ---

const route = useRoute()
const productStore = useProductStore()
await productStore.loadProduct(route.params.slug as string)

const { data: productReviewsResponse } = await useFetch<ProductReviewsData>(`/api/shop/reviews/${route.params.slug as string}`, {
  key: `product-reviews:${route.params.slug as string}`,
  default: () => ({ items: [] })
})

const product = computed(() => productStore.product)
const fixedReviewProduct = computed(() => product.value ? {
  id: (product.value as any).id || product.value.product_id,
  product_id: product.value.product_id || (product.value as any).id,
  slug: product.value.slug || String(route.params.slug || ''),
  title: product.value.title || (product.value as any).name || 'Товар',
  image: (product.value as any).images?.[0]?.image_url,
} : null)
const productReviews = computed<ProductReviewsData>(() => {
  const value = productReviewsResponse.value
  return value && Array.isArray(value.items) ? value : { items: [] }
})

const isCertificate = computed(() =>
  product.value?.template === 'certificate' ||
  product.value?.type === 'certificate' ||
  product.value?.category === 'certificate'
)

const isOmegaBundlePage = computed(() =>
  isOmegaBundleSlug(product.value?.slug || route.params.slug),
)

const isOmegaProductPage = computed(() =>
  String(product.value?.slug || route.params.slug || '') === OMEGA_PRODUCT_SLUG,
)

const bundleSectionsWithoutRelated = computed(() =>
  product.value?.bundleSections?.filter((section) => section.type !== 'related-products') || [],
)

const shouldShowProductFaq = computed(() => {
  if (!product.value) return false
  if (isOmegaBundlePage.value) return true

  const { faq: _faq, ...productWithoutFaq } = product.value as any
  const rawText = JSON.stringify(productWithoutFaq)
    .toLowerCase()
    .replace(/ё/g, 'е')

  const normalizedText = rawText.replace(/[^a-zа-я0-9]+/g, ' ')
  const compactText = normalizedText.replace(/\s+/g, '')

  return (
    compactText.includes('daigo5ml') ||
    compactText.includes('daigo5мл') ||
    compactText.includes('дайго5мл') ||
    compactText.includes('daigo10ml') ||
    compactText.includes('daigo10мл') ||
    compactText.includes('дайго10мл') ||
    /(?:daigo|дайго)10.*(?:ml|мл)/.test(compactText) ||
    normalizedText.includes('люкс') ||
    /\blux\b/.test(normalizedText)
  )
})



onMounted(() => {
  if (!import.meta.client) return
  if (!product.value) return

  const ytm = useYtm()

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

const { breadcrumbs, jsonLd } = useBreadcrumbs(product, '/catalog')

const faqJsonLd = computed(() => {
  if (!shouldShowProductFaq.value) return null

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

import { normalizeMediaUrl } from '~/utils/mediaUrl'

const SITE_URL = 'https://daigo.ru'
const shareImage = computed(() => {
  const fromEffect = product.value?.effect?.image
  const fallback =
    (product.value as any)?.hero?.image ||
    (product.value as any)?.images?.[0]?.image_url ||
    (product.value as any)?.images?.[0]
  const src = normalizeMediaUrl(fromEffect || fallback)
  if (!src) return null
  return src.startsWith('http') ? src : `${SITE_URL}${src}`
})

const productJsonLd = computed(() => {
  const currentProduct = product.value
  if (!currentProduct) return null

  const images = (currentProduct.images || [])
    .map((image) => normalizeMediaUrl(image.image_url))
    .filter(Boolean)
    .map((image) => image!.startsWith('http') ? image! : `${SITE_URL}${image}`)

  const variants = currentProduct.variants || []
  const offers = variants.length
    ? variants.map((variant) => ({
        '@type': 'Offer',
        sku: `${currentProduct.product_id}:${variant.variant_id}`,
        name: variant.label,
        price: Number(variant.price || 0),
        priceCurrency: 'RUB',
        availability: currentProduct.isActive
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/catalog/${currentProduct.slug}`,
      }))
    : [{
        '@type': 'Offer',
        sku: String(currentProduct.product_id),
        price: Number(currentProduct.price || 0),
        priceCurrency: 'RUB',
        availability: currentProduct.isActive
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: `${SITE_URL}/catalog/${currentProduct.slug}`,
      }]

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: currentProduct.title,
    description: currentProduct.shortDescription,
    sku: String(currentProduct.product_id),
    brand: {
      '@type': 'Brand',
      name: 'Daigo',
    },
    ...(images.length ? { image: images } : {}),
    offers,
  }
})

useHead(() => {
  const scripts: any[] = [{ type: 'application/ld+json', children: JSON.stringify(jsonLd.value) }]
  if (productJsonLd.value) {
    scripts.push({ type: 'application/ld+json', children: JSON.stringify(productJsonLd.value) })
  }
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
        <BundleProductHero
          v-if="isOmegaBundlePage && bundlePageContent"
          :product="product"
          :name="bundlePageContent.name"
        />
        <ProductHero v-else :product="product" />

        <ClientOnly v-if="!isOmegaBundlePage">
          <ProductStickyCartPopup :product="product" observe-target="#product-cta" />
        </ClientOnly>

        <!-- <DaigoSpecialSections
          :product-id="product?.id"
          :product-slug="product?.slug"
          :enabled-product-ids="[101, 102]"
          :enabled-product-slugs="['metabiotik-daigo', 'metabiotik-daigo-10ml']"
        />

        <ReviewsBlock
          v-if="!isOmegaBundlePage && productReviews?.items?.length"
          :reviews="productReviews"
          :show-actions="true"
          title="Отзывы"
          @openMedia="onOpenMedia"
          @write="openWriteReview"
          class="mt-10 md:mt-20"
          id="reviews"
        />

        <section v-else-if="!isOmegaBundlePage" id="reviews" class="mt-10 md:mt-20 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
          <h2 class="text-product leading-tight font-medium">Отзывы</h2>
          <p class="mt-3 text-sm md:text-base text-[#6B7280]">Станьте первым, кто оставит отзыв об этом товаре.</p>
          <button
            type="button"
            class="mt-5 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition"
            @click="openWriteReview"
          >
            Написать отзыв
          </button>
        </section> -->

        <BundleProductSections
          v-if="isOmegaBundlePage && bundleSectionsWithoutRelated.length"
          :sections="bundleSectionsWithoutRelated"
        />

        <template v-else>
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

          <!-- <ProductVideo :video-url="product.videoUrl" :video-poster="product.videoPoster" /> -->

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
        </template>

        <BundleProductSections
          v-if="isOmegaBundlePage || isOmegaProductPage"
          :sections="relatedOmegaBundles"
        />

        <ReviewsBlock
          v-if="productReviews?.items?.length"
          :reviews="productReviews"
          :show-actions="true"
          title="Отзывы"
          @openMedia="onOpenMedia"
          @write="openWriteReview"
          class="mt-10 md:mt-20"
          id="reviews"
        />

        <section v-else id="reviews" class="mt-10 md:mt-20 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
          <h2 class="text-product leading-tight font-medium">Отзывы</h2>
          <p class="mt-3 text-sm md:text-base text-[#6B7280]">Станьте первым, кто оставит отзыв об этом товаре.</p>
          <button
            type="button"
            class="mt-5 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition"
            @click="openWriteReview"
          >
            Написать отзыв
          </button>
        </section>

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
        </UiModal>

        <ClientOnly v-if="!isOmegaBundlePage">
          <ReviewFormModal
            ref="reviewFormRef"
            :show="isWriteReviewOpen"
            title="Написать отзыв"
            :fixed-product="fixedReviewProduct"
            :submitting="isSubmittingReview"
            :error="reviewError"
            @close="closeWriteReview"
            @submit="submitReview"
          />
        </ClientOnly>

        <ProductProductionSection
          v-if="product.productionSection"
          v-bind="product.productionSection"
          class="mt-6 md:mt-12"
        />

        <ClientOnly v-if="!isOmegaBundlePage">
          <RewardSection class="mt-12 md:mt-16 md:mt-12" />
        </ClientOnly>

        <ProductFAQ v-if="shouldShowProductFaq && product.faq?.items?.length" :faq="product.faq" />

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
