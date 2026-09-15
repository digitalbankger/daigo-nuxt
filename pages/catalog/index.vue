<script setup lang="ts">
definePageMeta({ layout: "main", hideGlobalBreadcrumbs: true });

import {
  useRoute,
  useRouter,
  useHead,
  useAsyncData,
  watch,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineAsyncComponent,
} from "#imports";
import { useCatalogStore } from "~/stores/catalogStore";
import { useDeviceStore } from "~/stores/deviceStore";
import ProductCard from "~/components/catalog/ProductCard.vue";
import WeeklyProducts from "~/components/catalog/WeeklyProducts.vue";
import Button from "~/components/ui/Button.vue";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import Breadcrumbs from "~/components/ui/Breadcrumbs.vue";
import { useYtm } from "@/composables/useYtm";
import {
  buildCatalogCanonicalPath,
  buildCatalogFilterLocation,
  getCatalogPrimarySeoSelection,
  getCatalogTrackingQuery,
  catalogFiltersToApiQuery,
  mergeCatalogFilters,
  normalizeCatalogFilters,
  normalizeExclusiveCatalogSeoFilters,
  selectExclusiveCatalogSeoFilter,
  stableCatalogFiltersKey,
  parseCatalogFilterValues,
  parseCatalogQueryFilters,
  parseCatalogSeoPathSegments,
  type CatalogFilterValues,
} from "~/utils/catalogFilterRoute";
import {
  getWeeklyProductSort,
  isWeeklyProductSlug,
} from "~/constants/weeklyProducts";


const LazyFilterPanel = defineAsyncComponent(() =>
  import("~/components/catalog/FilterPanel.vue"),
);

const ytm = useYtm();
const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const deviceStore = useDeviceStore();
const analytics = useAnalytics();
const isCatalogLoading = ref(false);

const PRODUCTS_PER_LOAD = 12;
const PIVOT = 15;
const loadMoreTrigger = ref<HTMLElement | null>(null);
let loadMoreObserver: IntersectionObserver | null = null;
let desktopFilterMedia: MediaQueryList | null = null;
const shouldMountDesktopFilter = ref(false);

function syncDesktopFilterMount() {
  shouldMountDesktopFilter.value = Boolean(desktopFilterMedia?.matches);
}

const SERVICE_QUERY_KEYS = new Set([
  "empty",
  "page",
  "page_size",
  "limit",
  "no_total",
  "for",
]);

await catalogStore.fetchFilters();

const allowedFilterSlugs = computed(
  () => new Set(catalogStore.filters.map((group) => group.slug)),
);

const rawRouteFilters = computed<CatalogFilterValues>(() =>
  mergeCatalogFilters(
    parseCatalogSeoPathSegments(route.params.filters),
    parseCatalogQueryFilters(route.query as Record<string, unknown>, allowedFilterSlugs.value),
  ),
);

const normalizedFilters = computed<CatalogFilterValues>(() => {
  const pathFilters = parseCatalogSeoPathSegments(route.params.filters);

  return normalizeExclusiveCatalogSeoFilters(
    rawRouteFilters.value,
    getCatalogPrimarySeoSelection(pathFilters),
  );
});

const normalizedQuery = computed(() =>
  catalogFiltersToApiQuery(normalizedFilters.value),
);

const directionQuickFilters = computed(() =>
  catalogStore.filters.find((group) => group.slug === "napravlennost")?.options ?? [],
);

const catalogPageHeading = computed(() => {
  const pathFilters = parseCatalogSeoPathSegments(route.params.filters);
  const primary = getCatalogPrimarySeoSelection(pathFilters);
  if (!primary) return "Каталог";

  const group = catalogStore.filters.find((item) => item.slug === primary.key);
  const option = group?.options.find((item) => item.value === primary.value);

  return option?.label || primary.value.replace(/-/g, " ");
});

const catalogBreadcrumbs = computed(() => {
  const crumbs = [{ title: "Каталог", to: "/catalog" }];

  if (catalogPageHeading.value !== "Каталог") {
    crumbs.push({
      title: catalogPageHeading.value,
      to: buildCatalogCanonicalPath(normalizedFilters.value),
    });
  }

  return crumbs;
});

