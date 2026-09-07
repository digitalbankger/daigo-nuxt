<script setup lang="ts">
import {
  useRoute,
  useRouter,
  useHead,
  watch,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  defineAsyncComponent,
} from '#imports'
import { useCatalogStore } from '~/stores/catalogStore'
import { useAnalytics } from '@/composables/useAnalytics'
import ProductCard from '~/components/catalog/ProductCard.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useYtm } from '@/composables/useYtm'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import {
  buildCatalogFilterPath,
  catalogFiltersToApiQuery,
  mergeCatalogFilters,
  normalizeCatalogFilters,
  parseCatalogFilterSegments,
  parseCatalogFilterValues,
  parseCatalogQueryFilters,
  stableCatalogFiltersKey,
  uniqueCatalogFilterValues,
  filterPathIsCatalogFilter,
  type CatalogFilterValues,
} from '~/utils/catalogFilterRoute'

type QuickReasonFilter = {
  label: string
  query: Record<string, string[]>
}

const PRODUCTS_LIMIT = 12

const quickReasonFilters: QuickReasonFilter[] = [
  {
    label: 'Микрофлора после лечения',
    query: { 'pomogaet-pri': ['vosstanovlenie-mikroflory', 'disbakterioz'] },
  },
  {
    label: 'Пищевая непереносимость',
    query: { 'pomogaet-pri': ['pishchevaya-neperenosimost'] },
  },
  {
    label: 'Иммунитет',
    query: { napravlennost: ['kishechnik-i-immunitet'] },
  },
  {
    label: 'ЖКТ у детей',
    query: { 'pomogaet-pri': ['meteorism', 'disbakterioz', 'kishechnaya-neprokhodimost-zapor'] },
  },
  // 'Класс продукта' отключён в каталоге.
  {
    label: 'Аллергии',
    query: { 'pomogaet-pri': ['allergiya', 'pishchevaya-neperenosimost'] },
  },
  {
    label: 'Дерматит и псориаз',
    query: { 'pomogaet-pri': ['atopicheskij-dermatit', 'neyrodermit', 'psoriaz'] },
  },
  {
    label: 'Волосы и дефициты',
    query: { 'pomogaet-pri': ['vypadenie-volos'] },
  },
  {
    label: 'После химиотерапии',
    query: {
      napravlennost: ['kishechnik-i-immunitet'],
      'pomogaet-pri': ['vosstanovlenie-mikroflory'],
    },
  },
  {
    label: 'Возрастная профилактика',
    query: {
      napravlennost: ['mozg-i-nervnaya-sistema'],
      'pomogaet-pri': ['demenciya', 'alcegeymer'],
    },
  },
]

const ytm = useYtm()
const route = useRoute()
const router = useRouter()
const LazyFilterPanel = defineAsyncComponent(() => import('~/components/catalog/FilterPanel.vue'))

const catalogStore = useCatalogStore()
const analytics = useAnalytics()
const isCatalogLoading = ref(true)
const isLoadingMore = ref(false)
const currentLazyPage = ref(1)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const skeletonItems = Array.from({ length: PRODUCTS_LIMIT })
let loadMoreObserver: IntersectionObserver | null = null
let desktopFilterMedia: MediaQueryList | null = null
const shouldMountDesktopFilter = ref(false)

function syncDesktopFilterMount() {
  shouldMountDesktopFilter.value = Boolean(desktopFilterMedia?.matches)
}

await catalogStore.fetchFilters()

const pagingQueryKeys = new Set(['empty', 'page', 'page_size', 'limit'])
const trackingQueryKeys = new Set(['ysclid', 'yclid', 'gclid', 'fbclid', 'etext', 'ybaip'])
const allowedFilterSlugs = computed(() => new Set(catalogStore.filters.map((group) => group.slug)))
const filterOrder = computed(() => catalogStore.filters.map((group) => group.slug))

function cleanRoutePathFilters() {
  return parseCatalogFilterSegments(route.params.filters, allowedFilterSlugs.value)
}

function cleanRouteQueryFilters() {
  return parseCatalogQueryFilters(route.query as Record<string, unknown>, allowedFilterSlugs.value)
}

const normalizedFilters = computed<CatalogFilterValues>(() => {
  return mergeCatalogFilters(cleanRoutePathFilters(), cleanRouteQueryFilters())
})

