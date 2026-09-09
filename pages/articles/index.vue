<script setup lang="ts">
definePageMeta({ layout: 'main' })

import {
  computed,
  createError,
  onBeforeUnmount,
  ref,
  showError,
  useAsyncData,
  useHead,
  useRoute,
  useRouter,
  watch,
} from '#imports'
import { useArticlesStore } from '~/stores/articlesStore'
import type { ArticleListItem } from '~/types/articles'
import type { FilterGroup } from '~/types/filter'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ArticleFilterPanel from '~/components/articles/ArticleFilterPanel.vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

type ArticleListResponse = {
  items: ArticleListItem[]
  total: number
  page: number
  perPage: number
}

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

const isFilterModalOpen = ref(false)
useBodyScrollLock(isFilterModalOpen)
const openFilters = () => { isFilterModalOpen.value = true }
const closeFilters = () => { isFilterModalOpen.value = false }

const searchInput = ref(String(route.query.q ?? ''))
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(() => route.query.q, (v) => {
  const next = String(v ?? '')
  if (next !== searchInput.value) searchInput.value = next
})

watch(searchInput, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    const q = String(val ?? '').trim()
    const nextQuery: Record<string, any> = { ...(route.query as any) }
    delete nextQuery.page
    if (q) nextQuery.q = q
    else delete nextQuery.q
    router.push({ path: '/articles', query: nextQuery })
  }, 700)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

function getRoutePage() {
  const raw = route.params.page ?? route.query.page ?? 1
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1
}

function buildCleanQuery(q: Record<string, any>, pageNumber = getRoutePage()) {
  const query = Object.fromEntries(
    Object.entries(q)
      .filter(([key]) => key !== 'page')
      .map(([key, value]) => [key, Array.isArray(value) ? (value[0] ?? '') : (value ?? '')])
      .filter(([, val]) => typeof val === 'string' && val.trim() !== '')
  ) as Record<string, string>

  query.page = String(pageNumber)
  return query
}

const page = computed(() => getRoutePage())
const requestQuery = computed(() => buildCleanQuery(route.query as Record<string, any>, page.value))

// Фильтры храним в Pinia, но данные списка статей больше не зависят от побочного
// эффекта внутри store. Это важно для prerender payload и SPA-переходов.
const { data: filtersData } = await useAsyncData<FilterGroup[]>(
  'articles:filters:data',
  () => $fetch<FilterGroup[]>('/api/articles/filters'),
  { default: () => [] },
)

articlesStore.setFilters(filtersData.value ?? [])
watch(filtersData, (value) => articlesStore.setFilters(value ?? []))

// На SSR/prerender данные попадают прямо в Nuxt payload.
// На клиентских переходах refresh() запрашивает новую страницу и обновляет этот ref,
// поэтому рендер больше не зависит от того, выполнился ли callback Pinia-store.
const initialListKey = `articles:list:${route.fullPath}`
const {
  data: articlePageData,
  pending: articlesPending,
  refresh: refreshArticles,
} = await useAsyncData<ArticleListResponse>(
  initialListKey,
  () => $fetch<ArticleListResponse>('/api/articles', { query: requestQuery.value }),
  {
    default: () => ({
      items: [],
      total: 0,
      page: page.value,
      perPage: 15,
    }),
  },
)

const totalPages = computed(() => {
  const total = Number(articlePageData.value?.total ?? 0)
  const perPage = Math.max(1, Number(articlePageData.value?.perPage ?? 15))
  return Math.max(1, Math.ceil(total / perPage))
})

function pageNotFoundError() {
  return createError({
    statusCode: 404,
    statusMessage: 'Страница статей не найдена',
    fatal: true,
  })
}

// Для прямого SSR/prerender запроса возвращаем настоящий 404.
if (page.value > totalPages.value) {
  throw pageNotFoundError()
}

// При SPA-переходе route меняется без повторной загрузки документа.
// Явно обновляем список по текущему URL и только после ответа проверяем номер страницы.
if (import.meta.client) {
  watch(
    () => route.fullPath,
    async () => {
      await refreshArticles()
      if (page.value > totalPages.value) showError(pageNotFoundError())
    },
    { flush: 'post' },
  )
}

const articleFilterSlugs = computed(() => new Set(articlesStore.filters.map(group => group.slug)))

const activeQuery = computed(() => {
  const q = route.query as Record<string, any>
  return Object.fromEntries(Object.entries(q).filter(([key]) => articleFilterSlugs.value.has(key)))
})

