<script setup lang="ts">
import { computed } from "vue";
import type { ArticleDetail } from "~/types/articles";
import YouWillLearn from "~/components/articles/YouWillLearn.vue";
import SideNoteCard from "~/components/articles/omega/SideNoteCard.vue";
import OmegaProductCard from "~/components/articles/omega/OmegaProductCard.vue";
import LongevityBannerProductCard from "./LongevityBannerProductCard.vue";
import LongevitySideProduct from "./LongevitySideProduct.vue";

const props = defineProps<{
  article: ArticleDetail;
  slug: string;
}>();

const sections = computed(() => props.article.sections || []);

function goToComments() {
  document
    .getElementById("comments")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const shareUrl = computed(() =>
  encodeURIComponent(`https://daigo.ru/articles/${props.slug}`),
);
const shareTitle = computed(() => encodeURIComponent(props.article.title));
async function shareNative() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.article.title,
        text: props.article.description,
        url: `https://daigo.ru/articles/${props.slug}`,
      });
    } catch {}
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 md:gap-8">
    <!-- мета: дата / время / просмотры / комментарии -->
    <div class="flex flex-wrap items-center gap-4 md:gap-6 text-black">
      <div class="text-sm md:text-2xl flex items-center gap-2">
        <img src="/icons/publications/calendar.svg" class="w-4 md:w-5" alt="" />
        <span>{{ new Date(article.date).toLocaleDateString("ru-RU") }}</span>
      </div>
      <div class="text-sm md:text-2xl flex items-center gap-2">
        <img src="/icons/publications/clock.svg" class="w-4 md:w-5" alt="" />
        <span aria-label="Время чтения">{{ article.time }} мин</span>
      </div>
      <div class="text-sm md:text-2xl flex items-center gap-2">
        <img src="/icons/publications/ye.svg" class="w-4 md:w-5" alt="" />
        <span aria-label="Просмотры">{{ article.views }}</span>
      </div>
      <div class="text-sm md:text-2xl flex items-center gap-2">
        <img src="/icons/publications/comment.svg" class="w-4 md:w-5" alt="" />
        <span aria-label="Комментарии">{{ article.comments }}</span>
      </div>
    </div>

    <!-- обложка + оглавление слева, "Рекомендации для вас" справа -->
    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-8 items-start"
    >
      <div class="lg:col-span-8 flex flex-col gap-6">
        <img
          :src="article.cover || article.image"
          :alt="article.title"
          format="webp"
          quality="80"
          loading="lazy"
          decoding="async"
          class="w-full rounded-2xl object-cover h-[220px] sm:h-[422px]"
        />

        <div class="flex gap-8">
          <button
            type="button"
            class="text-sm md:text-2xl flex items-center gap-2"
            @click="goToComments"
          >
            <img src="/icons/publications/comment.svg" class="w-5" alt="" />
            <span>Комментарии</span>
          </button>
          <button
            type="button"
            class="text-sm md:text-2xl flex items-center gap-2"
            @click="shareNative"
          >
            <img src="/icons/publications/share.svg" class="w-5" alt="" />
            <span class="text-[#FF64E7]">Поделиться</span>
          </button>
        </div>

        <YouWillLearn
          :key="slug"
          :container-ids="['longevity-content']"
          :limit="sections.length"
        />
      </div>

      <aside v-if="article.recommendedProducts?.length" class="lg:col-span-4">
        <h3 class="text-xl md:text-cardhead font-medium mb-4">
          Рекомендации для вас
        </h3>
        <div class="flex flex-col gap-6">
          <OmegaProductCard
            v-for="p in article.recommendedProducts"
            :key="p.product_id"
            :product="p"
            variant="sidebar"
          />
        </div>
      </aside>
    </div>

    <!-- секции -->
    <div id="longevity-content" class="flex flex-col">
      <template v-for="(section, idx) in sections" :key="section.id">
        <hr v-if="idx > 0" class="border-black/10" />
        <div
          class="grid grid-cols-1 lg:grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-6 items-start py-8 md:py-12 first:pt-0"
        >
          <article class="lg:col-span-8 flex flex-col gap-6">
            <h2
              :id="section.id"
              class="text-3xl md:text-product font-medium leading-tight scroll-mt-24"
            >
              {{ section.heading }}
            </h2>
            <div class="longevity-body" v-html="section.html" />
            <img
              v-if="section.image"
              :src="section.image.src"
              :alt="section.image.alt || section.heading"
              class="w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </article>

          <aside class="lg:col-span-4">
            <SideNoteCard
              v-if="section.sideNote"
              :title="section.sideNote.title"
              :text="section.sideNote.text"
              :icon="section.sideNote.icon"
            />
            <LongevitySideProduct
              v-else-if="section.sideProduct"
              :product="section.sideProduct"
            />
            <img
              v-else-if="section.infographic"
              :src="section.infographic.src"
              :alt="section.infographic.alt || ''"
              class="w-full rounded-2xl object-contain"
              loading="lazy"
              decoding="async"
            />
          </aside>
        </div>

        <!-- промо-баннер: nested — карточки лежат прямо на баннере -->
        <div
          v-if="section.banner && section.banner.style !== 'separate'"
          class="relative overflow-hidden rounded-[20px] mb-8 md:mb-12 flex flex-col"
        >
          <img
            :src="section.banner.image"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <h3
            class="relative z-10 text-[#56462e] font-medium text-2xl sm:text-4xl md:text-[46px] leading-tight p-6 md:p-8"
          >
            {{ section.banner.title }}
          </h3>
          <div
            class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-6 md:px-8 pb-6 md:pb-8"
          >
            <LongevityBannerProductCard
              v-for="p in section.banner.products"
              :key="p.product_id"
              :product="p"
            />
          </div>
        </div>

        <!-- промо-баннер: separate — баннер отдельно, карточки отдельным рядом ниже -->
        <template v-else-if="section.banner">
          <div
            class="relative overflow-hidden rounded-[20px] h-[220px] sm:h-[340px] md:h-[420px] mb-6 md:mb-8"
          >
            <img
              :src="section.banner.image"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <h3
              class="relative z-10 text-[#56462e] font-medium text-2xl sm:text-4xl md:text-[46px] leading-tight p-6 md:p-8"
            >
              {{ section.banner.title }}
            </h3>
          </div>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
          >
            <OmegaProductCard
              v-for="p in section.banner.products"
              :key="p.product_id"
              :product="p"
              variant="banner"
            />
          </div>
        </template>
      </template>
    </div>

    <!-- финал -->
    <template v-if="article.outro">
      <hr class="border-black/10" />
      <div class="flex flex-col gap-6 py-8 md:py-12">
        <h2 class="text-3xl md:text-product font-medium leading-tight">
          {{ article.outro.heading }}
        </h2>
        <div
          class="longevity-body longevity-outro"
          v-html="article.outro.html"
        />
      </div>
    </template>
  </div>
</template>

<style>
.longevity-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #000;
}

.longevity-body p {
  font-size: 16px;
  line-height: 1.4;
  color: #000;
}

@media (min-width: 768px) {
  .longevity-body p {
    font-size: 20px;
  }
}

.longevity-body b,
.longevity-body strong {
  font-weight: 600;
}

.longevity-body ul,
.longevity-body ol {
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.longevity-body ul {
  list-style-type: disc;
}

.longevity-body ol {
  list-style-type: decimal;
}

.longevity-body a {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.longevity-body blockquote {
  margin: 0;
  padding: 0;
  border: none;
  font-style: normal;
}

.longevity-outro blockquote p {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 500;
  color: #000;
}

@media (min-width: 768px) {
  .longevity-outro blockquote p {
    font-size: clamp(30px, 8vw, 46px);
  }
}
</style>

