<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useRoute, useRouter, useHead, useAsyncData, watch, computed, ref, onMounted, onBeforeUnmount, nextTick } from '#imports'
import { useCatalogStore } from '~/stores/catalogStore'
import { useDeviceStore } from '~/stores/deviceStore'
import FilterPanel from '~/components/catalog/FilterPanel.vue'
import ProductCard from '~/components/catalog/ProductCard.vue'
import Button from '~/components/ui/Button.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useYtm } from '@/composables/useYtm'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

const ytm = useYtm()
const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const deviceStore = useDeviceStore()
const analytics = useAnalytics()
const isCatalogLoading = ref(false)

const PRODUCTS_PER_LOAD = 12
const PIVOT = 15
const displayLimit = ref(PRODUCTS_PER_LOAD)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null

const SERVICE_QUERY_KEYS = new Set(['empty', 'page', 'page_size', 'limit', 'no_total', 'for'])

await catalogStore.fetchFilters()

const allowedFilterSlugs = computed(() => new Set(catalogStore.filters.map((group) => group.slug)))

function isCatalogFilterQueryKey(key: string) {
  return allowedFilterSlugs.value.has(key)
}

const normalizedQuery = computed(() => {
  return Object.fromEntries(
    Object.entries(route.query)
      .filter(([key]) => isCatalogFilterQueryKey(key))
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] ?? '' : value ?? ''
      ])
  ) as Record<string, string>
})

// Initial SSR/catalog fetch: товары должны попасть в HTML, а не появляться только после hydration.
// useAsyncData дополнительно сериализует результат в payload Nuxt, поэтому карточки не теряются
// между серверным рендером и клиентской гидрацией.
const initialCatalogQuery = normalizedQuery.value
const { data: initialCatalogPayload } = await useAsyncData(
  `catalog-products:${JSON.stringify(initialCatalogQuery)}`,
  async () => {
    await catalogStore.fetchProducts(initialCatalogQuery)

    return {
      products: catalogStore.products,
      totalProducts: catalogStore.totalProducts,
      totalPages: catalogStore.totalPages,
      page: catalogStore.page,
    }
  },
  {
    server: true,
    lazy: false,
    default: () => ({
      products: [],
      totalProducts: 0,
      totalPages: 1,
      page: 1,
    }),
  }
)

if (initialCatalogPayload.value) {
  catalogStore.products = initialCatalogPayload.value.products
  catalogStore.totalProducts = initialCatalogPayload.value.totalProducts
  catalogStore.totalPages = initialCatalogPayload.value.totalPages
  catalogStore.page = initialCatalogPayload.value.page
}

isCatalogLoading.value = false

const visibleProducts = computed(() => {
  const products = catalogStore.products.filter(p => (p.price ?? 0) > 0)

  return products.slice().sort((a, b) => {
    const aSort = Number.isFinite(+a.sort) ? +a.sort : 0
    const bSort = Number.isFinite(+b.sort) ? +b.sort : 0

    const aKey = aSort === 0 ? PIVOT + 0.5 : aSort
    const bKey = bSort === 0 ? PIVOT + 0.5 : bSort

    if (aKey !== bKey) return aKey - bKey

    const aTie = String(a.name ?? a.product_id ?? '')
    const bTie = String(b.name ?? b.product_id ?? '')
    return aTie.localeCompare(bTie, 'ru')
  })
})

const renderedProducts = computed(() => visibleProducts.value.slice(0, displayLimit.value))
const featuredCount = computed(() => (deviceStore.isMobile ? 2 : 3))
const featuredProducts = computed(() => renderedProducts.value.slice(0, featuredCount.value))
const otherProducts = computed(() => renderedProducts.value.slice(featuredCount.value))
const hasMoreProducts = computed(() => renderedProducts.value.length < visibleProducts.value.length)
const remainingProductsCount = computed(() => Math.max(0, visibleProducts.value.length - renderedProducts.value.length))
const skeletonItems = Array.from({ length: PRODUCTS_PER_LOAD })

function cleanupQuery(query: typeof route.query) {
  const nextQuery = { ...query }

  for (const key of SERVICE_QUERY_KEYS) {
    delete nextQuery[key]
  }

  return nextQuery
}

function hasDeprecatedCatalogQuery(query: typeof route.query) {
  return Object.keys(query).some((key) => SERVICE_QUERY_KEYS.has(key))
}

function buildCatalogCanonicalHref() {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(normalizedQuery.value)) {
    if (!value) continue
    params.set(key, String(value))
  }

  const qs = params.toString().replaceAll('%2C', ',')
  return `https://daigo.ru/catalog${qs ? `?${qs}` : ''}`
}

function applyQuickFilter(key: string, value: string) {
  const query = cleanupQuery(route.query)
  query[key] = value
  router.push({ query, hash: route.hash })
}