const normalizedQuery = computed(() => catalogFiltersToApiQuery(normalizedFilters.value))
const normalizedQueryKey = computed(() => stableCatalogFiltersKey(normalizedFilters.value))


function getFilterPath(filters: CatalogFilterValues = normalizedFilters.value) {
  return buildCatalogFilterPath(filters, filterOrder.value)
}

function hasPagingQueryParams() {
  return Object.keys(route.query).some((key) => pagingQueryKeys.has(key))
}

function hasLegacyFilterQueryParams() {
  return Object.keys(cleanRouteQueryFilters()).length > 0
}

function getPreservedTrackingQuery() {
  return Object.fromEntries(
    Object.entries(route.query).filter(([key]) => trackingQueryKeys.has(key) || key.startsWith('utm_'))
  )
}

function cloneFilters(filters: CatalogFilterValues): CatalogFilterValues {
  return normalizeCatalogFilters(
    Object.fromEntries(
      Object.entries(filters).map(([key, values]) => [key, [...values]])
    )
  )
}

const visibleProducts = computed(() => {
  return catalogStore.products.filter(p => (p.price ?? 0) > 0)
})

function isReasonActive(reason: QuickReasonFilter) {
  return Object.entries(reason.query).every(([key, values]) => {
    const currentValues = normalizedFilters.value[key] || []
    return values.every((value) => currentValues.includes(value))
  })
}

async function toggleReason(reason: QuickReasonFilter) {
  const filters = cloneFilters(normalizedFilters.value)
  const active = isReasonActive(reason)

  for (const [key, values] of Object.entries(reason.query)) {
    const currentValues = parseCatalogFilterValues(filters[key])
    const nextValues = active
      ? currentValues.filter((value) => !values.includes(value))
      : uniqueCatalogFilterValues([...currentValues, ...values])

    if (nextValues.length) filters[key] = nextValues
    else delete filters[key]
  }

  await router.push({ path: getFilterPath(filters), query: {}, hash: route.hash })
}

async function loadFirstPage() {
  isCatalogLoading.value = true
  isLoadingMore.value = false
  currentLazyPage.value = 1
  catalogStore.resetProducts()

  try {
    await catalogStore.fetchProducts(normalizedQuery.value, {
      page: 1,
      limit: PRODUCTS_LIMIT,
      append: false,
    })
  } finally {
    isCatalogLoading.value = false
  }
}

async function loadNextPage() {
  if (isCatalogLoading.value || isLoadingMore.value || !catalogStore.hasMore) return

  isLoadingMore.value = true

  try {
    const nextPage = currentLazyPage.value + 1
    await catalogStore.fetchProducts(normalizedQuery.value, {
      page: nextPage,
      limit: PRODUCTS_LIMIT,
      append: true,
    })
    currentLazyPage.value = nextPage
  } finally {
    isLoadingMore.value = false
  }
}

function attachLoadMoreObserver(el: HTMLElement | null) {
  if (!import.meta.client) return
  if (loadMoreObserver) loadMoreObserver.disconnect()
  loadMoreObserver = null

  if (!el || !('IntersectionObserver' in window)) return

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadNextPage()
      }
    },
    { rootMargin: '420px 0px 420px 0px' }
  )

  loadMoreObserver.observe(el)
}

watch(
  () => [route.path, route.query, route.params.filters, allowedFilterSlugs.value.size],
  () => {
    if (!import.meta.client) return

    const targetPath = getFilterPath()
    const shouldRedirectLegacyQuery = hasLegacyFilterQueryParams()
    const shouldCleanPaging = hasPagingQueryParams()
    const shouldNormalizeFilterPath = filterPathIsCatalogFilter(route.path) && route.path !== targetPath

    if (!shouldRedirectLegacyQuery && !shouldCleanPaging && !shouldNormalizeFilterPath) return

    router.replace({ path: targetPath, query: getPreservedTrackingQuery(), hash: route.hash })
  },
  { immediate: true, deep: true }
)

watch(
  normalizedQueryKey,
  async () => {
    await loadFirstPage()
  },
  { immediate: true }
)

