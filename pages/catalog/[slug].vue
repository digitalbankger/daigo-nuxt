<script setup lang="ts">
definePageMeta({ layout: "main", key: (route) => route.fullPath, hideGlobalBreadcrumbs: true });

import { useProductStore } from "~/stores/productStore";
import { useAuthStore } from "~/stores/authStore";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import ProductHero from "~/components/product/ProductHero.vue";
import BundleProductHero from "~/components/product/bundle/BundleProductHero.vue";
import EvolutionProductHero from "~/components/product/evolution/EvolutionProductHero.vue";
import EvolutionProductSections from "~/components/product/evolution/EvolutionProductSections.vue";
import ProductDescription from "~/components/product/ProductDescription.vue";
import ProductUsageInstructions from "~/components/product/ProductUsageInstructions.vue";
import ProductVideo from "~/components/product/ProductVideo.vue";
import ProductFAQ from "~/components/product/ProductFAQ.vue";
import RewardSection from "~/components/sections/RewardSection.vue";
import Button from "~/components/ui/Button.vue";
import ProductInfoBlock from "~/components/product/ProductInfoBlock.vue";
import ProductProductionSection from "~/components/product/ProductProductionSection.vue";
import ProductStickyCartPopup from "~/components/product/ProductStickyCartPopup.vue";
import CertificateProductPage from "~/components/product/certificate/CertificateProductPage.vue";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useYtm } from "@/composables/useYtm";
import { useAnalytics } from "@/composables/useAnalytics";
import { onMounted, computed, defineAsyncComponent, ref } from "vue";
import ReviewsBlock from "@/components/product/ProductReviews.vue";
import UiModal from "@/components/ui/UiModal.vue";
import ReviewFormModal from "~/components/reviews/ReviewFormModal.vue";
import { createProductReview } from "~/services/reviewService";
import DaigoSpecialSections from "@/components/product/special/DaigoSpecialSections.vue";
import { getOmegaBundlePageContent } from "~/data/omegaBundlePageContent";
import {
  isOmegaBundleSlug,
  OMEGA_BUNDLE_SLUGS,
  type OmegaBundleSlug,
} from "~/constants/omegaBundles";
import type { BundleContentSection } from "~/types/product";
import {
  findEvolutionVariant,
  getEvolutionPackSizeFromSlug,
  isEvolutionProductId,
  isEvolutionProductSlug,
  presentEvolutionProduct,
} from "~/constants/evolution";

const OMEGA_PRODUCT_SLUG = "zhir-pecheni-treski-omega-3";

const relatedOmegaBundles: BundleContentSection[] = [
  {
    type: "related-products",
    products: [
      {
        product_id: "f3972a31-b77c-4bd6-b916-cfdc1f475a04",
        variant_id: "e0108282-cb3a-4949-81a0-25987ec60d99",
        slug: "dvizhenie-mysli",
        title: "Движение мысли. Омега-3 и аминобиотик Brainy",
        image: "/images/omega-bundle/omega-brainy.jpg",
        price: 36500,
      },
      {
        product_id: "999f9a93-f82e-4614-bad8-17f7b4f42a0a",
        variant_id: "f134ec3f-bd83-49a5-b17e-9de116d48822",
        slug: "obnovlenie-kozhi",
        title: "Обновление кожи. Омега-3 и аминобиотик Dermic",
        image: "/images/omega-bundle/omega-dermic.jpg",
        price: 36500,
      },
      {
        product_id: "c8f62db4-e671-4abb-b364-b7027b9ac381",
        variant_id: "54812c3b-69d3-4ee7-b4e6-f42117dffeb3",
        slug: "svoboda-dvizheniya",
        title: "Свобода движения. Омега-3 и аминобиотик Jointic",
        image: "/images/omega-bundle/omega-jointic.jpg",
        price: 36500,
      },
    ].filter((item) =>
      OMEGA_BUNDLE_SLUGS.includes(item.slug as OmegaBundleSlug),
    ),
  },
];

const bundlePageContent = computed(() => {
  const slug = product.value?.slug || String(route.params.slug || "");

  if (!isOmegaBundleSlug(slug)) {
    return null;
  }

  return getOmegaBundlePageContent(slug as OmegaBundleSlug);
});

