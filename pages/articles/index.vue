<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useRoute, useRouter, useHead, computed, ref, watch } from '#imports'
import { useArticlesStore } from '~/stores/articlesStore'
import ArticleCard from '~/components/articles/ArticleCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import FilterPanel from '~/components/catalog/FilterPanel.vue'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()

const isFilterModalOpen = ref(false)
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
    const nextQuery: Record<string, any> = { ...(route.query as any), page: '1' }
    if (q) nextQuery.q = q
    else delete nextQuery.q
    router.push({ path: '/articles', query: nextQuery })
  }, 1500)
})


await articlesStore.fetchFilters()

const page = computed(() => Number(route.query.page || 1))

const activeQuery = computed(() => {
  const q = route.query as Record<string, any>
  return Object.fromEntries(Object.entries(q).filter(([k]) => k !== 'page' && k !== 'q'))
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
  nextQuery.page = '1'
  router.push({ path: '/articles', query: nextQuery })
}

function clearAllFilters() {
  const nextQuery: Record<string, any> = {}
  // сохраняем поиск, если он есть
  const q = String((route.query as any).q ?? '').trim()
  if (q) nextQuery.q = q
  nextQuery.page = '1'
  router.push({ path: '/articles', query: nextQuery })
}


function buildCleanQuery(q: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(q)
      .map(([key, value]) => [key, Array.isArray(value) ? (value[0] ?? '') : (value ?? '')])
      .filter(([key, val]) => key === 'page' || (typeof val === 'string' && val.trim() !== ''))
  ) as Record<string, string>
}

// реакция на изменение query
watch(
  () => route.query,
  async () => {
    articlesStore.setPage(page.value)
    const normalizedQuery = buildCleanQuery(route.query as Record<string, any>)
    await articlesStore.fetchArticles(normalizedQuery)
  },
  { immediate: true, deep: true }
)

function updateFilters(selected: Record<string, string[]>) {
  const query: Record<string, string> = {}
  for (const key in selected) {
    if (selected[key]?.length) query[key] = selected[key].join(',')
  }
  query.page = '1'
  router.push({ path: '/articles', query })
}

useHead(() => {
  const q = route.query as Record<string, any>
  const filters = Object.entries(q)
    .filter(([k]) => k !== 'page')
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(',') : v}`)
    .join(', ')

  const isEmpty = (articlesStore.articles ?? articlesStore.list).length === 0
  const title = isEmpty ? 'Статьи не найдены — Daigo' : (filters ? `Статьи по фильтрам: ${filters} — Daigo` : 'Статьи — Daigo')
  const description = isEmpty
    ? 'По вашему запросу статьи не найдены.'
    : (filters ? `Фильтрованные статьи по темам: ${filters}` : 'Подборка статей Daigo.')

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Daigo',
            url: 'https://daigo.ru/articles'
          }
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
          class="fixed inset-0 z-40 bg-black/20"
          @click="closeFilters"
        />
      </Transition>

      <Transition name="slide-left">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-y-0 left-0 z-50 w-full sm:w-[500px] bg-white p-6 overflow-y-auto"
        >
          <div class="w-full flex justify-between items-center mb-4">
            <button @click="closeFilters" class="absolute top-4 right-4" aria-label="Закрыть фильтры">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <FilterPanel
            :store="articlesStore"
            :filters="articlesStore.filters"
            :counts="articlesStore.counts"
            entity="articles"
            @update:filters="updateFilters"
          />
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
            @click="router.push({ query: { ...route.query, napravlennost: tag.value, page: '1' } })"
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


      <div v-if="(articlesStore.articles ?? articlesStore.list).length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8">
          <ArticleCard
            v-for="article in (articlesStore.articles ?? articlesStore.list)"
            :key="article.slug"
            :article="article"
          />
        </div>
      </div>
      <div v-else class="text-center text-gray-500 mt-10">
        Статьи не найдены.
      </div>

      <p class="xs-max:text-base text-lg font-medium mx-auto text-center mt-20 border-y py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

      <Pagination class="mt-1" :current="page" :total="articlesStore.totalPages" />
    </section>
  </BaseContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }
.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s ease; }
.slide-left-enter-from { transform: translateX(-100%); }
.slide-left-enter-to { transform: translateX(0); }
.slide-left-leave-from { transform: translateX(0); }
.slide-left-leave-to { transform: translateX(-100%); }
</style>