function getHumanFilterSummary() {
  return Object.entries(normalizedQuery.value)
    .flatMap(([key, rawValue]) => {
      const group = catalogStore.filters.find((item) => item.slug === key);
      if (!group) return [];

      const values = String(rawValue || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const labels = values
        .map((value) => group.options.find((option) => option.value === value)?.label)
        .filter((label): label is string => Boolean(label));

      if (!labels.length) return [];
      if (key === "napravlennost") return labels;

      return [`${group.label}: ${labels.join(", ")}`];
    })
    .join(", ");
}

// Initial SSR/catalog fetch: первая порция товаров попадает прямо в HTML.
// В useAsyncData хранится только флаг выполнения; сами 12 карточек гидратируются через Pinia,
// поэтому массив товаров не дублируется в Nuxt payload.
const initialCatalogQuery = normalizedQuery.value;
await useAsyncData(
  `catalog-products:${JSON.stringify(initialCatalogQuery)}`,
  async () => {
    await catalogStore.fetchProducts(initialCatalogQuery);
    // Сами товары уже сериализуются Pinia. Не дублируем их второй раз в
    // Nuxt payload: это заметно уменьшает HTML первой загрузки каталога.
    return true;
  },
  {
    server: true,
    lazy: false,
    default: () => false,
  },
);

isCatalogLoading.value = false;

const visibleProducts = computed(() => {
  const products = catalogStore.products.filter((p) => (p.price ?? 0) > 0);

  return products.slice().sort((a, b) => {
    const aSort = Number.isFinite(+a.sort) ? +a.sort : 0;
    const bSort = Number.isFinite(+b.sort) ? +b.sort : 0;

    const aKey = aSort === 0 ? PIVOT + 0.5 : aSort;
    const bKey = bSort === 0 ? PIVOT + 0.5 : bSort;

    if (aKey !== bKey) return aKey - bKey;

    const aTie = String(a.name ?? a.product_id ?? "");
    const bTie = String(b.name ?? b.product_id ?? "");
    return aTie.localeCompare(bTie, "ru");
  });
});



// «Продукты недели» берём из уже загруженной SSR-порции каталога.
// Дополнительного API-запроса нет: те же ProductCard-данные просто
// раскладываются по двум визуальным блокам. Порядок фиксирован в constants/weeklyProducts.ts.
const weekProducts = computed(() =>
  visibleProducts.value
    .filter((product) => isWeeklyProductSlug(product.slug))
    .slice()
    .sort(
      (a, b) =>
        getWeeklyProductSort(a.slug) - getWeeklyProductSort(b.slug),
    ),
);

const regularProducts = computed(() =>
  visibleProducts.value.filter(
    (product) => !isWeeklyProductSlug(product.slug),
  ),
);

// products в store содержит только реально загруженные порции.
const renderedProducts = computed(() => regularProducts.value);

// Аналитика повторяет реальный порядок блоков на странице и получает каждый
// товар ровно один раз: сначала продукты недели, затем остальные товары.
const analyticsProducts = computed(() => [
  ...weekProducts.value,
  ...renderedProducts.value,
]);

const featuredCount = computed(() => (deviceStore.isMobile ? 2 : 3));

// Если есть «Продукты недели», они заменяют верхнюю обычную строку карточек.
// Это не увеличивает количество карточек в первом SSR и не раздувает payload.
const featuredProducts = computed(() =>
  weekProducts.value.length
    ? []
    : renderedProducts.value.slice(0, featuredCount.value),
);

const otherProducts = computed(() =>
  weekProducts.value.length
    ? renderedProducts.value
    : renderedProducts.value.slice(featuredCount.value),
);

const otherProductsGlobalOffset = computed(() =>
  weekProducts.value.length
    ? weekProducts.value.length
    : featuredCount.value,
);

const hasMoreProducts = computed(
  () => catalogStore.products.length < catalogStore.totalProducts,
);
const remainingProductsCount = computed(() =>
  Math.max(0, catalogStore.totalProducts - catalogStore.products.length),
);
const skeletonItems = Array.from({ length: PRODUCTS_PER_LOAD });

function hasDeprecatedCatalogQuery(query: typeof route.query) {
  return Object.keys(query).some((key) => SERVICE_QUERY_KEYS.has(key));
}

function buildCatalogCanonicalHref() {
  return `https://daigo.ru${buildCatalogCanonicalPath(normalizedFilters.value)}`;
}

function isDirectionQuickFilterActive(value: string) {
  return parseCatalogFilterValues(normalizedQuery.value.napravlennost).includes(value);
}

function applyQuickFilter(key: string, value: string) {
  const filters = selectExclusiveCatalogSeoFilter(
    normalizeCatalogFilters(normalizedFilters.value),
    key as 'napravlennost' | 'pomogaet-pri',
    value,
  );
  const location = buildCatalogFilterLocation(filters);
  router.push({ path: location.path, query: location.query, hash: route.hash });
}

const isLoadingMore = ref(false);

async function loadMoreProducts() {
  if (!hasMoreProducts.value || isLoadingMore.value) return;
  isLoadingMore.value = true;
  try {
    await catalogStore.loadMoreProducts(normalizedQuery.value);
  } finally {
    isLoadingMore.value = false;
    setupLoadMoreObserver();
  }
}

function disconnectLoadMoreObserver() {
  loadMoreObserver?.disconnect();
  loadMoreObserver = null;
}

async function setupLoadMoreObserver() {
  if (!import.meta.client) return;

  await nextTick();
  disconnectLoadMoreObserver();

  if (!hasMoreProducts.value || !loadMoreTrigger.value) return;

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreProducts();
      }
    },
    {
      root: null,
      rootMargin: "320px 0px",
      threshold: 0.01,
    },
  );

  loadMoreObserver.observe(loadMoreTrigger.value);
}