const BundleProductSections = defineAsyncComponent(
  () => import("~/components/product/bundle/BundleProductSections.vue"),
);

// Отзыв
type ReviewMedia = {
  id: string;
  type: "image" | "video";
  thumb: string;
  src?: string;
};

type ProductReviewItem = {
  id: string;
  author: string;
  rating: number;
  date?: string;
  title?: string;
  text: string;
  source?: string;
  verified?: boolean;
  media?: ReviewMedia[];
  tags?: string[];
  i18n?: {
    ru: { title?: string; text: string };
    en?: { title?: string; text: string };
  };
};

type ProductReviewsData = {
  ratingAvg?: number;
  count?: number;
  source?: string;
  items: ProductReviewItem[];
};

const isWriteReviewOpen = ref(false);
const isSubmittingReview = ref(false);
const reviewError = ref("");
const reviewFormRef = ref<InstanceType<typeof ReviewFormModal> | null>(null);

const authStore = useAuthStore();

const openWriteReview = () => {
  if (!authStore.isAuthenticated || !authStore.userId) {
    authStore.openAuth(route.fullPath);
    return;
  }

  isWriteReviewOpen.value = true;
  reviewError.value = "";
};

const closeWriteReview = () => {
  isWriteReviewOpen.value = false;
  reviewError.value = "";
  isSubmittingReview.value = false;
};

const submitReview = async (payload: any) => {
  if (isSubmittingReview.value) return;

  if (!authStore.isAuthenticated || !authStore.userId) {
    reviewError.value = "Чтобы оставить отзыв, авторизуйтесь.";
    authStore.openAuth(route.fullPath);
    return;
  }

  const slug = String(product.value?.slug || route.params.slug || "").trim();
  if (!slug) {
    reviewError.value = "Не удалось определить товар для отзыва.";
    return;
  }

  isSubmittingReview.value = true;
  reviewError.value = "";

  try {
    const formData =
      payload.formData instanceof FormData ? payload.formData : new FormData();
    formData.set("daigo_id", String(authStore.userId));
    await createProductReview(slug, formData);
    reviewFormRef.value?.markSent();
  } catch (err: any) {
    const status = Number(
      err?.statusCode || err?.response?.status || err?.status || 0,
    );

    if (status === 401 || status === 403) {
      reviewError.value =
        "Сессия авторизации истекла. Авторизуйтесь еще раз, чтобы оставить отзыв.";
      authStore.openAuth(route.fullPath);
      return;
    }

    reviewError.value =
      err?.data?.message ||
      err?.data?.statusMessage ||
      err?.statusMessage ||
      err?.message ||
      "Не удалось отправить отзыв. Попробуйте еще раз.";
  } finally {
    isSubmittingReview.value = false;
  }
};

const isMediaModalOpen = ref(false);
const activeMedia = ref<ReviewMedia | null>(null);

const onOpenMedia = (m: ReviewMedia) => {
  if (m.type === "video") return;
  activeMedia.value = m;
  isMediaModalOpen.value = true;
};

const closeMedia = () => {
  isMediaModalOpen.value = false;
  activeMedia.value = null;
};
// --- Конец логики отзывов ---

const route = useRoute();
const productStore = useProductStore();
await productStore.loadProduct(route.params.slug as string);

if (!productStore.product) {
  const statusCode = productStore.errorStatusCode === 404 ? 404 : 502;
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? "Товар не найден" : "Не удалось загрузить товар",
    fatal: true,
  });
}

const { data: productReviewsResponse } = await useFetch<ProductReviewsData>(
  `/api/shop/reviews/${route.params.slug as string}`,
  {
    key: `product-reviews:${route.params.slug as string}`,
    default: () => ({ items: [] }),
  },
);

const product = computed(() => {
  const value = productStore.product;
  if (!value) return null;

  return isEvolutionProductSlug(route.params.slug)
    ? presentEvolutionProduct(value, route.params.slug)
    : value;
});
const fixedReviewProduct = computed(() =>
  product.value
    ? {
        id: (product.value as any).id || product.value.product_id,
        product_id: product.value.product_id || (product.value as any).id,
        slug: product.value.slug || String(route.params.slug || ""),
        title: product.value.title || (product.value as any).name || "Товар",
        image: (product.value as any).images?.[0]?.image_url,
      }
    : null,
);
const productReviews = computed<ProductReviewsData>(() => {
  const value = productReviewsResponse.value;
  return value && Array.isArray(value.items) ? value : { items: [] };
});