watch(
  [visibleProducts, currentLazyPage],
  () => {
    const list = visibleProducts.value
    if (!list.length) return

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
      page_count: catalogStore.totalPages,
      current_page: currentLazyPage.value
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
  loadMoreTrigger,
  (el) => {
    attachLoadMoreObserver(el)
  },
  { flush: 'post' }
)

useHead(() => {
  const filters = Object.entries(normalizedQuery.value)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

  const title = filters
    ? `Каталог Daigo — ${filters}`
    : 'Каталог продукции Daigo'

  const description = filters
    ? `Подборка товаров Daigo по фильтрам: ${filters}`
    : 'Каталог продукции Daigo: метабиотики, аминобиотики и продукты для поддержки здоровья.'

  const canonicalPath = getFilterPath()

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
        href: `https://daigo.ru${canonicalPath}`
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
  desktopFilterMedia = window.matchMedia('(min-width: 1024px)')
  syncDesktopFilterMount()
  desktopFilterMedia.addEventListener?.('change', syncDesktopFilterMount)

  scrollToHash()
  attachLoadMoreObserver(loadMoreTrigger.value)
})

onBeforeUnmount(() => {
  if (loadMoreObserver) loadMoreObserver.disconnect()
  desktopFilterMedia?.removeEventListener?.('change', syncDesktopFilterMount)
  desktopFilterMedia = null
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
    if (route.hash) {
      await scrollToHash(route.hash)
    }
  }
)
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-slider font-medium mb-4 md:mb-10">Каталог</h1>
      </div>

      <div class="relative z-10 mb-6 flex items-center gap-3 md:gap-4">
        <button
          class="flex h-10 w-10 flex-shrink-0 cursor-pointer flex-row items-center justify-center rounded-md bg-hoverbtn"
          @click="openFilters"
          aria-label="Открыть фильтры"
          type="button"
        >
          <img src="/icons/filter.svg" width="20" alt="" />
        </button>

        <div class="quick-filters-scroll flex gap-3 overflow-x-auto pr-2">
          <button
            v-for="reason in quickReasonFilters"
            :key="reason.label"
            class="flex-shrink-0 rounded-md px-4 py-2 text-sm md:text-base transition-colors"
            :class="isReasonActive(reason) ? 'bg-primary text-white' : 'bg-hoverbtn text-black hover:bg-gray-100'"
            type="button"
            @click="toggleReason(reason)"
          >
            {{ reason.label }}
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
          class="fixed inset-y-0 left-0 z-50 w-11/12 rounded-r-2xl bg-white p-3 overflow-y-auto sm:w-[500px] md:p-6"
        >
          <div class="w-full flex justify-between items-center mb-4">
            <button @click="closeFilters" class="absolute top-4 right-4" type="button" aria-label="Закрыть фильтры">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <LazyFilterPanel :store="catalogStore" />
        </div>
      </Transition>

      <div class="flex flex-row items-start gap-7">
        <aside class="hidden w-full lg:sticky lg:top-[120px] lg:block lg:max-h-[calc(100vh-140px)] lg:w-1/4 lg:self-start lg:overflow-y-auto lg:pr-1">
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

        <div v-else-if="visibleProducts.length" class="w-full lg:w-3/4">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <ProductCard
              v-for="(product, idx) in visibleProducts"
              :key="String(product.product_id)"
              :product="product"
              :index="idx"
              :global-index="idx"
              :priority="idx < 2"
            />
          </div>

          <div ref="loadMoreTrigger" class="flex min-h-20 items-center justify-center py-8">
            <button
              v-if="catalogStore.hasMore"
              class="rounded-full border border-black/10 px-6 py-3 text-base font-medium transition hover:bg-hoverbtn disabled:cursor-wait disabled:opacity-60"
              type="button"
              :disabled="isLoadingMore"
              @click="loadNextPage"
            >
              {{ isLoadingMore ? 'Загружаем...' : 'Показать еще 12' }}
            </button>

            <p v-else class="text-sm text-black/50">
              Все товары загружены
            </p>
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
.quick-filters-scroll {
  scrollbar-width: none;
}

.quick-filters-scroll::-webkit-scrollbar {
  display: none;
}

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
  background: #f3f3f3;
  border-radius: 20px 20px 0 0;
}

.catalog-skeleton-content {
  position: relative;
  z-index: 1;
  padding: 18px;
}

.catalog-skeleton-line {
  border-radius: 999px;
  background: #ececec;
}

.catalog-skeleton-line-title {
  width: 80%;
  height: 24px;
}

.catalog-skeleton-line-short {
  width: 60%;
  height: 16px;
  margin-top: 14px;
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
