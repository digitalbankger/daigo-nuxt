<script setup lang="ts">
import { computed } from "vue";
import type { ArticleDetail } from "~/types/articles";
import YouWillLearn from "~/components/articles/YouWillLearn.vue";
import SideNoteCard from "./SideNoteCard.vue";
import OmegaProductCard from "./OmegaProductCard.vue";
import ProductsWeekBanner from "./ProductsWeekBanner.vue";

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
  <div class="flex flex-col gap-4 md:gap-6">
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

    <img
      :src="article.cover || article.image"
      :alt="article.title"
      format="webp"
      quality="80"
      loading="lazy"
      decoding="async"
      class="w-full rounded-2xl object-cover h-[200px] sm:h-[460px]"
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

    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-10 items-start"
    >
      <div class="lg:col-span-8">
        <YouWillLearn
          :key="slug"
          :container-ids="['omega-content']"
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

    <div id="omega-content" class="flex flex-col">
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
            <div
              class="prose max-w-none prose-p:text-black prose-li:text-black"
              v-html="section.html"
            />
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
      </template>
    </div>

    <template v-if="article.outro">
      <hr class="border-black/10" />
      <div class="flex flex-col gap-6 py-8 md:py-12">
        <h2 class="text-3xl md:text-product font-medium leading-tight">
          {{ article.outro.heading }}
        </h2>
        <div
          class="prose max-w-none prose-p:text-black prose-li:text-black"
          v-html="article.outro.html"
        />
      </div>
    </template>

    <hr v-if="article.weeklyProducts?.length" class="border-black/10" />

    <ProductsWeekBanner
      v-if="article.weeklyProducts?.length"
      :products="article.weeklyProducts"
      :title="article.weeklyProductsTitle"
    />
  </div>
</template>