const filterLabelByValue = computed(() => {
  const map: Record<string, Record<string, string>> = {}
  for (const g of articlesStore.filters) {
    map[g.slug] = Object.fromEntries(g.options.map(o => [o.value, o.label]))
  }
  return map
})

function clearFilterKey(key: string) {
  const nextQuery: Record<string, any> = { ...(route.query as any) }
  delete nextQuery[key]
  delete nextQuery.page
  router.push({ path: '/articles', query: nextQuery })
}

function clearAllFilters() {
  const nextQuery: Record<string, any> = {}
  const q = String((route.query as any).q ?? '').trim()
  if (q) nextQuery.q = q
  router.push({ path: '/articles', query: nextQuery })
}

const displayArticles = computed<ArticleListItem[]>(() => {
  return Array.isArray(articlePageData.value?.items)
    ? articlePageData.value!.items
    : []
})

function isTrackingQueryKey(key: string) {
  return key.startsWith('utm_') || ['ysclid', 'yclid', 'gclid', 'fbclid', 'etext', 'ybaip'].includes(key)
}

useHead(() => {
  const q = route.query as Record<string, any>
  const hasIndexAffectingQuery = Object.keys(q).some((key) => !isTrackingQueryKey(key))
  const filters = Object.entries(q)
    .filter(([key]) => articleFilterSlugs.value.has(key))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(',') : value}`)
    .join(', ')

  const cleanPagePath = page.value <= 1 ? '/articles' : `/articles/page${page.value}`
  const canonical = `https://daigo.ru${cleanPagePath}`
  const isEmpty = displayArticles.value.length === 0
  const pageSuffix = page.value > 1 ? ` — страница ${page.value}` : ''
  const title = isEmpty
    ? 'Статьи не найдены — Daigo'
    : filters
      ? `Статьи по фильтрам: ${filters}${pageSuffix} — Daigo`
      : `Статьи${pageSuffix} — Daigo`
  const description = isEmpty
    ? 'По вашему запросу статьи не найдены.'
    : filters
      ? `Статьи Daigo по выбранным темам: ${filters}.`
      : `Статьи Daigo о микробиоте, пищеварении, иммунитете, питании и долголетии${page.value > 1 ? `, страница ${page.value}` : ''}.`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { name: 'robots', content: hasIndexAffectingQuery ? 'noindex, follow' : 'index, follow' },
    ],
    link: [{ rel: 'canonical', href: canonical }],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              '@id': `${canonical}#collection`,
              name: title,
              description,
              url: canonical,
              isPartOf: { '@id': 'https://daigo.ru/#website' },
              mainEntity: { '@id': `${canonical}#articles` },
              inLanguage: 'ru-RU'
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonical}#breadcrumbs`,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Главная',
                  item: 'https://daigo.ru/'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: page.value > 1 ? `Статьи — страница ${page.value}` : 'Статьи',
                  item: canonical
                }
              ]
            },
            {
              '@type': 'ItemList',
              '@id': `${canonical}#articles`,
              name: title,
              itemListElement: displayArticles.value.map((article, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://daigo.ru/articles/${article.slug}`,
                item: {
                  '@type': 'Article',
                  '@id': `https://daigo.ru/articles/${article.slug}#article`,
                  headline: article.title,
                  url: `https://daigo.ru/articles/${article.slug}`,
                  ...(article.image
                    ? {
                        image: String(article.image).startsWith('http')
                          ? article.image
                          : `https://daigo.ru${article.image}`
                      }
                    : {}),
                  ...(article.date ? { datePublished: article.date } : {})
                }
              }))
            }
          ]
        })
      }
    ]
  }
})
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex flex-row items-center justify-between">
          <h1 class="text-slider font-medium">Статьи</h1>

          <div class="w-full max-w-[480px] hidden sm:block">
            <input
              v-model="searchInput"
              type="text"
              placeholder="Поиск по статьям"
              class="w-full h-12 rounded-md bg-hoverbtn px-4 transition border-none focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div class="sm:hidden">
          <input
            v-model="searchInput"
            type="text"
            placeholder="Поиск по статьям"
            class="w-full h-10 rounded-md bg-hoverbtn px-4 transition border-none focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-0 z-[110] bg-black/30"
          @click="closeFilters"
        />
      </Transition>

      <Transition name="filter-drawer">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-x-0 bottom-0 z-[120] h-[70dvh] max-h-[70dvh] sm:h-full sm:max-h-full rounded-t-[28px] bg-white p-4 overflow-y-auto sm:inset-y-0 sm:left-0 sm:right-auto sm:bottom-auto sm:h-auto sm:max-h-none sm:w-[500px] sm:rounded-none sm:p-6"
        >
          <div class="w-full flex justify-between items-center mb-4">
            <button @click="closeFilters" class="absolute top-4 right-4" aria-label="Закрыть фильтры">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <ArticleFilterPanel :store="articlesStore" />
        </div>
      </Transition>

      <div class="flex items-center gap-4 mb-6">
        <!-- Кнопка фильтра -->
        <div
          class="flex flex-row justify-center items-center rounded-md bg-hoverbtn w-10 h-10 cursor-pointer flex-shrink-0"
          @click="openFilters"
          aria-label="Открыть фильтры"
        >
          <img src="/icons/filter.svg" width="20" alt="Фильтр" />
        </div>

        <!-- Теги со скроллом -->
        <div class="flex overflow-x-auto gap-4 no-scrollbar">
          <button
            v-for="tag in [
              { label: 'Кишечник и иммунитет', value: 'kishechnik-i-immunitet' },
              { label: 'Нервная система и мозг', value: 'mozg-i-nervnaya-sistema' },
              { label: 'Кожа и волосы', value: 'kozha-i-volosy' }
            ]"
            :key="tag.value"
            class="flex-shrink-0 px-4 py-2 rounded-md"
            :class="route.query.napravlennost === tag.value ? 'bg-primary text-white' : 'bg-hoverbtn'"
            @click="router.push({ path: '/articles', query: { ...route.query, napravlennost: tag.value } })"
            type="button"
          >
            {{ tag.label }}
          </button>
        </div>
      

      </div>
      
      <div
        v-if="Object.keys(activeQuery).length"
        class="flex items-center justify-between gap-3 mt-2"
      >
        <!-- Горизонтальный скролл -->
        <div class="flex-1 overflow-x-auto no-scrollbar">
          <div class="flex items-center gap-2 w-max">
            <template v-for="[key, raw] in Object.entries(activeQuery)" :key="key">
              <div class="flex items-center gap-2 bg-hoverbtn rounded-md px-3 py-2 flex-shrink-0">
                <span class="text-sm opacity-80 whitespace-nowrap">
                  {{ articlesStore.filters.find(f => f.slug === key)?.label || key }}:
                </span>

                <span class="text-sm font-medium whitespace-nowrap">
                  {{
                    (typeof raw === 'string' ? raw.split(',') : Array.isArray(raw) ? raw : [])
                      .map(v => filterLabelByValue[key]?.[v] || v)
                      .join(', ')
                  }}
                </span>

                <button
                  class="text-xs opacity-70 hover:opacity-100 underline whitespace-nowrap"
                  type="button"
                  @click="clearFilterKey(key)"
                >
                  очистить
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- Фиксированная кнопка справа -->
        <button
          class="text-xs opacity-70 hover:opacity-100 underline whitespace-nowrap flex-shrink-0"
          type="button"
          @click="clearAllFilters"
        >
          очистить все
        </button>
      </div>


      <div v-if="articlesPending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8" aria-live="polite" aria-busy="true">
        <div
          v-for="n in 6"
          :key="`article-skeleton-${n}`"
          class="mt-6 animate-pulse"
        >
          <div class="w-full h-[285px] md:h-[350px] rounded-[15px] bg-gray-100 mb-4" />
          <div class="h-7 bg-gray-100 rounded w-4/5 mb-4" />
          <div class="h-4 bg-gray-100 rounded w-full mb-2" />
          <div class="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
      <div v-else-if="displayArticles.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8">
          <ArticleCard
            v-for="(article, index) in displayArticles"
            :key="article.slug"
            :article="article"
            :priority="index < 3"
          />
        </div>
      </div>
      <div v-else class="text-center text-gray-500 mt-10">
        Статьи не найдены.
      </div>

      <p class="xs-max:text-base text-lg font-medium mx-auto text-center mt-20 border-y py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

      <Pagination class="mt-1" :current="page" :total="totalPages" mode="articles" />
    </section>
  </BaseContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
.filter-drawer-enter-active, .filter-drawer-leave-active { transition: transform 0.25s ease; }
.filter-drawer-enter-from, .filter-drawer-leave-to { transform: translateY(100%); }
.filter-drawer-enter-to, .filter-drawer-leave-from { transform: translateY(0); }

@media (min-width: 640px) {
  .filter-drawer-enter-from, .filter-drawer-leave-to { transform: translateX(-100%); }
  .filter-drawer-enter-to, .filter-drawer-leave-from { transform: translateX(0); }
}
</style>
