<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, defineAsyncComponent } from "vue";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import YouWillLearn from "~/components/articles/YouWillLearn.vue";
import Button from "~/components/ui/Button.vue";
import AccordionItem from "~/components/ui/AccordionItem.vue";
import PopularArticles from "~/components/articles/PopularArticles.vue";
import ProductsCarousel from "~/components/articles/ProductsCarousel.vue";
import OmegaSystemArticle from "~/components/articles/omega/OmegaSystemArticle.vue";
import LongevityArticle from "~/components/articles/longevity/LongevityArticle.vue";

import { useArticlesStore } from "~/stores/articlesStore";
import type { ArticleDetail } from "~/types/articles";

// берём товары по ids — как в отзывах
import { useProductsByIds } from "~/composables/useProductsByIds";
import { normalizeMediaUrl } from "~/utils/mediaUrl";
import { getArticleSeoDescription } from "~/utils/articleSeo";

const props = defineProps<{ slug: string }>();
const slug = computed(() => props.slug);
const isSummerArticle = computed(
  () => slug.value === "leto-eto-ne-tolko-otdyh",
);
const isOmegaArticle = computed(
  () => article.value?.layout === "omega3-system",
);
const isLongevityArticle = computed(
  () => article.value?.layout === "longevity",
);

const articles = useArticlesStore();
const { loading, errors } = storeToRefs(articles);

const ClientFAQ = defineAsyncComponent(
  () => import("~/components/FAQ/ClientFAQ.vue"),
);
const ClientComments = defineAsyncComponent(
  () => import("~/components/Comments/ClientComments.vue"),
);

// ===== SSR: статья =====
const { data: article, error } = await useAsyncData<ArticleDetail>(
  `article:${slug.value}`,
  async () => {
    return await articles.fetchArticle(slug.value);
  },
);

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "Статья не найдена" });
}

// ===== SEO =====
const title = article.value?.title ?? "Статья";
const description = getArticleSeoDescription(article.value);
const cover = normalizeMediaUrl(
  article.value?.cover || article.value?.image || "/og-default.jpg",
);
const canonical = `https://daigo.ru/articles/${slug.value}`;
const metaImage = cover.startsWith("http") ? cover : `https://daigo.ru${cover}`;

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogType: "article",
  ogUrl: canonical,
  ogImage: metaImage,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
});
useHead({ link: [{ rel: "canonical", href: canonical }] });

// schema.org Article + Breadcrumbs (JSON-LD)
const breadcrumbs = (article.value?.breadcrumbs || []).map((b, idx) => ({
  "@type": "ListItem",
  position: idx + 1,
  name: b.label,
  item: `https://daigo.ru${b.to}`,
}));
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  image: [metaImage],
  datePublished: article.value?.date,
  mainEntityOfPage: canonical,
  author: article.value?.author?.name
    ? { "@type": "Person", name: article.value.author.name }
    : { "@type": "Organization", name: "Daigo" },
  publisher: {
    "@type": "Organization",
    name: "Daigo",
    url: "https://daigo.ru",
  },
  description,
};
useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs,
      }),
    },
    { type: "application/ld+json", children: JSON.stringify(articleJsonLd) },
  ],
});

// ===== “Покупают вместе” по ids – как в отзывах =====
const articleProductIds = computed<(string | number)[]>(() => {
  const fromIds = (article.value?.productsIds || []).filter(Boolean);
  if (fromIds.length) return fromIds;
  const fromProducts = (article.value?.products || [])
    .map((p) => (p as any)?.product_id)
    .filter(Boolean);
  return fromProducts;
});
const { items: bundledByIds } = useProductsByIds(articleProductIds); // items – массив ProductCard
const bundledFallback = computed(() => article.value?.products || []);

// ===== Рекомендуемые товары – вход для общей карусели =====
const productIds = computed<(string | number)[]>(
  () =>
    article.value?.productsIds ??
    article.value?.products?.map((p) => p.product_id) ??
    [],
);