const reviewHref = computed(() =>
  productReviews.value.items.length > 0 ? "#reviews" : "/otzyvy",
);

const activeEvolutionVariantId = computed(() => {
  if (!product.value || !isEvolutionProductSlug(route.params.slug)) return undefined;
  if (isEvolutionProductId(product.value.product_id)) return undefined;

  return findEvolutionVariant(
    product.value.variants,
    getEvolutionPackSizeFromSlug(route.params.slug),
  )?.variant_id;
});

const canUseStickyCart = computed(() => {
  if (!isEvolutionProductSlug(route.params.slug)) return true;

  // В новой модели Evolution 1 банка и 12 банок — отдельные товары.
  // Для sticky-cart достаточно реального product_id и цены; variant_id нужен
  // только как legacy fallback для старой модели одного товара с variants.
  return Boolean(product.value?.product_id && Number(product.value?.price || 0) > 0);
});

const isCertificate = computed(
  () =>
    product.value?.template === "certificate" ||
    product.value?.type === "certificate" ||
    product.value?.category === "certificate",
);

const isOmegaBundlePage = computed(() =>
  isOmegaBundleSlug(product.value?.slug || route.params.slug),
);

const isOmegaProductPage = computed(
  () =>
    String(product.value?.slug || route.params.slug || "") ===
    OMEGA_PRODUCT_SLUG,
);

const isEvolutionProductPage = computed(() => {
  const slug = product.value?.slug || route.params.slug;
  const title = String(product.value?.title || "");
  return isEvolutionProductSlug(slug) || /evolution/i.test(title);
});

const bundleSectionsWithoutRelated = computed(
  () =>
    product.value?.bundleSections?.filter(
      (section) => section.type !== "related-products",
    ) || [],
);

const shouldShowProductFaq = computed(() => {
  if (!product.value) return false;
  if (isOmegaBundlePage.value || isEvolutionProductPage.value) return true;

  const { faq: _faq, ...productWithoutFaq } = product.value as any;
  const rawText = JSON.stringify(productWithoutFaq)
    .toLowerCase()
    .replace(/ё/g, "е");

  const normalizedText = rawText.replace(/[^a-zа-я0-9]+/g, " ");
  const compactText = normalizedText.replace(/\s+/g, "");

  return (
    compactText.includes("daigo5ml") ||
    compactText.includes("daigo5мл") ||
    compactText.includes("дайго5мл") ||
    compactText.includes("daigo10ml") ||
    compactText.includes("daigo10мл") ||
    compactText.includes("дайго10мл") ||
    /(?:daigo|дайго)10.*(?:ml|мл)/.test(compactText) ||
    normalizedText.includes("люкс") ||
    /\blux\b/.test(normalizedText)
  );
});

onMounted(() => {
  if (!import.meta.client) return;
  if (!product.value) return;

  const ytm = useYtm();

  const analytics = useAnalytics();
  analytics.viewItem({
    id: product.value.product_id,
    name: product.value.title,
    price: Number(product.value.price) || 0,
    url: `/catalog/${product.value.slug}`,
    image_url: product.value.images?.[0]?.image_url,
    brand: "Daigo",
  });

  ytm.viewDetail({
    currency: "RUB",
    brand: "Daigo",
    items: [
      {
        id: product.value.product_id,
        name: product.value.title,
        price: Number(product.value.price) || 0,
        image_url: product.value.images?.[0]?.image_url,
      },
    ],
  });
});

const { breadcrumbs, jsonLd } = useBreadcrumbs(product, "/catalog");

