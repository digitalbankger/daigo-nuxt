<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useProductStore } from '~/stores/productStore'
import { useAuthStore } from '~/stores/authStore'
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
import ReviewsBlock from '@/components/product/ProductReviews.vue'
import UiModal from '@/components/ui/UiModal.vue'
import DaigoSpecialSections from '@/components/product/special/DaigoSpecialSections.vue'

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
const isWriteReviewSuccess = ref(false)
const isSubmittingReview = ref(false)

const reviewForm = ref({
  author: '',
  rating: 5,
  title: '',
  text: '',
})

const reviewErrors = ref<{ author?: string; text?: string; form?: string }>({})

const authStore = useAuthStore()

const openWriteReview = () => {
  if (!authStore.isAuthenticated || !authStore.userId) {
    authStore.openAuth(route.fullPath)
    return
  }

  isWriteReviewOpen.value = true
  isWriteReviewSuccess.value = false
  reviewErrors.value = {}
}

const closeWriteReview = () => {
  isWriteReviewOpen.value = false
  isWriteReviewSuccess.value = false
  reviewErrors.value = {}
  isSubmittingReview.value = false
  reviewForm.value = { author: '', rating: 5, title: '', text: '' }
}

const submitReview = async () => {
  if (isSubmittingReview.value) return

  const e: typeof reviewErrors.value = {}
  if (!reviewForm.value.author.trim()) e.author = 'Введите имя'
  if (reviewForm.value.text.trim().length < 10) e.text = 'Отзыв слишком короткий (минимум 10 символов)'

  if (!authStore.isAuthenticated || !authStore.userId || !authStore.token) {
    e.form = 'Чтобы оставить отзыв, авторизуйтесь.'
    reviewErrors.value = e
    authStore.openAuth(route.fullPath)
    return
  }

  reviewErrors.value = e
  if (Object.keys(e).length) return

  isSubmittingReview.value = true

  try {
    const slug = String(product.value?.slug || route.params.slug || '')

    await $fetch(`/api/shop/reviews/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: {
        author: reviewForm.value.author.trim(),
        rating: Number(reviewForm.value.rating),
        title: reviewForm.value.title.trim(),
        text: reviewForm.value.text.trim(),
        tags: [],
        media: [],
        daigo_id: authStore.userId,
      },
    })

    isWriteReviewSuccess.value = true
  } catch (err: any) {
    const status = Number(err?.statusCode || err?.response?.status || err?.status || 0)

    if (status === 401 || status === 403) {
      reviewErrors.value = {
        form: 'Сессия авторизации истекла. Авторизуйтесь еще раз, чтобы оставить отзыв.',
      }
      authStore.openAuth(route.fullPath)
      return
    }

    reviewErrors.value = {
      form:
        err?.data?.message ||
        err?.data?.statusMessage ||
        err?.statusMessage ||
        err?.message ||
        'Не удалось отправить отзыв. Попробуйте еще раз.',
    }
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
const productReviews = computed<ProductReviewsData>(() => {
  const value = productReviewsResponse.value
  return value && Array.isArray(value.items) ? value : { items: [] }
})

const isCertificate = computed(() =>
  product.value?.template === 'certificate' ||
  product.value?.type === 'certificate' ||
  product.value?.category === 'certificate'
)



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

        <!-- <DaigoSpecialSections
          :product-id="product?.id"
          :product-slug="product?.slug"
          :enabled-product-ids="[101, 102]"
          :enabled-product-slugs="['metabiotik-daigo', 'metabiotik-daigo-10ml']"
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
        /> -->

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

        <UiModal
          :show="isWriteReviewOpen"
          @close="closeWriteReview"
          :panelClass="'sm:max-w-2xl p-0 overflow-hidden'"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
            <div class="text-lg font-medium">Написать отзыв</div>
            <button class="text-sm text-[#6B7280] hover:text-[#111]" @click="closeWriteReview">Закрыть</button>
          </div>

          <div class="p-5">
            <!-- SUCCESS -->
            <div v-if="isWriteReviewSuccess" class="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div class="text-lg font-semibold mb-2">Отзыв отправлен успешно</div>
              <p class="text-sm text-[#6B7280]">
                Мы опубликуем его после модерации.
              </p>

              <button
                type="button"
                class="mt-5 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition"
                @click="closeWriteReview"
              >
                Понятно
              </button>
            </div>

            <!-- FORM -->
            <form v-else class="space-y-4" @submit.prevent="submitReview">
              <div>
                <label class="block text-sm font-medium mb-1">Ваше имя</label>
                <input
                  v-model="reviewForm.author"
                  type="text"
                  class="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 outline-none focus:border-[#111] transition"
                  placeholder="Например: Татьяна"
                />
                <div v-if="reviewErrors.author" class="mt-1 text-xs text-red-600">
                  {{ reviewErrors.author }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Оценка</label>
                <div class="flex items-center gap-2">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    class="h-10 w-10 rounded-lg border border-[#E5E7EB] grid place-items-center transition"
                    :class="i <= reviewForm.rating ? 'bg-[#FFF7E0] border-[#e3c97b]' : 'bg-white'"
                    @click="reviewForm.rating = i"
                    aria-label="set rating"
                  >
                    <svg
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      :class="i <= reviewForm.rating ? 'text-[#e3c97b]' : 'text-[#E5E7EB]'"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Заголовок (необязательно)</label>
                <input
                  v-model="reviewForm.title"
                  type="text"
                  class="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 outline-none focus:border-[#111] transition"
                  placeholder="Коротко о главном"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">Текст отзыва</label>
                <textarea
                  v-model="reviewForm.text"
                  rows="6"
                  class="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#111] transition resize-none"
                  placeholder="Поделитесь вашим опытом…"
                />
                <div v-if="reviewErrors.text" class="mt-1 text-xs text-red-600">
                  {{ reviewErrors.text }}
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  class="h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111] hover:border-[#111] transition"
                  @click="closeWriteReview"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  :disabled="isSubmittingReview"
                  class="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ isSubmittingReview ? 'Отправляем…' : 'Отправить отзыв' }}
                </button>
              </div>

              <div v-if="reviewErrors.form" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ reviewErrors.form }}
              </div>

              <p class="text-xs text-[#6B7280]">
                Мы опубликуем отзыв после модерации.
              </p>
            </form>
          </div>
        </UiModal>

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