function loadMoreProducts() {
  if (!hasMoreProducts.value) return
  displayLimit.value = Math.min(displayLimit.value + PRODUCTS_PER_LOAD, visibleProducts.value.length)
}

function disconnectLoadMoreObserver() {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
}

async function setupLoadMoreObserver() {
  if (!import.meta.client) return

  await nextTick()
  disconnectLoadMoreObserver()

  if (!hasMoreProducts.value || !loadMoreTrigger.value) return

  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadMoreProducts()
    }
  }, {
    root: null,
    rootMargin: '320px 0px',
    threshold: 0.01,
  })

  loadMoreObserver.observe(loadMoreTrigger.value)
}

watch(
  normalizedQuery,
  async () => {
    if (import.meta.client) isCatalogLoading.value = true
    displayLimit.value = PRODUCTS_PER_LOAD

    try {
      await catalogStore.fetchProducts(normalizedQuery.value)
    } finally {
      isCatalogLoading.value = false
      setupLoadMoreObserver()
    }
  },
  { immediate: false, deep: true }
)

watch(
  () => route.query,
  () => {
    if (!hasDeprecatedCatalogQuery(route.query)) return
    router.replace({ query: cleanupQuery(route.query), hash: route.hash })
  },
  { immediate: true, deep: true }
)

watch(
  [renderedProducts, visibleProducts],
  () => {
    const list = renderedProducts.value
    if (!list.length || isCatalogLoading.value) return

    ytm.viewListing({
      currency: 'RUB',
      items: list.map((p, idx) => ({
        id: p.product_id,
        name: p.name,
        price: Number(p.price) || 0,
        position: idx + 1,
        category: p.tag ? [p.tag] : undefined,
        url: `/catalog/${p.slug}`,
        image_url: p.image
      })),
      page_count: Math.max(1, Math.ceil(visibleProducts.value.length / PRODUCTS_PER_LOAD)),
      current_page: Math.max(1, Math.ceil(renderedProducts.value.length / PRODUCTS_PER_LOAD))
    })

    analytics.viewItemList(
      'Каталог',
      list.map((p, idx) => ({
        id: p.product_id,
        name: p.name,
        price: Number(p.price) || 0,
        position: idx + 1,
        category: p.tag ? String(p.tag) : undefined,
        url: `/catalog/${p.slug}`,
        image_url: p.image,
        list: 'Каталог'
      })),
      route.fullPath
    )
  },
  { immediate: true }
)

watch(
  [loadMoreTrigger, hasMoreProducts],
  () => {
    setupLoadMoreObserver()
  }
)

useHead(() => {
  const filters = Object.entries(normalizedQuery.value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

  const title = filters
    ? `Каталог: ${filters} — Daigo`
    : 'Каталог — Daigo'

  const description = filters
    ? `Подборка товаров по фильтрам: ${filters}`
    : 'Каталог продукции Daigo: метабиотики, аминобиотики, подарочные сертификаты и наборы.'

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { name: 'robots', content: 'index, follow' }
    ],
    link: [
      {
        rel: 'canonical',
        href: buildCatalogCanonicalHref()
      }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Daigo',
            url: 'https://daigo.ru/catalog'
          }
        })
      }
    ]
  }
})

const isFilterModalOpen = ref(false)
useBodyScrollLock(isFilterModalOpen)

function openFilters() {
  isFilterModalOpen.value = true
}

function closeFilters() {
  isFilterModalOpen.value = false
}

async function scrollToHash(hash = route.hash) {
  if (!import.meta.client || !hash) return

  const id = hash.replace('#', '')
  if (!id) return

  await nextTick()

  let attempts = 0
  const maxAttempts = 30
  const delay = 150

  const tryScroll = () => {
    const el = document.getElementById(id)

    if (el) {
      const headerOffset = 120
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset

      window.scrollTo({
        top,
        behavior: 'smooth',
      })

      return
    }

    attempts++

    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, delay)
    }
  }

  window.setTimeout(tryScroll, 300)
}

onMounted(() => {
  scrollToHash()
  setupLoadMoreObserver()
})

onBeforeUnmount(() => {
  disconnectLoadMoreObserver()
})

watch(
  () => route.hash,
  (hash) => {
    scrollToHash(hash)
  }
)