watch(
  normalizedQuery,
  async () => {
    if (import.meta.client) isCatalogLoading.value = true;
    try {
      await catalogStore.fetchProducts(normalizedQuery.value);
    } finally {
      isCatalogLoading.value = false;
      setupLoadMoreObserver();
    }
  },
  { immediate: false, deep: true },
);

watch(
  () => [route.path, route.query],
  () => {
    const hasConflictingSeoFilters =
      stableCatalogFiltersKey(rawRouteFilters.value) !==
      stableCatalogFiltersKey(normalizedFilters.value);

    if (!hasDeprecatedCatalogQuery(route.query) && !hasConflictingSeoFilters) return;

    const location = buildCatalogFilterLocation(normalizedFilters.value);
    const tracking = getCatalogTrackingQuery(route.query as Record<string, unknown>);
    router.replace({
      path: location.path,
      query: { ...location.query, ...tracking },
      hash: route.hash,
    });
  },
  { immediate: true, deep: true },
);

watch(
  [analyticsProducts, visibleProducts],
  () => {
    const list = analyticsProducts.value;
    if (!list.length || isCatalogLoading.value) return;

    ytm.viewListing({
      currency: "RUB",
      items: list.map((p, idx) => ({
        id: p.product_id,
        name: p.name,
        price: Number(p.price) || 0,
        position: idx + 1,
        category: p.tag ? [p.tag] : undefined,
        url: `/catalog/${p.slug}`,
        image_url: p.image,
      })),
      page_count: Math.max(1, catalogStore.totalPages),
      current_page: Math.max(1, catalogStore.page),
    });

    analytics.viewItemList(
      "Каталог",
      list.map((p, idx) => ({
        id: p.product_id,
        name: p.name,
        price: Number(p.price) || 0,
        position: idx + 1,
        category: p.tag ? String(p.tag) : undefined,
        url: `/catalog/${p.slug}`,
        image_url: p.image,
        list: "Каталог",
      })),
      route.fullPath,
    );
  },
  { immediate: true },
);

watch([loadMoreTrigger, hasMoreProducts], () => {
  setupLoadMoreObserver();
});