const productsFallback = computed(() =>
  (article.value?.products || []).map((p) => ({
    product_id: (p as any).product_id || (p as any).id,
    slug:
      (p as any).slug ||
      String((p as any).url || "").replace(/^\/catalog\//, ""),
    name: (p as any).title || (p as any).name,
    subtitle: (p as any).subtitle || "",
    image: (p as any).image,
    price: (p as any).price,
    tag: (p as any).badge || (p as any).tag || undefined,
  })),
);

const productCarouselTitle = computed(() =>
  isSummerArticle.value ? "Возьмите в отпуск" : "Рекомендуемые товары",
);

// ===== утилиты/вью =====
const goToComments = () => {
  const el = document.getElementById("comments");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const socialIcon = (type?: string) => {
  switch (type) {
    case "tg":
      return "/icons/social/telegram.svg";
    case "vk":
      return "/icons/social/vk.svg";
    default:
      return "/icons/social/dzen.svg";
  }
};

const shareUrl = computed(() => encodeURIComponent(canonical));
const shareTitle = computed(() => encodeURIComponent(title));
const shareLinks = computed(() => ({
  whatsapp: `https://wa.me/?text=${shareTitle.value}%20${shareUrl.value}`,
  telegram: `https://t.me/share/url?url=${shareUrl.value}&text=${shareTitle.value}`,
  viber: `viber://forward?text=${shareTitle.value}%20${shareUrl.value}`,
  vk: `https://vk.com/share.php?url=${shareUrl.value}&title=${shareTitle.value}`,
  ok: `https://connect.ok.ru/offer?url=${shareUrl.value}&title=${shareTitle.value}`,
}));
const shareNative = async () => {
  const data = { title, text: description, url: canonical };
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch {}
  }
};

function formatArticleDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);
}

const topFive = [
  {
    id: 1,
    slug: "po-polochkam-printsip-deystviya-daigo",
    title: "Принцип действия Daigo",
    image: "/images/articles/one.jpg",
    date: "2025-07-15",
    time: 8,
  },
  {
    id: 4,
    slug: "na-chto-vliyaet-mikroflora-kishechnika",
    title: "На что влияет микрофлора кищечника",
    image: "/images/articles/one.jpg",
    date: "2025-07-15",
    time: 8,
  },
  {
    id: 5,
    slug: "daigo-lux-evolyutsiya-metabiotika-s-vekovoy-istoriey",
    title: "Daigo Lux: Эволюция метабиотика с вековой историей",
    image: "/images/articles/one.jpg",
    date: "2025-07-15",
    time: 8,
  },
  {
    id: 3,
    slug: "sindrom-puteshestvennika",
    title: "Синдром путешественника",
    image: "/images/articles/th.jpg",
    date: "2025-05-31",
    time: 6,
  },
  {
    id: 2,
    slug: "podgotovka-kozhi-k-plyazhnomu-sezonu",
    title: "Как подготовить кожу к пляжному сезону?",
    image: "/images/articles/sec.jpg",
    date: "2025-06-24",
    time: 10,
  },
];
function toUrl(a: { slug: string }) {
  return `/articles/${a.slug}`;
}
const list = topFive.map((i) => ({
  id: i.id,
  slug: i.slug,
  title: i.title,
  date: i.date,
  time: i.time,
}));