const faqJsonLd = computed(() => {
  if (!shouldShowProductFaq.value) return null;

  const faq = product.value?.faq;
  if (!faq?.items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
});

import { normalizeMediaUrl } from "~/utils/mediaUrl";

const SITE_URL = "https://daigo.ru";
const shareImage = computed(() => {
  const fromEffect = product.value?.effect?.image;
  const fallback =
    (product.value as any)?.hero?.image ||
    (product.value as any)?.images?.[0]?.image_url ||
    (product.value as any)?.images?.[0];
  const src = normalizeMediaUrl(fromEffect || fallback);
  if (!src) return null;
  return src.startsWith("http") ? src : `${SITE_URL}${src}`;
});

const productJsonLd = computed(() => {
  const currentProduct = product.value;
  if (!currentProduct) return null;

  const productUrl = `${SITE_URL}/catalog/${currentProduct.slug}`;
  const images = (currentProduct.images || [])
    .map((image) => normalizeMediaUrl(image.image_url))
    .filter(Boolean)
    .map((image) =>
      image!.startsWith("http") ? image! : `${SITE_URL}${image}`,
    );

  const seller = { "@id": `${SITE_URL}/#organization` };
  const variants = currentProduct.variants || [];
  const variantOffers = variants
    .filter((variant) => Number(variant.price || 0) > 0)
    .map((variant) => ({
      "@type": "Offer",
      sku: `${currentProduct.product_id}:${variant.variant_id}`,
      name: variant.label,
      price: Number(variant.price),
      priceCurrency: "RUB",
      availability: currentProduct.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
      seller,
    }));

  const defaultOffer = Number(currentProduct.price || 0) > 0
    ? [{
        "@type": "Offer",
        sku: String(currentProduct.product_id),
        price: Number(currentProduct.price),
        priceCurrency: "RUB",
        availability: currentProduct.isActive
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        url: productUrl,
        seller,
      }]
    : [];

  const offers = variantOffers.length ? variantOffers : defaultOffer;
  const reviewItems = productReviews.value.items || [];
  const calculatedRating = reviewItems.length
    ? reviewItems.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviewItems.length
    : 0;
  const apiRatingValue = Number(productReviews.value.ratingAvg || 0);
  const ratingValue = Number(apiRatingValue || calculatedRating || 0);
  // Если API не дал агрегированный рейтинг, не приписываем вычисленному
  // по загруженной выборке количество отзывов, которых в этой выборке нет.
  const reviewCount = apiRatingValue > 0
    ? Number(productReviews.value.count || reviewItems.length || 0)
    : reviewItems.length;

  const reviewsJsonLd = reviewItems
    .filter((review) => review.author && review.text && Number(review.rating || 0) > 0)
    .slice(0, 10)
    .map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      ...(review.title ? { name: review.title } : {}),
      reviewBody: review.text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(review.rating),
        bestRating: 5,
        worstRating: 1,
      },
    }));

  // Для Google Product snippets один Product должен содержать хотя бы один
  // коммерческий/рейтинговый сигнал: offers, review или aggregateRating.
  // Если цена и отзывы временно не пришли с API, лучше не отдавать невалидный
  // Product JSON-LD, чем создавать критическую ошибку в Search Console.
  const hasAggregateRating = reviewCount > 0 && ratingValue > 0;
  if (!offers.length && !reviewsJsonLd.length && !hasAggregateRating) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    url: productUrl,
    name: currentProduct.title,
    description: currentProduct.shortDescription || currentProduct.title,
    sku: String(currentProduct.product_id),
    brand: {
      "@type": "Brand",
      name: "Daigo",
    },
    ...(currentProduct.category ? { category: currentProduct.category } : {}),
    ...(images.length ? { image: images } : {}),
    ...(offers.length ? { offers } : {}),
    ...(hasAggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(ratingValue.toFixed(2)),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviewsJsonLd.length ? { review: reviewsJsonLd } : {}),
  };
});

useHead(() => {
  const scripts: any[] = [
    { type: "application/ld+json", children: JSON.stringify(jsonLd.value) },
  ];
  if (productJsonLd.value) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(productJsonLd.value),
    });
  }
  if (faqJsonLd.value) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(faqJsonLd.value),
    });
  }

  return {
    title: product.value?.title,
    meta: [
      { name: "description", content: product.value?.shortDescription },
      { property: "og:title", content: product.value?.title },
      { property: "og:description", content: product.value?.shortDescription },
      { property: "og:type", content: "product" },
      {
        property: "og:url",
        content: `https://daigo.ru/catalog/${product.value?.slug}`,
      },
      ...(shareImage.value
        ? [
            { property: "og:image", content: shareImage.value },
            { property: "og:image:secure_url", content: shareImage.value },
            {
              property: "og:image:alt",
              content: product.value?.title || "Daigo",
            },
          ]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(shareImage.value
        ? [{ name: "twitter:image", content: shareImage.value }]
        : []),
      { name: "twitter:title", content: product.value?.title },
      { name: "twitter:description", content: product.value?.shortDescription },
    ],
    link: [
      {
        rel: "canonical",
        href: `https://daigo.ru/catalog/${product.value?.slug}`,
      },
      ...(shareImage.value
        ? [{ rel: "image_src", href: shareImage.value }]
        : []),
    ],
    script: scripts,
  };
});
</script>