useHead(() => {
  const filters = getHumanFilterSummary();
  const trackingQuery = getCatalogTrackingQuery(route.query as Record<string, unknown>);
  const hasIndexAffectingQuery = Object.keys(route.query).some((key) => !(key in trackingQuery));

  const title = filters ? `Каталог: ${filters} — Daigo` : "Каталог — Daigo";

  const description = filters
    ? `Подборка товаров по фильтрам: ${filters}`
    : "Каталог продукции Daigo: метабиотики, аминобиотики, подарочные сертификаты и наборы.";

  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: buildCatalogCanonicalHref() },
      {
        name: "robots",
        content: hasIndexAffectingQuery ? "noindex, follow" : "index, follow",
      },
    ],
    link: [
      {
        rel: "canonical",
        href: buildCatalogCanonicalHref(),
      },
    ],
    script: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${buildCatalogCanonicalHref()}#collection`,
              name: title,
              description,
              url: buildCatalogCanonicalHref(),
              isPartOf: { "@id": "https://daigo.ru/#website" },
              mainEntity: { "@id": `${buildCatalogCanonicalHref()}#products` },
              inLanguage: "ru-RU",
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${buildCatalogCanonicalHref()}#breadcrumbs`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Главная",
                  item: "https://daigo.ru/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Каталог",
                  item: "https://daigo.ru/catalog",
                },
                ...(catalogPageHeading.value !== "Каталог"
                  ? [
                      {
                        "@type": "ListItem",
                        position: 3,
                        name: catalogPageHeading.value,
                        item: buildCatalogCanonicalHref(),
                      },
                    ]
                  : []),
              ],
            },
            {
              "@type": "ItemList",
              "@id": `${buildCatalogCanonicalHref()}#products`,
              name: title,
              numberOfItems: analyticsProducts.value.length,
              // На странице списка не размечаем каждую карточку как Product.
              // Google валидирует любой Product как отдельный товар и требует
              // хотя бы offers / review / aggregateRating. Для каталога семантически
              // корректнее ItemList + ListItem, а полноценный Product JSON-LD
              // остаётся только на детальной странице товара.
              itemListElement: analyticsProducts.value.map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: product.name,
                url: `https://daigo.ru/catalog/${product.slug}`,
                ...(product.image
                  ? {
                      image: String(product.image).startsWith("http")
                        ? product.image
                        : `https://daigo.ru${product.image}`,
                    }
                  : {}),
              })),
            },
          ],
        }),
      },
    ],
  };
});

const isFilterModalOpen = ref(false);

function openFilters() {
  isFilterModalOpen.value = true;
}

function closeFilters() {
  isFilterModalOpen.value = false;
}

async function scrollToHash(hash = route.hash) {
  if (!import.meta.client || !hash) return;

  const id = hash.replace("#", "");
  if (!id) return;

  await nextTick();

  let attempts = 0;
  const maxAttempts = 30;
  const delay = 150;

  const tryScroll = () => {
    const el = document.getElementById(id);

    if (el) {
      const headerOffset = 120;
      const top =
        el.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });

      return;
    }

    attempts++;

    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, delay);
    }
  };

  window.setTimeout(tryScroll, 300);
}

onMounted(() => {
  // Desktop-фильтр существует только на desktop; на mobile его chunk не монтируется до открытия drawer.
  desktopFilterMedia = window.matchMedia("(min-width: 1024px)");
  syncDesktopFilterMount();
  desktopFilterMedia.addEventListener?.("change", syncDesktopFilterMount);

  scrollToHash();
  setupLoadMoreObserver();
});

onBeforeUnmount(() => {
  disconnectLoadMoreObserver();
  desktopFilterMedia?.removeEventListener?.("change", syncDesktopFilterMount);
  desktopFilterMedia = null;
});

watch(
  () => route.hash,
  (hash) => {
    scrollToHash(hash);
  },
);