const downloadAllFiles = () => {
  const files = article.value?.materials?.files || [];
  if (!files.length) return;
  files.forEach((file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

function formatPriceRUB(val: number | string | undefined) {
  const n = Number(val || 0);
  return n.toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}

const defaultFaqItems = [
  {
    q: "Что такое коэнзим Q10?",
    a: "Это антиоксидант, участвующий в выработке энергии в клетках. Поддерживает сердечно-сосудистую систему.",
  },
  {
    q: "Чем полезен Tamotsu?",
    a: "Улучшает память, когнитивные функции и поддерживает работу мозга.",
  },
  {
    q: "Как хранить Tamotsu?",
    a: "В сухом месте, при температуре до 25°C, вдали от света.",
  },
  {
    q: "Какая польза от Tamotsu для мозга?",
    a: "Защищает нейроны, улучшает связь между клетками, снижает возрастные изменения.",
  },
  {
    q: "Где производят Tamotsu?",
    a: "В Японии, Хоккайдо, по стандарту GMP.",
  },
];

const visibleFaqItems = computed(() => {
  const faq = article.value?.faq || [];
  return faq.length ? faq : defaultFaqItems;
});

function splitSummerArticleContentTop(html?: string) {
  const source = html || "";

  if (!source) {
    return { intro: "", wide: "" };
  }

  const introMatch = source.match(
    /^\s*(<div\s+class=["']article-summer-intro["'][\s\S]*?<\/div>)\s*/i,
  );

  if (!introMatch) {
    return { intro: "", wide: source };
  }

  return {
    intro: introMatch[1],
    wide: source.slice(introMatch[0].length).trim(),
  };
}

const summerTopParts = computed(() =>
  splitSummerArticleContentTop(article.value?.contentTop),
);
const summerIntroHtml = computed(() =>
  isSummerArticle.value ? summerTopParts.value.intro : "",
);
const summerWideHtml = computed(() =>
  isSummerArticle.value ? summerTopParts.value.wide : "",
);
</script>

<template>
  <BaseContainer>
    <div class="container mx-auto py-2 lg:py-4">
      <!-- breadcrumbs -->
      <nav
        aria-label="Хлебные крошки"
        class="mb-4 text-sm md:text-base text-black/50"
      >
        <ul class="flex flex-wrap items-center gap-1">
          <li
            v-for="(bc, i) in article?.breadcrumbs"
            :key="bc.to"
            class="flex items-center gap-2"
          >
            <NuxtLink
              :to="bc.to"
              class="hover:text-black underline-offset-4 hover:underline"
              >{{ bc.label }}</NuxtLink
            >
            <span v-if="i < (article?.breadcrumbs?.length || 0) - 1">/</span>
          </li>
        </ul>
      </nav>

      <!-- title + meta -->
      <h1 class="text-3xl md:text-head font-medium leading-tight">
        {{ article?.title }}
      </h1>

      <OmegaSystemArticle
        v-if="isOmegaArticle && article"
        :article="article"
        :slug="slug"
        class="mt-6 md:mt-8"
      />

      <LongevityArticle
        v-else-if="isLongevityArticle && article"
        :article="article"
        :slug="slug"
        class="mt-6 md:mt-8"
      />

      <template v-else>
        <p
          v-if="isSummerArticle && article?.preview"
          class="mt-4 text-base md:text-2xl font-medium leading-snug"
        >
          {{ article.preview }}
        </p>

        <div
          v-if="isSummerArticle"
          class="mt-4 flex flex-wrap items-center gap-3 text-sm text-black/70"
        >
          <span class="inline-flex items-center gap-1.5">
            <svg
              class="h-4 w-4 text-[#4F8EF7]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            {{ formatArticleDate(article?.date) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <svg
              class="h-4 w-4 text-[#4F8EF7]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ article?.time }} мин
          </span>
          <span class="inline-flex items-center gap-1.5">
            <svg
              class="h-4 w-4 text-[#4F8EF7]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
            </svg>
            {{ article?.views }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <svg
              class="h-4 w-4 text-[#4F8EF7]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 5h14v10H8l-3 3V5Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            {{ article?.comments }}
          </span>
        </div>

        <div
          class="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10"
        >
          <!-- main -->
          <main class="lg:col-span-8 space-y-8">
            <!-- cover -->
            <div>
              <img
                :src="article?.cover || article?.image"
                :alt="article?.title || ''"
                format="webp"
                quality="80"
                loading="lazy"
                decoding="async"
                class="w-full rounded-2xl object-cover"
              />
            </div>

            <p
              v-if="!isSummerArticle"
              class="xs-max:text-base text-base sm:text-lg font-medium mt-10 sm:mt-16 border-y py-4 w-full"
            >
              БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ
            </p>

            <!-- actions -->
            <div class="mt-4 flex gap-8">
              <div
                class="text-sm md:text-2xl flex flex-row items-center gap-2 cursor-pointer"
                @click="goToComments"
              >
                <img src="/icons/publications/comment.svg" class="w-5" />
                <span aria-label="Комментарии">Комментарии</span>
              </div>
              <div
                class="text-sm md:text-2xl flex flex-row items-center gap-2 cursor-pointer"
                @click="shareNative"
              >
                <img src="/icons/publications/share.svg" class="w-5" />
                <span class="text-[#FF64E7]" aria-label="Поделиться"
                  >Поделиться</span
                >
              </div>
            </div>

            <!-- теги mobile -->
            <div v-if="article?.tags?.length" class="block md:hidden">
              <h3 class="text-xl md:text-cardhead font-medium">Теги</h3>
              <div class="mt-3 flex flex-wrap gap-2 md:gap-3">
                <NuxtLink
                  v-for="tag in article!.tags!"
                  :key="tag.id"
                  :to="`/articles?napravlennost=${tag.slug}`"
                  class="px-2 md:px-3 py-2 rounded-lg bg-hoverbtn hover:bg-gray-100 text-sm md:text-base"
                >
                  {{ tag.label }}
                </NuxtLink>
              </div>
            </div>

            <YouWillLearn
              v-if="!isSummerArticle"
              :key="slug"
              :container-ids="['article-top', 'article-bottom']"
              class="py-0 md:py-6"
            />

            <!-- content top -->
            <section
              v-if="article?.contentTop && !isSummerArticle"
              id="article-top"
              class="prose max-w-none prose-img:rounded-xl"
            >
              <div class="flex flex-col gap-10" v-html="article?.contentTop" />
            </section>

            <!-- Первый текстовый блок летней статьи остаётся рядом с сайдбаром -->
            <section
              v-if="isSummerArticle && summerIntroHtml"
              id="article-top"
              class="prose max-w-none prose-img:rounded-xl article-summer-content"
            >
              <div class="article-summer-body" v-html="summerIntroHtml" />
            </section>

            <!-- Полезные материалы -->
            <!-- <section v-if="article?.materials" class="mt-12 border-y border-black/10 py-6 md:py-8">
            <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              <div class="w-full md:w-8/12">
                <h2 class="text-xl md:text-product leading-tight font-medium">
                  {{ article!.materials!.title }}
                </h2>

                <div
                  v-if="article!.materials!.text"
                  class="text-sm md:text-xl mt-3 text-black"
                  v-html="article!.materials!.text"
                />
                <ul class="mt-5 space-y-3">
                  <li v-for="file in article!.materials!.files" :key="file.id" class="flex items-start gap-4">
                    <img src="/icons/file.svg" class="w-5 h-5 flex-shrink-0" />
                    <div class="min-w-0">
                      <p class="text-base md:text-xl text-black">
                        {{ file.title }}
                      </p>
                    </div>
                  </li>
                </ul>

                <Button
                  variant="solid"
                  v-if="article!.materials!.files?.length"
                  class="mt-6 w-full md:!w-60 hidden md:flex"
                  @click="downloadAllFiles"
                >
                  Скачать все материалы
                </Button>
              </div>

              <div v-if="article!.materials!.specialist" class="w-full md:w-4/12 flex md:justify-end">
                <div class="w-full md:w-auto flex flex-row md:flex-col items-start gap-3 md:gap-5">
                  <img
                    :src="article!.materials!.specialist!.avatarUrl"
                    alt=""
                    width="96"
                    height="96"
                    class="h-24 md:h-32 w-24 md:w-32 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="min-w-0">
                    <p class="text-xs md:text-base text-black/50"> {{ article!.materials!.specialist!.position }} </p>
                    <p class="mt-1 text-sm md:text-xl font-medium"> {{ article!.materials!.specialist!.name }} </p>
                    <p v-if="article!.materials!.specialist!.description" class="my-2 text-sm hidden md:block">
                      {{ article!.materials!.specialist!.description }}
                    </p>

                    <div v-if="article!.materials!.specialist!.social?.length" class="mt-3 md:mt-6 flex items-center gap-4">
                      <NuxtLink
                        v-for="s in article!.materials!.specialist!.social"
                        :key="s.url"
                        :to="s.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10 transition"
                        :aria-label="s.type"
                      >
                        <img :src="socialIcon(s.type)" :alt="s.type" class="h-8 w-8" />
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="article!.materials!.specialist!.description" class="m-0 text-sm block md:hidden">
                {{ article!.materials!.specialist!.description }}
              </p>

              <Button
                variant="solid"
                v-if="article!.materials!.files?.length"
                class="mt-0 w-full md:!w-60 flex md:hidden"
                @click="downloadAllFiles"
              >
                Скачать все материалы
              </Button>
            </div>
          </section> -->

            <!-- content bottom -->
            <section
              v-if="article?.contentBottom && !isSummerArticle"
              class="prose max-w-none mt-12 prose-img:rounded-xl"
              id="article-bottom"
            >
              <div v-html="article?.contentBottom" />
            </section>

            <p
              v-if="!isSummerArticle"
              class="xs-max:text-base text-base sm:text-lg font-medium mt-10 sm:mt-16 border-y py-4 w-full"
            >
              Данная публикация носит информационный характер. Указанные эффекты
              основаны на данных исследований, но не являются утверждением о
              лечении заболеваний. Биологически активные добавки не являются
              лекарственными средствами.
            </p>

            <!-- Топ 5 -->
            <section v-if="!isSummerArticle" class="mt-12 py-0 md:py-6">
              <h2 class="text-xl md:text-product font-medium">
                Топ 5 популярных статей
              </h2>
              <div class="mt-0 md:mt-4 gap-6">
                <ul
                  class="mt-4 md:mt-8 space-y-2 md:space-y-4 list-disc pl-4 md:pl-6"
                >
                  <li
                    v-for="i in list"
                    :key="i.id"
                    class="marker:text-primary marker:font-semibold md:marker:text-2xl"
                  >
                    <NuxtLink
                      :to="toUrl(i)"
                      class="text-sm md:text-2xl text-primary hover:border-b hover:border-primary transition-colors duration-300"
                    >
                      {{ i.title }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </section>

            <!-- FAQ -->
            <section
              v-if="visibleFaqItems.length && !isSummerArticle"
              class="mt-16 flex flex-col gap-6"
            >
              <h2 class="text-xl md:text-product font-medium">
                Часто задаваемые вопросы
              </h2>
              <div class="w-full flex flex-col">
                <AccordionItem
                  v-for="faqItem in visibleFaqItems"
                  :key="faqItem.q"
                  :title="faqItem.q"
                >
                  {{ faqItem.a }}
                </AccordionItem>
              </div>
            </section>

            <!-- Понравилась статья? -->
            <section v-if="!isSummerArticle" class="md:w-5/12 mt-12 py-5">
              <hr class="border-black/10 mb-6 w-5/6" />
              <h2 class="text-xl md:text-cardhead font-medium !leading-tight">
                Понравилась статья?
              </h2>
              <p class="mt-2 text-sm text-lg">
                Поделитесь статьёй с друзьями в социальных сетях
              </p>

              <div class="mt-4 flex items-center gap-4">
                <a
                  :href="shareLinks.whatsapp"
                  target="_blank"
                  rel="noopener"
                  aria-label="Поделиться в WhatsApp"
                  class="inline-flex"
                >
                  <img
                    src="/icons/social/whatsapp.svg"
                    alt=""
                    class="w-7 h-7"
                  />
                </a>
                <a
                  :href="shareLinks.telegram"
                  target="_blank"
                  rel="noopener"
                  aria-label="Поделиться в Telegram"
                  class="inline-flex"
                >
                  <img
                    src="/icons/social/telegram.svg"
                    alt=""
                    class="w-7 h-7"
                  />
                </a>
                <a
                  :href="shareLinks.viber"
                  aria-label="Поделиться в Viber"
                  class="inline-flex"
                >
                  <img src="/icons/social/viber.svg" alt="" class="w-7 h-7" />
                </a>
                <a
                  :href="shareLinks.vk"
                  target="_blank"
                  rel="noopener"
                  aria-label="Поделиться во ВКонтакте"
                  class="inline-flex"
                >
                  <img src="/icons/social/vk.svg" alt="" class="w-7 h-7" />
                </a>
                <a
                  :href="shareLinks.ok"
                  target="_blank"
                  rel="noopener"
                  aria-label="Поделиться в Одноклассниках"
                  class="inline-flex"
                >
                  <img src="/icons/social/ok.svg" alt="" class="w-7 h-7" />
                </a>

                <button
                  type="button"
                  class="sr-only"
                  @click="shareNative"
                  aria-label="Поделиться"
                />
              </div>
            </section>

            <!-- Комментарии -->
            <!-- <section v-if="!isSummerArticle" id="comments" class="mt-12">
              <ClientComments :slug="slug" :can-post="false" />
            </section> -->
          </main>

          <!-- sidebar -->
          <aside class="lg:col-span-4">
            <!-- теги -->
            <div v-if="article?.tags?.length" class="hidden md:block">
              <h3 class="text-cardhead font-medium">Теги</h3>
              <div class="mt-3 flex flex-wrap gap-3">
                <NuxtLink
                  v-for="tag in article!.tags!"
                  :key="tag.id"
                  :to="`/articles?napravlennost=${tag.slug}`"
                  class="px-3 py-2 rounded-lg bg-hoverbtn hover:bg-gray-100 text-base"
                >
                  {{ tag.label }}
                </NuxtLink>
              </div>
            </div>

            <!-- Рекомендации по статьям (сайдбар) -->
            <div
              v-if="article?.recommended?.length"
              class="mt-12 hidden sm:block"
            >
              <h3 class="text-cardhead font-medium">Рекомендации для вас</h3>
              <ul class="mt-5 space-y-4">
                <li
                  v-for="it in article.recommended"
                  :key="it.id"
                  class="flex gap-4"
                >
                  <div class="w-4/12">
                    <img
                      :src="it.image"
                      :alt="it.title"
                      class="w-full h-[100px] rounded-xl object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div class="w-8/12">
                    <NuxtLink :to="`/articles/${it.slug}`" class="text-xl">{{
                      it.title
                    }}</NuxtLink>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Покупают вместе -->
            <div
              v-if="
                !isSummerArticle &&
                ((bundledByIds && bundledByIds.length) ||
                  (bundledFallback && bundledFallback.length))
              "
              class="mt-12 hidden sm:block"
            >
              <h3 class="text-cardhead font-medium">Покупают вместе</h3>

              <!-- Вариант А: реальные карточки каталога по productIds -->
              <ul v-if="bundledByIds.length" class="mt-3 space-y-4">
                <li
                  v-for="p in bundledByIds"
                  :key="p.product_id || p.id"
                  class="flex gap-3 items-center"
                >
                  <img
                    :src="p.image"
                    :alt="p.name"
                    class="h-24 w-24 rounded-lg object-cover bg-hoverbtn"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="min-w-0 flex-1">
                    <NuxtLink
                      :to="`/catalog/${p.slug}`"
                      class="text-xl hover:underline truncate block"
                      >{{ p.name }}</NuxtLink
                    >
                    <p class="text-sm text-gray-500">
                      {{ formatPriceRUB(p.price) }}
                    </p>
                  </div>
                </li>
              </ul>

              <!-- Вариант Б (фолбэк): то, что лежит прямо в статье -->
              <ul v-else class="mt-3 space-y-4">
                <li
                  v-for="p in bundledFallback"
                  :key="p.url"
                  class="flex gap-3 items-center"
                >
                  <img
                    :src="p.image"
                    :alt="p.title"
                    class="h-16 w-16 rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="min-w-0 flex-1">
                    <NuxtLink
                      :to="p.url"
                      class="font-medium hover:underline truncate block"
                      >{{ p.title }}</NuxtLink
                    >
                    <p class="text-sm text-gray-500">
                      {{ formatPriceRUB(p.price) }}
                    </p>
                  </div>
                  <NuxtLink :to="p.url" class="btn btn-sm btn-primary"
                    >Купить</NuxtLink
                  >
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <!-- Основной контент летней статьи после первого текстового блока идёт на всю ширину контейнера -->
        <section
          v-if="isSummerArticle && summerWideHtml"
          class="article-summer-wide prose max-w-none prose-img:rounded-xl article-summer-content mt-8 md:mt-12"
        >
          <div class="article-summer-body" v-html="summerWideHtml" />
        </section>

        <section
          v-if="isSummerArticle && article?.contentBottom"
          class="prose max-w-none mt-12 prose-img:rounded-xl"
          id="article-bottom"
        >
          <div v-html="article?.contentBottom" />
        </section>

        <section
          v-if="isSummerArticle && visibleFaqItems.length"
          class="mt-16 flex flex-col gap-6"
        >
          <h2 class="text-xl md:text-product font-medium">
            Часто задаваемые вопросы
          </h2>
          <div class="w-full flex flex-col">
            <AccordionItem
              v-for="faqItem in visibleFaqItems"
              :key="faqItem.q"
              :title="faqItem.q"
            >
              {{ faqItem.a }}
            </AccordionItem>
          </div>
        </section>

        <section v-if="isSummerArticle" class="article-summer-share mt-12 py-5">
          <hr class="border-black/10 mb-6 max-w-xl" />
          <h2 class="text-xl md:text-cardhead font-medium !leading-tight">
            Понравилась статья?
          </h2>
          <p class="mt-2 text-sm md:text-lg">
            Поделитесь статьёй с друзьями в социальных сетях
          </p>

          <div class="mt-4 flex items-center gap-4">
            <a
              :href="shareLinks.whatsapp"
              target="_blank"
              rel="noopener"
              aria-label="Поделиться в WhatsApp"
              class="inline-flex"
            >
              <img src="/icons/social/whatsapp.svg" alt="" class="w-7 h-7" />
            </a>
            <a
              :href="shareLinks.telegram"
              target="_blank"
              rel="noopener"
              aria-label="Поделиться в Telegram"
              class="inline-flex"
            >
              <img src="/icons/social/telegram.svg" alt="" class="w-7 h-7" />
            </a>
            <a
              :href="shareLinks.viber"
              aria-label="Поделиться в Viber"
              class="inline-flex"
            >
              <img src="/icons/social/viber.svg" alt="" class="w-7 h-7" />
            </a>
            <a
              :href="shareLinks.vk"
              target="_blank"
              rel="noopener"
              aria-label="Поделиться во ВКонтакте"
              class="inline-flex"
            >
              <img src="/icons/social/vk.svg" alt="" class="w-7 h-7" />
            </a>
            <a
              :href="shareLinks.ok"
              target="_blank"
              rel="noopener"
              aria-label="Поделиться в Одноклассниках"
              class="inline-flex"
            >
              <img src="/icons/social/ok.svg" alt="" class="w-7 h-7" />
            </a>

            <button
              type="button"
              class="sr-only"
              @click="shareNative"
              aria-label="Поделиться"
            />
          </div>
        </section>

        <!-- РЕКОМЕНДУЕМЫЕ ТОВАРЫ — КАРУСЕЛЬ (перед «Популярные статьи») -->
        <ProductsCarousel
          :product-ids="productIds"
          :fallback="productsFallback"
          :title="productCarouselTitle"
        />

        <!-- Популярные статьи -->
        <section class="w-full flex flex-col gap-6 py-2 md:py-5 mt-6 md:mt-12">
          <h2 class="text-product leading-tight font-medium">
            Популярные статьи
          </h2>
          <PopularArticles />
        </section>
      </template>

      <!-- скелетоны / ошибки -->
      <div
        v-if="loading[`detail:${slug}`]"
        class="mt-10 animate-pulse text-gray-400"
      >
        Загрузка…
      </div>
      <div v-if="errors[`detail:${slug}`]" class="mt-10 text-red-600">
        Ошибка: {{ errors[`detail:${slug}`] }}
      </div>
    </div>
  </BaseContainer>
</template>

<style scoped>
.btn {
  @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition;
}
.btn-primary {
  @apply bg-black text-white hover:bg-gray-800;
}
.btn-outline {
  @apply border border-gray-300 hover:bg-gray-100;
}
.btn-sm {
  @apply px-3 py-1.5 text-xs;
}
</style>

<style>
.wysiwyg {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-summer-body {
  display: flex;
  flex-direction: column;
  gap: 46px;
}

.article-summer-content.prose {
  color: #111;
}

.article-summer-content.prose :where(h2) {
  margin: 0;
  color: #111;
  font-size: clamp(28px, 3vw, 44px);
  font-weight: 600;
  line-height: 1.08;
  font-family: "TG Haido Grotesk", "ui-sans-serif", "system-ui";
  margin-bottom: 20px;
}

.article-summer-content.prose :where(h3) {
  margin: 0;
  color: #111;
  font-size: clamp(22px, 2.8vw, 46px);
  font-weight: 600;
  line-height: 1.12;
  border-bottom: 1px solid #00000026;
  padding-bottom: 12px;
  width: fit-content;
}

.article-summer-content.prose :where(p) {
  margin: 0;
  color: #111;
  font-size: 18px;
  line-height: 1.45;
}

.article-summer-content.prose :where(ul) {
  margin: 16px 0 0;
  padding-left: 22px;
  list-style-type: disc;
}

.article-summer-content.prose :where(li) {
  margin: 12px 0;
  font-size: 16px;
  line-height: 1.45;
}

.article-summer-intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-summer-intro h2 {
  max-width: 760px;
}

.article-summer-intro h3 {
  font-size: clamp(22px, 2.1vw, 32px) !important;
  margin-bottom: 10px !important;
  font-family: Golos;
  font-weight: 500 !important;
  border: none !important;
}

.article-summer-cases {
  display: flex;
  flex-direction: column;
  gap: 43px;
}

.article-summer-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
  align-items: start;
}

.article-summer-pair > .article-summer-card:nth-of-type(1) {
  grid-column: 1;
  grid-row: 1;
}

.article-summer-pair > .article-summer-card:nth-of-type(2) {
  grid-column: 2;
  grid-row: 1;
}

.article-summer-pair > .article-summer-note:nth-of-type(1) {
  grid-column: 1;
  grid-row: 2;
}

.article-summer-pair > .article-summer-note:nth-of-type(2) {
  grid-column: 2;
  grid-row: 2;
}

.article-summer-card {
  min-width: 0;
  padding: 30px;
  border: none;
  border-radius: 22px;
  background: #f7f7f7;
  box-shadow: 0px 4px 10px 0px #00000040;
  overflow: hidden;
  position: relative;
}
.article-summer-pair:nth-child(2) .article-summer-card:nth-of-type(1) img {
  float: right;
  width: 290px;
  height: auto;
  max-height: 280px;
  object-fit: contain;
  margin: 10px -10px 0 18px !important;
}

.article-summer-pair:nth-child(3) .article-summer-card:nth-of-type(1) img {
  width: 240px;
  height: auto;
  max-height: 240px;
  object-fit: contain;
  margin: 8px -4px 0 18px !important;
}
.article-summer-pair:nth-of-type(2) > .article-summer-note:nth-of-type(2) {
  margin-top: -90px;
}
.article-summer-pair:nth-of-type(3) > .article-summer-card:nth-of-type(2) {
  margin-top: -90px;
}
.article-summer-note div {
  position: relative;
}

.article-summer-note img {
  position: absolute;
  right: 60px;
  top: 10px;
  margin: 0 !important;
  width: 50px;
}

.article-summer-card::after {
  content: "";
  display: block;
  clear: both;
}

.article-summer-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px !important;
  font-family: "TG Haido Grotesk", "ui-sans-serif", "system-ui" !important;
}

.article-summer-card h3::before {
  content: "";
  flex: 0 0 auto;
  flex-shrink: 0;
  width: 68px;
  height: 68px;
  background: url("/images/feb/article/c1.png") center / contain no-repeat;
  rotate: 275deg;
}

.article-summer-card img {
  float: right;
  width: min(42%, 214px);
  object-fit: contain;
  height: 100%;
}
.article-summer-card:nth-of-type(1) img {
  float: right;
  width: min(42%, 230px);
  object-fit: contain;
  height: 100%;
}
.article-summer-card:nth-of-type(6) img {
  float: right;
  width: min(42%, 230px);
  object-fit: contain;
  height: 100%;
}

.article-summer-card p {
  margin: 0 0 15px !important;
  font-size: 16px !important;
  line-height: 1.42 !important;
}

.article-summer-note {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 0;
}

.article-summer-note > div {
  min-width: 0;
  padding: 20px 6px 15px 20px;
  border: none;
  border-radius: 22px;
  background: #f7f7f7;
  box-shadow: 0px 4px 10px 0px #00000040;
  overflow: hidden;
  min-height: 196px;
}

.article-summer-note > div a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article-summer-note strong {
  display: block;
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 500;
  border-bottom: 1px solid #00000026;
  padding-bottom: 8px;
  width: -moz-fit-content;
  width: fit-content;
}

.article-summer-note p {
  margin: 0 0 10px !important;
  font-size: 14px !important;
  line-height: 1.35 !important;
}

.article-summer-split {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(280px, 5fr);
  gap: 28px;
  align-items: center;
}

.article-summer-split > div {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.article-summer-split img {
  width: 100%;
  margin: 0 !important;
  border-radius: 18px;
  object-fit: cover;
}

@media (max-width: 1024px) {
  .article-summer-pair {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .article-summer-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .article-summer-body {
    gap: 34px;
  }

  .article-summer-card {
    padding: 18px;
    border-radius: 18px;
    margin-top: 20px;
  }

  .article-summer-card img {
    float: right;
    width: 40%;
    max-height: 220px;
    margin: 8px 0 14px !important;
  }

  .article-summer-note {
    grid-template-columns: 1fr;
  }
  .article-summer-card p {
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
  .article-summer-note p {
    font-size: 12px !important;
    line-height: 1.3 !important;
  }
  .article-summer-note > div {
    min-height: auto;
  }
  .article-summer-pair:nth-of-type(3) > .article-summer-card:nth-of-type(2) {
    margin-top: 20px;
  }
  .article-summer-pair:nth-of-type(2) > .article-summer-note:nth-of-type(2) {
    margin-top: 20px;
  }
  .article-summer-pair:nth-child(2) .article-summer-card:nth-of-type(1) img {
    width: 40%;
  }
  .article-summer-pair:nth-child(3) .article-summer-card:nth-of-type(1) img {
    width: 40%;
  }
}
</style>