<template>
  <BaseContainer>
    <div v-if="product">
      <nav
        aria-label="Хлебные крошки"
        class="mb-2 md:mb-4 text-sm md:text-base text-black/50"
      >
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

      <!-- Если сертификат — рисуем спец. страницу -->
      <CertificateProductPage v-if="isCertificate" :product="product" />

      <!-- Иначе — стандартная карточка товара -->
      <template v-else>
        <EvolutionProductHero
          v-if="isEvolutionProductPage"
          :product="product"
          :review-href="reviewHref"
        />
        <BundleProductHero
          v-else-if="isOmegaBundlePage && bundlePageContent"
          :product="product"
          :name="bundlePageContent.name"
          :review-href="reviewHref"
        />
        <ProductHero v-else :product="product" :review-href="reviewHref" />

        <ClientOnly v-if="!isOmegaBundlePage && canUseStickyCart">
          <ProductStickyCartPopup
            :product="product"
            :variant-id="activeEvolutionVariantId"
            observe-target="#product-cta"
          />
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

        <EvolutionProductSections
          v-if="isEvolutionProductPage"
          :pack-size="getEvolutionPackSizeFromSlug(route.params.slug)"
        />

        <BundleProductSections
          v-else-if="isOmegaBundlePage && bundleSectionsWithoutRelated.length"
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

        <section
          v-else
          id="reviews"
          class="mt-10 md:mt-20 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7"
        >
          <h2 class="text-product leading-tight font-medium">Отзывы</h2>
          <p class="mt-3 text-sm md:text-base text-[#6B7280]">
            Станьте первым, кто оставит отзыв об этом товаре.
          </p>
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
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]"
          >
            <div class="text-sm font-semibold text-[#111]">Отзыв</div>
            <button
              class="text-sm text-[#6B7280] hover:text-[#111]"
              @click="closeMedia"
            >
              Закрыть
            </button>
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

        <ProductFAQ
          v-if="shouldShowProductFaq && product.faq?.items?.length"
          :faq="product.faq"
        />

        <section
          class="relative overflow-hidden w-full flex items-center justify-center rounded-2xl lg:min-h-[380px] bg-primary bg-no-repeat px-4 md:px-6 lg:px-10 py-4 md:py-8 text-white mt-16"
        >
          <img
            src="/images/product/prod-right-gold.png"
            alt=""
            class="hidden lg:block absolute z-0 right-0 h-full"
          />
          <img
            src="/images/product/prod-left-gold.png"
            alt=""
            class="hidden lg:block absolute z-0 left-0 h-full"
          />
          <img
            src="/images/product/prod-right-gold.png"
            alt=""
            class="block lg:hidden absolute z-0 right-0 h-full"
          />
          <img
            src="/images/product/prod-left-gold.png"
            alt=""
            class="block lg:hidden absolute z-0 left-0 h-full"
          />
          <div
            class="relative z-10 md:w-full flex flex-col gap-2 md:gap-4 items-start justify-center my-auto"
          >
            <h2
              class="font-medium leading-tight text-sm md:text-3xl lg:text-[40px]"
            >
              Как выбрать<span
                class="ms-1 rounded-md px-3 py-1 text-black bg-[#9aff9f]"
                >правильный товар?</span
              >
            </h2>
            <p
              class="text-[10px] md:text-2xl leading-tight font-light md:max-w-[60%] mb-1"
            >
              Чтобы подробнее узнать о товарах от Дайго, рекомендуем
              ознакомиться со статьями на нашем сайте
            </p>
            <Button
              tp="/articles"
              variant="outline"
              class="!text-white !border-white hover:!text-black !bg-white hover:bg-white !text-xs md:!text-lg !px-2 h-8 md:h-12 w-40 md:w-60"
            >
              Перейти к статьям
            </Button>
          </div>
        </section>
      </template>
    </div>
  </BaseContainer>
</template>