watch(
  () => visibleProducts.value.length,
  async () => {
    setupLoadMoreObserver()

    if (route.hash) {
      await scrollToHash(route.hash)
    }
  }
)
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-centr justify-between">
        <h1 class="text-slider font-medium mb-4 md:mb-10">Каталог</h1>
      </div>

      <div class="flex items-center gap-4 mb-6 relative z-10">
        <div
          class="flex flex-row justify-center items-center rounded-md bg-hoverbtn w-10 h-10 cursor-pointer flex-shrink-0"
          @click="openFilters"
          aria-label="Открыть фильтры"
        >
          <img src="/icons/filter.svg" width="20" alt="Фильтр" />
        </div>

        <div class="flex overflow-x-auto gap-4 no-scrollbar">
          <button
            v-for="tag in [
              { label: 'Кишечник и иммунитет', value: 'kishechnik-i-immunitet' },
              { label: 'Нервная система и мозг', value: 'mozg-i-nervnaya-sistema' },
              { label: 'Кожа и волосы', value: 'kozha-i-volosy' }
            ]"
            :key="tag.value"
            class="flex-shrink-0 px-4 py-2 rounded-md"
            :class="normalizedQuery.napravlennost === tag.value ? 'bg-primary text-white' : 'bg-hoverbtn'"
            @click="applyQuickFilter('napravlennost', tag.value)"
            type="button"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-0 z-40 bg-black/20"
          @click="closeFilters"
        />
      </Transition>

      <Transition name="slide-left">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-y-0 left-0 z-50 w-11/12 rounded-r-2xl sm:w-[500px] bg-white p-3 md:p-6 overflow-y-auto"
        >
          <div class="w-full flex justify-between items-center mb-4">
            <button @click="closeFilters" class="absolute top-4 right-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <FilterPanel :store="catalogStore" />
        </div>
      </Transition>

      <div class="flex flex-row gap-7">
        <aside class="hidden lg:block w-full lg:w-1/4">
          <FilterPanel :store="catalogStore" :with-shadow="true" />
        </aside>

        <div v-if="isCatalogLoading" class="w-full lg:w-3/4">
          <p class="mb-6 text-center text-lg font-medium text-black/70">
            Каталог загружается...
          </p>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <div
              v-for="(_, idx) in skeletonItems"
              :key="idx"
              class="catalog-skeleton-card"
            >
              <div class="catalog-skeleton-image"></div>

              <div class="catalog-skeleton-content">
                <div class="catalog-skeleton-line catalog-skeleton-line-title"></div>
                <div class="catalog-skeleton-line catalog-skeleton-line-short"></div>
                <div class="catalog-skeleton-line catalog-skeleton-line-price"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="renderedProducts.length" class="w-full lg:w-3/4">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <ProductCard
              v-for="(product, idx) in featuredProducts"
              :key="String(product.product_id)"
              :product="product"
              :index="idx"
              :global-index="idx"
              :priority="idx < 3"
            />
          </div>

          <p class="xs-max:text-base text-lg font-medium mx-auto text-center my-10 border-y py-4 w-full">
            БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ
          </p>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <ProductCard
              v-for="(product, idx) in otherProducts"
              :key="String(product.product_id)"
              :product="product"
              :index="idx + featuredCount"
              :global-index="idx + featuredCount"
            />
          </div>

          <div
            v-if="hasMoreProducts"
            ref="loadMoreTrigger"
            class="mt-10 flex flex-col items-center gap-3"
          >
            <Button type="button" class="min-w-[220px]" @click="loadMoreProducts">
              Показать ещё
              <span v-if="remainingProductsCount">({{ remainingProductsCount }})</span>
            </Button>
          </div>

          <div class="mt-0 text-sm text-gray-700 leading-relaxed h-2 relative overflow-hidden">
            <h2 class="md:w-[88%] font-medium leading-tight mb-6 text-[clamp(2rem,6vw,2.8rem)] text-white">
              Широкий выбор биологически активных добавок на Daigo.ru
            </h2>
            <p class="mb-20 text-base md:text-lg text-white">
              Онлайн магазин БАДов «Дайго» - это надёжное место для покупки качественных биологически активных добавок.
              <br>Забота о здоровье становится все более актуальной темой. Люди стремятся к жизни полной энергии и бодрости, и правильное питание играет здесь ключевую роль.
              <br>Магазин «Дайго» предлагает широкий ассортимент БАДов, которые помогут поддержать организм в тонусе, улучшить общее состояние и повысить иммунитет. <br><br>Один из ключевых принципов магазина «Дайго» - это качество и безопасность продукции. Представленные на сайте товары прошли строгий контроль качества, что позволяет быть уверенными в их эффективности и безопасности для здоровья. Приятным бонусом для наших клиентов является удобная система заказа и доставки. Вы можете оформить покупку в любое время, не выходя из дома, и получить заказ в кратчайшие сроки. Забота о собственном здоровье — это важный шаг на пути к полноценной и счастливой жизни. Поддерживайте организм с помощью качественных биологически активных добавок из магазина «Дайго» и наслаждайтесь активным образом жизни!
            </p>
          </div>
        </div>

        <div v-else class="text-center text-black/70 m-auto">
          <p>Товары не найдены!<br/>Измените фильтры.</p>
        </div>
      </div>
    </section>
  </BaseContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-enter-to {
  transform: translateX(0);
}
.slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

.catalog-skeleton-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: #f9f9f9;
  min-height: 360px;
}

.catalog-skeleton-card::after {
  content: '';
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