watch(
  () => visibleProducts.value.length,
  async () => {
    setupLoadMoreObserver();

    if (route.hash) {
      await scrollToHash(route.hash);
    }
  },
);
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <Breadcrumbs :crumbs="catalogBreadcrumbs" />

      <div class="flex flex-row items-center justify-between">
        <h1 class="text-slider font-medium mb-4 md:mb-10">{{ catalogPageHeading }}</h1>
      </div>

      <div class="flex items-center gap-4 mb-6 relative z-10">
        <button
          type="button"
          class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-hoverbtn lg:hidden"
          @click="openFilters"
          aria-label="Открыть фильтры"
        >
          <img src="/icons/filter.svg" width="20" height="20" alt="" />
        </button>

        <div class="flex overflow-x-auto gap-4 no-scrollbar">
          <button
            v-for="tag in directionQuickFilters"
            :key="tag.value"
            class="flex-shrink-0 px-4 py-2 rounded-md"
            :class="
              isDirectionQuickFilterActive(tag.value)
                ? 'bg-primary text-white'
                : 'bg-hoverbtn'
            "
            @click="applyQuickFilter('napravlennost', tag.value)"
            type="button"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <LazyCatalogFilterDrawer
        v-if="isFilterModalOpen"
        :show="true"
        :store="catalogStore"
        @close="closeFilters"
      />

      <div class="flex flex-row gap-7">
        <aside class="hidden lg:block w-full lg:w-1/4">
          <LazyFilterPanel
            v-if="shouldMountDesktopFilter"
            :store="catalogStore"
            :with-shadow="true"
          />
        </aside>

        <div v-if="isCatalogLoading" class="w-full lg:w-3/4">
          <p class="mb-6 text-center text-lg font-medium text-black/70">
            Каталог загружается...
          </p>

          <div
            class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20"
          >
            <div
              v-for="(_, idx) in skeletonItems"
              :key="idx"
              class="catalog-skeleton-card"
            >
              <div class="catalog-skeleton-image"></div>

              <div class="catalog-skeleton-content">
                <div
                  class="catalog-skeleton-line catalog-skeleton-line-title"
                ></div>
                <div
                  class="catalog-skeleton-line catalog-skeleton-line-short"
                ></div>
                <div
                  class="catalog-skeleton-line catalog-skeleton-line-price"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="analyticsProducts.length" class="w-full lg:w-3/4">
          <WeeklyProducts
            v-if="weekProducts.length"
            :products="weekProducts"
          />

          <div
            v-if="featuredProducts.length"
            class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20"
          >
            <ProductCard
              v-for="(product, idx) in featuredProducts"
              :key="String(product.product_id)"
              :product="product"
              :index="idx"
              :global-index="idx"
              :priority="idx < 2"
            />
          </div>

          <p
            class="xs-max:text-base text-lg font-medium mx-auto text-center my-10 border-y py-4 w-full"
          >
            БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ
          </p>

          <div
            class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20"
          >
            <ProductCard
              v-for="(product, idx) in otherProducts"
              :key="String(product.product_id)"
              :product="product"
              :index="idx + otherProductsGlobalOffset"
              :global-index="idx + otherProductsGlobalOffset"
            />
          </div>

          <div
            v-if="hasMoreProducts"
            ref="loadMoreTrigger"
            class="mt-10 flex flex-col items-center gap-3"
          >
            <Button
              type="button"
              class="min-w-[220px]"
              :disabled="isLoadingMore"
              @click="loadMoreProducts"
            >
              {{ isLoadingMore ? 'Загрузка...' : 'Показать ещё' }}
              <span v-if="remainingProductsCount"
                >({{ remainingProductsCount }})</span
              >
            </Button>
          </div>

        </div>

        <div v-else class="text-center text-black/70 m-auto">
          <p>Товары не найдены!<br />Измените фильтры.</p>
        </div>
      </div>
    </section>
  </BaseContainer>
</template>

<style scoped>
.catalog-skeleton-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: #f9f9f9;
  min-height: 360px;
}

.catalog-skeleton-card::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.65),
    transparent
  );
  animation: skeleton-shimmer 1.35s infinite;
}

.catalog-skeleton-image {
  width: 100%;
  height: 220px;
  background: #f4f4f4;
  border-radius: 20px 20px 0 0;
}

.catalog-skeleton-content {
  padding: 18px;
}

.catalog-skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: #f1f1f1;
  margin-bottom: 12px;
}

.catalog-skeleton-line-title {
  width: 85%;
  height: 18px;
}

.catalog-skeleton-line-short {
  width: 65%;
}

.catalog-skeleton-line-price {
  width: 45%;
  height: 20px;
  margin-top: 24px;
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 767px) {
  .catalog-skeleton-card {
    min-height: 280px;
    border-radius: 14px;
  }

  .catalog-skeleton-image {
    height: 160px;
    border-radius: 14px 14px 0 0;
  }

  .catalog-skeleton-content {
    padding: 12px;
  }
}
</style>
